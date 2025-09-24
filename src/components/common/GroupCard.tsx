import { useEffect, useState } from 'react';
import ConfirmModal from './modal/ConfirmModal';

export type GroupItem = {
  id: number;
  status: '모집중' | '모집예정';
  category: string;
  region: string;
  title: string;
  desc: string;
  dday: string;
  ad?: boolean;
  thumbnail: string;
  duration?: Duration;
  favorite: boolean;
};

export type Duration = 'oneday' | 'short' | 'long';

const STATUS_BG: Record<GroupItem['status'], string> = {
  모집중: 'bg-[#FF5252]',
  모집예정: 'bg-[#2A91E5]',
};

function StatusBadge({ text }: { text: GroupItem['status'] }) {
  return (
    <span
      className={[
        'text-[14px] font-bold text-white px-2 py-1',
        'rounded-tl-[15px] rounded-tr-[15px] rounded-br-[15px]',
        'relative z-[1] inline-block',
        'translate-x-[0%] translate-y-[-60%]',
        'h-[23px] p-[4px] flex items-center justify-center flex-shrink-0',
        STATUS_BG[text],
      ].join(' ')}
    >
      {text}
    </span>
  );
}

type GroupCardProps = {
  item: GroupItem;
  onToggleFavorite?: (id: number, next: boolean) => void; // 컨트롤드 모드면 제공
  /** @deprecated boolean은 하위호환용. 새로는 confirmMode 사용 권장 */
  confirmBeforeChange?: boolean;
  /** 확인 모드: none(확인 없음) | add(추가만 확인) | unfav(해제만 확인) | both(둘 다 확인) */
  confirmMode?: 'none' | 'add' | 'unfav' | 'both';
};

// ---------- 카드 ----------
export function GroupCard({
  item,
  onToggleFavorite,
  confirmBeforeChange = true,
  confirmMode,
}: GroupCardProps) {
  const controlled = typeof onToggleFavorite === 'function';

  // 로컬 모드용 상태
  const [localFav, setLocalFav] = useState<boolean>(item.favorite);

  // 부모 변경 반영
  useEffect(() => {
    if (!controlled) setLocalFav(item.favorite);
  }, [item.favorite, controlled]);

  const currentFav = controlled ? item.favorite : localFav;

  // 모달 상태
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'fav' | 'unfav' | null>(null);

  // 하위호환: confirmMode 미지정 시 boolean을 모드로 변환
  const mode: 'none' | 'add' | 'unfav' | 'both' =
    confirmMode ?? (confirmBeforeChange ? 'unfav' : 'none');

  const applyFavorite = (next: boolean) => {
    if (controlled) onToggleFavorite!(item.id, next);
    else setLocalFav(next);
  };

  const handleClickFavorite = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (!currentFav) {
      // 추가
      if (mode === 'add' || mode === 'both') {
        setPendingAction('fav');
        setConfirmOpen(true);
        return;
      }
      applyFavorite(true);
    } else {
      // 해제
      if (mode === 'unfav' || mode === 'both') {
        setPendingAction('unfav');
        setConfirmOpen(true);
        return;
      }
      applyFavorite(false);
    }
  };

  const handleConfirmModal = () => {
    if (pendingAction === 'unfav') applyFavorite(false);
    if (pendingAction === 'fav') applyFavorite(true);
    setConfirmOpen(false);
    setPendingAction(null);
  };

  const handleCloseModal = () => {
    setConfirmOpen(false);
    setPendingAction(null);
  };

  return (
    <>
      <li className="h-[290px] overflow-hidden relative cursor-pointer flex flex-col pt-5">
        <article className="rounded-md flex flex-col h-full">
          <span className="absolute left-2 z-10">
            <StatusBadge text={item.status} />
          </span>

          <div className="relative overflow-hidden">
            <img
              src={item.thumbnail}
              alt={`${item.title} 썸네일`}
              className="w-full object-cover rounded-t-[10px] h-[133px]"
            />
            <button
              type="button"
              aria-label="즐겨찾기"
              aria-pressed={currentFav}
              onClick={handleClickFavorite}
              className="absolute top-2 right-2 w-[15px] h-[15px]"
            >
              {currentFav ? (
                <img src="/images/fill_star.png" alt="즐겨찾기됨" />
              ) : (
                <img src="/images/unfill_star.png" alt="즐겨찾기 안됨" />
              )}
            </button>
          </div>

          <div className="relative p-[15px] border border-[#A3A3A3] rounded-b-md flex flex-col flex-1 pb-12">
            <header className="flex justify-between text-[12px] mb-2">
              <span className="text-[#D83737] font-semibold">{item.category}</span>
              <span className="text-[#767676]">{item.region}</span>
            </header>
            <h3 className="flex items-center gap-1 text-lg font-bold hover:underline">
              {/* 텍스트만 잘림 처리 */}
              <span className="truncate block max-w-[calc(100%-20px)]">{item.title}</span>
              {item.ad && (
                <img src="/images/trophy.svg" alt="trophy" className="w-4 h-4 flex-shrink-0" />
              )}
            </h3>
            <p className="text-[15px] h-[34px] text-[#979797] line-clamp-2 leading-[17px]">
              {item.desc}
            </p>
            <time className="absolute left-3 bottom-3 bg-[#87898D] text-white rounded-2xl px-2 text-[12px]">
              {item.dday}
            </time>
            {item.ad && (
              <span className="absolute right-3 bottom-3 bg-[#C5C5C5] text-white rounded-xl px-2 text-[9px] ">
                AD
              </span>
            )}
          </div>
        </article>
      </li>

      {/* 확인 모달 */}
      <ConfirmModal
        open={confirmOpen}
        title={'찜을 해제하시겠습니까?'}
        message={'해제 후에도 언제든 다시 찜할 수 있습니다.\n정말 해제 하시겠습니까?'}
        onConfirm={handleConfirmModal}
        onClose={handleCloseModal}
      />
    </>
  );
}

export default GroupCard;
