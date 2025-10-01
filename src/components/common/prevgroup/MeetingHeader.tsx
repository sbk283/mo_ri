import { useEffect, useRef, useState } from 'react';
import type { Swiper as SwiperClass } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import JoinGroupModal from '../modal/JoinGroupModal';
import ShareModal from '../modal/ShareModal';
import SuccessModal from '../modal/SuccessModal';
import ConfirmModal from '../modal/ConfirmModal';

export interface MeetingHeaderProps {
  title: string;
  status: '모집중' | '모집예정' | '서비스종료';
  category: string;
  subCategory: string;
  summary?: string;
  dday: string;
  duration: string;
  participants: string; // "2/10"
  images: string[];
  isFavorite: boolean;
  mode: 'detail' | 'preview';
  onFavoriteToggle: () => void;
  onApply: () => void;
}

function MeetingHeader({
  title,
  status,
  category,
  subCategory,
  summary,
  dday,
  duration,
  participants,
  images,
  isFavorite,
  // mode,
  onFavoriteToggle,
  // onApply,
}: MeetingHeaderProps) {
  // 대표 이미지
  const [selectedImage, setSelectedImage] = useState<string>(
    images.length > 0 ? images[0] : '/images/no_image.png',
  );

  // 공유 모달
  const [shareOpen, setShareOpen] = useState(false);
  const shareUrl = window.location.href;

  // 찜 모달
  const [confirmOpen, setConfirmOpen] = useState(false);

  // 참가 모달
  const [open, setOpen] = useState(false);
  // 참가 성공 모달
  const [joinSuccess, setJoinSuccess] = useState(false);

  // 성공 애니메이션 자동 닫힘
  useEffect(() => {
    if (joinSuccess) {
      const timer = setTimeout(() => setJoinSuccess(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [joinSuccess]);

  // 더미 데이터 (실제에선 props로 넘기거나 API 연동)
  const dummyGroup = {
    title,
    status,
    category,
    subCategory,
    memberCount: Number(participants.split('/')[0]),
    memberLimit: Number(participants.split('/')[1]),
    startDate: '2025.02.12',
    endDate: '2025.05.12',
    duration,
  };

  // 스와이퍼
  const swiperRef = useRef<SwiperClass | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);

  // 찜하기 핸들러
  const handleConfirmModal = () => {
    onFavoriteToggle();
    setConfirmOpen(false);
  };
  const handleCloseModal = () => {
    setConfirmOpen(false);
  };

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-[minmax(260px,320px)_1fr]">
      {/* 좌측 이미지 */}
      <div className="relative w-full">
        <img
          src={selectedImage}
          alt="대표 이미지"
          className="w-full aspect-[32/29] object-cover rounded"
        />

        {/* 썸네일 */}
        {images.length > 1 && (
          <div className="mt-2 w-full relative">
            <Swiper
              key={images.join('|')}
              breakpoints={{
                0: { slidesPerView: 3, spaceBetween: 8 },
                640: { slidesPerView: 4, spaceBetween: 10 },
                1024: { slidesPerView: 5, spaceBetween: 12 },
              }}
              className="w-full"
              onSwiper={sw => (swiperRef.current = sw)}
            >
              {images.map((img, idx) => (
                <SwiperSlide key={idx} className="!w-auto">
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

            {/* 스와이퍼 버튼 */}
            <button
              ref={nextRef}
              onClick={() => swiperRef.current?.slideNext()}
              className="swiper-button-next rounded-full !w-[37px] !h-[37px] absolute top-[60%] !-right-5 z-50"
            >
              <img src="/images/swiper_next.svg" alt="next" className="w-[9px] h-[15px]" />
            </button>
          </div>
        )}
      </div>

      {/* 우측 정보 */}
      <div className="min-w-0">
        <div className="w-full border border-[#c6c6c6] rounded-sm shadow p-4">
          <div className="flex items-center justify-between gap-2 pb-5">
            <span className="flex px-2 py-1 rounded-full bg-[#E06251] text-white text-[13px] font-semibold">
              {status}
            </span>

            <h2 className="flex-1 mx-1 text-[17px] font-semibold text-black truncate">{title}</h2>

            <span className="text-white text-[15px] font-semibold bg-gray-700 rounded px-2">
              {dday}
            </span>
          </div>

          <p className="mt-1 text-[15px] text-gray-800 leading-snug line-clamp-2">
            {summary || '간략 소개가 없습니다.'}
          </p>

          {/* 대분류 중분류 */}
          <div className="flex items-center justify-between mt-7">
            <div className="flex items-center justify-between text-[15px] gap-2">
              <span className="text-[#D83737] font-semibold">
                {category} &gt; {subCategory}
              </span>

              {/* 참여 인원 */}
              <span className="flex items-center gap-1 text-gray-600">
                <img src="/people_dark.svg" alt="참여 인원" className="w-[15px] h-[15px]" />
                {participants}
              </span>
            </div>

            {/* 날짜 */}
            <span className="text-gray-500 font-medium">{duration}</span>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-4 mt-4 justify-end">
          {/* 공유 */}
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className="flex flex-col items-center justify-center gap-1"
          >
            <img src="/images/share_dark.svg" alt="공유" className="w-6 h-6" />
            <span className="text-md font-medium text-[#777]">공유하기</span>
          </button>

          {/* 찜하기 */}
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="flex flex-col items-center justify-center gap-1"
          >
            {isFavorite ? (
              <img src="/images/star_gold.svg" alt="찜하기" className="w-6 h-6" />
            ) : (
              <img src="/images/star_dark.svg" alt="찜 해제" className="w-6 h-6" />
            )}
            <span className="text-md font-medium text-[#777]">찜하기</span>
          </button>

          {/* 참가하기 */}
          <button
            onClick={() => setOpen(true)}
            className="w-[210px] h-[50px] px-4 py-2 bg-brand text-white rounded-md"
          >
            참가하기
          </button>
        </div>
      </div>

      {/* 공유 모달 */}
      <ShareModal isOpen={shareOpen} onClose={() => setShareOpen(false)} shareUrl={shareUrl} />

      {/* 참가 모달 */}
      <JoinGroupModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onSubmit={intro => {
          console.log('참가신청 완료:', intro); // 참가 싲청 누르면 나오는 콘솔이라 메인에는 안뜸다 신경쓰이시면 지우겠슴다..
          setOpen(false);
          setJoinSuccess(true);
        }}
        group={dummyGroup} // 오류 수정 완료^^
      />
      <SuccessModal
        isOpen={joinSuccess}
        onClose={() => setJoinSuccess(false)}
        message="참가 신청 완료!"
      />

      {/* 찜 모달 */}
      <ConfirmModal
        open={confirmOpen}
        title={'찜을 해제하시겠습니까?'}
        message={'해제 후에도 언제든 다시 찜할 수 있습니다.\n정말 해제 하시겠습니까?'}
        onConfirm={handleConfirmModal}
        onClose={handleCloseModal}
      />
    </div>
  );
}

export default MeetingHeader;
