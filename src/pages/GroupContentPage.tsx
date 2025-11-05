// src/pages/GroupContentPage.tsx
import { AnimatePresence, motion } from "framer-motion";
import { useLayoutEffect, useRef, useState, useMemo, useEffect } from "react";
import DashboardDetail from "../components/dashboard/DashboardDetail";
import { DashboardNotice } from "../components/dashboard/DashboardNotice";
import GroupDashboardLayout from "../components/layout/GroupDashboardLayout";
import GroupDailyContent from "../components/common/GroupDailyContent";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import ConfirmModal from "../components/common/modal/ConfirmModal";

type TabLabel = "공지사항" | "모임일상";
type TabParam = "notice" | "daily";

const labelToParam = (label: TabLabel): TabParam =>
  label === "공지사항" ? "notice" : "daily";
const paramToLabel = (param?: string | null): TabLabel =>
  param === "daily" ? "모임일상" : "공지사항";

function GroupContentPage() {
  const { id: groupId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // 상세 뷰 관련 쿼리키들(탭 전환 시 제거할 목록)
  const DETAIL_KEYS = ["post", "view", "mode", "edit"] as const;

  // 작성 트리거
  const [noticeCreateTick, setNoticeCreateTick] = useState(0);
  const [dailyCreateTick, setDailyCreateTick] = useState(0);

  // 탭 상태
  const [selectedTabLabel, setSelectedTabLabel] =
    useState<TabLabel>("공지사항");

  // URL에 탭을 기록하면서 상세 파라미터를 제거
  const setTabAndClearDetail = (
    tabParam: TabParam,
    opts?: { replace?: boolean },
  ) => {
    const sp = new URLSearchParams(location.search);
    sp.set("tab", tabParam);
    DETAIL_KEYS.forEach((k) => sp.delete(k)); // 탭 바꾸면 상세 파라미터 제거

    const nextSearch = `?${sp.toString()}`;
    const nextUrl = `${location.pathname}${nextSearch}${location.hash || ""}`;
    const currUrl = `${location.pathname}${location.search}${location.hash || ""}`;
    if (nextUrl !== currUrl) {
      navigate(
        { pathname: location.pathname, search: nextSearch },
        { replace: opts?.replace ?? false },
      );
    }
  };

  // 마운트/그룹 변경 시 URL에서 탭 복원(없거나 이상하면 보정)
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const tabParam = (sp.get("tab") as TabParam | null) ?? null;
    const label = paramToLabel(tabParam);
    setSelectedTabLabel(label);

    const normalized = labelToParam(label);
    if (!tabParam || tabParam !== normalized) {
      // 탭 값 없거나 비정상이면 정규화하면서 상세 파라미터도 같이 제거
      setTabAndClearDetail(normalized, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  // 현재 URL에 상세 관련 쿼리(post, view, mode, edit) 있는지 여부
  const hasDetailParam = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return DETAIL_KEYS.some((k) => sp.has(k));
  }, [location.search]);

  // 탭 + 상세존재 여부에 따라 key를 바꿔서 강제 리마운트
  const tabKey = useMemo(
    () => `${selectedTabLabel}-${hasDetailParam ? "detail" : "list"}`,
    [selectedTabLabel, hasDetailParam],
  );

  // 탭 클릭 시: 상태 + URL 동기화(상세 파라미터 제거)
  const handleTabClick = (label: TabLabel) => {
    setSelectedTabLabel(label);
    setTabAndClearDetail(labelToParam(label));
  };

  // 각 탭 작성 중 여부 (버튼 숨김)
  const [isNoticeCrafting, setIsNoticeCrafting] = useState(false);
  const [isDailyCrafting, setIsDailyCrafting] = useState(false);

  // 호스트 여부
  const [roleLoaded, setRoleLoaded] = useState(false);
  const [isHost, setIsHost] = useState(false);

  // 그룹 탭 진입 시 역할 확인
  useEffect(() => {
    let off = false;
    (async () => {
      setRoleLoaded(false);

      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id;

      if (!groupId || !userId) {
        if (!off) {
          setIsHost(false);
          setRoleLoaded(true);
        }
        return;
      }

      const { data, error } = await supabase
        .from("group_members")
        .select("member_role, member_status")
        .eq("group_id", groupId)
        .eq("user_id", userId)
        .eq("member_status", "approved")
        .maybeSingle();

      if (error) {
        if (!off) {
          setIsHost(false);
          setRoleLoaded(true);
        }
        return;
      }

      const role = String(data?.member_role ?? "").toLowerCase();
      const host = role === "host" || role === "owner" || role === "admin";

      if (!off) {
        setIsHost(host);
        setRoleLoaded(true);
      }
    })();

    return () => {
      off = true;
    };
  }, [groupId]);

  // 탭 데이터
  const tabs = useMemo(
    () => [
      {
        label: "공지사항" as const,
        content: (
          <div>
            <DashboardNotice
              groupId={groupId}
              createRequestKey={noticeCreateTick}
              onCraftingChange={setIsNoticeCrafting}
            />
          </div>
        ),
      },
      {
        label: "모임일상" as const,
        content: (
          <div>
            <GroupDailyContent
              groupId={groupId}
              createRequestKey={dailyCreateTick}
              onCraftingChange={setIsDailyCrafting}
            />
          </div>
        ),
      },
    ],
    [groupId, noticeCreateTick, dailyCreateTick],
  );

  const currentTab = tabs.find((t) => t.label === selectedTabLabel)!;

  // 현재 탭의 작성 중 여부
  const isCrafting =
    selectedTabLabel === "공지사항" ? isNoticeCrafting : isDailyCrafting;

  // 언더라인 위치
  const listRef = useRef<HTMLUListElement | null>(null);
  const tabRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [underline, setUnderline] = useState({ left: 0, width: 0 });

  const measure = () => {
    const idx = tabs.findIndex((t) => t.label === selectedTabLabel);
    const el = tabRefs.current[idx];
    const parent = listRef.current;
    if (!el || !parent) return;
    const er = el.getBoundingClientRect();
    const pr = parent.getBoundingClientRect();
    setUnderline({ left: er.left - pr.left, width: er.width });
  };

  useLayoutEffect(() => {
    measure();
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [selectedTabLabel, tabs]);

  // 상단 "작성하기" 버튼
  const handleCreateClick = () => {
    // 작성하기 눌러도 상세 파라미터 남아있으면 혼란 줄 수 있으니 탭 유지 + 상세 제거
    setTabAndClearDetail(labelToParam(selectedTabLabel), { replace: true });

    if (selectedTabLabel === "공지사항") setNoticeCreateTick((t) => t + 1);
    else setDailyCreateTick((t) => t + 1);
  };

  // 공지사항 탭에서만: 호스트일 때만 버튼 노출
  const showCreateButton =
    !isCrafting &&
    (selectedTabLabel === "공지사항"
      ? roleLoaded && isHost // 공지: 호스트만
      : true); // 일상: 기존 로직 유지

  // === 모임 나가기 모달 상태 ===
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);

  const openLeaveModal = () => {
    if (isHost) {
      alert("호스트(관리자)는 모임을 탈퇴할 수 없습니다.");
      return;
    }
    setLeaveModalOpen(true);
  };

  const handleLeaveGroup = async () => {
    const { data: u } = await supabase.auth.getUser();
    const userId = u?.user?.id;

    if (!userId || !groupId) {
      alert("유효하지 않은 요청입니다.");
      setLeaveModalOpen(false);
      return;
    }

    if (isHost) {
      alert("호스트(관리자)는 모임을 탈퇴할 수 없습니다.");
      setLeaveModalOpen(false);
      return;
    }

    const { error } = await supabase
      .from("group_members")
      .update({ member_status: "left" })
      .eq("group_id", groupId)
      .eq("user_id", userId)
      .neq("member_status", "left");

    if (error) {
      console.error("[GroupContentPage] leave error:", error);
      alert("모임 탈퇴 중 오류가 발생했습니다.");
      setLeaveModalOpen(false);
      return;
    }

    alert("모임에서 탈퇴되었습니다.");
    setLeaveModalOpen(false);
    navigate("/");
  };

  return (
    <div>
      <GroupDashboardLayout>
        <div className="flex flex-col gap-3">
          {/* 그룹 정보 */}
          <div className="bg-white shadow-card h-[145px] w-[1024px] rounded-sm p-[12px]">
            <DashboardDetail />
          </div>

          {/* 게시판 */}
          <div className="bg-white shadow-card min-h-[590px] rounded-sm p-6">
            <div className="flex justify-between items-center">
              <p className="text-xxl font-bold mb-4">게시판</p>

              {showCreateButton && (
                <button
                  type="button"
                  onClick={handleCreateClick}
                  className="px-4 py-2 bg-brand text-white rounded hover:opacity-90 mb-4"
                >
                  작성하기
                </button>
              )}
            </div>

            {/* 탭 네비게이션 */}
            <div className="w-full">
              <nav className="h-[40px] border-b border-gray-300">
                <ul ref={listRef} className="relative flex pb-[5px]">
                  {tabs.map((item, i) => (
                    <li
                      key={item.label}
                      ref={(el) => (tabRefs.current[i] = el)}
                      className="relative w-[130px] text-center pt-1 top-[-10px] cursor-pointer"
                      onClick={() => handleTabClick(item.label)}
                    >
                      <p
                        className={`text-xl font-bold transition-colors duration-200 ${
                          item.label === selectedTabLabel
                            ? "text-brand"
                            : "text-[#3c3c3c] hover:text-brand"
                        }`}
                      >
                        {item.label}
                      </p>
                    </li>
                  ))}

                  {/* 탭 underline */}
                  <motion.div
                    className="absolute bottom-0 h-[4px] bg-brand rounded"
                    initial={false}
                    animate={{ left: underline.left, width: underline.width }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </ul>
              </nav>

              {/* 탭 컨텐츠 */}
              <main className="flex justify-center min-h-[300px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={tabKey}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {currentTab.content}
                  </motion.div>
                </AnimatePresence>
              </main>
            </div>
          </div>

          {/* 모임 나가기 */}
          {!isHost && (
            <button
              className="text-sm ml-auto mt-4 text-[#8C8C8C] hover:text-[#FF5252] transition"
              onClick={openLeaveModal}
            >
              모임나가기
            </button>
          )}
        </div>
      </GroupDashboardLayout>

      {/* 모임 나가기 확인 모달 */}
      <ConfirmModal
        open={leaveModalOpen}
        title="모임을 탈퇴하시겠어요?"
        message={
          "탈퇴하면 더 이상 이 모임에 가입할 수 없습니다.\n정말 탈퇴하시겠습니까?"
        }
        confirmText="나가기"
        cancelText="취소"
        onConfirm={handleLeaveGroup}
        onClose={() => setLeaveModalOpen(false)}
      />
    </div>
  );
}

export default GroupContentPage;
