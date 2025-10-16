// 그룹 리스트 레이아웃
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import ArrayDropdown from '../common/ArrayDropdown';
import BannerCardSwiper from '../common/BannerCardSwiper';
import GroupListCard from '../common/GroupListCard';
import { useGroup } from '../../contexts/GroupContext';

type GroupListLayoutProps = {
  mainCategory: string;
  activeCategory: string;
  slug: string;
};

function GroupListLayout({ mainCategory, activeCategory }: GroupListLayoutProps) {
  const [selectedSort, setSelectedSort] = useState('최신순');
  const { groups, loading, fetchGroups } = useGroup();

  // Supabase에서 그룹 가져오기
  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // 정렬 및 필터링
  const displayedGroups = useMemo(() => {
    const data = [...groups];
    switch (selectedSort) {
      case '원데이':
        return data.filter(g => g.group_start_day === g.group_end_day);
      case '장기':
        return data.filter(g => g.group_start_day !== g.group_end_day);
      case '단기':
        return data.filter(g => {
          const start = new Date(g.group_start_day);
          const end = new Date(g.group_end_day);
          const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
          return diffDays > 1 && diffDays <= 30;
        });
      case '최신순':
      default:
        return data.sort(
          (a, b) => new Date(b.group_created_at).getTime() - new Date(a.group_created_at).getTime(),
        );
    }
  }, [groups, selectedSort]);

  return (
    <div className="mx-auto flex w-[1024px] gap-10 px-1 py-[56px]">
      <main className="flex-1">
        {/* 헤더 */}
        <header className="mb-10">
          <h1 className="text-xl font-bold">모임리스트</h1>
          <div className="mt-2 border-l-4 border-brand pl-3">
            <p className="text-m font-bold text-gray-800">
              카테고리와 설정 지역에 맞는 모임을 한눈에 볼 수 있습니다.
            </p>
            <p className="text-sm text-gray-600">
              관심 있는 모임을 쉽고 빠르게 찾아 다양한 활동을 즐겨보세요.
            </p>
          </div>
        </header>

        {/* 중앙 Swiper */}
        <section className="mb-12 w-[1024px]">
          <h2 className="text-lg font-bold mb-4">해당 카테고리의 인기있는 TOP8</h2>
          <BannerCardSwiper />
        </section>

        {/* 리스트 */}
        <section>
          <div className="flex items-center justify-between mb-4 relative">
            <h2 className="text-lg font-bold">
              {mainCategory} &gt; {activeCategory}
            </h2>
            <ArrayDropdown
              options={['최신순', '원데이', '장기', '단기']}
              value={selectedSort}
              onChange={setSelectedSort}
            />
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center items-center h-60 text-gray-500">로딩 중...</div>
            ) : displayedGroups.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col justify-center items-center h-60 bg-gray-50"
              >
                <motion.p
                  className="text-lg font-semibold text-gray-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  현재 등록된 모임이 없습니다
                </motion.p>
                <motion.p
                  className="text-sm text-gray-400 mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  새로운 모임을 만들고 친구들과 활동을 시작해보세요!
                </motion.p>
              </motion.div>
            ) : (
              displayedGroups.map(group => <GroupListCard key={group.group_id} {...group} />)
            )}

            {displayedGroups.length > 0 && (
              <div className="pt-[107px] flex items-center">
                <div className="flex-1 border-t border-[#8C8C8C]" />
                <span className="mx-4 text-sm text-[#8C8C8C] whitespace-nowrap">
                  모든 항목을 불러왔습니다
                </span>
                <div className="flex-1 border-t border-[#8C8C8C]" />
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default GroupListLayout;
