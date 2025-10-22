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
  width = '100%',
  height = 'auto',
}: MeetingCardProps) {
  // 날짜 파싱
  const [startDateStr, endDateStr] = duration.split(' ~ ');
  const now = new Date();
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  // 종료일 기준으로 상태 자동 보정
  let computedStatus = status;
  if (now > end) {
    computedStatus = '모임종료';
  } else if (now >= start && now <= end) {
    computedStatus = '모집종료';
  }

  // D-day 계산 (시작 전일 때만)
  let displayDday = dday;
  if (now > end) {
    displayDday = ''; // 종료 후엔 안 보여줌
  }

  return (
    <div
      className="border border-[#c6c6c6] rounded-sm shadow p-4 bg-white flex flex-col justify-between"
      style={{ width, height }}
    >
      {/* 상단 */}
      <div>
        <div className="flex items-center justify-between px-1 gap-2 pb-3">
          {/* 상태 */}
          <span
            className={`flex px-2 py-1 rounded-full text-white text-[13px] font-semibold ${
              computedStatus === '모집중'
                ? 'bg-[#3B82F6]'
                : computedStatus === '모집종료'
                  ? 'bg-[#E06251]'
                  : 'bg-gray-400'
            }`}
          >
            {computedStatus}
          </span>

          {/* 제목 */}
          <h2 className="flex-1 mx-1 text-[17px] font-semibold text-black truncate">{title}</h2>

          {/* D-day (시작 전만 표시) */}
          {displayDday && (
            <span className="text-white text-[15px] font-semibold bg-gray-700 rounded px-2">
              {displayDday}
            </span>
          )}
        </div>

        {/* 소개 */}
        <p className="px-2 text-[15px] text-gray-800 leading-snug line-clamp-2 break-keep">
          {summary || '간략 소개가 없습니다.'}
        </p>
      </div>

      {/* 하단 */}
      <div className="flex items-center justify-between px-2 mt-3">
        <div className="flex items-center gap-2 text-[15px]">
          <span className="text-[#D83737] font-semibold">
            {category} &gt; {subCategory}
          </span>
          <span className="flex items-center gap-1 text-gray-600">
            <img src="/images/group_member.svg" alt="참여 인원" className="w-[15px] h-[15px]" />
            {participants}
          </span>
        </div>
        <span className="text-gray-500 font-medium">{duration}</span>
      </div>
    </div>
  );
}
export default MeetingCard;
