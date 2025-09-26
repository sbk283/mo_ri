// 스크롤 최상단 고정 컴포넌트
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // 라우트(pathname)가 바뀔 때마다 스크롤 최상단으로 이동
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
