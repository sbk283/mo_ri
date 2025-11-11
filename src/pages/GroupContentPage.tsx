import { AnimatePresence, motion } from "framer-motion";
import { useLayoutEffect, useRef, useState, useMemo, useEffect } from "react";
import DashboardDetail from "../components/dashboard/DashboardDetail";
import { DashboardNotice } from "../components/dashboard/DashboardNotice";
import GroupDashboardLayout from "../components/layout/GroupDashboardLayout";
import GroupDailyContent from "../components/common/GroupDailyContent";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import ConfirmModal from "../components/common/modal/ConfirmModal";
import { useAuth } from "../contexts/AuthContext";
import { useGroupMember } from "../contexts/GroupMemberContext";

type TabLabel = "공지사항" | "모임일상";
type TabParam = "notice" | "daily";

const labelToParam = (label: TabLabel): TabParam =>
  label === "모임일상" ? "daily" : "notice";
const paramToLabel = (param?: string | null): TabLabel =>
  param === "notice" ? "공지사항" : "모임일상";

function GroupContentPage() {
  const { user, loading: authLoading } = useAuth();
  const { members, fetchMembers } = useGroupMember();

  // 멤버 / 리더 여부
  const [isLeader, setIsLeader] = useState(false);
  const [isMember, setIsMember] = useState(false);

  const { id: groupId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // 상세 뷰 관련 쿼리키들(탭 전환 시 제거할 목록)
  const DETAIL_KEYS = ["post", "view", "mode", "edit", "create"] as const;

  // 작성 트리거
  const [noticeCreateTick, setNoticeCreateTick] = useState(0);
  const [dailyCreateTick, setDailyCreateTick] = useState(0);

  // 탭 리셋용 키: 탭을 클릭해서 슬러그를 초기화할 때마다 증가
  const [tabResetKey, setTabResetKey] = useState(0);

  // 탭 상태: URL의 tab 쿼리로 초기화
  const [selectedTabLabel, setSelectedTabLabel] = useState<TabLabel>(() => {
    const sp = new URLSearchParams(window.location.search);
    const tabParam = (sp.get("tab") as TabParam | null) ?? null;
    return paramToLabel(tabParam);
  });

  // URL에 탭을 기록하면서 상세 파라미터를 제거
  const setTabAndClearDetail = (
    tabParam: TabParam,
    opts?: { replace?: boolean },
  ) => {
    const sp = new URLSearchParams(location.search);
    sp.set("tab", tabParam);
    // 탭 바꾸면 상세 관련 파라미터 제거
    DETAIL_KEYS.forEach((k) => sp.delete(k));

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

  // URL에서 탭 복원 + 정규화 (탭 쿼리가 없거나 이상하면 보정)
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
  }, [location.search, groupId]);

  // 로그인 여부 확인 (비로그인 접근 차단)
  useEffect(() => {
    if (authLoading) return;
    if (!user) navigate("/login");
  }, [user, authLoading, navigate]);

  // 그룹 멤버 목록 조회
  useEffect(() => {
    if (!groupId) return;
    fetchMembers(groupId);
  }, [groupId, fetchMembers]);

  // 로그인한 사용자가 멤버인지 / 호스트인지 (멤버 컨텍스트 기반)
  useEffect(() => {
    if (!groupId || !user?.id) {
      setIsLeader(false);
      setIsMember(false);
      return;
    }

    const myMembership = members.find(
      (m) => m.group_id === groupId && m.user_id === user.id,
    );

    if (!myMembership) {
      setIsMember(false);
      setIsLeader(false);
      return;
    }

    setIsMember(true);
    setIsLeader(myMembership.member_role === "host");
  }, [members, groupId, user?.id]);

  // 호스트 여부 (DB 직접 조회, approved 상태만)
  const [roleLoaded, setRoleLoaded] = useState(false);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    let off = false;

    (async () => {
      setRoleLoaded(false);

      const userId = user?.id;

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
        console.error("[GroupContentPage] role check error:", error);
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
  }, [groupId, user?.id]);

  // 탭 + 탭리셋키에 따라 key를 바꿔서 강제 리마운트 제어
  // 상세/리스트 전환은 전부 자식 컴포넌트가 URL 보고 처리
  const tabKey = useMemo(
    () => `${selectedTabLabel}-${tabResetKey}`,
    [selectedTabLabel, tabResetKey],
  );

  // 탭 클릭 시: 상태 + URL 동기화(상세 파라미터 제거) + 탭 내용 리셋
  const handleTabClick = (label: TabLabel) => {
    setSelectedTabLabel(label);
    setTabAndClearDetail(labelToParam(label));
    // 이때는 "다른 탭으로 이동"이니까 탭 컨텐츠 리마운트해서 로컬 상태도 초기화
    setTabResetKey((v) => v + 1);
  };

  // 각 탭 작성 중 여부 (버튼 숨김)
  const [isNoticeCrafting, setIsNoticeCrafting] = useState(false);
  const [isDailyCrafting, setIsDailyCrafting] = useState(false);

  // 탭 데이터
  const tabs = useMemo(
    () => [
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
    ],
    [groupId, noticeCreateTick, dailyCreateTick],
  );

  const currentTab = tabs.find((t) => t.label === selectedTabLabel)!;

  // 현재 탭의 작성 중 여부
  const isCrafting =
    selectedTabLabel === "공지사항" ? isNoticeCrafting : isDailyCrafting;

  // === URL 쿼리로 현재 폼 상태 판단 (edit / create 공통) ===
  const searchParams = new URLSearchParams(location.search);
  const view = searchParams.get("view");
  const mode = searchParams.get("mode");
  const editFlag = searchParams.get("edit");
  const createFlag = searchParams.get("create");

  const isEditView =
    view === "edit" ||
    mode === "edit" ||
    editFlag === "1" ||
    editFlag === "true";

  const isCreateView =
    view === "create" || createFlag === "1" || createFlag === "true";

  // 현재 화면이 “폼(작성/수정)”인지 여부
  const inFormView = isEditView || isCreateView;

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
    const tabParam = labelToParam(selectedTabLabel);
    const sp = new URLSearchParams(location.search);

    // 탭 유지 / 세팅
    sp.set("tab", tabParam);

    // 기존 상세 관련 파라미터 전부 제거
    DETAIL_KEYS.forEach((k) => sp.delete(k));

    // 작성 모드 명시
    sp.set("view", "create");

    const nextSearch = `?${sp.toString()}`;
    const nextUrl = `${location.pathname}${nextSearch}${location.hash || ""}`;
    const currUrl = `${location.pathname}${location.search}${location.hash || ""}`;

    if (nextUrl !== currUrl) {
      navigate(
        { pathname: location.pathname, search: nextSearch },
        { replace: true },
      );
    }

    // 하위에서 effect로 보는 트리거
    if (selectedTabLabel === "공지사항") {
      setNoticeCreateTick((t) => t + 1);
    } else {
      setDailyCreateTick((t) => t + 1);
    }
  };

  // 공지사항 탭에서만: 호스트일 때만 버튼 노출
  // + edit/create 뷰일 때는 작성하기 버튼 숨김
  const showCreateButton =
    !inFormView &&
    !isCrafting &&
    (selectedTabLabel === "공지사항"
      ? roleLoaded && isHost // 공지: 호스트만
      : true); // 모임일상: 멤버면 항상 허용(기존 권한 로직 유지)

  // === 모임 나가기 모달 상태 ===
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);

  const openLeaveModal = () => {
    // 역할 정보 아직 로딩 중이면 그냥 무시
    if (!roleLoaded) return;

    if (isHost) {
      alert("호스트(관리자)는 모임을 탈퇴할 수 없습니다.");
      return;
    }

    if (!isMember) {
      alert("현재 이 모임에 가입된 상태가 아닙니다.");
      return;
    }

    setLeaveModalOpen(true);
  };

  const handleLeaveGroup = async () => {
    const userId = user?.id;

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

    if (!isMember) {
      alert("현재 이 모임에 가입된 상태가 아닙니다.");
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

  // 모임원이 아닌 경우: 접근 제한 화면만 노출
  if (roleLoaded && !isMember) {
    return (
      <GroupDashboardLayout>
        <div className="flex justify-center items-center h-[600px] text-lg font-medium">
          이 모임의 멤버만 접근할 수 있습니다.
        </div>
      </GroupDashboardLayout>
    );
  }

  return (
    <div>
      <GroupDashboardLayout>
        <div className="flex flex-col gap-3">
          {/* 그룹 정보 */}
          <div className="bg-white shadow-card h-[145px] w-[1024px] rounded-sm p-[12px]">
            <DashboardDetail />
          </div>

          <div>
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
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
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
            {roleLoaded && !isHost && isMember && (
              <button
                className="text-sm ml-auto mt-4 text-[#8C8C8C] hover:text-[#FF5252] transition"
                onClick={openLeaveModal}
              >
                모임나가기
              </button>
            )}
          </div>
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
