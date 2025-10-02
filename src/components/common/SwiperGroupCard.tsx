import { useMemo } from 'react';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import GroupCard, { type GroupItem } from './GroupCard';

type Props = {
  items: GroupItem[];
  onToggleFavorite?: (id: number, next: boolean) => void;
  confirmMode?: 'none' | 'add' | 'unfav' | 'both';
  spaceBetween?: number;
  breakpoints?: NonNullable<React.ComponentProps<typeof Swiper>['breakpoints']>;
  loop?: boolean;
  className?: string;
};

export default function SwiperGroupCard({
  items,
  onToggleFavorite,
  confirmMode = 'unfav',
  spaceBetween = 12,
  loop = false,
  className = '',
  breakpoints,
}: Props) {
  const defaultBps = useMemo<NonNullable<React.ComponentProps<typeof Swiper>['breakpoints']>>(
    () => ({
      0: { slidesPerView: 1.2, spaceBetween: 12 },
      480: { slidesPerView: 2, spaceBetween: 12 },
      768: { slidesPerView: 3, spaceBetween: 12 },
      1024: { slidesPerView: 4, spaceBetween: 12 },
      1280: { slidesPerView: 4, spaceBetween: 12 },
    }),
    [],
  );

  const bps = breakpoints ?? defaultBps;

  return (
    <div className={['relative w-[1024px] mx-auto', className].join(' ')}>
      <ul className="list-none p-0 m-0">
        <Swiper
          modules={[Navigation]}
          navigation={{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          }}
          spaceBetween={12}
          loop={loop}
          grabCursor
          breakpoints={bps}
        >
          {items.map(item => (
            <SwiperSlide key={item.id} tag="li">
              <GroupCard
                as="div"
                item={item}
                onToggleFavorite={onToggleFavorite}
                confirmMode={confirmMode}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </ul>

      <button
        className="swiper-button-next rounded-full !w-[37px] !h-[37px] absolute top-[58%] !-right-4 z-20"
        aria-label="다음 슬라이드"
        type="button"
      >
        <img src="/images/swiper_next.svg" alt="" aria-hidden="true" />
      </button>

      <button
        className="swiper-button-prev rounded-full !w-[37px] !h-[37px] absolute top-[58%] !-left-4 z-20"
        aria-label="이전 슬라이드"
        type="button"
      >
        <img
          src="/images/swiper_next.svg"
          alt=""
          aria-hidden="true"
          style={{ transform: 'rotate(180deg)' }}
        />
      </button>
    </div>
  );
}
