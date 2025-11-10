export default function SkeletonGroupCard() {
  return (
    <div className="animate-pulse flex w-full max-w-[1024px] border border-brand rounded-md bg-gray-100 h-[175px]">
      {/* 이미지 자리 */}
      <div className="w-[300px] h-full bg-brand-light" />

      {/* 텍스트 자리 */}
      <div className="flex-1 p-4">
        <div className="h-5 w-1/4 bg-brand-light rounded mb-3" />
        <div className="h-4 w-2/3 bg-brand-light rounded mb-2" />
        <div className="h-4 w-1/2 bg-brand-light rounded mb-2" />
        <div className="h-4 w-1/3 bg-brand-light rounded" />
      </div>
    </div>
  );
}
