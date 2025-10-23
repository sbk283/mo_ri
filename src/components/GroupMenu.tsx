import { AnimatePresence, motion } from 'motion/react';
import { useLayoutEffect, useRef, useState } from 'react';
import GroupContentBox from './GroupContentBox';

function GroupMenu() {
  const tabs = [
    {
      label: '모집중',
      content: (
        <div>
          <GroupContentBox />
        </div>
      ),
    },
    {
      label: '진행중',
      content: (
        <div>
          <GroupContentBox />
        </div>
      ),
    },
    {
      label: '종료',
      content: (
        <div>
          <GroupContentBox />
        </div>
      ),
    },
  ];

  const [selectedTab, setSelectedTab] = useState(tabs[0]);
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
      <nav className="h-[40px] border-b border-gray-300">
        <ul ref={listRef} className="relative flex pb-[5px]">
          {tabs.map((item, i) => (
            <li
              key={item.label}
              ref={el => (tabRefs.current[i] = el)}
              className="relative w-[130px] text-center pt-1 top-[-10px] cursor-pointer"
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
          <motion.div
            className="absolute bottom-0 h-[4px] bg-[#0689E8] rounded"
            initial={false}
            animate={{ left: underline.left, width: underline.width }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </ul>
      </nav>

      {/* 콘텐츠 */}
      <main className="flex justify-center items-center mt-10">
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
  );
}

export default GroupMenu;
