import MyPageLayout from '../components/layout/MyPageLayout';

// 기본 회원 정보, 모임 참여이력, 모임 생성이력 출력해야합니다.
function MyPage() {
  return (
    <MyPageLayout>
      {/* 상단 텍스트 부분 */}
      <div>
        <div className="text-xl font-bold text-gray-400 mb-[21px]">마이페이지</div>
      </div>
      <div className="flex gap-[12px] mb-[43px]">
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
      {/* 하단 내용 부분  */}
      <div className="w-[1024px] border border-gray-300 rounded-[5px] py-[36px] px-[48px] flex gap-[48px]">
        <div className="bg-slate-300 w-full max-w-[192px] h-[192px] rounded-[50%] border-[5px] border-brand">
          그림영역
        </div>
        <div className="w-full">
          <div className="flex items-center justify-between">
            <div className="bg-brand py-[5px] px-[10px] text-white font-medium rounded-[5px]">
              프리미엄 모임장 🏆
            </div>
            <button className="bg-white border border-gray-300 py-[5px] px-[10px] rounded-[5px] text-gray-200 font-semibold">
              회원정보수정
            </button>
          </div>
          <div>
            춤추는 낙타 <span>님 반가워요✨</span>
          </div>
        </div>
      </div>
    </MyPageLayout>
  );
}

export default MyPage;
