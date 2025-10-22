// 그룹 리스트 헤더에 있는 카드. 모달에서도 재사용 할거라 컴포넌트 분리

interface MeetingCardProps {
  title: string;
  status: string;
  dday: string;
  summary?: string;
  category: string;
  subCategory: string;
  participants: string;
  duration: string;
  /** width, height 동적 조절 */
  width?: string;
  height?: string;
}

function MeetingCard({
  title,
  status,
  dday,
  summary,
  category,
  subCategory,
  participants,
  duration,
  width = '100%', // 기본값
  height = 'auto', // 기본값
}: MeetingCardProps) {
  return (
    <div
      className="border border-[#c6c6c6] rounded-sm shadow p-4 bg-white flex flex-col justify-between"
      style={{ width, height }}
    >
      {/* 상단 영역 */}
      <div>
        {/* 상태 + 제목 + D-Day */}
        <div className="flex items-center justify-between px-1 gap-2 pb-3">
          <span className="flex px-2 py-1 rounded-full bg-[#E06251] text-white text-[13px] font-semibold">
            {status}
          </span>

          <h2 className="flex-1 mx-1 text-[17px] font-semibold text-black truncate">{title}</h2>

          <span className="text-white text-[15px] font-semibold bg-gray-700 rounded px-2">
            {dday}
          </span>
        </div>

        {/* 간략 소개 */}
        <p className="px-2 text-[15px] text-gray-800 leading-snug line-clamp-2">
          {summary || '간략 소개가 없습니다.'}
        </p>
      </div>

      {/* 하단 영역 (카테고리, 인원, 날짜) */}
      <div className="flex items-center justify-between px-2 mt-3">
        <div className="flex items-center gap-2 text-[15px]">
          <span className="text-[#D83737] font-semibold">
            {category} &gt; {subCategory}
          </span>
          <span className="flex items-center gap-1 text-gray-600">
            <img src="/people_dark.svg" alt="참여 인원" className="w-[15px] h-[15px]" />
            {participants}
          </span>
        </div>
        <span className="text-gray-500 font-medium">{duration}</span>
      </div>
    </div>
  );
}
export default MeetingCard;
