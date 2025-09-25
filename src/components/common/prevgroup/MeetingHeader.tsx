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

                {/* 마지막 썸네일에 화살표 버튼 */}
                {idx === imageUrls.length - 1 && (
                  <button className="swiper-button-next rounded-full !w-[23px] !h-[23px] absolute top-1/2 -translate-y-1/2 -right-6 z-50">
                    <img src="/images/swiper_next.svg" alt="next" className="w-[9px] h-[15px]" />
                  </button>
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      {/* 오른쪽 정보 */}
      <div className="border rounded-sm p-5 border-gray-300 h-[159px] w-[572px] pl-[18px]">
        <div className="flex-1 flex flex-col justify-between">
          {/* 상태 + D-day */}
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded">
              모집중
            </span>
            <span className="text-sm text-gray-400">{dday}</span>
          </div>

          {/* 모임 이름 */}
          <h2 className="mt-1 font-bold text-lg text-gray-900">{formData.title}</h2>

          {/* 간략 소개 */}
          <p className="text-sm text-gray-600 mt-1">
            {formData.summary || '간략 소개가 없습니다.'}
          </p>

          {/* 참여 인원 / 기간 / 카테고리 */}
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
            {/* 참여 인원 */}
            <span className="flex items-center gap-1">
              <img src="/people_dark.svg" alt="참여 인원" className="w-[15px] h-[15px]" />
              0/{formData.memberCount}
            </span>

            {/* 기간 */}
            <span>
              {formData.startDate || '시작일 미정'} ~ {formData.endDate || '종료일 미정'}
            </span>

            {/* 카테고리 */}
            <span className="text-brand font-semibold">{formData.interestMajor}</span>
            {formData.interestSub && (
              <span className="text-gray-400">/ {formData.interestSub}</span>
            )}
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex items-center gap-4 mt-10">
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
            className={`ml-auto px-6 py-2 rounded text-white font-semibold ${
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
