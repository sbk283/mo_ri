// JoinedGroupsPage 와 CreateStepThree 공용 컴포넌트
import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/swiper-bundle.css';

interface MeetingHeaderProps {
  title: string;
  description: string; // 모임 한줄 설명
  images: string[];
  dday: string;
  period: string; // 모집 기간 : 모임이 진행되는 전체 기간을 문자열로 표현
  participants: string; // 현재 참가한 인원 수 / 최대 정원
  isFavorite: boolean;
  mode: 'detail' | 'preview'; // 현재 화면 모드 ('detail' → 실제 모임 상세보기 페이지, 'preview' → Step3 미리보기 페이지)
  onFavoriteToggle: () => void;
  onApply: () => void; // 참가하기 버튼 눌렀을 때 실행되는 함수 (모드 = preview일 땐 실행 xxxx)
}

function MeetingHeader({
  title,
  description,
  images,
  dday,
  period,
  participants,
  isFavorite,
  mode,
  onFavoriteToggle,
  onApply,
}: MeetingHeaderProps) {
  // 선택된 이미지 state
  const [selectedImage, setSelectedImage] = useState<string>(images[0] || '');

  return (
    <div className="flex gap-4">
      {/* 메인 이미지 */}
      <div className="overflow-hidden rounded-md w-[350px] relative">
        <img src={selectedImage} alt="대표 이미지" className="w-[320px] h-[290px] object-cover" />

        {/* 하단 썸네일 미리보기 (스와이퍼 자리) */}
        <div className="mt-2 relative ml-[-29px]">
          <Swiper
            modules={[Navigation]}
            navigation={{ nextEl: '.swiper-button-next' }}
            spaceBetween={10}
            slidesPerView={4}
            className="w-[320px]"
          >
            {images.map((img, idx) => (
              <SwiperSlide key={idx} className="!w-[72px]">
                {' '}
                {/* 슬라이드 폭 고정 */}
                <div
                  className="w-[72px] h-[72px] rounded overflow-hidden cursor-pointer"
                  onClick={() => setSelectedImage(img)}
                >
                  <img
                    src={img}
                    alt={`썸네일 ${idx + 1}`}
                    className="w-full h-full object-cover hover:opacity-80"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* 화살표 버튼 */}
          <button
            className="swiper-button-next rounded-full !w-[23px] !h-[23px] absolute top-1/2 -translate-y-[-8px] z-50"
            style={{ transform: 'translateX(-50%) !important' }}
          >
            <img src="/images/swiper_next.svg" alt="next" className="w-[9px] h-[15px]" />
          </button>
        </div>
      </div>

      {/* 오른쪽 정보 */}
      <div className="flex-1">
        <h2 className="font-bold text-lg flex items-center gap-2">
          {title}
          <span className="text-sm text-red-500">{dday}</span>
        </h2>
        <p className="text-sm text-gray-600 mt-1">{description}</p>

        <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
          <span>참여인원: {participants}</span>
          <span>{period}</span>
        </div>

        {/* 액션 버튼 */}
        <div className="flex items-center gap-4 mt-4">
          {/* 공유 */}
          <button type="button">
            <img src="/images/share_dark.svg" alt="공유" className="w-6 h-6" />
          </button>

          {/* 즐겨찾기 */}
          <button type="button" onClick={onFavoriteToggle}>
            {isFavorite ? (
              <img src="/images/fill_star.png" alt="즐겨찾기" className="w-6 h-6" />
            ) : (
              <img src="/images/unfill_star.png" alt="즐겨찾기 해제" className="w-6 h-6" />
            )}
          </button>

          {/* 참가하기 */}
          <button
            type="button"
            onClick={mode === 'detail' ? onApply : undefined}
            className={`px-6 py-2 rounded text-white font-semibold ${
              mode === 'detail'
                ? 'bg-brand hover:bg-brand-dark cursor-pointer'
                : 'bg-gray-300 cursor-default'
            }`}
          >
            참가하기
          </button>
        </div>
      </div>
    </div>
  );
}
export default MeetingHeader;
