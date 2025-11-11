import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { Session, User } from "@supabase/supabase-js";
import { getProfile } from "../lib/profile";
import { supabase } from "../lib/supabase";
import ChatNotificationPanel from "./ChatNotificationPanel";
import { useAuth } from "../contexts/AuthContext"; // AuthContext 사용 추가

interface UserProfile {
  user_id: string;
  nickname: string | null;
  is_active: boolean | null;
}

const Header: React.FC = () => {
  // AuthContext로부터 현재 사용자 정보 가져옴 (로그인 상태 자동 반영됨)
  const { user, signOut, loading: authLoading } = useAuth();

  const [nickname, setNickname] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [showPanel, setShowPanel] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  // 사용자 정보 초기화 (프로필 정보를 가져와 닉네임 설정)
  const initUserSession = async (): Promise<void> => {
    // AuthContext 로딩이 끝나지 않았으면 실행하지 않음
    if (authLoading) return;

    // 로그인하지 않은 상태
    if (!user) {
      setNickname("");
      setLoading(false);
      return;
    }

    const profile: UserProfile | null = await getProfile(user.id);

    if (profile?.is_active === false) {
      await signOut();
      setNickname("");
      setLoading(false);
      return;
    }

    // 메타데이터에서 기본 이름 가져오기 (SNS 로그인 대비)
    const metadata = user.user_metadata ?? {};
    const socialName: string =
      metadata.full_name || metadata.name || metadata.nickname || "";

    // fallback: 이메일 앞부분
    const fallback: string = user.email?.split("@")[0] || "";

    // 닉네임 우선순위: profile.nickname → 소셜명 → fallback
    setNickname(profile?.nickname || socialName || fallback);

    setLoading(false);
  };

  // 로그아웃
  const handleLogout = async (): Promise<void> => {
    await signOut();
    navigate("/");
    window.sessionStorage.reload();
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

    setUnreadCount(0);
  };

  // unreadCount 실시간 업데이트: notifications + direct_messages 구독
  useEffect(() => {
    if (!user?.id) return;

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
          if (msg.sender_id === user.id) return;
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

  // 클라이언트 수동 알림 이벤트
  useEffect(() => {
    const handleManualNotify = () => {
      console.log("[Header] 클라이언트 알림 수신 (수동)");
      setUnreadCount((prev) => prev + 1);
    };

    window.addEventListener("notification:new", handleManualNotify);
    return () =>
      window.removeEventListener("notification:new", handleManualNotify);
  }, []);

  // 최초 사용자 세션 및 프로필 로딩
  useEffect(() => {
    initUserSession();
  }, [user, authLoading]);

  if (loading || authLoading) return null;

  const isLoggedIn: boolean = !!user;

  return (
    <>
      {/* Header 전체 영역 */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-white shadow-card">
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
                className={`font-bold hover:text-brand ${isActive("/groupmanager") ? "text-brand" : ""}`}
              >
                모임관리
              </Link>
              <Link
                to="/reviews"
                className={`font-bold hover:text-brand ${isActive("/reviews") ? "text-brand" : ""}`}
              >
                후기리뷰
              </Link>
              <Link
                to="/grouplist"
                className={`font-bold hover:text-brand ${isActive("/grouplist") ? "text-brand" : ""}`}
              >
                모임리스트
              </Link>
              <Link
                to="/mypage"
                className={`font-bold hover:text-brand ${isActive("/mypage") ? "text-brand" : ""}`}
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
              className="w-5 h-5"
            />
          </button>
        </div>

        {/* 모바일 드롭다운 */}
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
                onClick={() => setIsMenuOpen(false)}
                className="font-bold hover:text-brand"
              >
                모임관리
              </Link>
              <Link
                to="/reviews"
                onClick={() => setIsMenuOpen(false)}
                className="font-bold hover:text-brand"
              >
                후기리뷰
              </Link>
              <Link
                to="/grouplist"
                onClick={() => setIsMenuOpen(false)}
                className="font-bold hover:text-brand"
              >
                모임리스트
              </Link>
              <Link
                to="/mypage"
                onClick={() => setIsMenuOpen(false)}
                className="font-bold hover:text-brand"
              >
                마이페이지
              </Link>
            </nav>

            {isLoggedIn ? (
              <div className="flex flex-col items-center gap-3">
                <span className="font-medium text-blue-600">
                  {nickname}님 반가워요!
                </span>

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
