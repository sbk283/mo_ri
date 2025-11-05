import { useEffect, useState, useRef } from "react";

interface InfiniteScrollListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  initialCount?: number;
  loadMoreCount?: number;
}

function InfiniteScrollList<T>({
  items,
  renderItem,
  initialCount = 13,
  loadMoreCount = 5,
}: InfiniteScrollListProps<T>) {
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const [isFetching, setIsFetching] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  // 스크롤 감지
  useEffect(() => {
    if (!hasMore || isFetching) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsFetching(true);
        setTimeout(() => {
          setVisibleCount((prev) => prev + loadMoreCount);
          setIsFetching(false);
        }, 500); // 약간의 로딩 텀 (UX 개선)
      }
    });

    const target = observerRef.current;
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [hasMore, isFetching, loadMoreCount]);

  return (
    <div className="space-y-4">
      {visibleItems.map((item, index) => renderItem(item, index))}

      {/* 감지용 더미 엘리먼트 */}
      {hasMore && <div ref={observerRef} className="h-10" />}

      {/* 로딩 표시 */}
      {isFetching && (
        <p className="text-center text-sm text-gray-400">불러오는 중...</p>
      )}

      {/* 끝 표시 */}
      {!hasMore && items.length > 0 && (
        <div className="pt-[107px] flex items-center">
          <div className="flex-1 border-t border-[#8C8C8C]" />
          <span className="mx-4 text-sm text-[#8C8C8C] whitespace-nowrap">
            모든 항목을 불러왔습니다
          </span>
          <div className="flex-1 border-t border-[#8C8C8C]" />
        </div>
      )}
    </div>
  );
}

export default InfiniteScrollList;
