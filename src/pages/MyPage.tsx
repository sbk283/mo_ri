import MyPageLayout from '../components/layout/MyPageLayout';

// 기본 회원 정보, 모임 참여이력, 모임 생성이력 출력해야합니다.
function MyPage() {
  return (
    <MyPageLayout>
      {/* 상단 텍스트 부분 */}
      <div>
        <div className="text-xl font-bold text-gray-400 mb-[21px]">마이페이지</div>
      </div>
      <div className="flex gap-[12px]">
        <div className=" border-r border-brand border-[3px]"></div>
        <div className="text-gray-400">
          <div className="text-lg font-semibold">
            나의 기본 정보와 프로필을 확인하고 수정할 수 있는 공간입니다.
          </div>
          <div className="text-md">
            정확한 정보를 입력하면 더욱 편리하게 서비스를 이용하실 수 있습니다.
          </div>
        </div>
      </div>
    </MyPageLayout>
  );
}

export default MyPage;
