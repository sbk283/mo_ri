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
  duration,
  participants,
  dday,
  images,
  isFavorite,
  mode, // 추가: mode 사용
  onFavoriteToggle,
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

  // 공유
  const handleShareClick = () => {
    if (mode === 'preview') return;
    setShareOpen(true);
  };

  // 찜
  const handleFavoriteClick = () => {
    if (mode === 'preview') return;
    setConfirmOpen(true);
  };

  // 참가
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
        <MeetingCard
          title="[4주차] 마비노기 던전 공파 모집"
          status="모집중"
          summary="혼자서 글렘 베르나 돌기 힘드네요. 같이 던전 도실 분 구해요. 마비노기 모바일 아닙니다."
          category="취미/여가"
          subCategory="게임/오락"
          dday={dday}
          participants="2/10"
          duration="2025.02.12 ~ 2025.05.12"
          width={mode === 'preview' ? '553px' : '680px'}
          height={mode === 'preview' ? '200px' : '180px'}
        />

        {/* 액션 버튼 */}
        <div className="flex gap-4 mt-4 justify-end">
          {/* 공유 */}
          <button
            type="button"
            onClick={handleShareClick}
            className="flex flex-col items-center justify-center gap-1"
          >
            <img src="/images/share_dark.svg" alt="공유" className="w-6 h-6" />
            <span className="text-md font-medium text-[#777]">공유하기</span>
          </button>

          {/* 찜하기 */}
          <button
            type="button"
            onClick={handleFavoriteClick}
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
            onClick={handleJoinClick}
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
          console.log('참가신청 완료:', intro);
          setOpen(false);
          setJoinSuccess(true);
        }}
        group={dummyGroup}
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
