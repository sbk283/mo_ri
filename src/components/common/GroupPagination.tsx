// 페이지네이션 공용 컴포넌트
interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function GroupPagination({ page, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      {/* 이전 */}
      <button
        onClick={() => onPageChange(Math.max(page - 1, 1))}
        disabled={page === 1}
        className="px-2 py-1 text-sm text-gray-600 disabled:opacity-40"
      >
        &lt;
      </button>

      {/* 페이지 번호 */}
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          onClick={() => onPageChange(i + 1)}
          className={`px-3 py-1 rounded ${
            page === i + 1 ? 'bg-brand text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {i + 1}
        </button>
      ))}

      {/* 다음 */}
      <button
        onClick={() => onPageChange(Math.min(page + 1, totalPages))}
        disabled={page === totalPages}
        className="px-2 py-1 text-sm text-gray-600 disabled:opacity-40"
      >
        &gt;
      </button>
    </div>
  );
}
