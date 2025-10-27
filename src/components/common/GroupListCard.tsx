import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useGroupMember } from '../../contexts/GroupMemberContext';

export type GroupListCardProps = {
  group_id: string;
  group_title: string;
  group_short_intro?: string | null;
  category_major_name: string;
  category_sub_name: string;
  group_region?: string | null;
  status: 'recruiting' | 'closed' | 'finished';
  image_urls?: string[] | null;
  member_count?: number;
  group_capacity?: number | null;
  group_start_day: string;
  group_end_day: string;
};

function GroupListCard({
  group_id,
  group_title,
  group_short_intro,
  category_major_name,
  category_sub_name,
  status,
  group_region,
  image_urls,
  member_count,
  group_capacity,
  group_start_day,
  group_end_day,
}: GroupListCardProps) {
  const navigate = useNavigate();

  // Context 연결
  const { memberCounts, fetchMemberCount, subscribeToGroup } = useGroupMember();
  const currentCount =
    memberCounts[group_id] !== undefined ? memberCounts[group_id] : (member_count ?? 0);

  useEffect(() => {}, [memberCounts[group_id]]);

  // 최신 모임 인원
  useEffect(() => {
    if (!group_id) return;

    fetchMemberCount(group_id);
    subscribeToGroup(group_id);
  }, [group_id, fetchMemberCount, subscribeToGroup]);

  const mainImage = image_urls && image_urls.length > 0 ? image_urls[0] : '/nullbg.jpg';

  const statusLabel = {
    recruiting: '모집중',
    closed: '모집마감',
    finished: '모임종료',
  } as const;

  // 모임 유형 계산
  const calcGroupType = () => {
    const start = new Date(group_start_day);
    const end = new Date(group_end_day);
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '원데이';
    if (diffDays <= 31) return '단기모임';
    return '장기모임';
  };

  const groupType = calcGroupType();

  // 종료 여부 계산
  const now = new Date();
  const start = new Date(group_start_day);
  const end = new Date(group_end_day);

  // D-day 계산 (시작 전일 때만)
  let dday: number | null = null;
  if (now < start) {
    dday = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  // 상태 계산
  let computedStatus: 'recruiting' | 'closed' | 'finished' = status;
  const isFull = (group_capacity ?? 0) > 0 && currentCount >= (group_capacity ?? 0);

  if (now > end) {
    computedStatus = 'finished'; // 종료됨
  } else if (now >= start || isFull) {
    computedStatus = 'closed'; // 시작했거나 인원 다 참
  } else {
    computedStatus = 'recruiting'; // 아직 모집 중
  }

  return (
    <motion.div
      layout
      onClick={() => navigate(`/groupdetail/${group_id}`)}
      className="flex items-stretch w-[1024px] h-[175px] border border-gray-300 rounded-sm bg-white shadow-sm hover:shadow-md cursor-pointer"
    >
      {/* 이미지 */}
      <div className="relative w-[300px] h-full overflow-hidden">
        <img
          src={mainImage}
          alt="모임 이미지"
          className="absolute inset-0 w-full h-full object-cover rounded-l-[4px]"
        />
      </div>

      {/* 텍스트 */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        {/* 상단 */}
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`flex w-[54px] h-[23px] text-xs font-bold text-white rounded-2xl items-center justify-center ${
                computedStatus === 'recruiting'
                  ? 'bg-brand'
                  : computedStatus === 'closed'
                    ? 'bg-brand-red'
                    : 'bg-gray-300'
              }`}
            >
              {statusLabel[computedStatus]}
            </span>

            <h3 className="text-lg font-semibold">{group_title}</h3>

            {/* D-day는 시작 전일 때만 표시 */}
            {dday !== null && (
              <span className="bg-[#BEC0C4] text-[11px] px-2 py-[2px] rounded-sm text-white font-bold">
                D-{dday}
              </span>
            )}

            {/* 모임 유형 배지 */}
            <span className="text-[11px] font-semibold text-white bg-brand-orange px-2 py-[2px] rounded-sm">
              {groupType}
            </span>
          </div>

          <p className="mt-3 text-md text-base text-gray-400 line-clamp-1">
            {group_short_intro ?? '소개글이 없습니다.'}
          </p>
        </div>

        {/* 하단 */}
        <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
          <div className="flex items-center gap-6">
            <p className="text-[#FF5252] font-semibold text-base whitespace-nowrap">
              <span>{category_major_name}</span>
              <span className="text-gray-300 mx-1">{'>'}</span>
              <span className="text-gray-200">{category_sub_name}</span>
            </p>

            {group_region && (
              <div>
                <p className="text-md text-gray-200">{group_region}</p>
              </div>
            )}

            {/* 멤버 수 */}
            <div className="flex gap-1">
              <img src="/images/group_member.svg" alt="그룹멤버" className="w-[15px] h-[15px]" />
              <span className="font-semibold text-gray-200">
                {currentCount} / {group_capacity ?? 0}명
              </span>
            </div>
          </div>

          <span className="text-[#777] text-base">
            {group_start_day} ~ {group_end_day}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default GroupListCard;
