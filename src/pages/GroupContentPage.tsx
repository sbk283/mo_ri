import { AnimatePresence, motion } from 'motion/react';
import DashboardDetail from '../components/dashboard/DashboardDetail';
import GroupDashboardLayout from '../components/layout/GroupDashboardLayout';
import { useLayoutEffect, useRef, useState } from 'react';
import DashboardNotice from '../components/dashboard/DashboardNotice';

function GroupContentPage() {
  const tabs = [
    {
      label: '공지사항',
      content: (
        <div>
          <DashboardNotice />
        </div>
      ),
    },
    {
      label: '모임일상',
      content: <div></div>,
    },
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
    <div>
      <GroupDashboardLayout>
        <div className="flex flex-col gap-3">
          <div className="bg-white shadow-card h-[145px] w-[1024px] rounded-sm p-[12px]">
            <DashboardDetail />
          </div>
          <div className="bg-white shadow-card h-[770px] rounded-sm p-6">
            <div>
              <p className="text-xxl font-bold mb-4">게시판</p>
            </div>
            <div className="w-full">
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
              <main className="flex justify-center items-center min-h-[300px]">
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
          </div>
        </div>
      </GroupDashboardLayout>
    </div>
  );
}

export default GroupContentPage;
