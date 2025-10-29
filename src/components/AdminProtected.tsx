// 관리자 전용 protected

import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';

interface AdminProtectedProps {
  children: React.ReactNode;
}

export default function AdminProtected({ children }: AdminProtectedProps) {
  const { user } = useAuth();
  const [redirect, setRedirect] = useState(false);

  // 관리자 이메일 리스트
  const adminEmails = [
    'wltjs6668@naver.com',
    'dev.yachea@gmail.com',
    'sbkcoding@gmail.com',
    'lynn9702@naver.com',
  ];

  // 관리자 여부 체크
  const isAdmin = user ? adminEmails.includes(user.email ?? '') : false;

  // 로그인 안됨 또는 관리자 아님 → 2초 뒤 리다이렉트
  useEffect(() => {
    if (!user || (user && !isAdmin)) {
      // 2초 후 이동
      const timer = setTimeout(() => setRedirect(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [user, isAdmin]);

  if (redirect) {
    // 로그인 안됨 → /login, 로그인 됐지만 관리자 아님 → /
    return <Navigate to={user ? '/' : '/login'} replace />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="border rounded-sm w-[400px] p-6 text-center font-semibold text-brand border-gray-300 shadow-card bg-white text-lg">
          로그인 권한이 필요합니다. <br />
          <span className="text-black mt-1 font-medium text-md">
            잠시후 로그인 페이지로 이동합니다...
          </span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="border rounded-sm w-[400px] p-6 text-center font-semibold text-brand border-gray-300 shadow-card bg-white text-lg">
          관리자만 접근 가능합니다. <br />
          <span className="text-black mt-1 font-medium text-md">
            잠시후 메인 페이지로 이동합니다.
          </span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
