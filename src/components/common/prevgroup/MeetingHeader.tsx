// JoinedGroupsPage 와 CreateStepThree 공용 컴포넌트
import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/swiper-bundle.css';
import type { GroupFormData } from '../../../types/group';

interface MeetingHeaderProps {
  formData: GroupFormData;
  dday: string;
  isFavorite: boolean;
  mode: 'detail' | 'preview';
  onFavoriteToggle: () => void;
  onApply: () => void;
}

function MeetingHeader({
  formData,
  dday,
  isFavorite,
  mode,
  onFavoriteToggle,
  onApply,
}: MeetingHeaderProps) {
  // 대표 이미지
  const [selectedImage, setSelectedImage] = useState<string>(
    formData.images.length > 0 ? URL.createObjectURL(formData.images[0]) : '/images/no_image.png',
  );

  // 이미지 URL 배열 변환
  const imageUrls = formData.images.map(file => URL.createObjectURL(file));

  return (
    <div className="flex">
      {/* 메인 이미지 + 썸네일 */}
      <div className="overflow-hidden rounded-md w-[350px] relative">
        <img
          src={selectedImage}
          alt="대표 이미지"
          className="w-[320px] h-[290px] object-cover rounded"
        />

        {/* 썸네일 Swiper */}
        <div className="mt-2 relative w-[320px] h-[72px]">
          <Swiper
            modules={[Navigation]}
            navigation={{ nextEl: '.swiper-button-next' }}
            spaceBetween={10}
            slidesPerView={4}
            className="w-full h-full"
          >
            {imageUrls.map((img, idx) => (
              <SwiperSlide key={idx} className="!w-[72px] !h-[72px] relative">
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
            className="swiper-button-next rounded-full !w-[23px] !h-[23px] absolute top-1/2 -translate-y-[-8px] !translate-x-[70%] z-50"
            style={{ transform: 'translateX(-50%) !important' }}
          >
            <img src="/images/swiper_next.svg" alt="next" className="w-[9px] h-[15px]" />
          </button>
        </div>
      </div>

      {/* 상단 영역: 모집중, 제목, D-day */}
      <div>
        <div className="w-[480px] border border-gray-[#c6c6c6] rounded-sm shadow p-4">
          <div className="flex items-center justify-between">
            {/* 모집중 뱃지 */}
            <span className="flex px-2 py-1 rounded-full bg-[#E06251] text-white text-[13px] font-semibold">
              모집중
            </span>

            {/* 제목 */}
            <h2 className="flex-1 mx-3 text-[17px] font-semibold text-black truncate">
              {formData.title}
            </h2>

            {/* D-day */}
            <span className="text-white text-[15px] font-semibold bg-gray-700 rounded px-2">
              {dday}
            </span>
          </div>

          {/* 간략 소개 */}
          <p className="mt-2 text-[15px] text-gray-800 leading-snug line-clamp-2">
            {formData.summary || '간략 소개가 없습니다.'}
          </p>

          {/* 카테고리 / 참여인원 / 기간 */}
          <div className="mt-3 flex items-center justify-between text-[15px]">
            {/* 카테고리 */}
            <span className="text-[#D83737] font-semibold">{formData.interestMajor}</span>

            {/* 참여 인원 */}
            <span className="flex items-center gap-1 text-gray-600">
              <img src="/people_dark.svg" alt="참여 인원" className="w-[15px] h-[15px]" />
              0/{formData.memberCount}
            </span>

            {/* 날짜 */}
            <span className="text-gray-500 font-medium">
              {formData.startDate || '시작일 미정'} ~ {formData.endDate || '종료일 미정'}
            </span>
          </div>
        </div>

        {/* 하단 액션 영역 */}
        <div className="flex gap-4 mt-4 justify-end">
          {/* 공유 */}
          <button type="button" className="flex flex-col items-center justify-center gap-1">
            <img src="/images/share_dark.svg" alt="공유" className="w-6 h-6" />
            <span className="text-md font-medium text-[#777]">공유하기</span>
          </button>

          {/* 즐겨찾기 */}

          <button
            type="button"
            onClick={onFavoriteToggle}
            className="flex flex-col items-center justify-center gap-1"
          >
            {isFavorite ? (
              <img src="/images/fill_star.png" alt="즐겨찾기" className="w-6 h-6" />
            ) : (
              <img src="/images/unfill_star.png" alt="즐겨찾기 해제" className="w-6 h-6" />
            )}
            <span className="text-md font-medium text-[#777]">즐겨찾기</span>
          </button>

          {/* 신청하기 버튼 */}
          <button
            type="button"
            onClick={mode === 'detail' ? onApply : undefined}
            className={`flex w-[211px] h-[46px] px-4 justify-center items-center rounded-md text-white text-[17px] font-bold tracking-[0.4px] ${
              mode === 'detail'
                ? 'bg-[#0689E8] hover:bg-blue-600 cursor-pointer'
                : 'bg-gray-300 cursor-default'
            }`}
          >
            신청하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default MeetingHeader;
