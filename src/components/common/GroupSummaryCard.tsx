// 참가하기 모달에 들어가는 카드(?) 일단 대충만 만들어놓고 나중에 DB 붙은담에 기능 추가로 넣겠슴다

type GroupSummaryCardProps = {
  title: string;
  status: '모집중' | '모집예정' | '서비스종료';
  category: string;
  subCategory: string;
  memberCount: number;
  memberLimit: number;
  duration: string; // "2025.05.12 ~ 2025.05.12"
  dday?: string;
  thumbnail?: string;
  desc?: string;
};

function GroupSummaryCard({
  title,
  status,
  category,
  subCategory,
  memberCount,
  memberLimit,
  duration,
  dday,
  thumbnail = '/nullbg.jpg',
  desc,
}: GroupSummaryCardProps) {
  return (
    <div className="flex gap-3 border border-gray-300 rounded-sm p-3 bg-white">
      {/* 썸네일 */}
      <img
        src={thumbnail}
        alt="thumbnail"
        className="w-[120px] h-[80px] object-cover rounded-sm border border-gray-300"
      />

      {/* 본문 */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 text-[11px] font-bold text-white rounded-sm bg-[#E06251]">
            {status}
          </span>
          {dday && (
            <span className="px-2 py-0.5 text-[11px] font-bold text-white rounded-sm bg-gray-600">
              {dday}
            </span>
          )}
          <span className="px-2 py-0.5 text-[11px] font-bold text-white rounded-sm bg-[#FBAB17]">
            원데이
          </span>
        </div>

        <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{title}</h3>
        {desc && <p className="mt-1 text-xs text-gray-600 line-clamp-2">{desc}</p>}

        <div className="mt-2 flex items-center justify-between text-[12px] text-gray-600">
          <span className="font-semibold text-[#D83737]">
            {category} &gt; <span className="font-semibold text-gray-500">{subCategory}</span>
          </span>
          <span>
            {memberCount}/{memberLimit}
          </span>
          <span className="text-gray-500">{duration}</span>
        </div>
      </div>
    </div>
  );
}

export default GroupSummaryCard;
