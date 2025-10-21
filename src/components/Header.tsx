import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProfile } from '../lib/profile';
import { supabase } from '../lib/supabase';

const Header: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [nickname, setNickname] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 로그인 상태 + 프로필 닉네임 로드
  useEffect(() => {
    const fetchUserAndProfile = async () => {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);

        const profile = await getProfile(session.user.id);

        // 비활성화 계정일 경우 즉시 로그아웃 처리
        if (profile && profile.is_active === false) {
          await supabase.auth.signOut();
          setUser(null);
          setNickname('');
          setLoading(false);
          return;
        }

        // 닉네임
        const metadata = session.user.user_metadata;
        const socialName = metadata.full_name || metadata.name || metadata.nickname || '';
        const fallback = session.user.email?.split('@')[0] || '';

        if (profile?.nickname) setNickname(profile.nickname);
        else if (socialName) setNickname(socialName);
        else setNickname(fallback);
      } else {
        setUser(null);
        setNickname('');
      }

      setLoading(false);
    };
    fetchUserAndProfile();

    // 로그인 / 로그아웃 / 프로필 변경 시 자동 업데이트
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      fetchUserAndProfile();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // 프로필 테이블 변경 감시 (닉네임 바뀌면 즉시 반영)
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user_profiles-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_profiles',
          filter: `user_id=eq.${user.id}`,
        },
        async _payload => {
          const updated = await getProfile(user.id);
          if (updated?.nickname) setNickname(updated.nickname);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // 로그아웃
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('로그아웃 실패:', error.message);
      return;
    }
    navigate('/');
    window.location.reload();
  };

  if (loading) return null; // 초기 로딩시 깜박임 방지

  const isLoggedIn = !!user;

  return (
    <header className="fixed top-0 -left-3 right-0 z-50 bg-white shadow-card">
      <div className="mx-auto flex w-[1024px] h-[70px] justify-between items-center py-4">
        {/* 로고 */}
        <Link to="/" className="font-bold text-gray-800">
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
          </nav>

          {/* 로그인 상태별 렌더링 */}
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <span className="font-medium text-blue-600">{nickname}님 반가워요 ✨</span>
              <Link to="/mypage" className="text-xs text-gray-500 hover:underline">
                마이페이지
              </Link>
              <button
                onClick={handleLogout}
                className="font-bold border px-5 py-2 rounded-lg border-brand text-brand hover:bg-blue-600 hover:text-white hover:border-blue-600 transition"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="font-bold px-5 py-2 rounded-lg bg-brand text-white hover:bg-blue-600"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
