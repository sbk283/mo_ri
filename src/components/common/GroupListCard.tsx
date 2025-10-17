import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export type GroupListCardProps = {
  group_id: string;
  group_title: string;
  group_short_intro?: string | null;
  group_kind: 'study' | 'hobby' | 'sports' | 'volunteer' | 'etc';
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
  group_kind,
  status,
  image_urls,
  member_count,
  group_capacity,
  group_start_day,
  group_end_day,
}: GroupListCardProps) {
  const navigate = useNavigate();

  // 그룹의 첫번째 사진 받아오기
  const mainImage =
    image_urls && image_urls.length > 0
      ? image_urls[0]
      : 'https://i.ibb.co/s5cD7JG/default-group-thumb.jpg';

  const statusLabel = {
    recruiting: '모집중',
    closed: '모집마감',
    finished: '모임종료',
  } as const;

  const kindLabel = {
    study: '스터디/학습',
    hobby: '취미/여가',
    sports: '운동/건강',
    volunteer: '봉사/사회참여',
    etc: '기타',
  } as const;

  // d-day
  const dday = Math.ceil(
    (new Date(group_end_day).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
  );

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
        <div className="">
          <div className="flex items-center gap-2">
            <span
              className={`flex w-[54px] h-[23px] text-xs font-bold text-white rounded-2xl items-center justify-center ${
                status === 'recruiting'
                  ? 'bg-brand'
                  : status === 'closed'
                    ? 'bg-brand-red'
                    : 'bg-gray-200'
              }`}
            >
              {statusLabel[status]}
            </span>

            <h3 className="text-lg font-semibold">{group_title}</h3>
            <span className="bg-[#BEC0C4] text-[11px] px-2 py-[2px] rounded-sm text-white font-bold">
              D-{dday}
            </span>
          </div>

          <p className="mt-3 text-sm text-gray-600 line-clamp-1">
            {group_short_intro ?? '소개글이 없습니다.'}
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
          <div className="flex items-center gap-2">
            <p className="text-[#FF5252] font-semibold">
              {kindLabel[group_kind]}
              {'>'}
            </p>
            <img src="/images/group_member.svg" alt="그룹멤버" className="w-[15px] h-[15px]" />
            <span className="font-semibold text-gray-700">
              {member_count ?? 0} / {group_capacity ?? 0}명
            </span>
          </div>

          <span>
            {group_start_day} ~ {group_end_day}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default GroupListCard;
