import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

function CategoryMenuSidebar() {
  const [activeMain, setActiveMain] = useState('');
  const [activeSub, setActiveSub] = useState('');
  const [openCategory, setOpenCategory] = useState('');

  const categories = [
    { name: '전체보기', icon: '/images/list_all_dark.svg' },
    {
      name: '운동/건강',
      icon: '/images/health_dark.svg',
      sub: ['구기활동', '실내활동', '힐링/건강관리', '실외활동'],
    },
    { name: '스터디/학습', icon: '/images/study_dark.svg', sub: ['학습/공부', 'IT'] },
    {
      name: '취미/여가',
      icon: '/images/hobby_dark.svg',
      sub: ['예술/창작', '음악/공연/문화', '요리/제과·제빵', '게임/오락'],
    },
    { name: '봉사/사회참여', icon: '/images/volunteer_dark.svg', sub: ['복지/나눔', '캠페인'] },
  ];

  return (
    <motion.aside
      className="fixed top-[100px] left-[calc(50%-812px+24px)] w-[255px] z-40 hidden lg:block"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <Link
        to="/creategroup"
        className="flex w-full h-[113px] flex-col items-center justify-center rounded-sm bg-brand shadow hover:bg-blue-600"
      >
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-[28px] leading-normal">모임생성</span>
          <img
            src="/images/ic_baseline-arrow-circle.svg"
            alt="바로가기"
            className="w-[33px] h-[33px] aspect-square -rotate-90"
          />
        </div>
        <p className="mt-1 text-white text-center font-normal text-[10px] leading-normal">
          지금 모임을 만들어 보세요!
        </p>
      </Link>

      {/* 검색창 */}
      <div className="mt-2 relative w-full h-[45px]">
        <input
          type="text"
          placeholder="모임명이나 카테고리를 입력해 주세요."
          className="w-full rounded-[5px] border-2 border-brand px-3 py-[10px] placeholder:text-sm placeholder:text-gray-400"
        />
        <button className="absolute right-3 top-1/2 -translate-y-1/2">
          <img src="/images/search.svg" alt="검색" className="w-[24px] h-[24px]" />
        </button>
      </div>

      {/* 카테고리 */}
      <nav className="mt-5">
        <h3 className="mb-2 mt-3 text-sm font-bold text-gray-700">카테고리</h3>
        <ul className="space-y-1">
          {categories.map(cat => {
            const isActiveMain =
              activeMain === cat.name || (cat.sub && cat.sub.includes(activeSub));

            return (
              <li key={cat.name}>
                <button
                  onClick={() => {
                    setActiveMain(cat.name);
                    setActiveSub('');
                    if (cat.sub) {
                      setOpenCategory(openCategory === cat.name ? '' : cat.name);
                    } else {
                      setOpenCategory('');
                    }
                  }}
                  className={`flex w-full items-center gap-2 rounded px-3 py-2 text-sm hover:bg-gray-100 ${
                    isActiveMain ? 'text-[#0689E8]' : 'text-[#4E4E4E]'
                  }`}
                >
                  {/* 아이콘 (_dark 제거하여 활성화 시 일반 아이콘 표시) */}
                  <img
                    src={isActiveMain ? cat.icon.replace('_dark', '') : cat.icon}
                    alt={cat.name}
                    className="w-4 h-4"
                  />
                  <span className="font-medium">{cat.name}</span>
                </button>

                {/* sub 카테고리 (framer-motion) */}
                <AnimatePresence>
                  {cat.sub && openCategory === cat.name && (
                    <motion.ul
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="ml-7 mt-1 space-y-1 border-l border-gray-300 pl-3 text-sm"
                    >
                      {cat.sub.map(sub => (
                        <li key={sub}>
                          <button
                            onClick={() => {
                              setActiveMain(cat.name);
                              setActiveSub(sub);
                            }}
                            className={`w-full text-left ${
                              activeSub === sub ? 'text-[#0689E8]' : 'text-[#4E4E4E]'
                            }`}
                          >
                            {sub}
                          </button>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </nav>
    </motion.aside>
  );
}

export default CategoryMenuSidebar;
