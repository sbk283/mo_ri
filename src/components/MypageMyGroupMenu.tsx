import { AnimatePresence, motion } from 'motion/react';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { usePDFPrintHandler } from '../utils/print/PDFPrintHandler';
import CreatedGroupsHistory from './groupHistory/CreatedGroupsHistory';
import ParticipationHistory from './groupHistory/ParticipationHistory';

function MypageMyGroupMenu() {
  const [checkedCount, setCheckedCount] = useState(0);
  // 프린트 설정할거임
  const [checkedItems, setCheckedItems] = useState<any[]>([]);

  // 프린트 테스트
  const { printSelectedItems, isPrinting } = usePDFPrintHandler();
  const handleCheckChange = (items: any[]) => {
    setCheckedItems(items);
    setCheckedCount(items.length);
  };

  //전체 선택을 위한 ref 저장
  const participationRef = useRef<{ selectAll: () => void }>(null);
  const createdRef = useRef<{ selectAll: () => void }>(null);

  // tab 을 useMemo 를 써서 불필요한 재생성 방지.
  const tabs = useMemo(
    () => [
      {
        label: '모임 참여 이력',
        content: (
          <div>
            <ParticipationHistory onCheckChange={handleCheckChange} ref={participationRef} />
          </div>
        ),
        ref: participationRef,
      },
      {
        label: '모임 생성 이력',
        content: (
          <div>
            <CreatedGroupsHistory onCheckChange={handleCheckChange} ref={createdRef} />
          </div>
        ),
        ref: createdRef,
      },
    ],
    [],
  );

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

  // 전체선택 핸들러
  const handleSelectAll = () => {
    const currentTabIndex = tabs.findIndex(t => t.label === selectedTab.label);
    const currentRef = tabs[currentTabIndex].ref;

    if (currentRef?.current?.selectAll) {
      currentRef.current.selectAll();
    }
  };

  // 출력하기 버튼 핸들러
  const handlePrint = () => {
    if (checkedCount === 0) {
      alert('출력할 항목을 선택해주세요.');
      return;
    }
    const allMeetings = checkedItems; // 선택된 모임 배열
    const selectedIds = checkedItems.map(item => item.group_id); // id 배열

    printSelectedItems(allMeetings, selectedIds);
  };

  return (
    <div className="w-full">
      {/* 네비게이션 */}
      <nav className="h-[40px] border-b-[1px] border-gray-300">
        <ul ref={listRef} className="relative flex pb-[5px] ">
          {tabs.map((item, i) => (
            <li
              key={item.label}
              ref={el => (tabRefs.current[i] = el)}
              className="relative w-[167px] text-center pt-1 top-[-10px] cursor-pointer "
              onClick={() => {
                setSelectedTab(item);
                setCheckedCount(0);
              }}
            >
              <p
                className={`text-xl font-bold transition-colors duration-200   ${
                  item.label === selectedTab.label ? 'text-brand' : 'text-gray-400 hover:text-brand'
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
      <div className="flex justify-between items-center mb-[26px]  mt-[17px]">
        <div className="border-l-[4px] border-brand  text-md pl-[16px]  text-gray-400 font-bold">
          참여 이력을 선택하여 원하는 이력만 출력이 가능합니다.
        </div>
        <button
          onClick={handleSelectAll}
          className="bg-brand text-white py-[4px] px-[12px]  rounded-[5px] font-medium text-sm "
        >
          전체선택
        </button>
      </div>

      {/* 콘텐츠 출력 */}
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

      {/* 참여이력 출력하기 버튼 */}
      <div className="flex justify-end ">
        <button
          onClick={handlePrint}
          disabled={checkedCount === 0 || isPrinting}
          className={`text-xl mt-[10px] py-[8px] px-[28px] rounded-[5px] font-bold transition-colors ${
            checkedCount === 0 || isPrinting
              ? 'bg-gray-300 text-white cursor-not-allowed'
              : 'bg-brand text-white hover:bg-blue-600'
          }`}
        >
          참여 이력 출력하기
        </button>
      </div>
      {/* <div>
        미리보기
        <PDFPreview items={checkedItems} />
      </div> */}
    </div>
  );
}

export default MypageMyGroupMenu;
