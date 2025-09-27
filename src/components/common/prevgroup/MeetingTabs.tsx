import { useRef, useState, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import MeetingLeaderInfo from './MeetingLeaderInfo';
import MeetingCurriculum from './MeetingCurriculum';
import type { GroupFormData } from '../../../types/group';

function MeetingTabs({ formData }: { formData: GroupFormData }) {
  // 각각의 구역(모임소개, 커리큘럼, 모임장) 위치 기억하기
  const introBox = useRef<HTMLDivElement>(null);
  const curriculumBox = useRef<HTMLDivElement>(null);
  const leaderBox = useRef<HTMLDivElement>(null);

  // 탭 버튼 리스트
  const tabButtons = [
    { name: '모임소개', box: introBox },
    { name: '커리큘럼', box: curriculumBox },
    { name: '모임장', box: leaderBox },
  ];

  // 현재 눌린 탭
  const [currentTab, setCurrentTab] = useState(tabButtons[0]);

  // underline 위치와 크기
  const menuList = useRef<HTMLUListElement | null>(null);
  const buttonRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [linePos, setLinePos] = useState({ left: 0, width: 0 });

  // underline 위치 계산하기
  const updateLine = () => {
    const idx = tabButtons.findIndex(t => t.name === currentTab.name);
    const el = buttonRefs.current[idx];
    const parent = menuList.current;
    if (!el || !parent) return;
    const er = el.getBoundingClientRect();
    const pr = parent.getBoundingClientRect();
    setLinePos({ left: er.left - pr.left, width: er.width });
  };

  useLayoutEffect(() => {
    updateLine();
    const onResize = () => updateLine();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [currentTab]);

  // 스크롤 이동
  const goToBox = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="w-full">
      {/* 탭 메뉴 */}
      <nav className="h-[40px] border-b border-gray-300 mb-6">
        <ul ref={menuList} className="relative flex pb-[5px]">
          {tabButtons.map((tab, i) => (
            <li
              key={tab.name}
              ref={el => (buttonRefs.current[i] = el)}
              className="relative w-[130px] text-center pt-1 top-[-10px] cursor-pointer"
              onClick={() => {
                setCurrentTab(tab);
                goToBox(tab.box);
              }}
            >
              <p
                className={`text-xl font-bold transition-colors duration-200 ${
                  tab.name === currentTab.name
                    ? 'text-[#0689E8]'
                    : 'text-[#3c3c3c] hover:text-[#0689E8]'
                }`}
              >
                {tab.name}
              </p>
            </li>
          ))}

          {/* underline */}
          <motion.div
            className="absolute bottom-0 h-[4px] bg-[#0689E8]"
            initial={false}
            animate={{ left: linePos.left, width: linePos.width }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </ul>
      </nav>

      {/* 모임 소개 */}
      <motion.div
        ref={introBox}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="mb-10"
      >
        <div
          className="prose max-w-none border border-gray-300 p-4"
          dangerouslySetInnerHTML={{
            __html: formData.description || '<p>소개 내용이 없습니다.</p>',
          }}
        />
      </motion.div>

      {/* 커리큘럼 */}
      <motion.div
        ref={curriculumBox}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mb-10"
      >
        <MeetingCurriculum formData={formData} />
      </motion.div>

      {/* 모임장 */}
      <motion.div
        ref={leaderBox}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <MeetingLeaderInfo formData={formData} />
      </motion.div>
    </div>
  );
}

export default MeetingTabs;
