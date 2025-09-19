// 그룹 리스트 레이아웃

import { useState } from 'react';
import BannerCardSwiper from '../common/BannerCardSwiper';
import ArrayDropdown from '../common/ArrayDropdown';
import GroupListCard from '../common/GroupListCard';
import { motion } from 'framer-motion';

type Group = {
  id: number;
  title: string;
  status: '모집중' | '모집예정' | '서비스종료';
  category: string;
  subCategory: string;
  desc: string;
  dday: string;
  thumbnail: string;
  memberCount: number;
  memberLimit: number;
  duration: string;
};

function GroupListLayout() {
  const [groupListsort, setGroupListSort] = useState('최신순');
  const arrayOptions = ['최신순', '원데이', '장기', '단기'];

  const [groupList] = useState<Group[]>([
    // {
    //   id: 1,
    //   title: '강한 남자들의 모임 [강남모]',
    //   status: '모집중',
    //   category: '취미/여가',
    //   subCategory: '게임/오락',
    //   desc: '준비된 트레이너와 함께하는 근력 강화 프로그램. 꾸준히 참여할 수 있는 모임입니다.',
    //   dday: 'D-5',
    //   thumbnail: 'https://picsum.photos/seed/list1/200/120',
    //   memberCount: 2,
    //   memberLimit: 10,
    //   duration: '2025.05.12 ~ 2025.05.12',
    // },
    // {
    //   id: 2,
    //   title: '강한 남자들의 모임 [강남모]',
    //   status: '모집중',
    //   category: '취미/여가',
    //   subCategory: '게임/오락',
    //   desc: '준비된 트레이너와 함께하는 근력 강화 프로그램. 꾸준히 참여할 수 있는 모임입니다.',
    //   dday: 'D-5',
    //   thumbnail: 'https://picsum.photos/seed/list1/200/120',
    //   memberCount: 0,
    //   memberLimit: 10,
    //   duration: '2025.05.12 ~ 2025.05.12',
    // },
  ]);

  return (
    <div className="mx-auto flex w-[1024px] gap-10 px-1 py-[56px]">
      <main className="flex-1">
        {/* 헤더 */}
        <header className="mb-10">
          <h1 className="text-xl font-bold">모임리스트</h1>
          <div className="mt-2 border-l-4 border-brand pl-3">
            <p className="text-m font-bold text-gray-800">
              카테고리와 주변 지역에 맞는 모임을 한눈에 볼 수 있습니다.
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
            <h2 className="text-lg font-bold">봉사/사회참여 &gt; 캠페인 모임</h2>
            <ArrayDropdown
              options={arrayOptions}
              value={groupListsort}
              onChange={setGroupListSort}
            />
          </div>

          <div className="space-y-4">
            {groupList.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col justify-center items-center h-60 bg-gray-50"
              >
                {/* 안내 문구 */}
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
              groupList.map(item => <GroupListCard key={item.id} {...item} />)
            )}

            {groupList.length > 0 && (
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
