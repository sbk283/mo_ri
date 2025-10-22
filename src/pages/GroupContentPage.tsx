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

  // 현재 탭 라벨만 보관 (객체 참조 꼬임 방지)
  const [selectedTabLabel, setSelectedTabLabel] = useState<'공지사항' | '모임일상'>('공지사항');

  // 탭별 작성중 상태 (상단 버튼 숨김 제어용)
  const [isNoticeCrafting, setIsNoticeCrafting] = useState(false);
  const [isDailyCrafting, setIsDailyCrafting] = useState(false);

  // 탭 데이터 (tick 포함해서 자식 프롭 갱신 보장)
  const tabs = useMemo(
    () => [
      {
        label: '공지사항' as const,
        content: (
          <div>
            <DashboardNotice
              groupId={groupId}
              createRequestKey={noticeCreateTick}
              onCraftingChange={setIsNoticeCrafting}
            />
          </div>
        ),
      },
      {
        label: '모임일상' as const,
        content: (
          <div>
            <GroupDailyContent
              groupId={groupId}
              createRequestKey={dailyCreateTick}
              onCraftingChange={setIsDailyCrafting}
            />
          </div>
        ),
      },
    ],
    [groupId, noticeCreateTick, dailyCreateTick],
  );

  const currentTab = tabs.find(t => t.label === selectedTabLabel)!;

  // 현재 탭 작성중 여부
  const isCrafting = selectedTabLabel === '공지사항' ? isNoticeCrafting : isDailyCrafting;

  // 언더라인 위치 계산용
  const listRef = useRef<HTMLUListElement | null>(null);
  const tabRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [underline, setUnderline] = useState({ left: 0, width: 0 });

  const measure = () => {
    const idx = tabs.findIndex(t => t.label === selectedTabLabel);
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
  }, [selectedTabLabel, tabs]);

  // 상단 "작성하기" 버튼
  const handleCreateClick = () => {
    if (selectedTabLabel === '공지사항') setNoticeCreateTick(t => t + 1);
    else setDailyCreateTick(t => t + 1);
  };

  return (
    <div>
      <GroupDashboardLayout>
        <div className="flex flex-col gap-3">
          {/* 상단 그룹 정보 */}
          <div className="bg-white shadow-card h-[145px] w-[1024px] rounded-sm p-[12px]">
            <DashboardDetail />
          </div>

          {/* 게시판 */}
          <div className="bg-white shadow-card min-h-[590px] rounded-sm p-6">
            <div className="flex justify-between items-center">
              <p className="text-xxl font-bold mb-4">게시판</p>

              {/* 작성중이면 버튼 숨김 */}
              {!isCrafting && (
                <button
                  type="button"
                  onClick={handleCreateClick}
                  className="px-4 py-2 bg-brand text-white rounded hover:opacity-90 mb-4"
                >
                  작성하기
                </button>
              )}
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
                      onClick={() => setSelectedTabLabel(item.label)}
                    >
                      <p
                        className={`text-xl font-bold transition-colors duration-200 ${
                          item.label === selectedTabLabel
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
                    key={selectedTabLabel}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {currentTab.content}
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
