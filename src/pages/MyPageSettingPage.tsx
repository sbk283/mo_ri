import MyPageLayout from '../components/layout/MyPageLayout';
import PasswordEdit from '../components/users/PasswordEdit';

// 마이페이지 설정 페이지입니다.
function MyPageSettingPage() {
  return (
    <MyPageLayout>
      {/* 상단 텍스트 부분 */}
      <div>
        <div className="text-xl font-bold text-gray-400 mb-[21px]">
          마이페이지 {'>'} 설정 {'>'} 회원 정보 관리
        </div>
      </div>
      <div className="flex gap-[12px] mb-[45px]">
        <div className=" border-r border-brand border-[3px]"></div>
        <div className="text-gray-400">
          <div className="text-lg font-semibold">
            내 계정에 등록된 기본 정보를 확인하고 수정할 수 있는 공간입니다.
          </div>
          <div className="text-md">
            정확한 정보를 유지하면 서비스를 더욱 안전하고 편리하게 이용하실 수 있습니다.
          </div>
        </div>
      </div>
      {/* 하단 영역부분 비밀번호 확인컴포넌트 삭제 할거임.*/}
      {/* <PasswordCheck /> */}

      <PasswordEdit />
    </MyPageLayout>
  );
}

export default MyPageSettingPage;
