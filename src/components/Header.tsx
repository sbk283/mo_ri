import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { Session, User } from "@supabase/supabase-js";
import { getProfile } from "../lib/profile";
import { supabase } from "../lib/supabase";
import ChatNotificationPanel from "./ChatNotificationPanel";

interface UserProfile {
  user_id: string;
  nickname: string | null;
  is_active: boolean | null;
}

const Header: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [nickname, setNickname] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [showPanel, setShowPanel] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  // 사용자 세션 초기화
  const initUserSession = async (): Promise<void> => {
    const {
      data: { session },
    }: { data: { session: Session | null } } = await supabase.auth.getSession();

    if (!session?.user) {
      setUser(null);
      setNickname("");
      setLoading(false);
      return;
    }

    const currentUser = session.user;
    setUser(currentUser);

    const profile: UserProfile | null = await getProfile(currentUser.id);

    if (profile?.is_active === false) {
      await supabase.auth.signOut();
      setUser(null);
      setNickname("");
      setLoading(false);
      return;
    }

    const metadata = currentUser.user_metadata ?? {};
    const socialName: string =
      metadata.full_name || metadata.name || metadata.nickname || "";
    const fallback: string = currentUser.email?.split("@")[0] || "";
    setNickname(profile?.nickname || socialName || fallback);

    setLoading(false);
  };

  // 로그아웃
  const handleLogout = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("로그아웃 실패:", error.message);
    navigate("/");
    window.location.reload();
  };

  // 알림 패널 열기/닫기
  const handlePanelOpen = (): void => setShowPanel(true);
  const handlePanelClose = async (): Promise<void> => {
    setShowPanel(false);
    if (!user?.id) return;

    const { error } = await supabase.rpc("mark_notifications_read", {
      p_user_id: user.id,
    });

    if (error) {
      console.error("읽음 처리 실패:", error.message);
      return;
    }

    setUnreadCount(0); // 빨간 점 제거
  };

  // 초기 unreadCount 가져오기 (Header에서만 1회)
  useEffect(() => {
    if (!user?.id) return;

    // notifications 구독
    const notiChannel = supabase
      .channel(`header_notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const n = payload.new;
          console.log("[Header notifications 이벤트]", n);

          // chat 타입 포함 — 모든 알림 타입 허용
          if (
            [
              "chat",
              "review_like",
              "post_like",
              "group_approved",
              "group_request",
              "inquiry_new",
              "inquiry_reply",
            ].includes(n.type)
          ) {
            setUnreadCount((prev) => prev + 1);
          }
        },
      )
      .subscribe();

    // direct_messages 구독
    const dmChannel = supabase
      .channel(`header_dm:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
        },
        (payload) => {
          const msg = payload.new;
          if (!msg) return;
          // 내가 보낸 메시지는 제외
          if (msg.sender_id === user.id) return;
          // 상대가 나에게 보낸 메시지면 바로 알림
          console.log("[Header 새 메시지 감지]", msg);
          setUnreadCount((prev) => prev + 1);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notiChannel);
      supabase.removeChannel(dmChannel);
    };
  }, [user?.id]);

  useEffect(() => {
    const handleManualNotify = () => {
      console.log("[Header] 클라이언트 알림 수신 (수동)");
      setUnreadCount((prev) => prev + 1);
    };

    window.addEventListener("notification:new", handleManualNotify);
    return () =>
      window.removeEventListener("notification:new", handleManualNotify);
  }, []);

  // 최초 세션 로드
  useEffect(() => {
    initUserSession();
  }, []);

  if (loading) return null;
  const isLoggedIn: boolean = !!user;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-30 bg-white shadow-card">
        {/* 반응형 대응: 1024px 이상에서는 중앙 정렬 + 유동폭, 이하에서는 패딩 적용 */}
        <div className="mx-auto flex max-w-[1040px] w-full h-[70px] justify-between items-center py-4 px-4 pl-1">
          {/* 로고 */}
          <Link to="/">
            <img
              src="/images/mori_logo.svg"
              className="h-[24px] w-[75px]"
              alt="mori_logo"
            />
          </Link>

          {/* 메뉴 */}
          <div className="hidden md:flex items-center gap-9">
            <nav className="flex gap-6 text-gray-700">
              <Link
                to="/groupmanager"
                className={`font-bold hover:text-brand ${
                  isActive("/groupmanager") ? "text-brand" : ""
                }`}
              >
                모임관리
              </Link>
              <Link
                to="/reviews"
                className={`font-bold hover:text-brand ${
                  isActive("/reviews") ? "text-brand" : ""
                }`}
              >
                후기리뷰
              </Link>
              <Link
                to="/grouplist"
                className={`font-bold hover:text-brand ${
                  isActive("/grouplist") ? "text-brand" : ""
                }`}
              >
                모임리스트
              </Link>
              <Link
                to="/mypage"
                className={`font-bold hover:text-brand ${
                  isActive("/mypage") ? "text-brand" : ""
                }`}
              >
                마이페이지
              </Link>
            </nav>

            {/* 로그인 상태 */}
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <span className="font-medium text-blue-600">
                  {nickname}님 반가워요!
                </span>

                {/* 알림 아이콘 */}
                <button
                  onClick={handlePanelOpen}
                  className="relative focus:outline-none"
                >
                  <img
                    src="/images/notification.svg"
                    alt="알림"
                    className="h-4 w-4"
                  />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 -right-0.5 w-2 h-2 bg-brand-red rounded-full" />
                  )}
                </button>

                {/* 로그아웃 */}
                <button
                  onClick={handleLogout}
                  className="font-bold text-sm border px-3 py-1.5 rounded-sm border-brand text-brand hover:bg-blue-600 hover:text-white hover:border-blue-600 transition"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="font-bold text-sm px-3 py-1.5 rounded-lg bg-brand text-white hover:bg-blue-600"
              >
                로그인
              </Link>
            )}
          </div>

          {/* 모바일 메뉴 버튼 */}
          <button
            className="block md:hidden focus:outline-none transform transition-transform duration-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <img
              src="/images/hamburger_menu.svg"
              alt="hamburger_menu"
              className="w-5 h-5 "
            />
          </button>
        </div>

        {/* 모바일 메뉴 드롭다운 (768px 이하 전용) */}
        <div
          className={`md:hidden bg-white border-t border-gray-300 shadow-md px-4 overflow-hidden transform transition-all duration-500 ease-in-out ${
            isMenuOpen
              ? "max-h-[500px] opacity-100 translate-y-0"
              : "max-h-0 opacity-0 -translate-y-2"
          }`}
        >
          <div className="flex flex-col py-4 space-y-4">
            <nav className="flex flex-col items-center gap-4 text-gray-700">
              <Link
                to="/groupmanager"
                className="font-bold hover:text-brand"
                onClick={() => setIsMenuOpen(false)}
              >
                모임관리
              </Link>
              <Link
                to="/reviews"
                className="font-bold hover:text-brand"
                onClick={() => setIsMenuOpen(false)}
              >
                후기리뷰
              </Link>
              <Link
                to="/grouplist"
                className="font-bold hover:text-brand"
                onClick={() => setIsMenuOpen(false)}
              >
                모임리스트
              </Link>
              <Link
                to="/mypage"
                className="font-bold hover:text-brand"
                onClick={() => setIsMenuOpen(false)}
              >
                마이페이지
              </Link>
            </nav>

            {/* 로그인 상태 (모바일) */}
            {isLoggedIn ? (
              <div className="flex flex-col items-center gap-3">
                <span className="font-medium text-blue-600">
                  {nickname}님 반가워요!
                </span>

                {/* 알림 아이콘 */}
                <button
                  onClick={handlePanelOpen}
                  className="relative focus:outline-none"
                >
                  <img
                    src="/images/notification.svg"
                    alt="알림"
                    className="h-4 w-4"
                  />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 -right-0.5 w-2 h-2 bg-brand-red rounded-full" />
                  )}
                </button>

                {/* 로그아웃 버튼 */}
                <button
                  onClick={handleLogout}
                  className="font-bold text-sm border px-3 py-2 rounded-lg border-brand text-brand hover:bg-blue-600 hover:text-white hover:border-blue-600 transition"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="font-bold text-sm px-3 py-2 rounded-sm bg-brand text-white hover:bg-blue-600"
              >
                로그인
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* 알림 패널 */}
      <ChatNotificationPanel
        open={showPanel}
        onClose={handlePanelClose}
        userId={user?.id ?? null}
        onUnreadChange={(count: number) => setUnreadCount(count)}
      />
    </>
  );
};

export default Header;
