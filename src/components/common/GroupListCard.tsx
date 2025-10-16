import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export type GroupListCardProps = {
  group_id: string;
  group_title: string;
  group_short_intro?: string | null;
  group_kind: 'study' | 'hobby' | 'sports' | 'volunteer' | 'etc';
  status: 'recruiting' | 'closed' | 'finished';
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
  group_capacity,
  group_start_day,
  group_end_day,
}: GroupListCardProps) {
  const navigate = useNavigate();

  const statusLabel: Record<GroupListCardProps['status'], string> = {
    recruiting: '모집중',
    closed: '모집마감',
    finished: '모임종료',
  };

  const kindLabel: Record<GroupListCardProps['group_kind'], string> = {
    study: '스터디/학습',
    hobby: '취미/여가',
    sports: '운동/건강',
    volunteer: '봉사/사회참여',
    etc: '기타',
  };

  const dday = Math.ceil(
    (new Date(group_end_day).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
  );

  return (
    <motion.div
      layout
      onClick={() => navigate(`/groupdetail/${group_id}`)}
      className="h-[175px] w-[1024px] flex items-start gap-2 border rounded-sm bg-white shadow-sm hover:shadow-md cursor-pointer"
    >
      <img
        src="https://i.ibb.co/s5cD7JG/default-group-thumb.jpg"
        alt="모임 이미지"
        className="h-[175px] w-[300px] object-cover rounded-l-sm"
      />

      <div className="flex-1 p-4">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 text-xs font-bold text-white rounded-sm ${
              status === 'recruiting'
                ? 'bg-[#FF5252]'
                : status === 'closed'
                  ? 'bg-gray-400'
                  : 'bg-gray-600'
            }`}
          >
            {statusLabel[status]}
          </span>

          <h3 className="text-sm font-semibold">{group_title}</h3>
          <span className="bg-[#BEC0C4] text-[11px] px-2 py-[2px] rounded-sm text-white font-bold">
            D-{dday}
          </span>
        </div>

        <p className="mt-3 text-sm text-gray-600 line-clamp-1">
          {group_short_intro ?? '소개글이 없습니다.'}
        </p>

        <div className="mt-6 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <p className="text-[#FF5252] font-semibold">{kindLabel[group_kind]}</p>
            <img src="/images/group_member.svg" alt="그룹멤버" className="w-[15px] h-[15px]" />
            <span>{group_capacity ?? 0}명</span>
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
