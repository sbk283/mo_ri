import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
// import 'swiper/swiper-bundle.css';
import GroupCard from './GroupCard';
import type { GroupWithCategory } from '../../types/group';
import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from './LoadingSpinner';

type BannerCardSwiperProps = {
  // groups: GroupWithCategory[];
  spaceBetween?: number;
  breakpoints?: NonNullable<React.ComponentProps<typeof Swiper>['breakpoints']>;
  loop?: boolean;
  className?: string;
};

function BannerCardSwiper({
  // groups,
  spaceBetween = 12,
  loop = false,
  className = '',
  breakpoints,
}: BannerCardSwiperProps) {
  const swiperRef = useRef<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [groups, setGroups] = useState<GroupWithCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotGroups = async () => {
      try {
        //  모집 중인 그룹 불러오기
        const { data: recruitingGroups, error: groupError } = await supabase
          .from('groups')
          .select(
            `
            *,
            categories_major(category_major_name),
            categories_sub(category_sub_name)
          `,
          )
          .eq('status', 'recruiting');

        if (groupError) throw groupError;

        //  찜 목록 가져오기 (favorite = true 인 것만)
        const { data: favData, error: favError } = await supabase
          .from('group_favorites')
          .select('group_id')
          .eq('favorite', true);

        if (favError) throw favError;

        //  group_id별 찜 수 계산
        const favCountMap = favData.reduce(
          (acc, cur) => {
            acc[cur.group_id] = (acc[cur.group_id] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        );

        //  그룹 데이터에 favorite_count 추가
        const merged = recruitingGroups.map(g => ({
          ...g,
          favorite_count: favCountMap[g.group_id] || 0,
        }));

        // 찜 개수 기준으로 정렬 후 상위 10개만
        const sorted = merged.sort((a, b) => b.favorite_count - a.favorite_count).slice(0, 10);

        setGroups(sorted);
      } catch (err) {
        console.error('🔥 인기 모임 불러오기 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHotGroups();
  }, []);

  //  오늘 날짜 기준으로 마감일이 지난 그룹 제외
  const filteredGroups = useMemo(() => {
    const today = new Date();
    return groups.filter(group => {
      // end_date 없으면 표시
      if (!group.group_end_day) return true;
      const end = new Date(group.group_end_day);
      // end가 오늘 이후거나 오늘이면 표시
      return end >= new Date(today.setHours(0, 0, 0, 0));
    });
  }, [groups]);

  const defaultBps = useMemo<NonNullable<React.ComponentProps<typeof Swiper>['breakpoints']>>(
    () => ({
      0: { slidesPerView: 2, spaceBetween },
      480: { slidesPerView: 2, spaceBetween },
      768: { slidesPerView: 3, spaceBetween },
      1024: { slidesPerView: 4, spaceBetween },
      1280: { slidesPerView: 4, spaceBetween },
    }),
    [spaceBetween],
  );

  // if (!filteredGroups || filteredGroups.length === 0) return null;

  const bps = breakpoints ?? defaultBps;
  const visibleGroups = filteredGroups.slice(0, 8);
  const slidesPerView = swiperRef.current?.params?.slidesPerView || 4;

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!filteredGroups || filteredGroups.length === 0) {
    return (
      <div className="flex items-center justify-center pb-10 pt-10 gap-10 border border-gray-300 rounded-sm mb-[64px]">
        <img src="/images/hotgroup.svg" alt="모임 없음" className="w-[300px]" />
        <div className="text-center">
          <b className="text-lg">현재 해당 카테고리에 등록된 모임이 없습니다</b>
          <p className="pt-1 text-md">새로운 모임을 만들고 회원들과 활동을 시작해보세요!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={['relative w-[1024px] mx-auto', className].join(' ')}>
      <ul className="list-none p-0 m-0">
        <Swiper
          modules={[Navigation]}
          onSwiper={swiper => (swiperRef.current = swiper)}
          onSlideChange={swiper => setActiveIndex(swiper.activeIndex)}
          navigation={{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          }}
          spaceBetween={12}
          loop={loop}
          grabCursor
          breakpoints={bps}
        >
          {visibleGroups.map(item => (
            <SwiperSlide key={item.group_id} tag="li">
              <GroupCard as="div" item={item} />
            </SwiperSlide>
          ))}
        </Swiper>
      </ul>

      {/* 이전 버튼: 첫 슬라이드에서는 숨김 */}
      {activeIndex > 0 && (
        <button
          className="custom-prev flex items-center justify-center rounded-full w-[37px] h-[37px] absolute top-[44%] left-[-20px] z-20 bg-white shadow-card"
          aria-label="이전 슬라이드"
          onClick={() => swiperRef.current?.slidePrev()}
        >
          <img src="/images/swiper_next.svg" alt="" aria-hidden="true" className="rotate-180" />
        </button>
      )}

      {/* 다음 버튼: 마지막 슬라이드에서는 숨김 */}
      {activeIndex < visibleGroups.length - slidesPerView && (
        <button
          className="custom-next flex items-center justify-center rounded-full w-[37px] h-[37px] absolute top-[44%] right-[-20px] z-20 bg-white shadow-card"
          aria-label="다음 슬라이드"
          onClick={() => swiperRef.current?.slideNext()}
        >
          <img src="/images/swiper_next.svg" alt="" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export default BannerCardSwiper;
