export type GroupItem = {
  id: number;
  status: '모집중' | '모집예정';
  category: string;
  region: string;
  title: string;
  desc: string;
  dday: string;
  ad?: boolean;
  thumbnail: string;
  duration?: Duration;
  favorite: boolean;
};

export type Duration = 'oneday' | 'short' | 'long';

// status 별 색상 매핑
const STATUS_BG: Record<GroupItem['status'], string> = {
  모집중: 'bg-[#FF5252]',
  모집예정: 'bg-[#2A91E5]',
};

// StatusBadge 컴포넌트
function StatusBadge({ text }: { text: GroupItem['status'] }) {
  return (
    <span
      className={[
        'text-[14px] font-bold text-white px-2 py-1',
        'rounded-tl-[15px] rounded-tr-[15px] rounded-br-[15px]',
        'relative z-[1] inline-block',
        'translate-x-[0%] translate-y-[-60%]',
        'h-[23px] p-[4px] flex items-center justify-center flex-shrink-0',
        STATUS_BG[text],
      ].join(' ')}
    >
      {text}
    </span>
  );
}

export function GroupCard({ item }: { item: GroupItem }) {
  return (
    <li className="h-[290px] overflow-hidden relative cursor-pointer flex flex-col pt-5">
      <article className="rounded-md flex flex-col h-full">
        {/* 상태 배지: 좌상단 */}
        <span className="absolute left-2 z-10">
          <StatusBadge text={item.status} />
        </span>
        {/* 썸네일 */}
        <div className="relative overflow-hidden">
          <img
            src={item.thumbnail}
            alt={`${item.title} 썸네일`}
            className="w-full object-cover rounded-t-[10px] h-[133px]"
          />
          <button
            type="button"
            aria-label="즐겨찾기"
            className="absolute top-2 right-2 size-6 w-[15px] h-[15px]"
          >
            {item.favorite ? (
              <img src="/images/fill_star.png" alt="" aria-hidden="true" />
            ) : (
              <img src="/images/unfill_star.png" alt="" aria-hidden="true" />
            )}
          </button>
        </div>
        <div className="relative p-[15px] border border-[#A3A3A3] rounded-b-md flex flex-col flex-1 pb-12">
          <header className="flex justify-between text-[12px] mb-2">
            <span className="text-[#D83737] font-semibold">{item.category}</span>
            <span className="text-[#767676]">{item.region}</span>
          </header>
          <h3 className="flex items-center gap-1 text-lg font-bold hover:underline line-clamp-1">
            <span className="truncate mb-1 display-flex items-center gap-1">{item.title}</span>
            {item.ad && (
              <img src="/images/trophy.svg" alt="trophy" className="w-4 h-4 flex-shrink-0 mb-2" />
            )}
          </h3>
          <p className="text-[15px] h-[34px] text-[#979797] line-clamp-2 leading-[17px]">
            {item.desc}
          </p>
          <time className="absolute left-3 bottom-3 bg-[#87898D] text-white rounded-2xl px-2 text-[12px]">
            {item.dday}
          </time>
          {item.ad && (
            <span className="absolute right-3 bottom-3 bg-[#C5C5C5] text-white rounded-xl px-2 text-[9px] ">
              AD
            </span>
          )}
        </div>
      </article>
    </li>
  );
}

export default GroupCard;
