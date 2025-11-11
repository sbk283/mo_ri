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
import SuccessModal from "../components/common/modal/SuccessModal";
import { useAuth } from "../contexts/AuthContext";
import { useGroupMember } from "../contexts/GroupMemberContext";

type TabLabel = "공지사항" | "모임일상";
type TabParam = "notice" | "daily";

const labelToParam = (label: TabLabel): TabParam =>
  label === "공지사항" ? "notice" : "daily";
const paramToLabel = (param?: string | null): TabLabel =>
  param === "daily" ? "모임일상" : "공지사항";

function GroupContentPage() {
  const { user, loading: authLoading } = useAuth();
  const { members, fetchMembers } = useGroupMember();

  const [isLeader, setIsLeader] = useState(false);
  const [isMember, setIsMember] = useState(false);

  const { id: groupId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const DETAIL_KEYS = ["post", "view", "mode", "edit", "create"] as const;

  const [noticeCreateTick, setNoticeCreateTick] = useState(0);
  const [dailyCreateTick, setDailyCreateTick] = useState(0);
  const [tabResetKey, setTabResetKey] = useState(0);

  const [selectedTabLabel, setSelectedTabLabel] = useState<TabLabel>(() => {
    const sp = new URLSearchParams(window.location.search);
    const tabParam = (sp.get("tab") as TabParam | null) ?? null;
    return paramToLabel(tabParam);
  });

  const setTabAndClearDetail = (
    tabParam: TabParam,
    opts?: { replace?: boolean },
  ) => {
    const sp = new URLSearchParams(location.search);
    sp.set("tab", tabParam);
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

  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const tabParam = (sp.get("tab") as TabParam | null) ?? null;
    const label = paramToLabel(tabParam);
    setSelectedTabLabel(label);

    const normalized = labelToParam(label);
    if (!tabParam || tabParam !== normalized) {
      setTabAndClearDetail(normalized, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, groupId]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) navigate("/login");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!groupId) return;
    fetchMembers(groupId);
  }, [groupId, fetchMembers]);

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

  const tabKey = useMemo(
    () => `${selectedTabLabel}-${tabResetKey}`,
    [selectedTabLabel, tabResetKey],
  );

  const handleTabClick = (label: TabLabel) => {
    setSelectedTabLabel(label);
    setTabAndClearDetail(labelToParam(label));
    setTabResetKey((v) => v + 1);
  };

  const [isNoticeCrafting, setIsNoticeCrafting] = useState(false);
  const [isDailyCrafting, setIsDailyCrafting] = useState(false);

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

  const isCrafting =
    selectedTabLabel === "공지사항" ? isNoticeCrafting : isDailyCrafting;

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

  const inFormView = isEditView || isCreateView;

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

  const handleCreateClick = () => {
    const tabParam = labelToParam(selectedTabLabel);
    const sp = new URLSearchParams(location.search);

    sp.set("tab", tabParam);
    DETAIL_KEYS.forEach((k) => sp.delete(k));
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

    if (selectedTabLabel === "공지사항") {
      setNoticeCreateTick((t) => t + 1);
    } else {
      setDailyCreateTick((t) => t + 1);
    }
  };

  const showCreateButton =
    !inFormView &&
    !isCrafting &&
    (selectedTabLabel === "공지사항" ? roleLoaded && isHost : true);

  // 모임 나가기 확인 모달
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);

  // 탈퇴 결과 모달 (SuccessModal)
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [resultType, setResultType] = useState<"success" | "error">("success");
  const [redirectAfterModal, setRedirectAfterModal] = useState(false);

  const openResultModal = (
    message: string,
    type: "success" | "error" = "success",
    options?: { redirectHome?: boolean },
  ) => {
    setResultMessage(message);
    setResultType(type);
    setResultModalOpen(true);
    setRedirectAfterModal(!!options?.redirectHome);
  };

  const handleResultModalClose = () => {
    setResultModalOpen(false);
    if (redirectAfterModal) {
      setRedirectAfterModal(false);
      navigate("/");
    }
  };

  const openLeaveModal = () => {
    if (!roleLoaded) return;

    if (isHost) {
      openResultModal("호스트(관리자)는 모임을 탈퇴할 수 없습니다.", "error");
      return;
    }

    if (!isMember) {
      openResultModal("현재 이 모임에 가입된 상태가 아닙니다.", "error");
      return;
    }

    setLeaveModalOpen(true);
  };

  const handleLeaveGroup = async () => {
    const userId = user?.id;

    if (!userId || !groupId) {
      openResultModal("유효하지 않은 요청입니다.", "error");
      setLeaveModalOpen(false);
      return;
    }

    if (isHost) {
      openResultModal("호스트(관리자)는 모임을 탈퇴할 수 없습니다.", "error");
      setLeaveModalOpen(false);
      return;
    }

    if (!isMember) {
      openResultModal("현재 이 모임에 가입된 상태가 아닙니다.", "error");
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
      openResultModal("모임 탈퇴 중 오류가 발생했습니다.", "error");
      setLeaveModalOpen(false);
      return;
    }

    openResultModal("모임에서 탈퇴되었습니다.", "success", {
      redirectHome: true,
    });
    setLeaveModalOpen(false);
  };

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
          <div className="bg-white shadow-card h-[145px] w-[1024px] rounded-sm p-[12px]">
            <DashboardDetail />
          </div>

          <div>
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

      <SuccessModal
        isOpen={resultModalOpen}
        message={resultMessage}
        type={resultType}
        onClose={handleResultModalClose}
      />
    </div>
  );
}

export default GroupContentPage;
