import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import GroupCard from "./GroupCard";
import type { GroupWithCategory } from "../../types/group";
import { useEffect, useMemo, useRef, useState, useCallback, memo } from "react";
import { supabase } from "../../lib/supabase";
import SkeletonSwiper from "../skeleton/SkeletonSwiper"; // 추가

type BannerCardSwiperProps = {
  groups: GroupWithCategory[];
  loading: boolean;
  spaceBetween?: number;
  breakpoints?: NonNullable<React.ComponentProps<typeof Swiper>["breakpoints"]>;
  loop?: boolean;
  className?: string;
};

function BannerCardSwiper({
  groups,
  loading,
  spaceBetween = 12,
  loop = false,
  className = "",
  breakpoints,
}: BannerCardSwiperProps) {
  const swiperRef = useRef<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hotGroups, setHotGroups] = useState<GroupWithCategory[]>([]);
  const [fetching, setFetching] = useState(true);

  // 인기 모임 데이터 fetch + 정렬
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setFetching(true);

        const { data: favData, error: favError } = await supabase
          .from("group_favorites")
          .select("group_id")
          .eq("favorite", true);

        if (favError) throw favError;

        const favCountMap = favData.reduce(
          (acc, cur) => {
            acc[cur.group_id] = (acc[cur.group_id] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        );

        const merged = groups.map((g) => ({
          ...g,
          favorite_count: favCountMap[g.group_id] || 0,
        }));

        const sorted = merged
          .sort((a, b) => (b.favorite_count || 0) - (a.favorite_count || 0))
          .slice(0, 8);

        setHotGroups(sorted);
      } catch (err) {
        console.error("인기 모임 불러오기 실패:", err);
        setHotGroups(groups.slice(0, 8));
      } finally {
        setFetching(false);
      }
    };

    if (groups.length > 0) fetchFavorites();
  }, [groups]);

  // 마감된 모임 제외 필터링 (memo)
  const filteredGroups = useMemo(() => {
    const today = new Date();
    const todayZero = new Date(today.setHours(0, 0, 0, 0));
    return (hotGroups ?? []).filter((group) => {
      if (!group.group_end_day) return true;
      const end = new Date(group.group_end_day);
      return end >= todayZero;
    });
  }, [hotGroups]);

  // breakpoints 메모이징
  const defaultBps = useMemo<
    NonNullable<React.ComponentProps<typeof Swiper>["breakpoints"]>
  >(
    () => ({
      0: { slidesPerView: 2, spaceBetween },
      480: { slidesPerView: 2, spaceBetween },
      768: { slidesPerView: 3, spaceBetween },
      1024: { slidesPerView: 4, spaceBetween },
      1280: { slidesPerView: 4, spaceBetween },
    }),
    [spaceBetween],
  );

  const bps = breakpoints ?? defaultBps;

  // 최종 표시할 그룹 (memo)
  const visibleGroups = useMemo(
    () => filteredGroups.slice(0, 8),
    [filteredGroups],
  );

  // 슬라이드 변경 핸들러 (memo)
  const handleSlideChange = useCallback(
    (swiper: any) => setActiveIndex(swiper.activeIndex),
    [],
  );

  // 현재 slidesPerView 계산
  const slidesPerView =
    swiperRef.current?.params?.slidesPerView || bps[1024]?.slidesPerView || 4;

  // Skeleton 처리
  if (loading || fetching) {
    return (
      <div className={["relative w-[1024px] mx-auto", className].join(" ")}>
        <SkeletonSwiper />
      </div>
    );
  }

  // 그룹이 없을 때
  if (!visibleGroups || visibleGroups.length === 0) {
    return (
      <div className="flex items-center justify-center pb-10 pt-10 gap-10 border border-gray-300 rounded-sm mb-[64px]">
        <img src="/images/hotgroup.svg" alt="모임 없음" className="w-[300px]" />
        <div className="text-center">
          <b className="text-lg">현재 해당 카테고리에 등록된 모임이 없습니다</b>
          <p className="pt-1 text-md">
            새로운 모임을 만들고 회원들과 활동을 시작해보세요!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={["relative w-[1024px] mx-auto", className].join(" ")}>
      <ul className="list-none p-0 m-0">
        <Swiper
          modules={[Navigation]}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          onSlideChange={handleSlideChange}
          navigation={{
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          }}
          spaceBetween={spaceBetween}
          loop={loop}
          grabCursor
          breakpoints={bps}
        >
          {visibleGroups.map((item) => (
            <SwiperSlide key={item.group_id} tag="li">
              <MemoizedGroupCard as="div" item={item} />
            </SwiperSlide>
          ))}
        </Swiper>
      </ul>

      {activeIndex > 0 && (
        <button
          className="custom-prev flex items-center justify-center rounded-full w-[37px] h-[37px] absolute top-[44%] left-[-20px] z-[5] bg-white shadow-card"
          aria-label="이전 슬라이드"
          onClick={() => swiperRef.current?.slidePrev()}
        >
          <img
            src="/images/swiper_next.svg"
            alt=""
            aria-hidden="true"
            className="rotate-180"
          />
        </button>
      )}

      {activeIndex < visibleGroups.length - slidesPerView && (
        <button
          className="custom-next flex items-center justify-center rounded-full w-[37px] h-[37px] absolute top-[44%] right-[-20px] z-[9] bg-white shadow-card"
          aria-label="다음 슬라이드"
          onClick={() => swiperRef.current?.slideNext()}
        >
          <img src="/images/swiper_next.svg" alt="" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

// GroupCard 메모 적용
const MemoizedGroupCard = memo(GroupCard);

export default memo(BannerCardSwiper);
