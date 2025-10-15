import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getProfile } from '../lib/profile';
import { supabase } from '../lib/supabase';

const Header: React.FC = () => {
  const { user, session } = useAuth();
  const isLoggedIn = !!session;
  const [nickname, setNickname] = useState<string>('');
  const navigate = useNavigate(); // 로그아웃 후 리다이렉트

  useEffect(() => {
    const fetchNickname = async () => {
      if (!user) return;

      // 카카오 로그인 시 metadata에서 바로 닉네임 가져오기
      if (user.user_metadata?.nickname) {
        setNickname(user.user_metadata.nickname);
        return;
      }

      // 일반 회원 - DB(user_profiles)에서 닉네임 조회
      const profile = await getProfile(user.id);
      if (profile?.nickname) {
        setNickname(profile.nickname);
      } else {
        setNickname(user.email?.split('@')[0] || '');
      }
    };

    fetchNickname();
  }, [user]);

  // 로그아웃 함수
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('로그아웃 실패:', error.message);
      return;
    }
    // 세션 초기화 후 메인으로 이동
    navigate('/');
    window.location.reload();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-card">
      <div className="mx-auto flex w-[1024px] h-[70px] justify-between items-center py-4">
        {/* 왼쪽 로고 */}
        <Link to="/" className="font-bold text-gray-800">
          <img src="/images/mori_logo.svg" className="h-[24px] w-[75px]" alt="mori_logo" />
        </Link>

        {/* 오른쪽 메뉴 */}
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

              {/* 로그아웃 버튼 */}
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
