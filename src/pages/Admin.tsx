import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import PendingGroupsList from '../admin/PendingGroupsList';
import { AnimatePresence, motion } from 'framer-motion';

function Admin() {
  const tabs = useMemo(
    () => [
      {
        label: '모임 생성 신청 목록',
        content: (
          <div>
            <PendingGroupsList />
          </div>
        ),
      },
      {
        label: '문의 내역 목록',
        content: <div>문의내역 컴포넌트 작성 예정</div>,
      },
      {
        label: '회원 탈퇴 목록',
        content: <div>회원 탈퇴 목록 컴포넌트 작성예정</div>,
      },
    ],
    [],
  );

  const [selectedTab, setSelectedTab] = useState(tabs[0]);

  // underline 위치/너비 측정용
  const listRef = useRef<HTMLUListElement | null>(null);
  const tabRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [underline, setUnderline] = useState({ left: 0, width: 0 });

  const measure = () => {
    const idx = tabs.findIndex(t => t.label === selectedTab.label);
    const el = tabRefs.current[idx];
    const parent = listRef.current;
    if (!el || !parent) return;
    const er = el.getBoundingClientRect();
    const pr = parent.getBoundingClientRect();
    setUnderline({ left: er.left - pr.left, width: er.width });
  };

  useLayoutEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [selectedTab]);

  return (
    <>
      <div className="h-[125px]" />
      <div className="m-auto mb-[100px] border border-gray-300 w-[1024px] rounded-sm p-8 shadow-card">
        <div className="mb-5 font-semibold text-xxl ">관리자 페이지</div>

        {/* 탭 네비게이션 */}
        <nav className="h-[40px] border-b border-gray-300 mb-8">
          <ul ref={listRef} className="relative flex gap-9">
            {tabs.map((tab, i) => (
              <li
                key={tab.label}
                ref={el => (tabRefs.current[i] = el)}
                className={`cursor-pointer pt-1 ${tab.label === selectedTab.label ? 'text-brand text-lg font-bold' : 'text-gray-400 text-lg font-medium hover:text-brand'}`}
                onClick={() => setSelectedTab(tab)}
              >
                {tab.label}
              </li>
            ))}

            {/* underline 표시 */}
            <motion.div
              className="absolute bottom-[-11px] h-[3px] bg-brand"
              initial={false}
              animate={{ left: underline.left, width: underline.width }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </ul>
        </nav>

        {/* 콘텐츠 영역 */}
        <main>
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedTab.label}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {selectedTab.content}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </>
  );
}

export default Admin;
