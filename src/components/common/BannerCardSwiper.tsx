import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

function BannerCardSwiper() {
  const groupList = [
    { id: 1, title: '마비노기 던전 공파 모집', promo: true, status: '모집중', dday: 'D-3' },
    { id: 2, title: '강남 클라이밍 모임', promo: false, status: '모집예정', dday: 'D-5' },
    { id: 3, title: '주말 농구 번개 모집', promo: false, status: '모집중', dday: 'D-7' },
    { id: 4, title: '요가 원데이 클래스', promo: true, status: '모집예정', dday: 'D-1' },
    { id: 5, title: '스터디: 리액트 마스터', promo: false, status: '모집중', dday: 'D-10' },
    { id: 6, title: '마라톤 준비 모임', promo: false, status: '모집예정', dday: 'D-15' },
    { id: 7, title: '드로잉 취미 모임', promo: true, status: '모집중', dday: 'D-2' },
    { id: 8, title: '헬스 친구 구해요', promo: false, status: '모집예정', dday: 'D-20' },
  ];

  return (
    <div className="relative">
      <Swiper
        spaceBetween={16}
        slidesPerView={4}
        navigation={{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }}
        modules={[Navigation]}
        className="my-6"
      >
        {groupList.map(group => (
          <SwiperSlide key={group.id}>
            <div className="w-[245px] h-[290px] rounded border border-[#DBDBDB] bg-white flex flex-col shadow-sm relative overflow-hidden">
              {/* 모집 상태 뱃지 */}
              <div
                className={`absolute top-0 left-0 flex items-center justify-center px-2 h-[23px] text-white text-xs font-bold`}
                style={{
                  backgroundColor: group.status === '모집중' ? '#E06251' : '#517EE0',
                  borderRadius: '13px 15px 15px 0',
                  width: group.status === '모집중' ? '54px' : '67px',
                }}
              >
                {group.status}
              </div>

              {/* 이미지 */}
              <img
                src={`https://picsum.photos/seed/${group.id}/300/160`}
                alt="모임 이미지"
                className="w-full h-[140px] object-cover"
              />

              {/* 카드 내용 */}
              <div className="flex-1 flex flex-col justify-between p-3">
                {/* 카테고리 + 지역 */}
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[#D83737] text-[12px] font-semibold">취미/여가</span>
                  <span className="text-[#767676] text-[10px]">지역무관</span>
                </div>

                {/* 제목 */}
                <h3 className="text-[17px] font-semibold text-black flex items-center gap-1">
                  {group.title}
                  {group.promo && <img src="/images/medal.svg" alt="메달" className="w-4 h-4" />}
                </h3>

                {/* 설명 */}
                <p className="text-[14px] text-[#818181] leading-[17px] line-clamp-2">
                  혼자서 글렘 베르나 돌기 힘드네요. 같이 던전 도실 분 구해요.
                </p>

                {/* 하단 메타 */}
                <div className="flex items-center gap-2 mt-2">
                  {/* D-day */}
                  <span className="flex items-center justify-center w-[30px] h-[14px] rounded bg-[#87898D] text-[10px] font-bold text-white">
                    {group.dday}
                  </span>

                  {/* AD (promo일 때만) */}
                  {group.promo && (
                    <span className="flex items-center justify-center w-[26px] h-[12px] rounded-full bg-[#C5C5C5] text-[10px] font-bold text-white">
                      AD
                    </span>
                  )}
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 화살표 버튼 */}
      <button className="swiper-button-prev absolute top-1/2 -left-6 z-10 w-[37px] h-[37px] flex items-center justify-center rounded-full border border-[#E5E5E5] bg-white shadow-md">
        &lt;
      </button>
      <button className="swiper-button-next absolute top-1/2 -right-6 z-10 w-[37px] h-[37px] flex items-center justify-center rounded-full border border-[#E5E5E5] bg-white shadow-md">
        &gt;
      </button>
    </div>
  );
}

export default BannerCardSwiper;
