import { useEffect, useState } from 'react';
import ConfirmModal from '../components/common/modal/ConfirmModal';
import InquirySelectorEdit from '../components/InquirySelectorEdit';
import MyPageLayout from '../components/layout/MyPageLayout';
import { useAuth } from '../contexts/AuthContext';
import type { inquirie } from '../types/inquiriesType';
import { supabase } from '../lib/supabase';

// 1:1 문의 내역 페이지 입니다.
function MyInquiriesPage() {
  const { user } = useAuth(); // 현재 로그인된 유저
  // 상태
  const [inquiries, setInquiries] = useState<inquirie[]>([]);
  const [loading, setLoading] = useState(true);

  // 상세보기
  const [detailInquiries, setDetailInquiries] = useState<string | null>(null);

  // 수정하기
  const [editInquiry, setEditInquiry] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');

  // 문의 유형
  const [inquiryMajor, setInquiryMajor] = useState('');
  const [inquirySub, setInquirySub] = useState('');

  // 모달 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'delete' | 'save' | 'cancel' | 'alert' | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [modalMessage, setModalMessage] = useState('');

  // 문의 유형 선택
  const handleChange = (field: 'inquiryMajor' | 'inquirySub', value: string) => {
    if (field === 'inquiryMajor') setInquiryMajor(value);
    if (field === 'inquirySub') setInquirySub(value);
  };

  // db 문의 내역 불러오기
  useEffect(() => {
    const fetchInquiries = async () => {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('user_inquiries')
        .select('*')
        .eq('user_id', user.id)
        .order('inquiry_created_at', { ascending: false });

      if (error) console.error('문의 불러오기 실패:', error.message);
      else setInquiries(data || []);
      setLoading(false);
    };

    fetchInquiries();
  }, [user]);

  // 삭제하기
  const handleDelete = async (id: string) => {
    if (!window.confirm('정말로 이 문의를 삭제하시겠습니까?')) return;

    try {
      // 삭제할 문의 정보 가져오기
      const { data: inquiryData, error: fetchError } = await supabase
        .from('user_inquiries')
        .select('inquiry_file_urls')
        .eq('inquiry_id', id)
        .single();

      if (fetchError) throw fetchError;

      let files: { path: string; originalName: string }[] = [];
      // 파일 삭제
      if (inquiryData?.inquiry_file_urls) {
        try {
          const parsed = JSON.parse(inquiryData.inquiry_file_urls);
          files = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          files = [{ path: inquiryData.inquiry_file_urls, originalName: '파일' }];
        }

        for (const file of files) {
          if (!file?.path) continue; // 안전하게 체크
          const { error: storageError } = await supabase.storage
            .from('inquiry-images') // 실제 버킷 이름
            .remove([file.path]);

          if (storageError) console.error('파일 삭제 실패:', storageError);
        }
      }

      // DB에서 삭제
      const { error } = await supabase.from('user_inquiries').delete().eq('inquiry_id', id);
      if (error) throw error;

      // 로컬 상태 동기화
      setInquiries(prev => prev.filter(item => item.inquiry_id !== id));
      setDetailInquiries(null);
    } catch (err: any) {
      console.error('삭제 처리 중 오류:', err.message || err);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };
  // 해당 내용 찾기
  const selectedInquiry = inquiries.find(item => item.inquiry_id === detailInquiries);

  // 모달 오픈 함수.
  const openModal = (type: 'delete' | 'save' | 'cancel', id?: string) => {
    setModalType(type);
    setTargetId(id || null);
    setModalOpen(true);
  };

  // 모달 확인 시 실행
  const handleConfirm = async () => {
    if (modalType === 'delete' && targetId) {
      await handleDelete(targetId);
    }

    if (modalType === 'save' && selectedInquiry) {
      // db 업데이트
      const { error } = await supabase
        .from('user_inquiries')
        .update({
          inquiry_detail: editedContent,
          inquiry_main_type: inquiryMajor,
          inquiry_sub_type: inquirySub,
        })
        .eq('inquiry_id', selectedInquiry.inquiry_id);

      if (error) {
        console.error('문의 수정 실패:', error.message);
        alert('수정 중 오류가 발생했습니다.');
        return;
      }

      // 로컬 상태도 동기화.
      setInquiries(prev =>
        prev.map(item =>
          item.inquiry_id === selectedInquiry.inquiry_id
            ? {
                ...item,
                inquiry_detail: editedContent,
                inquiry_main_type: inquiryMajor,
                inquiry_sub_type: inquirySub,
              }
            : item,
        ),
      );
      setEditInquiry(null);
    }

    if (modalType === 'cancel') {
      setEditInquiry(null);
      if (selectedInquiry) {
        setEditedContent(selectedInquiry.inquiry_detail);
        setInquiryMajor(selectedInquiry.inquiry_main_type);
        setInquirySub(selectedInquiry.inquiry_sub_type);
      }
    }

    setModalOpen(false);
  };
  // 수정 버튼
  const handleEdit = (id: string) => {
    setEditInquiry(id);
  };

  const handleSaveClick = () => {
    //  문의 유형 유효성 검사 추가
    if (!inquiryMajor) {
      setModalType('alert');
      setModalMessage('문의 유형(대분류)을 선택해주세요.');
      setModalOpen(true);

      return;
    }
    if (!inquirySub) {
      setModalType('alert');
      setModalMessage('문의 유형(중분류)을 선택해주세요.');
      setModalOpen(true);

      return;
    }
    // 모든 값이 있으면 모달 열기
    openModal('save');
  };
  const handleCancelClick = () => openModal('cancel');
  const handleDeleteClick = (id: string) => openModal('delete', id);

  const handleDetail = (id: string) => {
    setDetailInquiries(id === detailInquiries ? null : id);
  };

  // 선택 변경 시 초기화
  useEffect(() => {
    if (selectedInquiry) {
      setEditedContent(selectedInquiry.inquiry_detail || '');
      setInquiryMajor(selectedInquiry.inquiry_main_type || '');
      setInquirySub(selectedInquiry.inquiry_sub_type || '');
    } else {
      setEditedContent('');
      setInquiryMajor('');
      setInquirySub('');
    }
  }, [selectedInquiry]);

  return (
    <MyPageLayout>
      {/* 상단 텍스트 부분 */}
      <div>
        <div className="text-xl font-bold text-gray-400 mb-[21px]">
          마이페이지 {'>'} 고객센터 {'>'} 1:1 문의 내역
        </div>
      </div>
      <div className="flex gap-[12px] mb-[56px]">
        <div className=" border-r border-brand border-[3px]"></div>
        <div className="text-gray-400">
          <div className="text-lg font-semibold">내가 보낸 1:1 문의 내역을 확인할 수 있어요.</div>
          <div className="text-md">
            답변 상태를 확인하고, 필요한 경우 추가 문의도 이어서 진행해 보세요.
          </div>
        </div>
      </div>
      {/* 하단 영역 부분  내용 없을때.*/}
      <div className="mb-[77px]">
        <div className="text-brand font-semibold text-xxl mb-[38px]">1:1 문의 내역</div>
        {inquiries.length === 0 ? (
          <div className="w-[1024px] border border-gray-300 rounded-[5px] py-[53px] text-center text-xl text-gray-200 font-medium">
            1:1 문의 내역이 없습니다.
          </div>
        ) : (
          <div className="w-[1024px] border border-gray-300 rounded-[5px] text-gray-200 font-medium">
            <div className="grid grid-cols-6 text-center pt-[14px] gap-[50px] text-lg font-semibold text-gray-400">
              <div>문의 일자</div>
              <div>문의 내용</div>
              <div>문의 유형</div>
              <div>상태</div>
              <div>답변일자</div>
              <div>상세보기</div>
            </div>
            <div className="border-b border-black opacity-30 my-[10px] m-[10px]" />

            {/* 문의 항목 */}
            {inquiries.map((item, index) => (
              <div key={item.inquiry_id}>
                <div className="grid grid-cols-6 text-center pb-[14px] gap-[40px] items-center text-md text-gray-200 mt-[10px] font-normal">
                  <div className="font-medium">
                    {new Date(item.inquiry_created_at).toLocaleDateString()}
                  </div>
                  <div className="truncate font-medium text-gray-400">{item.inquiry_detail}</div>
                  <div className="font-medium text-gray-400 text-sm">
                    <b>{item.inquiry_main_type}</b>
                    <br />
                    <span className=" text-gray-200  whitespace-nowrap">
                      {item.inquiry_sub_type}
                    </span>
                  </div>
                  <div
                    className={`text-md ${
                      item.inquiry_status === 'answered'
                        ? 'text-brand font-semibold'
                        : 'text-gray-200 font-medium'
                    }`}
                  >
                    {item.inquiry_status === 'answered' ? '답변완료' : '답변대기'}
                  </div>
                  <div className="font-medium">
                    {' '}
                    {item.inquiry_answered_at
                      ? new Date(item.inquiry_answered_at).toLocaleDateString()
                      : '-'}
                  </div>
                  <button
                    className={`${
                      detailInquiries === item.inquiry_id
                        ? 'font-bold text-brand'
                        : 'font-medium text-gray-200'
                    }`}
                    onClick={() => handleDetail(item.inquiry_id)}
                  >
                    [상세보기]
                  </button>
                </div>

                {index !== inquiries.length - 1 && (
                  <div className="border-b border-black opacity-30 ml-[10px] mr-[10px]" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 상세보기 */}
      <div className="text-brand font-semibold text-xxl mb-[38px]">1:1 문의 내역 상세보기</div>
      {selectedInquiry ? (
        <div className="w-[1024px] border border-gray-300 rounded-[5px] p-[60px] text-gray-200 font-medium">
          {/* 이름 */}
          <div className="flex gap-[95px] items-center mb-[16px]">
            <div className="text-gray-400 text-lg font-bold">이름</div>
            <div className="text-gray-200 text-md">{user?.user_metadata?.name ?? '-'}</div>
          </div>
          <div className="border-b border-black opacity-30 my-[16px]" />

          {/* 이메일 */}
          <div className="flex gap-[80px] items-center mb-[16px]">
            <div className="text-gray-400 text-lg font-bold">이메일</div>
            <div className="text-gray-200 text-md">{user?.email ?? '-'}</div>
          </div>
          <div className="border-b border-black opacity-30 my-[16px]" />

          {/* 문의 일자 / 유형 */}
          <div className="flex mb-[16px]">
            <div className="flex gap-[60px] items-center">
              <div className="text-gray-400 text-lg font-bold">문의 일자</div>
              <div className="text-gray-200 text-md">
                {new Date(selectedInquiry.inquiry_created_at).toLocaleString('ko-KR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
            <div className="flex items-center gap-[30px] ml-[80px]">
              <div className="text-gray-400 text-lg font-bold">문의 유형</div>
              {editInquiry === selectedInquiry.inquiry_id ? (
                <InquirySelectorEdit
                  className="w-[100px]"
                  major={inquiryMajor}
                  sub={inquirySub}
                  onChange={handleChange}
                />
              ) : (
                <div className="text-gray-200 text-md whitespace-nowrap overflow-hidden">
                  {selectedInquiry.inquiry_main_type} {'>'} {selectedInquiry.inquiry_sub_type}
                </div>
              )}
            </div>
          </div>
          <div className="border-b border-black opacity-30 my-[16px]" />

          {/* 문의 내용 */}
          <div className="flex gap-[60px] items-start mb-[16px]">
            <div className="text-gray-400 text-lg font-bold">문의 내용</div>
            <div
              className="text-gray-200 text-md flex-1"
              style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
            >
              {editInquiry === selectedInquiry.inquiry_id ? (
                <textarea
                  className="resize-none h-[150px] w-full border border-gray-300 bg-transparent rounded-[8px] text-gray-200 text-md p-[12px]"
                  value={editedContent}
                  onChange={e => setEditedContent(e.target.value)}
                />
              ) : (
                selectedInquiry.inquiry_detail
              )}

              {/* 첨부 파일 영역 */}
              {selectedInquiry.inquiry_file_urls && (
                <div className="mt-[12px] flex flex-wrap gap-2">
                  {(() => {
                    let files: { path: string; originalName: string }[] = [];

                    try {
                      let parsed = selectedInquiry.inquiry_file_urls;

                      // 문자열이면 한 번 파싱
                      if (typeof parsed === 'string') parsed = JSON.parse(parsed);

                      // 파싱 결과가 여전히 문자열 배열이면 다시 파싱
                      if (Array.isArray(parsed) && typeof parsed[0] === 'string') {
                        parsed = (parsed as string[])
                          .map((item: string) => {
                            try {
                              return JSON.parse(item);
                            } catch {
                              return null;
                            }
                          })
                          .filter(Boolean);
                      }

                      files = (Array.isArray(parsed) ? parsed : [parsed]) as {
                        path: string;
                        originalName: string;
                      }[];
                    } catch (e) {
                      console.warn('파일 파싱 오류:', e);
                      files = [];
                    }

                    return files.slice(0, 2).map((file, idx) => (
                      <a
                        key={idx}
                        href={`https://eetunrwteziztszaezhd.supabase.co/storage/v1/object/public/inquiry-images/${file.path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center bg-white border border-gray-300 p-1 rounded-[5px] text-sm text-gray-700"
                      >
                        <img src="/images/file_blue.svg" alt="파일" className="mr-1 w-4 h-4" />
                        <span className="truncate max-w-[200px]">{file.originalName}</span>
                      </a>
                    ));
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* 답변 완료 또는 수정/삭제 버튼 */}
          {selectedInquiry.inquiry_status === 'answered' ? (
            <>
              <div className="border-b border-black opacity-30 my-[16px]" />
              <div className="flex gap-[60px] items-start ">
                <div className="text-gray-400 text-lg font-bold">문의 답변</div>
                <div
                  className="text-gray-200 text-md"
                  style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
                >
                  {selectedInquiry.inquiry_answer || '답변 내용이 없습니다.'}
                </div>
              </div>
              <div className="flex justify-end mt-[16px]">
                <button
                  onClick={() => handleDelete(selectedInquiry.inquiry_id)}
                  className="flex px-[35px] py-[8px] bg-brand rounded-[5px] text-white font-bold text-lg"
                >
                  문의 삭제
                </button>
              </div>
            </>
          ) : (
            <div className="flex justify-end gap-[14px]">
              {editInquiry === selectedInquiry.inquiry_id ? (
                <>
                  <div className="flex justify-end gap-[14px]">
                    <button
                      className="flex px-[35px] py-[8px] border border-brand bg-white rounded-[5px] text-brand font-bold text-lg"
                      onClick={handleCancelClick}
                    >
                      수정 취소
                    </button>
                    <button
                      className="flex px-[35px] py-[8px] bg-brand rounded-[5px] text-white font-bold text-lg"
                      onClick={handleSaveClick}
                    >
                      수정 완료
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleEdit(selectedInquiry.inquiry_id)}
                    className="flex px-[35px] py-[8px] border border-brand bg-white rounded-[5px] text-brand font-bold text-lg"
                  >
                    문의 수정
                  </button>
                  <button
                    onClick={() => handleDeleteClick(selectedInquiry.inquiry_id)}
                    className="flex px-[35px] py-[8px] bg-brand rounded-[5px] text-white font-bold text-lg"
                  >
                    문의 삭제
                  </button>
                </>
              )}
              <ConfirmModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={modalType === 'alert' ? () => setModalOpen(false) : handleConfirm}
                title={
                  modalType === 'delete'
                    ? '문의 내역을 삭제하시겠습니까?'
                    : modalType === 'save'
                      ? '수정 내용을 저장하시겠습니까?'
                      : modalType === 'cancel'
                        ? '수정을 취소하시겠습니까?'
                        : ''
                }
                message={
                  modalType === 'alert'
                    ? modalMessage
                    : modalType === 'delete'
                      ? '삭제 후에는 복구할 수 없습니다.\n정말 삭제하시겠습니까?'
                      : modalType === 'save'
                        ? '수정된 내용으로 저장됩니다.\n계속 진행하시겠습니까?'
                        : modalType === 'cancel'
                          ? '변경된 내용이 사라집니다.\n정말 취소하시겠습니까?'
                          : ''
                }
                confirmText="확인"
                cancelText="취소"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="w-[1024px] border border-gray-300 rounded-[5px] py-[53px] text-center text-xl text-gray-200 font-medium">
          1:1 문의 내역 상세보기를 눌러 확인하세요.
        </div>
      )}
    </MyPageLayout>
  );
}

export default MyInquiriesPage;
