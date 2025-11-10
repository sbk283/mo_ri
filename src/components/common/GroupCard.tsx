import { useNavigate } from "react-router-dom";
import type { GroupWithCategory } from "../../types/group";
import { useEffect, useState, useCallback, useMemo, memo } from "react";
import ConfirmModal from "./modal/ConfirmModal";
import LazyImage from "../common/LazyImage";

interface GroupCardProps {
  item: GroupWithCategory;
  as?: "li" | "div";
  onToggleFavorite?: (id: string, next: boolean) => void | Promise<void>;
  confirmBeforeChange?: boolean;
  confirmMode?: "none" | "add" | "unfav" | "both";
  showFavoriteButton?: boolean;
}

function GroupCard({
  item,
  as = "li",
  onToggleFavorite,
  confirmBeforeChange = true,
  confirmMode,
  showFavoriteButton = false,
}: GroupCardProps) {
  const Wrapper = as as keyof JSX.IntrinsicElements;
  const navigate = useNavigate();

  // 즐겨 찾기 상태
  const controlled = typeof onToggleFavorite === "function";
  const [localFav, setLocalFav] = useState(item.favorite);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"fav" | "unfav" | null>(
    null,
  );

  const currentFav = controlled ? item.favorite : localFav;

  const mode: "none" | "add" | "unfav" | "both" =
    confirmMode ?? (confirmBeforeChange ? "unfav" : "none");

  // 즐겨찾기 동기화
  useEffect(() => {
    if (!controlled) setLocalFav(item.favorite);
  }, [item.favorite, controlled]);

  // 즐겨찾기 적용 (메모이징)
  const applyFavorite = useCallback(
    (next: boolean) => {
      if (controlled) onToggleFavorite?.(item.group_id, next);
      else setLocalFav(next);
    },
    [controlled, item.group_id, onToggleFavorite],
  );

  // 즐겨찾기 버튼 클릭 핸들러 (메모이징)
  const handleClickFavorite = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (!currentFav) {
        if (mode === "add" || mode === "both") {
          setPendingAction("fav");
          setConfirmOpen(true);
          return;
        }
        applyFavorite(true);
      } else {
        if (mode === "unfav" || mode === "both") {
          setPendingAction("unfav");
          setConfirmOpen(true);
          return;
        }
        applyFavorite(false);
      }
    },
    [currentFav, mode, applyFavorite],
  );

  // 모달에서 확인 시 처리
  const handleConfirmModal = useCallback(() => {
    if (pendingAction === "fav") applyFavorite(true);
    if (pendingAction === "unfav") applyFavorite(false);
    setConfirmOpen(false);
    setPendingAction(null);
  }, [pendingAction, applyFavorite]);

  // 모달 닫기
  const handleCloseModal = useCallback(() => {
    setConfirmOpen(false);
    setPendingAction(null);
  }, []);

  // 상태 계산 (useMemo 적용)
  const status = useMemo(() => {
    const today = new Date();
    const start = new Date(item.group_start_day);
    const end = new Date(item.group_end_day);
    if (today < start) return "예정";
    else if (today >= start && today <= end) return "recruiting";
    else return "closed";
  }, [item.group_start_day, item.group_end_day]);

  // 디데이 계산 (useMemo 적용)
  const dday = useMemo(() => {
    const today = new Date();
    const end = new Date(item.group_start_day);
    const diff = Math.ceil(
      (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diff > 0 ? `D-${diff}` : "마감";
  }, [item.group_start_day]);

  // 카드 클릭 처리
  const handleClick = useCallback(() => {
    navigate(`/groupdetail/${item.group_id}`);
  }, [navigate, item.group_id]);

  // 이미지 src fallback 처리
  const imageSrc = item.image_urls?.[0] ?? "/images/default_thumbnail.png";

  return (
    <>
      <Wrapper
        className="overflow-hidden relative cursor-pointer pt-5"
        onClick={handleClick}
      >
        <article className="h-[290px] w-[245px] rounded-sm border border-gray-300 bg-white overflow-hidden">
          {/* 말풍선 */}
          <div
            className={`absolute left-2 top-[1px] z-[5] px-2
              rounded-tl-[15px] rounded-tr-[15px] rounded-br-[15px]
              text-white text-md font-semibold
              ${
                status === "recruiting"
                  ? "bg-brand-red"
                  : status === "예정"
                    ? "bg-brand"
                    : "bg-gray-500"
              }`}
          >
            {status === "recruiting"
              ? "모집마감"
              : status === "예정"
                ? "모집중"
                : "마감"}
          </div>

          {/* 이미지 영역 */}
          <div className="relative">
            <LazyImage
              src={imageSrc}
              alt={item.group_title}
              className="w-full h-[133px] object-cover"
            />

            {showFavoriteButton && (
              <button
                type="button"
                aria-label="즐겨찾기"
                aria-pressed={!!currentFav}
                onClick={handleClickFavorite}
                className="absolute top-2 right-2 w-[20px] h-[20px]"
              >
                <img
                  src={
                    currentFav
                      ? "/images/fill_star.svg"
                      : "/images/unfill_star.svg"
                  }
                  alt={currentFav ? "즐겨찾기됨" : "즐겨찾기 안됨"}
                />
              </button>
            )}
          </div>

          {/* 텍스트 영역 */}
          <div className="relative p-[15px] rounded-b-sm flex flex-col flex-1 bg-white">
            <header className="flex justify-between text-sm mb-2">
              <span className="text-[#D83737] font-semibold">
                {item.categories_major?.category_major_name}
              </span>
              <span className="text-[#767676]">
                {item.group_region ? item.group_region : "지역무관"}
              </span>
            </header>

            <h3 className="items-center gap-1 text-lg truncate mb-[7px] font-bold">
              {item.group_title}
            </h3>

            <p className="text-[15px] text-gray-300 line-clamp-2 leading-[19px]">
              {item.group_short_intro}
            </p>
          </div>

          {/* 디데이 */}
          <div className="absolute font-semibold text-center left-3 bottom-3 bg-[#87898D] text-white rounded-sm px-2 text-sm">
            {dday}
          </div>
        </article>
      </Wrapper>

      <ConfirmModal
        open={confirmOpen}
        title={"찜을 해제하시겠습니까?"}
        message={"찜을 해제해도 \n 언제든 다시 찜리스트에 추가할 수 있습니다."}
        onConfirm={handleConfirmModal}
        onClose={handleCloseModal}
      />
    </>
  );
}

export default memo(GroupCard);
