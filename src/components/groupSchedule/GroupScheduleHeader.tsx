// 그룹 일정 헤더 컴포넌트

interface GroupScheduleHeaderProps {
  monthLabel: string;
  handlePrev: () => void;
  handleNext: () => void;
  isLeader: boolean;
  onOpenModal: () => void;
}

/**
 * 그룹 일정 헤더 컴포넌트
 * - 상단 타이틀("일정관리")
 * - 월 네비게이션 (< n월 >)
 * - 모임장일 경우 "일정등록" 버튼 표시
 */

function GroupScheduleHeader({
  monthLabel,
  handlePrev,
  handleNext,
  isLeader,
  onOpenModal,
}: GroupScheduleHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      {/* 좌측 타이틀 */}
      <h2 className="text-black text-[28px] font-semibold pb-8">일정관리</h2>

      {/* 우측 월 네비게이션 + 버튼 */}
      <div className="flex items-center gap-48">
        {/* 월 네비게이션 (< n월 >) */}
        <div className="flex items-center gap-10 text-sky-600 text-2xl font-semibold">
          <button
            onClick={handlePrev}
            className="px-2 py-1 rounded hover:bg-gray-100 focus:outline-none"
            aria-label="이전 달"
          >
            <img src="/images/left_arrow.svg" alt="왼쪽화살표" />
          </button>

          <span className="text-lg font-semibold">{monthLabel || '월'}</span>

          <button
            onClick={handleNext}
            className="px-2 py-1 rounded hover:bg-gray-100 focus:outline-none"
            aria-label="다음 달"
          >
            <img src="/images/right_arrow.svg" alt="오른쪽화살표" />
          </button>
        </div>

        {/* 일정등록 버튼 (모임장만 표시) */}
        {isLeader && (
          <button
            onClick={onOpenModal}
            className="px-4 py-2 bg-brand text-white rounded-md shadow hover:bg-brand-dark focus:outline-none"
          >
            일정등록
          </button>
        )}
      </div>
    </div>
  );
}

export default GroupScheduleHeader;
