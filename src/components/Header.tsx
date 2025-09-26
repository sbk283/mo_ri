import React from 'react';
import { Link } from 'react-router-dom';

type HeaderProps = {
  isLoggedIn: boolean;
  userName?: string;
};

const Header: React.FC<HeaderProps> = ({ isLoggedIn, userName }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-card">
      <div className="mx-auto flex w-[1024px] h-[70px] justify-between items-center py-4">
        {/* 왼쪽 */}
        <div className="flex items-center gap-6">
          {/* 로고 */}
          <Link to="/" className="font-bold text-gray-800">
            <img
              src="/images/mori_logo.svg"
              className="h-[24px] w-[75px] min-w-[75px]"
              alt="mori_logo"
            />
          </Link>
        </div>

        {/* 오른쪽 */}
        <div className="flex items-center gap-10">
          <nav className="flex gap-6 text-gray-700">
            <Link to="/groupmanager" className="font-bold hover:text-brand">
              모임관리
            </Link>
            <Link to="/groupreviews" className="font-bold hover:text-brand">
              후기리뷰
            </Link>
            <Link to="/grouplist" className="font-bold hover:text-brand">
              모임리스트
            </Link>
          </nav>

          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <span className="font-medium text-blue-600">{userName}님 반가워요 ✨</span>
              <Link to="/mypage" className="text-xs text-gray-500 hover:underline">
                마이페이지
              </Link>
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
