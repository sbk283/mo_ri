import { Link } from 'react-router-dom';
import Plus from '../../../public/images/plus.svg';
import { GroupCard, type GroupItem } from '../common/GroupCard';

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
    {
      id: 5,
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
      id: 6,
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
      id: 7,
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
      id: 8,
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
    <section className="mx-auto max-w-[1024px] w-[1024px]" aria-labelledby="popular-groups-heading">
      <div className="mx-auto max-w-[1024px] px-4">
        <header className="pt-[80px] pb-[36px]">
          <h2 id="popular-groups-heading" className="font-semibold text-lg">
            Mo:ri 가 엄선한 인기모임!
          </h2>
          <div className="mr-4">
            <div className="flex items-center gap-4">
              <p className="font-semibold text-xxl">지금 바로 확인하세요!</p>
              <Link to="/grouplist" className="flex items-center text-sm gap-1 pb-1">
                <img src={Plus} alt="" aria-hidden="true" />
                더보기
              </Link>
            </div>
          </div>
        </header>

        <ul
          className="grid gap-[21px] mb-[80px]
            grid-cols-2 sm:grid-cols-3 lg:grid-cols-4
            place-items-stretch overflow-x-auto pb-2 w-[1024px]"
        >
          {data.slice(0, 4).map(item => (
            <GroupCard key={item.id} item={item} />
          ))}
        </ul>
      </div>
    </section>
  );
}
