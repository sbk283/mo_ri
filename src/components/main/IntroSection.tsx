import { useState } from 'react';
import { Link } from 'react-router-dom';

function IntroSection() {
  // 로그인 상태관리
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div>
      <div className="relative  mt-[70px]">
        <div className="relative w-full h-[500px] overflow-hidden rounded-bl-[80px] rounded-br-[80px]">
          <img src="/bgimg.jpg" alt="" className="absolute inset-0 bg-cover bg-center " />
          <div className="absolute inset-0 bg-black/50 " />
        </div>

        <div className="absolute top-[135px] left-1/2 transform -translate-x-1/2  text-xxl font-bold text-gray-50">
          당신의 모임을 검색하세요!
        </div>
        {/* 검색창 */}
        <div className="absolute flex justify-center left-1/2 -translate-x-1/2 top-[214px]">
          <input
            type="text"
            placeholder="모임명이나 카테고리를 입력해 주세요."
            className="w-[550px] p-[15px] rounded-[40px] placeholder:text-md placeholder:text-gray-200 px-8 border-brand border-[2px]"
          />
          <button className="absolute right-6 top-1/2 transform -translate-y-1/2">
            <img src="./search.png" alt="검색" className="w-[30px] h-[30px] transform scale-75" />
          </button>
        </div>
        {/* 프로필 영역 */}
        <div>
          <div className="absolute  top-[380px] left-1/2  transform -translate-x-1/2 bg-white w-[1024px] h-[216px] flex rounded-[5px] shadow-card gap-[18px]  items-start">
            <Link
              to={'/creategroup'}
              className="bg-brand-light w-[207px] h-[227px]  transform -translate-y-[30px] -translate-x-[-42px] rounded-[5px]  rounded-tr-[50px] px-[26px] py-[37px]"
            >
              <div className=" text-md font-bold text-white">관리자</div>
              <div className="flex justify-between items-center">
                <div className=" text-[25px] font-semibold text-white">모임 생성</div>
                <img src="./direction.svg" alt="바로가기" />
              </div>
              <div className=" text-sm font-sans text-white">모임을 만들어 보세요!</div>
              <img
                src="./meetingsicon.svg"
                alt="그림아이콘"
                className="transform -translate-y-[-12px]"
              />
            </Link>
            <Link
              to={'/grouplist'}
              className="bg-brand-red w-[207px] h-[227px]  transform -translate-y-[30px] -translate-x-[-42px] rounded-[5px]  rounded-tr-[50px]  px-[26px] py-[37px] "
            >
              <div className=" text-md font-bold text-white">참가자</div>
              <div className="flex justify-between items-center">
                <div className=" text-[25px] font-semibold text-white">모임 리스트</div>
                <img src="./direction.png" alt="바로가기" />
              </div>
              <div className=" text-sm font-sans text-white">모임에 참여해 보세요!</div>
              <img
                src="./Onlinemeetingicon.svg"
                alt="그림아이콘"
                className="transform -translate-y-[-14px]"
              />
            </Link>

            {/* 로그인 / 비회원 일때 보여지는 화면 전환 (날리지 말것!!) */}
            {isLoggedIn ? (
              <>
                <div className="flex transform -translate-x-[-65px] pt-[22px]">
                  <div>
                    <img
                      src="./ham.png"
                      alt="프로필 이미지"
                      className="w-[140px] h-[175px] rounded-[5px] object-cover "
                    />
                  </div>
                </div>
                <div className="flex transform -translate-x-[-40px] pt-[19px]">
                  <div className="pl-[35px]">
                    <div className="flex justify-between font-bold text-lg">
                      <div>
                        홍길동님(용산동 불주먹)
                        <span className="font-medium text-sm text-gray-200">환영합니다.</span>
                      </div>
                      <button>
                        <img src="/logout.svg" alt="로그아웃" className="w-[18px]" />
                      </button>
                    </div>
                    <div className=" flex justify-between mt-[9px] items-center gap-[8px] mb-[6px]">
                      <div className="font-bold text-md text-brand">참여중인모임</div>
                      <div className="border-[0.5px] w-[160px] border-[#dadada]" />
                      <Link to={'/joingroups'} className="font-normal text-sm">
                        더보기
                      </Link>
                    </div>
                    <div className="space-y-[4px]  text-sm">
                      <div>· [장기]이러쿵저러쿵 스터디</div>
                      <div>· [원데이]이러쿵저러쿵 스터디</div>
                      <div>· [원데이]이러쿵저러쿵 스터디</div>
                    </div>
                    <div className=" flex justify-between mt-[9px] items-center gap-[8px]">
                      <div className="font-bold text-md text-brand">바로가기</div>
                      <div className="border-[0.5px] w-[231px] border-[#dadada]" />
                    </div>
                    <div className="flex gap-[17px] text-sm">
                      <div className="flex items-center gap-[6px] justify-center">
                        <img src="./reviewicon.png" alt="리뷰 아이콘" />
                        <Link to={'/groupreviews'}>리뷰</Link>
                      </div>
                      <div className="flex items-center gap-[6px] justify-center">
                        <img src="./star.png" alt="찜리스트 아이콘" />
                        <Link to={'/groupwish'}>찜리스트</Link>
                      </div>
                      <div className="flex items-center gap-[6px] justify-center">
                        <img src="./headseticon.png" alt="고객센터 아이콘" />
                        <Link to={'/faq'}>고객센터</Link>
                      </div>
                      <div className="flex items-center gap-[6px] justify-center">
                        <img src="./settingicon.png" alt="회원설정 아이콘" />
                        <Link to={'/mypagesetting'}>회원설정</Link>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-[23px] transform -translate-x-[-170px] pt-[50px]">
                  <img src="/images/mori_logo.svg" alt="" className="w-[75px] h-[24px]" />
                  <div>
                    <p className=" text-md font-semibold text-gray-500 leading-tight">
                      참여와 기록을 통해 <br />
                      성장과 커리어를 만들어 보세요.
                    </p>
                  </div>
                </div>
                <Link
                  to={'/login'}
                  className="absolute transform -translate-x-[-570px] -translate-y-[-115px] "
                >
                  <p className="text-xxl font-bold text-white  bg-brand w-[385px] text-center py-[6px] rounded-[5px]">
                    로그인
                  </p>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default IntroSection;
