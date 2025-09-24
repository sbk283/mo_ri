import React, { useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

function GroupMenu() {
  const tabs = [
    { icon: '🍅', label: '모집중' },
    { icon: '🥬', label: '진행중' },
    { icon: '🧀', label: '종료' },
  ];

  const [selectedTab, setSelectedTab] = useState(tabs[0]);

  // underline 위치/너비 계산용
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
    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [selectedTab]);

  return (
    <div className="w-full min-h-[500px]">
      {/* 네비게이션 */}
      <nav className="h-[40px] border-b-2 border-[#3c3c3c]">
        <ul ref={listRef} className="relative flex pb-1">
          {tabs.map((item, i) => (
            <li
              key={item.label}
              ref={el => (tabRefs.current[i] = el)}
              className="relative w-[130px] text-center pt-1 cursor-pointer"
              onClick={() => setSelectedTab(item)}
            >
              <p
                className={`text-xl font-bold transition-colors duration-200  ${
                  item.label === selectedTab.label
                    ? 'text-[#0689E8]'
                    : 'text-[#3c3c3c] hover:text-[#0689E8]'
                }`}
              >
                {item.label}
              </p>
            </li>
          ))}

          {/* underline: 항상 렌더링하고, 선택된 탭의 left/width로 이동 */}
          <motion.div
            className="absolute bottom-0 h-[4px] bg-[#0689E8] rounded"
            initial={false}
            animate={{ left: underline.left, width: underline.width }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </ul>
      </nav>

      {/* 콘텐츠 */}
      <main className="flex justify-center items-center min-h-[300px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTab.label}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {selectedTab.icon}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default GroupMenu;
