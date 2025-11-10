export default function SkeletonSwiper() {
  return (
    <div className="flex gap-3 w-[1024px] mx-auto animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-[290px] w-[245px] rounded-sm border border-brand bg-gray-100 overflow-hidden"
        >
          {/* 이미지 자리 */}
          <div className="w-full h-[133px] bg-brand-light" />

          {/* 텍스트 영역 */}
          <div className="p-[15px] flex flex-col gap-3">
            {/* 카테고리 + 지역 */}
            <div className="flex justify-between">
              <div className="w-[80px] h-[16px] bg-brand-light rounded" />
              <div className="w-[60px] h-[16px] bg-brand-light rounded" />
            </div>

            {/* 제목 */}
            <div className="w-[150px] h-[18px] bg-brand-light rounded" />

            {/* 소개글 */}
            <div className="space-y-2">
              <div className="w-full h-[14px] bg-brand-light rounded" />
              <div className="w-2/3 h-[14px] bg-brand-light rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
