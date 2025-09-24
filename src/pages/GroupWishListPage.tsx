import { useState } from 'react';
import { GroupCard, type GroupItem } from '../components/common/GroupCard';
import GroupManagerLayout from '../components/layout/GroupManagerLayout';

// 찜리스트 페이지
function GroupWishListPage() {
  const [groups, setGroups] = useState<GroupItem[]>([
    {
      id: 1,
      status: '모집중',
      category: '취미/여가',
      region: '지역무관',
      title: '마비노기 던전 공파 모집',
      desc: '던전같이돌아요어쩌구저쩌구... 던전같이돌아요어쩌구저쩌구...던전같이돌아요어쩌구저쩌구...',
      dday: 'D-3',
      ad: true,
      thumbnail: '/images/group_img.png',
      favorite: true,
    },
    {
      id: 2,
      status: '모집예정',
      category: '취미/여가',
      region: '지역무관',
      title: '마비노기 모바일 던전 공파 모집',
      desc: '던전같이돌아요어쩌구저쩌구... 던전같이돌아요어쩌구저쩌구... 던전같이돌아요어쩌구저쩌구...',
      dday: 'D-3',
      ad: false,
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
      favorite: true,
    },
    {
      id: 4,
      status: '모집예정',
      category: '취미/여가',
      region: '지역무관',
      title: '카드라이더 하실분 모집',
      desc: '카트라이더는 서비스 종료했는데... 어떻게 하죠? 카트라이더는 서비스 종료했는데... 어떻게 하죠?',
      dday: 'D-7',
      ad: false,
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
      favorite: true,
    },
    {
      id: 6,
      status: '모집예정',
      category: '취미/여가',
      region: '지역무관',
      title: '마비노기 모바일 던전 공파 모집',
      desc: '던전같이돌아요어쩌구저쩌구... 던전같이돌아요어쩌구저쩌구... 던전같이돌아요어쩌구저쩌구...',
      dday: 'D-3',
      ad: false,
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
      favorite: true,
    },
    {
      id: 8,
      status: '모집예정',
      category: '취미/여가',
      region: '지역무관',
      title: '카드라이더 하실분 모집',
      desc: '카트라이더는 서비스 종료했는데... 어떻게 하죠? 카트라이더는 서비스 종료했는데... 어떻게 하죠?',
      dday: 'D-7',
      ad: false,
      thumbnail: '/images/group_img.png',
      favorite: true,
    },
  ]);

  const toggleFavorite = (id: number, next: boolean) => {
    setGroups(prev => prev.map(g => (g.id === id ? { ...g, favorite: next } : g)));
  };
  const favoriteGroups = groups.filter(item => item.favorite);
  return (
    <GroupManagerLayout>
      {' '}
      {/* 상단 텍스트 부분 */}
      <div>
        <div className="text-xl font-bold text-gray-400 mb-[21px]">모임관리 {'>'} 찜리스트</div>
      </div>
      <div className="flex gap-[12px]">
        <div className=" border-r border-brand border-[3px]"></div>
        <div className="text-gray-400">
          <div className="text-lg font-semibold">관심 있는 모임을 한곳에서 모아볼 수 있습니다.</div>
          <div className="text-md">
            찜한 모임의 일정과 정보를 확인하며 원하는 모임에 쉽게 참여해보세요.
          </div>
        </div>
      </div>
      {/* 찜리스트 부분 */}
      <div className="mt-[40px]">
        {favoriteGroups.length === 0 ? (
          <div className="text-center text-gray-400 text-lg py-20 mb-20">
            <div>찜한 모임이 없습니다. 새로운 모임에 참여해 즐거운 활동을 시작해보세요!</div>
            <a href="/grouplist" className="text-[#0689E8] font-[15px] mt-[19px] inline-block">
              모임 참여하러 가기 {`>`}
            </a>
          </div>
        ) : (
          <ul
            className="grid gap-[21px] mb-[80px]
              grid-cols-2 sm:grid-cols-3 lg:grid-cols-4
              place-items-stretch overflow-x-auto pb-2 w-[1024px]"
          >
            {favoriteGroups.map(item => (
              <GroupCard key={item.id} item={item} onToggleFavorite={toggleFavorite} />
            ))}
          </ul>
        )}
      </div>
    </GroupManagerLayout>
  );
}
export default GroupWishListPage;
