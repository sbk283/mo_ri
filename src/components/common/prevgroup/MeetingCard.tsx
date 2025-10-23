import { useEffect } from 'react';
import { useGroupMember } from '../../../contexts/GroupMemberContext';

interface MeetingCardProps {
  groupId: string;
  groupCapacity: number;
  title: string;
  status: string;
  dday: string;
  summary?: string;
  category: string;
  subCategory: string;
  participants?: string;
  duration: string;
  width?: string;
  height?: string;
}

function MeetingCard({
  groupId,
  groupCapacity,
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
  // Context에서 memberCounts와 fetchMemberCount 가져오기
  const { memberCounts, fetchMemberCount, subscribeToGroup } = useGroupMember();

  // Context의 실시간 멤버 수 사용 (GroupListCard와 동일한 패턴)
  const currentCount = memberCounts[groupId] !== undefined ? memberCounts[groupId] : 0;

  // 컴포넌트 마운트 시 최신 멤버 수 가져오기
  useEffect(() => {
    if (!groupId) return;

    fetchMemberCount(groupId);
    subscribeToGroup(groupId);
  }, [groupId, fetchMemberCount, subscribeToGroup]);

  // 날짜 계산
  const [startDateStr, endDateStr] = duration.split(' ~ ');
  const now = new Date();
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  let computedStatus = status;
  if (now > end) computedStatus = '모임종료';
  else if (now >= start && now <= end) computedStatus = '모집종료';

  let displayDday = dday;
  if (now > end) displayDday = '';

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

          <h2 className="flex-1 mx-1 text-[17px] font-semibold text-black truncate">{title}</h2>

          {displayDday && (
            <span className="text-white text-[15px] font-semibold bg-gray-700 rounded px-2">
              {displayDday}
            </span>
          )}
        </div>

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
            {/* Context의 실시간 멤버 수 사용 */}
            {participants ?? `${currentCount}/${groupCapacity}`}
          </span>
        </div>
        <span className="text-gray-500 font-medium">{duration}</span>
      </div>
    </div>
  );
}

export default MeetingCard;
