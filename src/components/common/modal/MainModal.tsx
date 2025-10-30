import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

// Swiper v11+ 스타일 import

if (typeof window !== 'undefined') {
  Modal.setAppElement('#root');
}

interface Banner {
  id: number;
  imageUrl: string;
  title?: string;
  description?: string;
  link?: string;
}

interface BannerSliderModalProps {
  banners: Banner[];
  autoOpen?: boolean;
  onClose?: () => void;
  autoplayDelay?: number;
  showCounter?: boolean;
  enableDoNotShowToday?: boolean;
  storageKey?: string;
}

const STORAGE_KEY_PREFIX = 'bannerModal_doNotShow_';

// Modal 스타일을 인라인으로 정의
const modalStyles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  content: {
    position: 'relative' as const,
    inset: 'auto',
    border: 'none',
    background: 'white',
    overflow: 'hidden',
    borderRadius: '12px',
    padding: 0,
    width: '440px',
    height: '640px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
  },
};

export const BannerSliderModal: React.FC<BannerSliderModalProps> = ({
  banners,
  autoOpen = true,
  onClose,
  autoplayDelay = 3000,
  showCounter = true,
  enableDoNotShowToday = true,
  storageKey = 'default',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(1);

  useEffect(() => {
    if (autoOpen) {
      const shouldShow = checkShouldShowModal();
      setIsOpen(shouldShow);
    }
  }, [autoOpen, storageKey]);

  const checkShouldShowModal = (): boolean => {
    if (!enableDoNotShowToday) return true;

    const key = `${STORAGE_KEY_PREFIX}${storageKey}`;
    const stored = localStorage.getItem(key);

    if (!stored) return true;

    const hiddenUntil = new Date(stored);
    const now = new Date();

    return now > hiddenUntil;
  };

  const setDoNotShowToday = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const key = `${STORAGE_KEY_PREFIX}${storageKey}`;
    localStorage.setItem(key, tomorrow.toISOString());
  };

  const handleClose = (doNotShowToday = false) => {
    if (doNotShowToday && enableDoNotShowToday) {
      setDoNotShowToday();
    }

    setIsOpen(false);
    onClose?.();
  };

  const handleBannerClick = (banner: Banner) => {
    if (banner.link) {
      window.open(banner.link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => handleClose(false)}
      style={modalStyles}
      closeTimeoutMS={300}
      shouldCloseOnOverlayClick={true}
      shouldCloseOnEsc={true}
    >
      {/* 닫기 버튼 */}
      <button
        onClick={() => handleClose(false)}
        className="absolute top-3 right-3 z-50 w-9 h-9 flex items-center justify-center bg-black/60 hover:bg-black/80 text-white rounded-full transition-all duration-200 hover:rotate-90 backdrop-blur-sm"
        aria-label="모달 닫기"
      >
        ✕
      </button>

      {/* Swiper 컨테이너 */}
      <div className="w-full h-full flex flex-col">
        <div className="flex-1 relative">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={0}
            slidesPerView={1}
            navigation={{
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
              el: '.swiper-pagination',
            }}
            autoplay={{
              delay: autoplayDelay,
              disableOnInteraction: false,
            }}
            loop={true}
            onSlideChange={swiper => setCurrentSlide(swiper.realIndex + 1)}
            className="w-full h-full"
          >
            {banners.map(banner => (
              <SwiperSlide key={banner.id}>
                <div
                  onClick={() => handleBannerClick(banner)}
                  className={`w-full h-full relative ${banner.link ? 'cursor-pointer' : ''}`}
                >
                  <img
                    src={banner.imageUrl}
                    alt={banner.title || `배너 ${banner.id}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* 네비게이션 버튼 */}
          {/* <div className="relative -top-1/2">
            <div className="swiper-button-prev ab  !w-10 !h-10 !bg-white/90 hover:!bg-white rounded-full after:!text-lg !text-gray-800 after:!font-bold transition-all hover:scale-110">
              <img className="translate-x-[-2px]" src="/images/left_arrow.svg" alt="prev" />
            </div>
            <div className="swiper-button-next !w-10 !h-10 !bg-white/90 hover:!bg-white rounded-full after:!text-lg !text-gray-800 after:!font-bold transition-all hover:scale-110">
              <img
                className="rotate-180 translate-x-[2px]"
                src="/images/left_arrow.svg"
                alt="next"
              />
            </div>
          </div> */}

          {/* 슬라이드 카운터 */}
          {showCounter && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1.5 rounded-full text-xs font-semibold z-10 backdrop-blur-sm pointer-events-none">
              {currentSlide} / {banners.length}
            </div>
          )}
        </div>

        {/* 오늘 하루 보지 않기 Footer */}
        {enableDoNotShowToday && (
          <div className="w-full h-[50px] bg-gray-100 flex items-center justify-center border-t border-gray-200 flex-shrink-0">
            <button
              onClick={() => handleClose(true)}
              className="text-gray-600 hover:text-gray-900 text-sm font-medium px-4 py-2 transition-all rounded-md active:scale-98"
            >
              오늘 하루 보지 않기
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default BannerSliderModal;
