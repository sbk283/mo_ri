import { Link } from 'react-router-dom';
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';

function ServiceIntroducePage() {
  const swiperData = [
    {
      src: './bannerdesign1.jpg',
      alt: '관심사를 통한 모임찾기',
      to: '/grouplist/all',
    },
    {
      src: './bannerdesign2.jpg',
      alt: '찜리스트 가능',
      to: '/groupwish',
    },
    {
      src: './bannerdesign3.jpg',
      alt: '쳬계적인 모임생성',
      to: '/creategroup',
    },
    {
      src: './bruce.jpg',
      alt: '설명4',
      to: '/grouplist',
    },
  ];
  return (
    <div>
      {/* 상단배너 */}
      <div className="h-[560px] overflow-hidden relative mb-12 ">
        <img
          className="absolute w-full h-full object-cover inset-0"
          src="./service_bg.svg"
          alt="mo:ri 배경"
        />
        <div className="relative z-2 w-[1024px] h-full mx-auto flex justify-center items-center pr-[600px]">
          <div className="whitespace-nowrap">
            <img className="mb-3" src="./logo_white.svg" alt="Mo:ri" />
            <p className="text-white">당신의 일상에 가치를 더하는 모임</p>
            <p className="text-white text-xl font-bold">모리에서 함께 만들어갑니다.</p>
          </div>
        </div>
      </div>
      {/* 내용 */}
      <div>
        <div className="w-[1024px] mx-auto">
          {/* 메인홈가기 */}
          <div className="flex items-center justify-center mb-[170px]">
            <div className="w-[345px] h-[287px]">
              <img className="w-full h-full" src="./serviceimg1.svg" alt="모임" />
            </div>
            <div className="ml-[65px]">
              <div>
                <p className="text-xxl font-bold">"취미부터 자기계발까지,</p>
                <p className="text-xxl font-bold">
                  <span className="text-brand">원하는 모임을 한 곳에서 해결</span>하세요.”
                </p>
                <p className="text-md pt-3">
                  취미, 자기계발, 봉사까지, 원하는 모임을 쉽고 빠르게 찾을 수 있습니다.
                </p>
              </div>
              <div className="pt-10 pl-20">
                <Link
                  to={'/'}
                  className="border border-brand px-[65px] py-[12px] rounded-[5px] bg-white text-brand text-xl font-bold"
                >
                  메인 홈으로 가기
                </Link>
              </div>
            </div>
          </div>
          {/*  배너2개*/}
          <div className="pb-[100px]">
            <div>
              <Swiper
                slidesPerView={2}
                spaceBetween={20}
                pagination={{
                  clickable: true,
                }}
                modules={[Pagination]}
                className="mySwiperServiceIt w-full h-[230]"
              >
                {swiperData.map((banner, idx) => (
                  <SwiperSlide key={idx}>
                    <Link to={banner.to ?? '/default'}>
                      <img src={banner.src} alt={banner.alt} />
                    </Link>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
          {/* 믿고사용할수있는 최적환경제공 */}
          <div className="flex items-center justify-center mb-[100px]">
            <div className="mr-[90px]">
              <div>
                <p className="text-xxl font-bold">"믿고 사용할 수 있는</p>
                <p className="text-xxl font-bold">최적의 환경을 제공합니다."</p>
                <p className="text-lg font-bold pt-3">
                  <span className="text-brand">안전한 약속, 투명한 운영</span>, 개인정보 보호까지!”
                </p>
                <p className="pt-2">
                  모임은 <span className="font-bold">커리큘럼 기반</span>으로 엄격하게 관리되며,
                </p>
                <p>관리자 승인을 통해 신뢰할 수 있는 모임만 제공합니다.</p>
              </div>
            </div>
            <div className="w-[345px] h-[287px]">
              <img className="w-full h-full" src="./serviceimg2.svg" alt="모임" />
            </div>
          </div>
          {/* 버튼2개 */}
          <div className="relative w-[1024px] h-[454px] mx-auto mb-11">
            <img className="absolute w-full h-full" src="./Rectangle.svg" alt="회원가입" />
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
            <div className="absolute z-50 top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
              <p className="text-white text-lg text-center mb-2">
                무료 가입으로 첫 모임을 경험해 보세요!
              </p>
              <p className="text-white font-bold text-xl text-center">
                새로운 경험, 당신의 하루를 채워줄 모임이 기다리고 있어요.
              </p>
              <div className="flex gap-4 pt-6">
                <Link
                  to={'/login'}
                  className="border border-brand px-[60px] py-[10px] rounded-[5px] bg-brand text-white text-lg font-bold"
                >
                  회원 가입하기
                </Link>
                <Link
                  to={'/grouplist/all'}
                  className="border border-brand px-[60px] py-[10px] rounded-[5px] bg-white text-brand text-lg font-bold"
                >
                  모임 둘러보기
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ServiceIntroducePage;
