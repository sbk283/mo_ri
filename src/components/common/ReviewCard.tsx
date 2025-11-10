// src/components/common/ReviewCard.tsx

import { optimizeImageUrl } from "../../utils/image";
import LazyImage from "../common/LazyImage";

export type ReviewItem = {
  id: number;
  title: string;
  category: string;
  status: "진행중" | "종료";
  src: string; // ← 작성자 프로필 이미지 URL
  rating: 1 | 2 | 3 | 4 | 5;
  period: string;
  content: string;
  tags: string[];
  created_id: string;
  created_at?: string;
  empathy?: number;
};

export function ReviewCard({
  item,
  className = "",
  onClick,
}: {
  item: ReviewItem;
  className?: string;
  onClick?: (id: number) => void;
}) {
  // 이미지 fallback 처리
  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.dataset.fallbackApplied) return;
    img.dataset.fallbackApplied = "true";
    img.src = "/images/no_image.jpg";
  };

  // 안전한 프로필 이미지 src 지정
  const profileImage = item.src || "/images/no_image.jpg";

  return (
    <button
      type="button"
      onClick={() => onClick?.(item.id)}
      className={[
        "w-[240px] h-[280px] overflow-hidden relative cursor-pointer rounded-sm border border-[#A3A3A3] bg-white text-left",
        "focus:outline-none",
        className,
      ].join(" ")}
      aria-label={`후기 카드: ${item.title}`}
      title={item.title}
    >
      {/* 상단 헤더 영역 */}
      <div className="bg-[#2A91E5] h-[72px] pt-[14px] px-[27px] relative">
        <p
          className="text-white font-semibold text-md mb-1 line-clamp-1"
          title={item.title}
        >
          {item.title}
        </p>
        <span className="border border-brand-red bg-white text-brand-red font-semibold text-sm px-[4px] py-[1px] rounded-sm">
          {item.category}
        </span>

        {/* 작성자 프로필 (LazyImage 적용) */}
        <LazyImage
          src={optimizeImageUrl(profileImage, 100)}
          alt={`${item.created_id} 프로필`}
          className="absolute top-9 right-2 w-[59px] h-[59px] rounded-[50%] object-cover"
          onError={handleImgError}
        />
      </div>

      {/* 본문 영역 */}
      <div className="px-[27px] py-[17px] relative h-[calc(280px-72px)]">
        <img className="mb-1" src="../colon.svg" alt="따옴표" />
        <p className="line-clamp-6 text-sm text-[#8c8c8c] pr-1">
          {item.content}
        </p>

        {/* 작성자 하단 고정 */}
        <p className="absolute bottom-[27px] left-[27px] text-[#B8641B] text-sm">
          {item.created_id} 님의 후기
        </p>
      </div>
    </button>
  );
}
