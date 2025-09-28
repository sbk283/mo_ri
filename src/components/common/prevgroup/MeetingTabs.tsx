import { useRef, useState, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import MeetingLeaderInfo from './MeetingLeaderInfo';
import MeetingCurriculum from './MeetingCurriculum';

interface MeetingTabsProps {
  intro: string;
  curriculum: {
    title: string;
    detail: string;
    files?: string[];
  }[];
  leader: {
    name: string;
    location?: string;
    career?: string;
  };
}

function MeetingTabs({ intro, curriculum, leader }: MeetingTabsProps) {
  // 각 구역 박스 (모임소개 / 커리큘럼 / 모임장)
  const introSectionRef = useRef<HTMLDivElement>(null);
  const curriculumSectionRef = useRef<HTMLDivElement>(null);
  const leaderSectionRef = useRef<HTMLDivElement>(null);

  // 탭 버튼 목록 (내려갈 구역으로)
  const tabList = [
    { label: '모임소개', targetRef: introSectionRef },
    { label: '커리큘럼', targetRef: curriculumSectionRef },
    { label: '모임장', targetRef: leaderSectionRef },
  ];

  // 현재 선택된 탭
  const [activeTab, setActiveTab] = useState(tabList[0]);

  // underline(밑줄) 위치 관리
  const tabMenuRef = useRef<HTMLUListElement | null>(null); // 탭 전체 메뉴
  const tabButtonRefs = useRef<(HTMLLIElement | null)[]>([]); // 각 버튼
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

  // underline 위치 업데이트
  const updateUnderline = () => {
    const idx = tabList.findIndex(tab => tab.label === activeTab.label);
    const currentButton = tabButtonRefs.current[idx];
    const tabMenu = tabMenuRef.current;
    if (!currentButton || !tabMenu) return;

    const buttonRect = currentButton.getBoundingClientRect();
    const menuRect = tabMenu.getBoundingClientRect();
    setUnderlineStyle({ left: buttonRect.left - menuRect.left, width: buttonRect.width });
  };

  useLayoutEffect(() => {
    updateUnderline();
    const handleResize = () => updateUnderline();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTab]);

  // 특정 구역으로 부드럽게 스크롤 이동
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="w-full">
      {/* 탭 메뉴 */}
      <nav className="h-[40px] border-b border-gray-300 mb-6">
        <ul ref={tabMenuRef} className="relative flex pb-[5px]">
          {tabList.map((tab, index) => (
            <li
              key={tab.label}
              ref={el => (tabButtonRefs.current[index] = el)}
              className="relative w-[130px] text-center pt-1 top-[-10px] cursor-pointer"
              onClick={() => {
                setActiveTab(tab);
                scrollToSection(tab.targetRef);
              }}
            >
              <p
                className={`text-xl font-bold transition-colors duration-200 ${
                  tab.label === activeTab.label
                    ? 'text-[#0689E8]'
                    : 'text-[#3c3c3c] hover:text-[#0689E8]'
                }`}
              >
                {tab.label}
              </p>
            </li>
          ))}

          {/* underline */}
          <motion.div
            className="absolute bottom-0 h-[4px] bg-[#0689E8]"
            initial={false}
            animate={{ left: underlineStyle.left, width: underlineStyle.width }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </ul>
      </nav>

      {/* 모임 소개 */}
      <motion.div
        ref={introSectionRef}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="mb-10"
      >
        <div
          className="prose max-w-none border border-gray-300 p-4"
          dangerouslySetInnerHTML={{
            __html: intro || '<p>소개 내용이 없습니다.</p>',
          }}
        />
      </motion.div>

      {/* 커리큘럼 */}
      <motion.div
        ref={curriculumSectionRef}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mb-10"
      >
        <MeetingCurriculum curriculum={curriculum} />
      </motion.div>

      {/* 모임장 */}
      <motion.div
        ref={leaderSectionRef}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <MeetingLeaderInfo
          leaderName={leader.name}
          leaderLocation={leader.location}
          leaderCareer={leader.career}
        />
      </motion.div>
    </div>
  );
}

export default MeetingTabs;
