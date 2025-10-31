import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Session, User, RealtimeChannel } from '@supabase/supabase-js';
import { getProfile } from '../lib/profile';
import { supabase } from '../lib/supabase';
import ChatNotificationPanel from './ChatNotificationPanel';

interface UserProfile {
  user_id: string;
  nickname: string | null;
  is_active: boolean | null;
}

const Header: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [nickname, setNickname] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [showPanel, setShowPanel] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const navigate = useNavigate();

  // 사용자 세션 초기화
  const initUserSession = async (): Promise<void> => {
    const {
      data: { session },
    }: { data: { session: Session | null } } = await supabase.auth.getSession();

    if (!session?.user) {
      setUser(null);
      setNickname('');
      setLoading(false);
      return;
    }

    const currentUser = session.user;
    setUser(currentUser);

    const profile: UserProfile | null = await getProfile(currentUser.id);

    if (profile?.is_active === false) {
      await supabase.auth.signOut();
      setUser(null);
      setNickname('');
      setLoading(false);
      return;
    }

    const metadata = currentUser.user_metadata ?? {};
    const socialName: string = metadata.full_name || metadata.name || metadata.nickname || '';
    const fallback: string = currentUser.email?.split('@')[0] || '';
    setNickname(profile?.nickname || socialName || fallback);

    setLoading(false);
  };

  // 로그아웃
  const handleLogout = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('로그아웃 실패:', error.message);
    navigate('/');
    window.location.reload();
  };

  // 알림 패널 열기
  const handlePanelOpen = (): void => setShowPanel(true);

  // 알림 패널 닫기 (읽음 처리)
  const handlePanelClose = async (): Promise<void> => {
    setShowPanel(false);
    if (!user?.id) return;

    // 읽음 처리용 RPC
    const { error } = await supabase.rpc('mark_notifications_read', {
      p_user_id: user.id,
    });

    if (error) {
      console.error('읽음 처리 실패:', error.message);
      return;
    }

    // 모든 알림 읽음 처리 후 헤더 빨간 점 초기화
    setUnreadCount(0);
  };

  // 초기 세션 로드 및 프로필 실시간 감시
  useEffect(() => {
    let profileChannel: RealtimeChannel | null = null;

    const setup = async (): Promise<void> => {
      await initUserSession();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const userId = session.user.id;

        profileChannel = supabase
          .channel(`user_profiles:${userId}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'user_profiles',
              filter: `user_id=eq.${userId}`,
            },
            async () => {
              const updated = await getProfile(userId);
              if (updated?.nickname) setNickname(updated.nickname);
            },
          )
          .subscribe();
      }
    };

    setup();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      initUserSession();
    });

    return () => {
      listener.subscription.unsubscribe();
      if (profileChannel) supabase.removeChannel(profileChannel);
    };
  }, []);

  if (loading) return null;
  const isLoggedIn: boolean = !!user;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-30 bg-white shadow-card">
        <div className="mx-auto flex w-[1024px] h-[70px] justify-between items-center py-4">
          {/* 로고 */}
          <Link to="/">
            <img src="/images/mori_logo.svg" className="h-[24px] w-[75px]" alt="mori_logo" />
          </Link>

          {/* 메뉴 */}
          <div className="flex items-center gap-10">
            <nav className="flex gap-6 text-gray-700">
              <Link to="/groupmanager" className="font-bold hover:text-brand">
                모임관리
              </Link>
              <Link to="/reviews" className="font-bold hover:text-brand">
                후기리뷰
              </Link>
              <Link to="/grouplist" className="font-bold hover:text-brand">
                모임리스트
              </Link>
              {/* 마이페이지 */}
              <Link to="/mypage">
                <p className="font-bold hover:text-brand">마이페이지</p>
              </Link>
            </nav>

            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <span className="font-medium text-blue-600">{nickname}님 반가워요!</span>
                {/* 채팅 알림 아이콘 */}
                <button onClick={handlePanelOpen} className="relative focus:outline-none">
                  <img src="/images/notification.svg" alt="채팅 알림" className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 -right-0.5 w-2 h-2 bg-brand-red rounded-full" />
                  )}
                </button>

                {/* 로그아웃 */}
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
                className="font-bold text-sm px-3 py-2 rounded-lg bg-brand text-white hover:bg-blue-600"
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
