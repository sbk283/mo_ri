import { useEffect, useRef, useState } from 'react';
import type { Swiper as SwiperClass } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import ConfirmModal from '../modal/ConfirmModal';
import JoinGroupModal from '../modal/JoinGroupModal';
import ShareModal from '../modal/ShareModal';
import SuccessModal from '../modal/SuccessModal';
import MeetingCard from './MeetingCard';

export interface MeetingHeaderProps {
  title: string;
  status: '모집중' | '모집종료' | '모임종료';
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
  summary,
  subCategory,
  duration,
  participants,
  dday,
  images,
  isFavorite,
  mode,
  onFavoriteToggle,
}: MeetingHeaderProps) {
  const [selectedImage, setSelectedImage] = useState<string>(
    images.length > 0 ? images[0] : '/images/no_image.png',
  );

  const [shareOpen, setShareOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);

  const shareUrl = window.location.href;
  const swiperRef = useRef<SwiperClass | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (joinSuccess) {
      const timer = setTimeout(() => setJoinSuccess(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [joinSuccess]);

  const handleConfirmModal = () => {
    onFavoriteToggle();
    setConfirmOpen(false);
  };

  const handleShareClick = () => {
    if (mode === 'preview') return;
    setShareOpen(true);
  };

  const handleFavoriteClick = () => {
    if (mode === 'preview') return;
    setConfirmOpen(true);
  };

  const handleJoinClick = () => {
    if (mode === 'preview') return;
    setOpen(true);
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
        <MeetingCard
          title={title}
          status={status}
          summary={summary ?? ''}
          category={category}
          subCategory={subCategory}
          dday={dday}
          participants={participants}
          duration={duration}
          width={mode === 'preview' ? '553px' : '680px'}
          height={mode === 'preview' ? '200px' : '180px'}
        />

        <div className="flex gap-4 mt-4 justify-end">
          <button onClick={handleShareClick} className="flex flex-col items-center gap-1">
            <img src="/images/share_dark.svg" alt="공유" className="w-6 h-6" />
            <span className="text-md font-medium text-[#777]">공유하기</span>
          </button>

          <button onClick={handleFavoriteClick} className="flex flex-col items-center gap-1">
            {isFavorite ? (
              <img src="/images/star_gold.svg" alt="찜하기" className="w-6 h-6" />
            ) : (
              <img src="/images/star_dark.svg" alt="찜 해제" className="w-6 h-6" />
            )}
            <span className="text-md font-medium text-[#777]">찜하기</span>
          </button>

          <button
            onClick={handleJoinClick}
            className="w-[210px] h-[50px] px-4 py-2 bg-brand text-white rounded-md"
          >
            참가하기
          </button>
        </div>
      </div>

      {/* 모달들 */}
      <ShareModal isOpen={shareOpen} onClose={() => setShareOpen(false)} shareUrl={shareUrl} />
      <JoinGroupModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onSubmit={intro => {
          console.log('참가신청 완료:', intro);
          setOpen(false);
          setJoinSuccess(true);
        }}
        group={{
          title,
          status,
          category,
          subCategory,
          memberCount: Number(participants.split('/')[0]),
          memberLimit: Number(participants.split('/')[1]),
          duration,
        }}
      />
      <SuccessModal
        isOpen={joinSuccess}
        onClose={() => setJoinSuccess(false)}
        message="참가 신청 완료!"
      />
      <ConfirmModal
        open={confirmOpen}
        title="찜을 해제하시겠습니까?"
        message={'해제 후에도 언제든 다시 찜할 수 있습니다.\n정말 해제 하시겠습니까?'}
        onConfirm={handleConfirmModal}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
}

export default MeetingHeader;
