// 그룹리스트 카드 컴포넌트. 위에서 말고
import { motion } from 'framer-motion';

type GroupListCardProps = {
  id: number;
  title: string;
  status: '모집중' | '모집예정' | '서비스종료';
  category: string;
  subCategory: string;
  desc: string;
  dday: string;
  thumbnail: string;
  memberCount: number;
  memberLimit: number;
  duration: string;
};

function GroupListCard({
  title,
  status,
  category,
  subCategory,
  desc,
  dday,
  thumbnail,
  memberCount,
  memberLimit,
  duration,
}: GroupListCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20 }} // 위에서 올라옴
      animate={{ opacity: 1, y: 0 }} // 자연스럽게 보임
      exit={{ opacity: 0, y: 20 }} // 위로 사라짐
      transition={{ duration: 0.3 }}
      className="h-[175px] w-[1024px] flex items-start gap-4 rounded-lg border border-[#D9D9D9] bg-white shadow-sm hover:shadow-md transition"
    >
      {/* 썸네일 */}
      <img
        src={thumbnail}
        alt="모임 이미지"
        className="h-[175px] w-[300px] rounded-tl-sm rounded-bl-sm object-cover"
      />

      {/* 정보 */}
      <div className="flex-1 pt-[21px] pl-[22px]">
        {/* 모집상태 + 제목 */}
        <div className="flex items-center gap-2">
          <span className="flex w-[54px] h-[23px] items-center justify-center rounded-sm bg-[#FF5252] text-xs font-semibold text-white">
            {status}
          </span>
          <h3 className="font-semibold text-sm flex items-center gap-[13px]">
            {title}
            <img src="/images/trophy.svg" alt="trophy" className="w-4 h-4" />
          </h3>
          {/* D-day */}
          <span className="flex w-[40px] h-[21px] items-center justify-center rounded-sm bg-[#BEC0C4] text-[11px] font-extrabold text-white">
            {dday}
          </span>
          {/* 원데이 (예시용 고정) */}
          <span className="flex w-[47px] h-[21px] items-center justify-center rounded-sm bg-[#FBAB17] text-[11px] font-bold text-white">
            원데이
          </span>
        </div>

        {/* 설명 */}
        <p className="mt-[26px] text-sm text-[#818181]">{desc}</p>

        {/* 하단 메타 */}
        <div className="mt-[42px] flex items-center gap-2 text-xs text-gray-500">
          <p className="font-semibold text-[#FF5252] text-md">
            {category} &gt;{' '}
            <span className="font-semibold text-gray-200 text-md mr-11">{subCategory}</span>
          </p>
          <img src="/images/group_member.svg" alt="그룹멤버" className="w-[15px] h-[15px]" />
          <span className="text-[#767676] mr-[241px]">
            {memberCount}/{memberLimit}
          </span>
          <span className="text-md text-[#777]">{duration}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default GroupListCard;
