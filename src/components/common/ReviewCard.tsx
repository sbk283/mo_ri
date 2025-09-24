// src/components/common/ReviewCard.tsx
import Colon from '../../../public/colon.svg';

export type ReviewItem = {
  id: number;
  title: string;
  category: string;
  avatarSrc: string;
  quote: string;
  authorMasked: string;
};

export function ReviewCard({ item, className = '' }: { item: ReviewItem; className?: string }) {
  return (
    <div
      className={[
        'w-[240px] h-[280px] shrink-0 rounded-[5px] border border-[#A3A3A3] bg-white',
        'overflow-hidden relative cursor-pointer',
        className,
      ].join(' ')}
      role="article"
      aria-label={`후기 카드: ${item.title}`}
    >
      {/* 상단 헤더 영역 */}
      <div className="bg-[#2A91E5] h-[72px] pt-[14px] px-[27px] relative">
        <p className="text-white font-semibold text-md mb-1 line-clamp-1" title={item.title}>
          {item.title}
        </p>
        <span className="border border-[#FF5252] bg-white text-[#FF5252] font-semibold text-sm px-[4px] py-[1px] rounded-[5px]">
          {item.category}
        </span>
        <img
          className="absolute top-8 right-2 w-[59px] h-[59px] rounded-[50%] object-cover"
          src={item.avatarSrc}
          alt="모임사진"
        />
      </div>

      {/* 본문 영역 */}
      <div className="px-[27px] py-[17px]">
        <img className="mb-1" src={Colon} alt="따옴표" />
        <p className="line-clamp-6 text-sm text-[#8c8c8c] mb-4">{item.quote}</p>
        <p className="text-[#B8641B] text-sm">{item.authorMasked}</p>
      </div>
    </div>
  );
}
