import { useMemo, useRef, useState } from 'react';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import type { GroupWithCategory } from '../../types/group';
import GroupCard from './GroupCard';

type Props = {
  groups: GroupWithCategory[];
  spaceBetween?: number;
  breakpoints?: NonNullable<React.ComponentProps<typeof Swiper>['breakpoints']>;
  loop?: boolean;
  className?: string;
};

export default function SwiperGroupCard({
  groups,
  spaceBetween = 12,
  loop = false,
  className = '',
  breakpoints,
}: Props) {
  const swiperRef = useRef<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);

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

  const bps = breakpoints ?? defaultBps;

  if (!groups || groups.length === 0) return null;

  const visibleGroups = groups.slice(0, 8);
  // 현재 브레이크포인트 기준 slidesPerView 계산
  const slidesPerView = swiperRef.current?.params?.slidesPerView || 4;

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
          className="custom-prev flex items-center justify-center rounded-full w-[37px] h-[37px] absolute top-[44%] left-[-20px] z-[5] bg-white shadow-card"
          aria-label="이전 슬라이드"
          onClick={() => swiperRef.current?.slidePrev()}
        >
          <img src="/images/swiper_next.svg" alt="" aria-hidden="true" className="rotate-180" />
        </button>
      )}

      {/* 다음 버튼: 마지막 슬라이드에서는 숨김 */}
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
