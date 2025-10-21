import { useEffect, type PropsWithChildren } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/**
 * 로그인 한 사용자가 접근할 수 있는 페이지
 * - 사용자 프로필 페이지
 * - 관리자 대시보드 페이지
 * - 개인 설정 페이지
 * - 구매 내역 페이지  등등
 */
const Protected: React.FC<PropsWithChildren> = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function checkUserStatus() {
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('is_active')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('프로필 조회 오류:', error);
        // 필요에 따라 에러 처리
        return;
      }

      if (!profile?.is_active) {
        await supabase.auth.signOut();
        navigate('/login');
        return;
      }
    }

    if (!loading) {
      checkUserStatus();
    }
  }, [user, loading, navigate]);

  if (loading) {
    // 사용자 정보가 로딩중이라면
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.7)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div>로딩중...</div>
      </div>
    );
  }

  // 로그인이 안되어서 user 정보가 없으면 로그인 페이지로 이동
  if (!user) {
    return <Navigate to={'/login'} replace />;
  }
  return <div>{children}</div>;
};

export default Protected;
