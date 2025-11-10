// 스크롤 최상단 고정 컴포넌트
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // 윈도우 말고 root 엘리먼트(root 엘리먼트:main.tsx 보시면 거기쪽.!) 찾아서 리엑트앱 렌더링
    // const root = document.getElementById("root");
    // if (root) {
    //   root.scrollTo(0, 0);
    // } else {
    //   window.scrollTo(0, 0);
    // }
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default ScrollToTop;
