import { useState, useEffect } from "react";
import LoadingSpinner from "../components/common/LoadingSpinner";
import type { inquirie } from "../types/inquiriesType";
import { supabase } from "../lib/supabase";
import { notifyInquiryReply } from "../lib/notificationHandlers";

// user_profiles에서 필요한 필드만 정의
interface UserProfile {
  name: string;
  email: string;
}

// Supabase에서 가져올 조인 데이터 타입
interface InquiryWithProfile extends inquirie {
  user_profiles: UserProfile | null;
  user_name: string; // 평탄화 후 추가
  user_email: string;
}

function AdminInquiryList() {
  const [inquiries, setInquiries] = useState<InquiryWithProfile[]>([]);
  const [selectedInquiry, setSelectedInquiry] =
    useState<InquiryWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState("");

  // 문의 목록 불러오기
  const fetchInquiries = async () => {
    setLoading(true);
    try {
      // 2025-11-03 관리자 : user_id 필드 추가 (알림 전송을 위해 필요)
      const { data, error } = await supabase
        .from("user_inquiries")
        .select(
          `
        inquiry_id,
        user_id,
        inquiry_main_type,
        inquiry_sub_type,
        inquiry_detail,
        inquiry_status,
        inquiry_answer,
        inquiry_file_urls,
        inquiry_created_at,
        inquiry_answered_at,
        user_profiles(name, email)
      `,
        )
        .eq("inquiry_status", "pending")
        .order("inquiry_created_at", { ascending: false });

      if (error) {
        setInquiries([]);
      } else if (data) {
        // Supabase에서 관계로 가져온 user_profiles 정보 평탄화
        const formatted = (data as any[]).map((item) => ({
          ...item,
          user_name: item.user_profiles?.name ?? "알 수 없음",
          user_email: item.user_profiles?.email ?? "-",
        }));
        setInquiries(formatted);
      } else {
        // data가 null인 경우
        setInquiries([]);
      }
    } catch (err) {
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  };

  // 2025-11-03 관리자 : 초기 데이터 로드
  useEffect(() => {
    fetchInquiries();
  }, []);

  // 2025-11-03 관리자 : 실시간으로 새로운 문의 등록 감지 및 상태 변경 감지
  useEffect(() => {
    // 방법 1: notifications 테이블 구독 (inquiry_new 타입 알림이 오면 문의 목록 갱신)
    // 알림이 오는 것은 확인되었으므로 이 방법을 우선 사용
    const notifyChannel = supabase
      .channel("admin_inquiries_notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        async (payload) => {
          try {
            const notification = payload.new as any;
            // 2025-11-03 관리자 : inquiry_new 타입 알림이 오면 문의 목록 갱신
            if (notification.type === "inquiry_new") {
              await fetchInquiries();
            }
          } catch (err) {
            // 에러 발생 시 무시
          }
        },
      )
      .subscribe();

    // 방법 2: user_inquiries 테이블 직접 구독 (백업용)
    const inquiryChannel = supabase
      .channel("admin_inquiries_realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "user_inquiries",
        },
        async (payload) => {
          try {
            const newInquiry = payload.new as any;
            // 2025-11-03 관리자 : pending 상태인 문의만 목록에 추가
            if (newInquiry.inquiry_status === "pending") {
              // 즉시 목록 갱신 (더 안정적)
              await fetchInquiries();
            }
          } catch (err) {
            // 에러 발생 시 무시
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "user_inquiries",
        },
        async (payload) => {
          try {
            const updatedInquiry = payload.new as any;
            // 2025-11-03 관리자 : 문의 상태가 answered로 변경되면 목록에서 제거
            if (updatedInquiry.inquiry_status === "answered") {
              setInquiries((prev) =>
                prev.filter(
                  (item) => item.inquiry_id !== updatedInquiry.inquiry_id,
                ),
              );
            } else {
              // 상태가 변경되면 목록 갱신
              await fetchInquiries();
            }
          } catch (err) {
            // 에러 발생 시 무시
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notifyChannel);
      supabase.removeChannel(inquiryChannel);
    };
  }, []);

  // 문의 보기
  const handleSelect = (inquiry: InquiryWithProfile) => {
    setSelectedInquiry(inquiry);
    setAnswer(inquiry.inquiry_answer || "");
  };

  // 답변 저장 -> db 업데이트
  const handleSubmitAnswer = async () => {
    if (!selectedInquiry) return;
    if (!answer.trim()) {
      alert("답변을 입력하세요.");
      return;
    }

    const { error } = await supabase
      .from("user_inquiries")
      .update({
        inquiry_answer: answer,
        inquiry_status: "answered",
        inquiry_answered_at: new Date().toISOString(),
      })
      .eq("inquiry_id", selectedInquiry.inquiry_id);

    if (error) {
      console.error("답변 저장 오류:", error);
      alert("답변 저장 중 오류가 발생했습니다.");
      return;
    }

    // 2025-11-03 문의 작성자에게 알림 전송
    await notifyInquiryReply({
      inquiryWriterId: selectedInquiry.user_id,
      inquiryDetail:
        selectedInquiry.inquiry_detail.substring(0, 50) +
        (selectedInquiry.inquiry_detail.length > 50 ? "..." : ""),
      // inquiryId: selectedInquiry.inquiry_id,
    });

    alert(" 답변이 저장되었습니다.");

    await fetchInquiries();
    setSelectedInquiry(null);
  };

  return (
    <div className="mx-auto">
      {/* 목록 */}
      <div className="border border-gray-300 rounded-[5px]">
        <div
          className="grid text-center py-3 text-md font-semibold text-gray-400 border-b border-gray-200"
          style={{ gridTemplateColumns: "1fr 1fr 1.5fr 2fr 1fr 1fr" }}
        >
          <div>문의 일자</div>
          <div>유저 이름</div>
          <div>문의 유형</div>
          <div>내용</div>
          <div>상태</div>
          <div>상세보기</div>
        </div>

        {/* 목록 내용 */}
        {loading ? (
          <LoadingSpinner />
        ) : inquiries.length === 0 ? (
          <div className="text-center py-10 text-gray-300 text-lg">
            문의 내역이 없습니다.
          </div>
        ) : (
          inquiries.map((item, index) => (
            <div
              key={item.inquiry_id}
              className={`grid items-center text-center py-3 text-md text-gray-200 ${
                index === inquiries.length - 1 ? "" : "border-b border-gray-200"
              }`}
              style={{ gridTemplateColumns: "1fr 1fr 1.5fr 2fr 1fr 1fr" }}
            >
              <div>
                {new Date(item.inquiry_created_at).toLocaleDateString()}
              </div>
              <div className="font-medium text-gray-400">
                {item.user_profiles?.name ?? "알 수 없음"}
              </div>
              <div className="font-medium text-gray-400 text-sm">
                <b>{item.inquiry_main_type}</b>
                <br />
                <span className=" text-gray-200  whitespace-nowrap">
                  {item.inquiry_sub_type}
                </span>
              </div>
              <div className="truncate">{item.inquiry_detail}</div>
              <div
                className={`${
                  item.inquiry_status === "answered"
                    ? "text-green-500 font-semibold"
                    : "text-gray-400"
                }`}
              >
                {item.inquiry_status === "answered" ? "답변완료" : "대기중"}
              </div>
              <button
                onClick={() => handleSelect(item)}
                className="text-brand font-semibold hover:underline"
              >
                보기
              </button>
            </div>
          ))
        )}
      </div>

      {/* 상세 보기 */}
      {selectedInquiry && (
        <div className="mt-10 border border-gray-300 rounded-[5px] p-8">
          <div className="text-brand font-semibold text-xl mb-5">
            문의 상세보기
          </div>

          <div className="mb-4 pl-4">
            <div className="flex gap-5 mb-2">
              <span className="text-gray-400 font-bold w-[80px]">이름</span>
              <span>{selectedInquiry.user_name}</span>
            </div>
            <div className="flex gap-5 mb-2">
              <span className="text-gray-400 font-bold w-[80px]">이메일</span>
              <span>{selectedInquiry.user_email}</span>
            </div>
            <div className="flex gap-5 mb-2">
              <span className="text-gray-400 font-bold w-[80px]">
                문의 유형
              </span>
              <span>
                {selectedInquiry.inquiry_main_type} /{" "}
                {selectedInquiry.inquiry_sub_type}
              </span>
            </div>
            <div className="border-t border-gray-300 my-6" />

            <div className="flex flex-1 gap-5 mb-2 items-start">
              <span className="text-gray-400 font-bold w-[80px] shrink-0">
                문의 내용
              </span>
              <span className="text-gray-700 whitespace-pre-line break-words flex-1">
                {selectedInquiry.inquiry_detail}
              </span>
            </div>

            <div className="flex flex-1 gap-5 mb-2 items-start">
              <span className="text-gray-400 font-bold w-[80px] shrink-0">
                첨부파일
              </span>
              <span className="flex-1">
                {/* 첨부된 파일이 있다면 보여주기 */}
                {(() => {
                  const files: { path: string; originalName: string }[] = [];

                  if (selectedInquiry.inquiry_file_urls) {
                    try {
                      let parsed: any = selectedInquiry.inquiry_file_urls;

                      // 문자열이면 JSON.parse
                      if (typeof parsed === "string") {
                        parsed = JSON.parse(parsed);
                      }

                      // 배열 안에 문자열(JSON 문자열) 있으면 다시 파싱
                      if (Array.isArray(parsed)) {
                        parsed = parsed
                          .map((item) => {
                            if (typeof item === "string") {
                              try {
                                return JSON.parse(item);
                              } catch {
                                return null;
                              }
                            }
                            return item;
                          })
                          .filter(
                            (
                              item,
                            ): item is {
                              path: string;
                              originalName: string;
                            } => {
                              // null 제거 & 타입 가드
                              return (
                                item &&
                                typeof item.path === "string" &&
                                typeof item.originalName === "string"
                              );
                            },
                          );
                      }

                      files.push(...(Array.isArray(parsed) ? parsed : []));
                    } catch (e) {
                      console.warn("파일 파싱 오류:", e);
                    }
                  }

                  return files.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {files.slice(0, 2).map((file, idx) => (
                        <a
                          key={idx}
                          href={`https://eetunrwteziztszaezhd.supabase.co/storage/v1/object/public/inquiry-images/${file.path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center bg-white border border-gray-300 p-1 rounded-[5px] text-sm text-gray-700"
                        >
                          <img
                            src="/images/file_blue.svg"
                            alt="파일"
                            className="mr-1 w-4 h-4"
                          />
                          <span className="truncate max-w-[200px]">
                            {file.originalName}
                          </span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm">첨부파일 없음</div>
                  );
                })()}
              </span>
            </div>
          </div>

          <div className="mb-4 pl-4">
            <div className="border-t border-gray-300 my-6" />
            <div className="text-gray-400 font-bold mb-4">관리자 답변</div>
            <textarea
              className="w-full resize-none h-[120px] border border-gray-300 rounded-[8px] p-3 bg-transparent text-gray-200"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="답변을 입력하세요..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setSelectedInquiry(null)}
              className="px-5 py-2 border border-brand text-brand rounded-[5px]"
            >
              닫기
            </button>
            <button
              onClick={handleSubmitAnswer}
              className="px-5 py-2 bg-brand text-white rounded-[5px]"
            >
              답변 저장
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminInquiryList;
