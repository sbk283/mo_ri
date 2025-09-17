import React from 'react';
import { Link } from 'react-router-dom';

type HeaderProps = {
  isLoggedIn: boolean;
  userName?: string;
};

const Header: React.FC<HeaderProps> = ({ isLoggedIn, userName }) => {
  return (
    <header className="mx-auto w-[1024px] flex justify-between items-center py-3 shadow-md bg-white">
      {/* 좌측 */}
      <Link to="/" className="font-bold text-gray-800">
        <img src="/images/mori_logo.svg" className="h-[24px] w-[75px]" alt="mori_logo" />
      </Link>

      {/* 오른쪽 */}
      <div className="flex items-center gap-10">
        {/* 네비게이션 */}
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
          <div>
            <span className="font-medium">{userName}님</span>
            <button className="font-bold px-5 py-3 rounded bg-gray-200 hover:bg-gray-300">
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
    </header>
  );
};

export default Header;
