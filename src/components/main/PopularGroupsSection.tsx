import { Link } from 'react-router-dom';
import Plus from '../../../public/images/plus.svg';

type GroupItem = {
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
};

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
        'translate-x-[20%] translate-y-[20%]',
        STATUS_BG[color],
      ].join(' ')}
    >
      {text}
    </span>
  );
}
function GroupCard({ item }: { item: GroupItem }) {
  return (
    <li className="w-[240px] h-[350px] rounded-[5px] overflow-hidden relative cursor-pointer flex flex-col">
      <article className="rounded-md flex flex-col h-full">
        {/* 썸네일 */}
        <div className="relative h-[150px] overflow-hidden">
          {/* 상태 배지: 좌상단 */}
          <span className="absolute top-2 left-2 z-10">
            <StatusBadge text={item.status} color={item.statusColor} />
          </span>

          <img
            src={item.thumbnail}
            alt={`${item.title} 썸네일`}
            className="w-full h-full object-cover rounded-t-[10px]"
          />
          <button type="button" aria-label="즐겨찾기" className="absolute top-2 right-2 size-6">
            <img src="/images/unfill_star.png" alt="" aria-hidden="true" />
          </button>
        </div>

        {/* 본문: 절대배치 기준이 되는 영역 */}
        <div className="relative p-3 border border-[#eee] flex flex-col flex-1 pb-12">
          <header className="flex justify-between text-sm mb-2">
            <span className="text-red-500">{item.category}</span>
            <span className="text-gray-400">{item.region}</span>
          </header>

          <h3 className="text-lg font-bold hover:underline line-clamp-1">{item.title}</h3>
          <p className="text-sm text-[#979797] line-clamp-2">{item.desc}</p>

          {/* ↓↓↓ 여기서 고정: 좌하단/우하단 */}
          <time className="absolute left-3 bottom-3 bg-gray-400/70 text-white rounded-2xl px-2 py-1">
            {item.dday}
          </time>
          {item.ad && (
            <span className="absolute right-3 bottom-3 bg-gray-200 rounded-2xl px-2 py-1 text-gray-500">
              AD
            </span>
          )}
        </div>
      </article>
    </li>
  );
}

export default function PopularGroupsSection() {
  const data: GroupItem[] = [
    {
      id: 1,
      status: '모집중',
      statusColor: 'red',
      category: '취미/여가',
      region: '지역무관',
      title: '마비노기 던전 공파 모집',
      desc: '던전같이돌아요어쩌구저쩌구... 던전같이돌아요어쩌구저쩌구...던전같이돌아요어쩌구저쩌구...',
      dday: 'D-3',
      ad: true,
      thumbnail: '/images/group_img.png',
    },
    {
      id: 2,
      status: '모집예정',
      statusColor: 'blue',
      category: '취미/여가',
      region: '지역무관',
      title: '마비노기 모바일 던전 공파 모집',
      desc: '던전같이돌아요어쩌구저쩌구... 던전같이돌아요어쩌구저쩌구... 던전같이돌아요어쩌구저쩌구...',
      dday: 'D-3',
      ad: true,
      thumbnail: '/images/group_img.png',
    },
    {
      id: 3,
      status: '모집중',
      statusColor: 'red',
      category: '취미/여가',
      region: '지역무관',
      title: '마비노기 영웅전 던전 공파 모집',
      desc: '던전같이돌아요어쩌구저쩌구... 던전같이돌아요어쩌구저쩌구... 던전같이돌아요어쩌구저쩌구...',
      dday: 'D-3',
      ad: true,
      thumbnail: '/images/group_img.png',
    },
    {
      id: 4,
      status: '서비스종료',
      statusColor: 'black',
      category: '취미/여가',
      region: '지역무관',
      title: '카드라이더 하실분 모집',
      desc: '카트라이더는 서비스 종료했는데... 어떻게 하죠? 카트라이더는 서비스 종료했는데... 어떻게 하죠?',
      dday: 'D+999',
      ad: true,
      thumbnail: '/images/group_img.png',
    },
  ];

  return (
    <section
      className="bg-[#F9FBFF] border border-solid border-[#DBDBDB]"
      aria-labelledby="popular-groups-heading"
    >
      <div className="mx-auto max-w-[1024px] px-4">
        <header className="flex items-end pt-[80px] pb-[36px]">
          <div className="mr-4">
            <h2 id="popular-groups-heading" className="font-semibold text-lg">
              Mo:ri 가 엄선한 인기모임!
            </h2>
            <p className="font-semibold text-xxl">지금 바로 확인하세요!</p>
          </div>
          <Link to="/" className="flex text-sm pb-2 gap-1">
            <img src={Plus} alt="" aria-hidden="true" />
            더보기
          </Link>
        </header>

        <ul className="grid gap-[21px] mb-[80px] overflow-x-auto pb-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 place-items-stretch">
          {data.map(item => (
            <GroupCard key={item.id} item={item} />
          ))}
        </ul>
      </div>
    </section>
  );
}
