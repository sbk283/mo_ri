import { Link } from 'react-router-dom';
import Plus from '../../../public/images/plus.svg';
import type { GroupItem } from '../common/GroupCard';
import SwiperGroupCard from '../common/SwiperGroupCard';

export default function PopularGroupsSection() {
  const data: GroupItem[] = [
    {
      id: 1,
      status: '모집중',
      category: '취미/여가',
      region: '지역무관',
      title: '마비노기 던전 공파 모집',
      desc: '던전같이돌아요어쩌구저쩌구... 던전같이돌아요어쩌구저쩌구...던전같이돌아요어쩌구저쩌구...',
      dday: 'D-3',
      ad: false,
      thumbnail: '/images/group_img.png',
      favorite: false,
    },
    {
      id: 2,
      status: '모집예정',
      category: '취미/여가',
      region: '지역무관',
      title: '마비노기 모바일 던전 공파 모집',
      desc: '던전같이돌아요어쩌구저쩌구... 던전같이돌아요어쩌구저쩌구... 던전같이돌아요어쩌구저쩌구...',
      dday: 'D-3',
      ad: true,
      thumbnail: '/images/group_img.png',
      favorite: true,
    },
    {
      id: 3,
      status: '모집중',
      category: '취미/여가',
      region: '지역무관',
      title: '마비노기 영웅전 던전 공파 모집',
      desc: '던전같이돌아요어쩌구저쩌구... 던전같이돌아요어쩌구저쩌구... 던전같이돌아요어쩌구저쩌구...',
      dday: 'D-3',
      ad: true,
      thumbnail: '/images/group_img.png',
      favorite: false,
    },
    {
      id: 4,
      status: '모집예정',
      category: '취미/여가',
      region: '지역무관',
      title: '카드라이더 하실분 모집',
      desc: '카트라이더는 서비스 종료했는데... 어떻게 하죠? 카트라이더는 서비스 종료했는데... 어떻게 하죠?',
      dday: 'D-7',
      ad: true,
      thumbnail: '/images/group_img.png',
      favorite: true,
    },
    {
      id: 5,
      status: '모집중',
      category: '취미/여가',
      region: '지역무관',
      title: '마비노기 던전 공파 모집',
      desc: '던전같이돌아요어쩌구저쩌구... 던전같이돌아요어쩌구저쩌구...던전같이돌아요어쩌구저쩌구...',
      dday: 'D-3',
      ad: true,
      thumbnail: '/images/group_img.png',
      favorite: false,
    },
    {
      id: 6,
      status: '모집예정',
      category: '취미/여가',
      region: '지역무관',
      title: '마비노기 모바일 던전 공파 모집',
      desc: '던전같이돌아요어쩌구저쩌구... 던전같이돌아요어쩌구저쩌구... 던전같이돌아요어쩌구저쩌구...',
      dday: 'D-3',
      ad: true,
      thumbnail: '/images/group_img.png',
      favorite: true,
    },
    {
      id: 7,
      status: '모집중',
      category: '취미/여가',
      region: '지역무관',
      title: '마비노기 영웅전 던전 공파 모집',
      desc: '던전같이돌아요어쩌구저쩌구... 던전같이돌아요어쩌구저쩌구... 던전같이돌아요어쩌구저쩌구...',
      dday: 'D-3',
      ad: true,
      thumbnail: '/images/group_img.png',
      favorite: false,
    },
    {
      id: 8,
      status: '모집예정',
      category: '취미/여가',
      region: '지역무관',
      title: '카드라이더 하실분 모집',
      desc: '카트라이더는 서비스 종료했는데... 어떻게 하죠? 카트라이더는 서비스 종료했는데... 어떻게 하죠?',
      dday: 'D-7',
      ad: true,
      thumbnail: '/images/group_img.png',
      favorite: true,
    },
  ];

  return (
    <section
      className="bg-[#F9FBFF] border-t border-b border-solid border-[#DBDBDB]"
      aria-labelledby="popular-groups-heading"
    >
      <div className="mx-auto w-[1024px]">
        <header className="pt-[40px] pb-[18px]">
          <h2 id="popular-groups-heading" className="font-semibold text-lg">
            Mo:ri 가 엄선한 인기모임!
          </h2>
          <div className="mr-4">
            <div className="flex items-center gap-4">
              <p className="font-semibold text-xxl">지금 바로 확인하세요!</p>
              <Link to="/grouplist" className="flex text-sm gap-1 pb-auto">
                <img src={Plus} alt="" aria-hidden="true" />
                <span className="items-center">더보기</span>
              </Link>
            </div>
          </div>
        </header>

        <div className="mb-[80px]">
          <SwiperGroupCard items={data} confirmMode="unfav" loop={false} spaceBetween={16} />
        </div>
      </div>
    </section>
  );
}
