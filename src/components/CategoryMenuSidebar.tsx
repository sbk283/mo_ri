//  카테고리 메뉴 사이드바
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { categorySlugMap, slugToCategoryMap } from '../constants/categorySlugs';
import SearchBar from './search/SearchBar';

function CategoryMenuSidebar() {
  const [activeMain, setActiveMain] = useState('');
  const [activeSub, setActiveSub] = useState('');
  const [openCategory, setOpenCategory] = useState('');
  const location = useLocation(); // 현재 경로
  const navigate = useNavigate();

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

  // 검색 하기
  const handleSearch = (term: string) => {
    if (!term.trim()) return;
    navigate(`/grouplist?search=${encodeURIComponent(term.trim())}`);
  };

  // URL slug 홛ㄱ인 후 activeMain인지 activeSub인지 결정
  useEffect(() => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const slug = pathParts[pathParts.length - 1];

    // 전체보기 처리
    if (slug === 'all') {
      setActiveMain('전체보기');
      setActiveSub('');
      setOpenCategory('');
      return;
    }

    const korName = slugToCategoryMap[slug];
    if (!korName) return;

    const main = categories.find(cat => cat.name === korName);
    if (main) {
      setActiveMain(main.name);
      if (main.sub?.length) setOpenCategory(main.name);
      setActiveSub('');
    } else {
      const parent = categories.find(cat => cat.sub?.includes(korName));
      if (parent) {
        setActiveMain(parent.name);
        setOpenCategory(parent.name);
        setActiveSub(korName);
      }
    }
  }, [location.pathname]);

  return (
    <motion.aside
      className="fixed top-[120px] left-[calc(50%-812px+24px)] w-[235px] z-40 hidden lg:block"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {/* 모임 생성 버튼 */}
      <Link
        to="/creategroup"
        className="flex w-full h-[113px] flex-col items-center justify-center rounded-sm bg-brand shadow hover:bg-blue-600"
      >
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-[28px] leading-normal">모임생성</span>
          <img
            src="/images/ic_baseline-arrow-circle.svg"
            alt="바로가기"
            className="w-[33px] h-[33px] aspect-square"
          />
        </div>
        <p className="mt-1 text-white text-center font-normal text-[10px] leading-normal">
          지금 모임을 만들어 보세요!
        </p>
      </Link>

      {/* 검색창 */}
      <div className="mt-2 relative w-full h-[45px]">
        <SearchBar
          placeholder="모임명, 카테고리 검색"
          onSearch={handleSearch}
          inputClassName="w-full rounded-sm border-2 border-brand px-3 pr-9 py-[10px] placeholder:text-sm placeholder:text-gray-400"
          icon={<img src="/images/search.svg" alt="검색" className="w-[24px] h-[24px]" />}
        />
        {/* <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center"
        >
          <img src="/images/search.svg" alt="검색" className="w-[24px] h-[24px]" />
        </button> */}
      </div>

      {/* 카테고리 */}
      <nav className="mt-5">
        <h3 className="mb-2 mt-3 text-[20px] font-bold text-gray-700">카테고리</h3>
        <ul className="space-y-1">
          {categories.map(cat => {
            const isActiveMain =
              activeMain === cat.name || (cat.sub && cat.sub.includes(activeSub));

            return (
              <li key={cat.name}>
                {/* 메인 카테고리 → 슬러그 적용 (Link 사용) */}
                <Link
                  to={`/grouplist/${categorySlugMap[cat.name]}`} // slug 적용
                  onClick={() => {
                    setActiveMain(cat.name);
                    if (cat.sub?.length) {
                      setOpenCategory(cat.name);
                      setActiveSub(cat.sub[0]);
                    } else {
                      setOpenCategory('');
                      setActiveSub('');
                    }
                  }}
                  className={`flex w-full items-center gap-2 rounded px-3 py-2 text-[17px] font-bold hover:bg-gray-100 ${
                    isActiveMain ? 'text-[#0689E8]' : 'text-[#4E4E4E]'
                  }`}
                >
                  <img
                    src={isActiveMain ? cat.icon.replace('_dark', '') : cat.icon}
                    alt={cat.name}
                    className="w-4 h-4"
                  />
                  <span className="font-medium">{cat.name}</span>
                </Link>

                {/* 서브 카테고리 */}
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
                          <Link
                            to={`/grouplist/${categorySlugMap[sub]}`} // slug 적용
                            onClick={() => {
                              setActiveMain(cat.name);
                              setActiveSub(sub);
                            }}
                            className={`w-full text-left ${
                              activeSub === sub ? 'text-[#0689E8]' : 'text-[#4E4E4E]'
                            }`}
                          >
                            {sub}
                          </Link>
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
