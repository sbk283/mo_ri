import { memo, useMemo, useRef, useState, useCallback } from "react";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import type { GroupWithCategory } from "../../types/group";
import GroupCard from "./GroupCard";

type Props = {
  groups: GroupWithCategory[];
  spaceBetween?: number;
  breakpoints?: NonNullable<React.ComponentProps<typeof Swiper>["breakpoints"]>;
  loop?: boolean;
  className?: string;
};

function SwiperGroupCard({
  groups,
  spaceBetween = 12,
  loop = false,
  className = "",
  breakpoints,
}: Props) {
  const swiperRef = useRef<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // breakpoints 메모이징 (불필요 렌더 방지)
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

  // groups 존재 체크
  if (!groups || groups.length === 0) return null;

  // visibleGroups 메모이징
  const visibleGroups = useMemo(() => groups.slice(0, 8), [groups]);

  // 슬라이드 change 핸들러 메모이징
  const handleSlideChange = useCallback((swiper: any) => {
    setActiveIndex(swiper.activeIndex);
  }, []);

  // 현재 브레이크포인트 기준 slidesPerView
  const slidesPerView =
    swiperRef.current?.params?.slidesPerView || bps[1024]?.slidesPerView || 4;

  return (
    <div className={["relative w-[1024px] mx-auto", className].join(" ")}>
      <ul className="list-none p-0 m-0">
        <Swiper
          modules={[Navigation]}
          // swiper instance 저장
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

      {/* 이전 버튼 */}
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

      {/* 다음 버튼 */}
      {activeIndex < visibleGroups.length - slidesPerView && (
        <button
          className="custom-next flex items-center justify-center rounded-full w-[37px] h-[37px] absolute top-[44%] right-[-20px] z-[5] bg-white shadow-card"
          aria-label="다음 슬라이드"
          onClick={() => swiperRef.current?.slideNext()}
        >
          <img src="/images/swiper_next.svg" alt="" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

// GroupCard memo 최적화
const MemoizedGroupCard = memo(GroupCard);

export default memo(SwiperGroupCard);
