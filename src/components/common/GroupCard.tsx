export type GroupItem = {
  id: number;
  status: '모집중' | '모집예정' | '서비스종료';
  statusColor: 'red' | 'blue' | 'black';
  category: string;
  region: string;
  title: string;
  desc: string;
  dday: string;
  ad?: boolean;
  thumbnail: string;
  duration?: Duration;
};

export type Duration = 'oneday' | 'short' | 'long';

const STATUS_BG: Record<GroupItem['statusColor'], string> = {
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  black: 'bg-black',
};

function StatusBadge({
  text,
  color,
}: {
  text: GroupItem['status'];
  color: GroupItem['statusColor'];
}) {
  return (
    <span
      className={[
        'text-sm font-bold text-white px-2 py-1',
        'rounded-tl-[15px] rounded-tr-[15px] rounded-br-[15px]',
        'relative z-[1] inline-block',
        'translate-x-[0%] translate-y-[-60%]',
        STATUS_BG[color],
      ].join(' ')}
    >
      {text}
    </span>
  );
}

export function GroupCard({ item }: { item: GroupItem }) {
  return (
    <li className="h-[350px] rounded-[5px] overflow-hidden relative cursor-pointer flex flex-col pt-5">
      <article className="rounded-md flex flex-col h-full">
        {/* 상태 배지: 좌상단 */}
        <span className="absolute left-2 z-10">
          <StatusBadge text={item.status} color={item.statusColor} />
        </span>
        {/* 썸네일 */}
        <div className="relative h-[150px] overflow-hidden">
          <img
            src={item.thumbnail}
            alt={`${item.title} 썸네일`}
            className="w-full h-full object-cover rounded-t-[10px]"
          />
          <button type="button" aria-label="즐겨찾기" className="absolute top-2 right-2 size-6">
            <img src="/images/unfill_star.png" alt="" aria-hidden="true" />
          </button>
        </div>
        <div className="relative p-3 border border-[#eee] flex flex-col flex-1 pb-12">
          <header className="flex justify-between text-sm mb-2">
            <span className="text-red-500">{item.category}</span>
            <span className="text-gray-400">{item.region}</span>
          </header>

          <h3 className="text-lg font-bold hover:underline line-clamp-1">{item.title}</h3>
          <p className="text-sm text-[#979797] line-clamp-2">{item.desc}</p>
          <time className="absolute left-3 bottom-3 bg-[#87898D] text-white rounded-2xl px-2 py-1">
            {item.dday}
          </time>
          {item.ad && (
            <span className="absolute right-3 bottom-3 bg-[#c5c5c5] text-white rounded-2xl px-2 py-1">
              AD
            </span>
          )}
        </div>
      </article>
    </li>
  );
}
