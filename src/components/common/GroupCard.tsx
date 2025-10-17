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
  모집중: 'bg-brand',
  모집예정: 'bg-brand-red',
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
  onToggleFavorite?: (id: number, next: boolean) => void;
  confirmBeforeChange?: boolean;
  confirmMode?: 'none' | 'add' | 'unfav' | 'both';
  as?: 'li' | 'div';
};

export function GroupCard({
  item,
  onToggleFavorite,
  confirmBeforeChange = true,
  confirmMode,
  as = 'li',
}: GroupCardProps) {
  const controlled = typeof onToggleFavorite === 'function';
  const [localFav, setLocalFav] = useState<boolean>(item.favorite);

  useEffect(() => {
    if (!controlled) setLocalFav(item.favorite);
  }, [item.favorite, controlled]);

  const currentFav = controlled ? item.favorite : localFav;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'fav' | 'unfav' | null>(null);

  const mode: 'none' | 'add' | 'unfav' | 'both' =
    confirmMode ?? (confirmBeforeChange ? 'unfav' : 'none');

  const applyFavorite = (next: boolean) => {
    if (controlled) onToggleFavorite!(item.id, next);
    else setLocalFav(next);
  };

  const handleClickFavorite = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!currentFav) {
      if (mode === 'add' || mode === 'both') {
        setPendingAction('fav');
        setConfirmOpen(true);
        return;
      }
      applyFavorite(true);
    } else {
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

  const Wrapper = as as keyof JSX.IntrinsicElements;

  return (
    <>
      <Wrapper className="h-[290px] overflow-hidden relative cursor-pointer flex flex-col pt-5">
        <article className="rounded-sm flex flex-col h-full border border-[#A3A3A3]">
          <span className="absolute left-2 z-10">
            <StatusBadge text={item.status} />
          </span>

          <div className="relative overflow-hidden">
            <img
              src={item.thumbnail}
              alt={`${item.title} 썸네일`}
              className="w-full object-cover rounded-t-sm h-[133px]"
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

          <div className="relative p-[15px] rounded-b-sm flex flex-col flex-1 pb-12 bg-white">
            <header className="flex justify-between text-sm mb-2">
              <span className="text-[#D83737] font-semibold">{item.category}</span>
              <span className="text-[#767676]">{item.region}</span>
            </header>
            <h3 className="flex items-center gap-1 text-lg font-bold hover:underline">
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
              <span className="absolute right-3 bottom-3 bg-[#C5C5C5] text-white rounded-xl px-2 text-[9px]">
                AD
              </span>
            )}
          </div>
        </article>
      </Wrapper>

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
