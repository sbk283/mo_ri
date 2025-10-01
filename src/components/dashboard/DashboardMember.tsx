import { Link } from 'react-router-dom';

const members = [
  { nickname: '포토샵하는 낙타', profileimage: '/bruce.jpg' },
  { nickname: '축구하는 낙타', profileimage: '/bruce.jpg' },
  { nickname: '달리는 낙타', profileimage: '/bruce.jpg' },
  { nickname: '누워있는 낙타', profileimage: '/bruce.jpg' },
  { nickname: '노래하는 낙타', profileimage: '/bruce.jpg' },
  { nickname: '포토샵하는 낙타', profileimage: '/bruce.jpg' },
  { nickname: '날아가는 낙타', profileimage: '/bruce.jpg' },
  { nickname: '꿈을 꾸는 낙타', profileimage: '/bruce.jpg' },
];

const DashboardMember = () => {
  // 화면에 보여질 멤버 수를 4개로 제한
  const visibleMembers = members.slice(0, 5);
  // 추가 멤버 수 계산
  const extraMembersCount = members.length - visibleMembers.length;

  return (
    <div className="p-5 ">
      {/* 제목 */}
      <div className="flex justify-between mb-4 relative">
        <p className="text-xl font-bold">모임 멤버</p>
        <span className="text-[#FF5252] text-sm absolute left-[82px] bottom-[2px]">NEW</span>
        <Link to={'/groupmember/:id'} className="flex gap-1 items-center text-[#8C8C8C] text-sm">
          <img src="/plus_gray.svg" alt="더보기" />
          더보기
        </Link>
      </div>

      {/* 목록 */}
      <div className="flex flex-col gap-5">
        {visibleMembers.map((member, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-[38px] h-[38px] overflow-hidden rounded-[50%]">
              <img
                className="w-full h-full object-cover"
                src={member.profileimage}
                alt="프로필사진"
              />
            </div>
            <p>{member.nickname}</p>
          </div>
        ))}
      </div>

      {extraMembersCount > 0 && (
        <div className="absolute bottom-4 right-1/2 translate-x-1/2">
          <p className="text-gray-600">멤버 +{extraMembersCount}</p>
        </div>
      )}
    </div>
  );
};

export default DashboardMember;
