import { Link } from 'react-router-dom';
import MyPageLayout from '../components/layout/MyPageLayout';
import MypageMyGroupMenu from '../components/MypageMyGroupMenu';

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
      {/* 하단 내용 부분 -상단 박스  */}
      <div className="w-[1024px] border border-gray-300 rounded-[5px] py-[36px] px-[48px] flex gap-[48px] mb-[59px]">
        <div className="overflow-hidden bg-slate-300 w-full max-w-[192px] h-[192px] rounded-[50%] border-[5px] border-brand">
          <img src="/ham.png" alt="이미지" className="w-full h-full object-cover" />
        </div>
        <div className="w-full">
          <div className="flex items-center justify-between mb-[10px]">
            <div className="text-brand text-xxl font-bold mb-[4px] ">
              춤추는 낙타 <span className="text-black">님 반가워요✨</span>
            </div>
            <Link
              to={'/mypagesetting'}
              className="bg-white border border-gray-300 py-[5px] px-[10px] rounded-[5px] text-gray-200 font-semibold"
            >
              회원정보수정
            </Link>
          </div>

          <div className="text-md text-gray-400 font-medium mb-[20px]">
            유지선{''} | {''}(z.seon.dev@gmail.com)
          </div>
          <div className=" border border-gray-300 mb-[12px]" />
          <div>
            <div className="text-md font-bold text-gray-400 mb-[9px]">내 관심 키워드</div>
            {/* 관심사 키워드 영역 추후 선택따라서 변경 가능하게~ */}
            <div className="flex gap-[14px]">
              <div className="inline-block bg-brand py-[5px] px-[25px] rounded-[5px] text-white font-medium">
                봉사 / 사회 참여
              </div>
              <div className="inline-block bg-brand py-[5px] px-[25px] rounded-[5px] text-white font-medium">
                스터디 / 학습
              </div>
              <div className="inline-block bg-brand py-[5px] px-[25px] rounded-[5px] text-white font-medium">
                운동 / 건강
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* 하단 내용 부분 -하단 박스  */}
      <div>
        <MypageMyGroupMenu />
      </div>
    </MyPageLayout>
  );
}

export default MyPage;
