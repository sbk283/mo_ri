// src/components/common/ReviewCard.tsx
import Colon from '../../../public/colon.svg';

export type ReviewItem = {
  id: number;
  title: string;
  category: string;
  status: '진행중' | '종료';
  src: string;
  rating: 1 | 2 | 3 | 4 | 5;
  period: string;
  content: string;
  tags: string[];
  authorMasked: string;
  created_at?: string;
  ad?: boolean;
  empathy?: number;
};

export function ReviewCard({
  item,
  className = '',
  onClick,
}: {
  item: ReviewItem;
  className?: string;
  onClick?: (id: number) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(item.id)}
      className={[
        'w-[240px] h-[280px] overflow-hidden relative cursor-pointer rounded-sm border border-[#A3A3A3] bg-white text-left',
        'focus:outline-none focus:ring-2 focus:ring-[#2A91E5]',
        className,
      ].join(' ')}
      aria-label={`후기 카드: ${item.title}`}
    >
      {/* 상단 헤더 영역 */}
      <div className="bg-[#2A91E5] h-[72px] pt-[14px] px-[27px] relative">
        <p className="text-white font-semibold text-md mb-1 line-clamp-1" title={item.title}>
          {item.title}
        </p>
        <span className="border border-[#FF5252] bg-white text-[#FF5252] font-semibold text-sm px-[4px] py-[1px] rounded-sm">
          {item.category}
        </span>
        <img
          className="absolute top-8 right-2 w-[59px] h-[59px] rounded-[50%] object-cover"
          src={item.src}
          alt="모임사진"
        />
      </div>

      {/* 본문 영역 */}
      <div className="px-[27px] py-[17px] relative h-[calc(280px-72px)]">
        <img className="mb-1" src={Colon} alt="따옴표" />
        <p className="line-clamp-6 text-sm text-[#8c8c8c] pr-1">{item.content}</p>
        {/* 작성자 하단 고정 */}
        <p className="absolute bottom-[27px] left-[27px] text-[#B8641B] text-sm">
          {item.authorMasked}
        </p>
      </div>
    </button>
  );
}
