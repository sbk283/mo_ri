import { useEffect, useRef, useState } from "react";
import type { Swiper as SwiperClass } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
// import 'swiper/swiper-bundle.css';
import ConfirmModal from "../modal/ConfirmModal";
import JoinGroupModal from "../modal/JoinGroupModal";
import ShareModal from "../modal/ShareModal";
import SuccessModal from "../modal/SuccessModal";
import MeetingCard from "./MeetingCard";
import { useGroupMember } from "../../../contexts/GroupMemberContext";
import { useAuth } from "../../../contexts/AuthContext";
import { useGroupFavorite } from "../../../hooks/useGroupFavorite";
import { useNavigate } from "react-router-dom";

export interface MeetingHeaderProps {
  groupId: string;
  title: string;
  status: "모집중" | "모집종료" | "모임종료";
  category: string;
  subCategory: string;
  summary?: string;
  dday: string;
  duration: string;
  participants: string; // "2/10"
  images: string[];
  isFavorite: boolean;
  mode: "detail" | "preview";
  onFavoriteToggle: () => void;
  onApply: () => void;
}

function MeetingHeader({
  groupId,
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
    images.length > 0 ? images[0] : "/nullbg.jpg",
  );

  const [shareOpen, setShareOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [isAlreadyJoined, setIsAlreadyJoined] = useState(false);

  const shareUrl = window.location.href;
  const swiperRef = useRef<SwiperClass | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);

  const { joinGroup, members, fetchMembers } = useGroupMember();
  const { user } = useAuth();

  const { addFavorite, removeFavorite, checkFavorite } = useGroupFavorite();
  const [favorite, setFavorite] = useState(isFavorite);

  const navigate = useNavigate();

  const [currentCount, capacity] = participants.split("/").map(Number);

  // 모임 종료 여부 계산
  const [startDateStr, endDateStr] = duration.split(" ~ ");
  const now = new Date();
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  // 모집 마감 (당일 포함)
  const isClosed = now >= startDate;

  // 모임 종료
  const isEnded = now > endDate;

  // 정원 마감 여부
  const isFull = currentCount >= capacity;

  // 버튼 비활성화 조건
  const isJoinDisabled = !isAlreadyJoined && (isFull || isClosed || isEnded);

  // 초기 렌더 시, DB에서 찜 상태 불러오기
  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      if (!user || !groupId || groupId === "preview-temp-id") return;

      const isFav = await checkFavorite(groupId);
      setFavorite(isFav ?? false);
    };

    fetchFavoriteStatus();
  }, [user, groupId, checkFavorite]);

  // 찜 토글
  const handleFavoriteToggle = async () => {
    if (favorite) {
      await removeFavorite(groupId);
      setFavorite(false);
    } else {
      await addFavorite(groupId);
      setFavorite(true);
    }
  };

  /**
   * 미리 보기 스텝3
   * 이미 참가한 모임인지 확인
   */
  useEffect(() => {
    const checkMembership = async () => {
      if (!groupId || groupId === "preview-temp-id") return;
      await fetchMembers(groupId);
    };

    checkMembership();
  }, [groupId, user, fetchMembers]);

  // members 변경 시 참가 여부 체크
  useEffect(() => {
    if (!user) return;

    const joined = members.some(
      (m) => m.user_id === user.id && m.member_status === "approved",
    );

    setIsAlreadyJoined(joined);
  }, [members, user]);

  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (joinSuccess) {
      const timer = setTimeout(() => setJoinSuccess(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [joinSuccess]);

  // "이미 참가한 모임입니다." 자동 닫기 (1.5초 후)
  useEffect(() => {
    if (errorOpen && errorMessage === "이미 참가한 모임입니다.") {
      const timer = setTimeout(() => setErrorOpen(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [errorOpen, errorMessage]);

  // 참가 처리
  const handleJoinSubmit = async (intro: string) => {
    console.log("참가 신청 시도:", intro);
    const result = await joinGroup(groupId);

    if (result === "success") {
      setJoinSuccess(true);
      setIsAlreadyJoined(true);
    } else if (result === "already") {
      setErrorMessage("이미 참가한 모임입니다.");
      setErrorOpen(true);
    } else {
      setErrorMessage("참가에 실패했습니다. 다시 시도해주세요.");
      setErrorOpen(true);
    }

    setOpen(false);
  };

  const handleConfirmModal = () => {
    onFavoriteToggle();
    setConfirmOpen(false);
  };

  const handleShareClick = () => {
    if (mode === "preview") return;
    setShareOpen(true);
  };

  const handleFavoriteClick = () => {
    if (mode === "preview") return;
    setConfirmOpen(true);
  };

  const handleJoinClick = () => {
    if (mode === "preview") return;

    // 이미 참가한 경우
    if (isAlreadyJoined) {
      navigate(`/groupcontent/${groupId}?tab=daily`);
      return;
    }

    if (isFull || isEnded) return;

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
              key={images.join("|")}
              breakpoints={{
                0: { slidesPerView: 3, spaceBetween: 8 },
                640: { slidesPerView: 4, spaceBetween: 10 },
                1024: { slidesPerView: 5, spaceBetween: 12 },
              }}
              className="w-full"
              onSwiper={(sw) => (swiperRef.current = sw)}
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
              className="swiper-button-next rounded-full !w-[37px] !h-[37px] absolute top-[60%] !-right-5 z-10"
            >
              <img
                src="/images/swiper_next.svg"
                alt="next"
                className="w-[9px] h-[15px]"
              />
            </button>
          </div>
        )}
      </div>

      {/* 우측 정보 */}
      <div className="min-w-0">
        <MeetingCard
          groupId={groupId}
          groupCapacity={Number(participants.split("/")[1])}
          title={title}
          status={status}
          summary={summary ?? ""}
          category={category}
          subCategory={subCategory}
          dday={dday}
          participants={participants}
          duration={duration}
          width={mode === "preview" ? "553px" : "680px"}
          height={mode === "preview" ? "200px" : "180px"}
        />

        <div className="flex gap-4 mt-4 justify-end">
          <button
            onClick={handleShareClick}
            className="flex flex-col items-center gap-1"
          >
            <img src="/images/share_dark.svg" alt="공유" className="w-6 h-6" />
            <span className="text-md font-medium text-[#777]">공유하기</span>
          </button>

          <button
            onClick={handleFavoriteToggle}
            className="flex flex-col items-center gap-1"
          >
            {favorite ? (
              <img
                src="/images/star_gold.svg"
                alt="찜하기"
                className="w-6 h-6"
              />
            ) : (
              <img
                src="/images/star_dark.svg"
                alt="찜 해제"
                className="w-6 h-6"
              />
            )}
            <span className="text-md font-medium text-[#777]">찜하기</span>
          </button>
          <button
            onClick={handleJoinClick}
            disabled={mode !== "preview" && isJoinDisabled}
            className={`w-[210px] h-[50px] px-4 py-2 rounded-md font-semibold transition-colors ${
              isAlreadyJoined
                ? "bg-[#777] text-white"
                : isFull
                  ? "bg-gray-300 text-white cursor-not-allowed"
                  : isClosed
                    ? "bg-gray-300 text-white cursor-not-allowed"
                    : isEnded
                      ? "bg-gray-300 text-white cursor-not-allowed"
                      : "bg-brand text-white hover:bg-blue-600"
            }`}
          >
            {isAlreadyJoined
              ? "모임페이지로 바로가기"
              : isFull
                ? "정원 마감"
                : isClosed
                  ? "모집 마감"
                  : isEnded
                    ? "모임 종료"
                    : "참가하기"}
          </button>
          {/* <button
            onClick={handleJoinClick}
            disabled={isJoinDisabled}
            className={`w-[210px] h-[50px] px-4 py-2 rounded-md font-semibold transition-colors ${
              isAlreadyJoined
                ? "bg-[#777] text-white"
                : isFull
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : isEnded
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-brand text-white hover:bg-blue-600"
            }`}
          >
            {isAlreadyJoined
              ? "모임페이지로 바로가기"
              : isFull
                ? "정원 마감"
                : isEnded
                  ? "모임 종료"
                  : "참가하기"}
          </button> */}
        </div>
      </div>

      {/* 모달들 */}
      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        shareUrl={shareUrl}
      />
      <JoinGroupModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onSubmit={handleJoinSubmit}
        group={{
          groupId,
          title,
          status,
          category,
          subCategory,
          memberLimit: Number(participants.split("/")[1]),
          duration,
          dday,
          desc: summary,
        }}
      />
      <SuccessModal
        isOpen={joinSuccess}
        onClose={() => setJoinSuccess(false)}
        message="참가 신청 완료!"
        type="success"
      />
      <SuccessModal
        isOpen={errorOpen}
        onClose={() => setErrorOpen(false)}
        message={errorMessage}
        type="error"
      />
      <ConfirmModal
        open={confirmOpen}
        title="찜을 해제하시겠습니까?"
        message={
          "해제 후에도 언제든 다시 찜할 수 있습니다.\n정말 해제 하시겠습니까?"
        }
        onConfirm={handleConfirmModal}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
}

export default MeetingHeader;
