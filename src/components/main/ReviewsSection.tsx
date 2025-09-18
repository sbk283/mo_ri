import { Link } from 'react-router-dom';
import Plus from '../../../public/images/plus.svg';

function ReviewsSection() {
  return (
    <div className="bg-[#F9FBFF] border-t border-b border-solid border-[#DBDBDB]">
      <div className="mx-auto w-[1024px]">
        {/* 후기 */}
        <div>
          {/* 카테고리 */}
          <div className="flex items-end pt-[80px] pb-[36px]">
            <div className="mr-4">
              <p className="font-semibold text-lg">믿고 참여하는</p>
              <p className="font-semibold text-xxl">Mo:ri 의 모임 후기!</p>
            </div>
            <div>
              <Link to={'/'} className="flex text-sm pb-2 gap-1">
                <img src={Plus} alt="더보기" />
                더보기
              </Link>
            </div>
          </div>
          {/* 후기박스 */}
          <div className="flex gap-[21px]">
            <div className="w-[240px] h-[280px] bg-white rounded-[5px] overflow-hidden relative shadow-card cursor-pointer">
              <div className="bg-brand h-[72px]  pt-[14px] px-[27px]">
                <p className="text-white font-semibold text-md mb-1 line-clamp-1">
                  마비노기 던전 공파 모집
                </p>
                <span className="border border-[#FF5252] bg-white text-[#FF5252] font-semibold text-sm px-[4px] py-[1px] rounded-[5px] ">
                  취미/여가
                </span>
                <img
                  className="absolute top-8 right-2 w-[59px] h-[59px] rounded-[50%] object-cover"
                  src="./bruce.jpg"
                  alt="모임사진"
                />
              </div>
              <div className=" px-[27px] py-[17px]">
                <img className="mb-1" src="./colon.svg" alt="따옴표" />
                <p className="line-clamp-6 text-sm text-[#8c8c8c] mb-4">
                  파티장이 정말 좋습니다. 체계적으로 하고 파티도 여러 직업들로 잘 배분되어 있어서
                  좋네요. 어떤 아이템을 먹고 시작해야하는지도 잘 알려주고 클리어 팁도 잘 알려주고
                  너무 좋았어요. 완전 버스탄 기분이네요!
                </p>
                <p className="text-[#B8641B] text-sm">zipgago*** 님의 후기</p>
              </div>
            </div>
            <div className="w-[240px] h-[280px] bg-white rounded-[5px] overflow-hidden relative shadow-card cursor-pointer">
              <div className="bg-brand h-[72px]  pt-[14px] px-[27px]">
                <p className="text-white font-semibold text-md mb-1 line-clamp-1">
                  마비노기 던전 공파 모집
                </p>
                <span className="border border-[#FF5252] bg-white text-[#FF5252] font-semibold text-sm px-[4px] py-[1px] rounded-[5px] ">
                  취미/여가
                </span>
                <img
                  className="absolute top-8 right-2 w-[59px] h-[59px] rounded-[50%] object-cover"
                  src="./bruce.jpg"
                  alt="모임사진"
                />
              </div>
              <div className=" px-[27px] py-[17px]">
                <img className="mb-1" src="./colon.svg" alt="따옴표" />
                <p className="line-clamp-6 text-sm text-[#8c8c8c] mb-4">
                  파티장이 정말 좋습니다. 체계적으로 하고 파티도 여러 직업들로 잘 배분되어 있어서
                  좋네요. 어떤 아이템을 먹고 시작해야하는지도 잘 알려주고 클리어 팁도 잘 알려주고
                  너무 좋았어요. 완전 버스탄 기분이네요!
                </p>
                <p className="text-[#B8641B] text-sm">zipgago*** 님의 후기</p>
              </div>
            </div>
            <div className="w-[240px] h-[280px] bg-white rounded-[5px] overflow-hidden relative shadow-card cursor-pointer">
              <div className="bg-brand h-[72px]  pt-[14px] px-[27px]">
                <p className="text-white font-semibold text-md mb-1 line-clamp-1">
                  마비노기 던전 공파 모집
                </p>
                <span className="border border-[#FF5252] bg-white text-[#FF5252] font-semibold text-sm px-[4px] py-[1px] rounded-[5px] ">
                  취미/여가
                </span>
                <img
                  className="absolute top-8 right-2 w-[59px] h-[59px] rounded-[50%] object-cover"
                  src="./bruce.jpg"
                  alt="모임사진"
                />
              </div>
              <div className=" px-[27px] py-[17px]">
                <img className="mb-1" src="./colon.svg" alt="따옴표" />
                <p className="line-clamp-6 text-sm text-[#8c8c8c] mb-4">
                  파티장이 정말 좋습니다. 체계적으로 하고 파티도 여러 직업들로 잘 배분되어 있어서
                  좋네요. 어떤 아이템을 먹고 시작해야하는지도 잘 알려주고 클리어 팁도 잘 알려주고
                  너무 좋았어요. 완전 버스탄 기분이네요!
                </p>
                <p className="text-[#B8641B] text-sm">zipgago*** 님의 후기</p>
              </div>
            </div>
            <div className="w-[240px] h-[280px] bg-white rounded-[5px] overflow-hidden relative shadow-card cursor-pointer">
              <div className="bg-brand h-[72px]  pt-[14px] px-[27px]">
                <p className="text-white font-semibold text-md mb-1 line-clamp-1">
                  마비노기 던전 공파 모집
                </p>
                <span className="border border-[#FF5252] bg-white text-[#FF5252] font-semibold text-sm px-[4px] py-[1px] rounded-[5px] ">
                  취미/여가
                </span>
                <img
                  className="absolute top-8 right-2 w-[59px] h-[59px] rounded-[50%] object-cover"
                  src="./bruce.jpg"
                  alt="모임사진"
                />
              </div>
              <div className=" px-[27px] py-[17px]">
                <img className="mb-1" src="./colon.svg" alt="따옴표" />
                <p className="line-clamp-6 text-sm text-[#8c8c8c] mb-4">
                  파티장이 정말 좋습니다. 체계적으로 하고 파티도 여러 직업들로 잘 배분되어 있어서
                  좋네요. 어떤 아이템을 먹고 시작해야하는지도 잘 알려주고 클리어 팁도 잘 알려주고
                  너무 좋았어요. 완전 버스탄 기분이네요!
                </p>
                <p className="text-[#B8641B] text-sm">zipgago*** 님의 후기</p>
              </div>
            </div>
          </div>
        </div>
        {/* 서비스소개및 배너 */}
        <div className="pt-[135px] pb-[74px] ">
          <div className="mx-auto bg-white shadow-card w-[1024px] h-[233px] flex py-[23px] relative">
            {/* 서비스소개 */}
            <div className="pl-[24px]">
              <Link to={'/serviceint'}>
                <div className="bg-brand w-[230px] h-[246px] rounded-[5px] rounded-tr-[50px] py-[36px] px-[32px] absolute bottom-[23px]">
                  <span className="text-white font-bold text-sm">어려운 분들께</span>
                  <p className="text-white text-xxl font-bold flex gap-2 items-center">
                    서비스소개 <img src="./linkarrow.svg" alt="이동" />
                  </p>
                  <p className="text-white pt-2 text-sm w-[129px] ">
                    모임생성부터 참가까지 사이트를 이용할 수 있는 방법을 알려드립니다.
                  </p>
                </div>
              </Link>
            </div>
            {/* 배너노출 */}
            <div className="flex gap-[31px] absolute right-[35px]">
              <div className="w-[213px] h-[187px] rounded-[5px] bg-gray-300 overflow-hidden hover:shadow-card">
                <a
                  href="https://greenart.co.kr/?ACE_REF=adwords_g&ACE_KW=%EA%B7%B8%EB%A6%B0%EC%BB%B4%ED%93%A8%ED%84%B0%EC%95%84%ED%8A%B8%ED%95%99%EC%9B%90&gad_source=1&gad_campaignid=16820849449&gbraid=0AAAAADsHW8xXw-LjNJLTj-a4cz89UEwrZ&gclid=CjwKCAjwlaTGBhANEiwAoRgXBSJt5jhL98x5f0HeijEpTTFfMbSh92Ajsj93QWomKrWQLhbmuKCJEhoCmZ8QAvD_BwE"
                  target="_blank"
                >
                  <img
                    className="w-[100%] y-[100%] object-cover"
                    src="./pro_banner2.jpg"
                    alt="그린컴퓨터아트학원"
                  />
                </a>
              </div>
              <div className="w-[213px] h-[187px] rounded-[5px] bg-gray-300 overflow-hidden hover:shadow-card">
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSfArAWTcEHht9c693B3wVQWWl-15gaT9seoM6JsCWUnpBqCTA/viewform?pli=1"
                  target="_blank"
                >
                  <img
                    className="w-[100%] y-[100%] object-cover"
                    src="./pro_banner1.jpg"
                    alt="제휴배너이름"
                  />
                </a>
              </div>
              <div className="w-[213px] h-[187px] rounded-[5px] bg-gray-300 overflow-hidden hover:shadow-card">
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSfArAWTcEHht9c693B3wVQWWl-15gaT9seoM6JsCWUnpBqCTA/viewform?pli=1"
                  target="_blank"
                >
                  <img
                    className="w-[100%] y-[100%] object-cover"
                    src="./pro_banner1.jpg"
                    alt="제휴배너이름"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReviewsSection;
