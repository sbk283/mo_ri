// src/pages/GroupContentPage.tsx
import { AnimatePresence, motion } from 'framer-motion';
import { useLayoutEffect, useRef, useState, useMemo } from 'react';
import DashboardDetail from '../components/dashboard/DashboardDetail';
import { DashboardNotice } from '../components/dashboard/DashboardNotice';
import GroupDashboardLayout from '../components/layout/GroupDashboardLayout';
import GroupDailyContent from '../components/common/GroupDailyContent';
import { useParams } from 'react-router-dom';

function GroupContentPage() {
  const { id: groupId } = useParams<{ id: string }>();

  // 각 탭별 작성 트리거
  const [noticeCreateTick, setNoticeCreateTick] = useState(0);
  const [dailyCreateTick, setDailyCreateTick] = useState(0);

  // 탭 데이터 (DB 연동: 각 컴포넌트에 groupId 전달)
  const tabs = useMemo(
    () => [
      {
        label: '공지사항',
        content: (
          <div>
            <DashboardNotice groupId={groupId} />
          </div>
        ),
      },
      {
        label: '모임일상',
        content: (
          <div>
            <GroupDailyContent groupId={groupId} />
          </div>
        ),
      },
    ],
    [groupId],
  );

  // 선택된 탭 상태
  const [selectedTab, setSelectedTab] = useState(tabs[0]);

  // 언더라인 위치 계산용
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
  }, [selectedTab, tabs]);

  // 상단 "작성하기" 버튼
  const handleCreateClick = () => {
    if (selectedTab.label === '공지사항') setNoticeCreateTick(t => t + 1);
    else if (selectedTab.label === '모임일상') setDailyCreateTick(t => t + 1);
  };

  return (
    <div>
      <GroupDashboardLayout>
        <div className="flex flex-col gap-3">
          {/* 상단 그룹 정보 (DashboardDetail 내부에서 useParams로 group 불러옴) */}
          <div className="bg-white shadow-card h-[145px] w-[1024px] rounded-sm p-[12px]">
            <DashboardDetail />
          </div>

          {/* 게시판 */}
          <div className="bg-white shadow-card min-h-[770px] rounded-sm p-6">
            <div className="flex justify-between items-center">
              <p className="text-xxl font-bold mb-4">게시판</p>
              <button
                onClick={handleCreateClick}
                className="px-4 py-2 bg-brand text-white rounded hover:opacity-90 mb-4"
              >
                작성하기
              </button>
            </div>

            {/* 탭 네비게이션 */}
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
                        className={`text-xl font-bold transition-colors duration-200 ${
                          item.label === selectedTab.label
                            ? 'text-[#0689E8]'
                            : 'text-[#3c3c3c] hover:text-[#0689E8]'
                        }`}
                      >
                        {item.label}
                      </p>
                    </li>
                  ))}

                  {/* 탭 underline */}
                  <motion.div
                    className="absolute bottom-0 h-[4px] bg-[#0689E8] rounded"
                    initial={false}
                    animate={{ left: underline.left, width: underline.width }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </ul>
              </nav>

              {/* 탭 컨텐츠 */}
              <main className="flex justify-center min-h-[300px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedTab.label}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {selectedTab.label === '공지사항' ? (
                      <DashboardNotice groupId={groupId} createRequestKey={noticeCreateTick} />
                    ) : (
                      <GroupDailyContent groupId={groupId} createRequestKey={dailyCreateTick} />
                    )}
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
