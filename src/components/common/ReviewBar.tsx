import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, type ReactNode } from 'react';
import RemoveModal from './modal/RemoveModal';

export type GroupReview = {
  id: number;
  title: string;
  category: string; // 예: 스터디/학습
  status: '진행중' | '종료';
  rating: 1 | 2 | 3 | 4 | 5;
  period: string; // "YYYY.MM.DD ~ YYYY.MM.DD"
  content: string;
  tags: string[];
};

type Props = {
  review: GroupReview;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  defaultOpen?: boolean;
};

const Pill = ({
  tone = 'gray',
  children,
}: {
  tone?: 'gray' | 'blue' | 'amber';
  children: ReactNode;
}) => {
  const base =
    'inline-flex items-center rounded-[5px] h-[29px] px-3 py-1 font-semibold gap-2 border';

  const toneMap = {
    gray: 'bg-[#8C8C8C] border-[#8c8c8c] text-white leading-none text-[17px]',
    blue: 'bg-white text-[#0689E8] border-[#0689E8] leading-none text-[17px]',
    amber: 'text-[#6C6C6C] border-[#6C6C6C] leading-none text-[16px]',
  } as const;

  return <span className={clsx(base, toneMap[tone])}>{children}</span>;
};

const Star = ({ filled }: { filled: boolean }) => (
  <svg
    viewBox="0 0 20 20"
    className={`w-5 h-5 relative bottom-[2px] ${filled ? 'fill-amber-400' : 'fill-gray-300'}`}
    aria-hidden="true"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.1 3.38a1 1 0 0 0 .95.69h3.552c.967 0 1.371 1.24.588 1.81l-2.874 2.09a1 1 0 0 0-.364 1.118l1.1 3.38c.3.921-.755 1.688-1.54 1.118l-2.874-2.09a1 1 0 0 0-1.176 0l-2.874 2.09c-.785.57-1.84-.197-1.54-1.118l1.1-3.38a1 1 0 0 0-.364-1.118L1.86 8.807c-.783-.57-.379-1.81.588-1.81h3.552a1 1 0 0 0 .95-.69l1.1-3.38z" />
  </svg>
);

const Rating = ({ value }: { value: number }) => (
  <div className="flex items-center gap-2 pr-[100px]">
    <span className="text-[17px] text-gray-600">별점</span>
    <div className="flex items-center gap-1" aria-label={`별점 ${value}점 / 5점`}>
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} filled={n <= value} />
      ))}
    </div>
  </div>
);

export default function GroupReviewCard({ review, onEdit, onDelete, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [removed, setRemoved] = useState(false); // ✅ 임시 로컬 삭제용

  const handleDeleteClick = () => setConfirmOpen(true);

  const handleConfirmDelete = () => {
    setConfirmOpen(false);
    onDelete?.(review.id); // 부모 콜백도 호출
    setRemoved(true); // ✅ 로컬에서도 카드 숨김 처리
  };

  return (
    <AnimatePresence initial={false}>
      {!removed && (
        <motion.li
          key={review.id}
          initial={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
          className="rounded-[5px] overflow-hidden relative flex flex-col w-[1000px]"
        >
          <article className="rounded-md flex flex-col border border-[#A3A3A3] bg-white">
            {/* 상단 요약 */}
            <div className="py-6 pl-9 pr-6">
              <header className="flex items-center justify-start gap-3">
                <div className="flex flex-col">
                  <h3 className="text-xl font-bold leading-tight line-clamp-1">{review.title}</h3>
                  <p className="mt-1 text-xs text-gray-500">모임 기간 : {review.period}</p>
                </div>
                <div className="flex gap-5 ml-10">
                  <div className="flex items-center justify-end">
                    <Pill tone="blue">{review.category}</Pill>
                  </div>
                  <div>
                    <Pill tone="gray">{review.status}</Pill>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <Rating value={review.rating} />
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 px-3 py-1 text-[15px] hover:bg-gray-50 rounded"
                    onClick={() => setOpen(o => !o)}
                    aria-expanded={open}
                    aria-controls={`review-panel-${review.id}`}
                  >
                    상세보기
                  </button>
                </div>
              </header>
            </div>

            {/* 상세보기 영역 */}
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  key="panel"
                  id={`review-panel-${review.id}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.26, ease: [0.22, 0.61, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <hr className="border-[#eee]" />
                  <div className="relative p-3 flex flex-col flex-1 pb-12 m-4">
                    <div className="mb-2 mt-5 flex items-center gap-8 border-b border-[#6C6C6C] pb-2">
                      <h3 className="text-xl font-bold leading-tight line-clamp-1">
                        {review.title}
                      </h3>
                      <Pill tone="blue">{review.category}</Pill>
                      <Rating value={review.rating} />
                      <p className="mt-1 text-xs text-gray-500 ml-auto">
                        모임 기간 : {review.period}
                      </p>
                    </div>

                    <motion.p
                      className="text-md text-[#555] leading-6 whitespace-pre-line mb-4 mt-4"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18, delay: 0.05 }}
                    >
                      {review.content}
                    </motion.p>

                    <motion.div
                      className="flex flex-wrap gap-2 mb-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.18, delay: 0.1 }}
                    >
                      {review.tags.map(t => (
                        <Pill key={t} tone="amber">
                          #{t}
                        </Pill>
                      ))}
                    </motion.div>

                    {/* 하단 고정 버튼 */}
                    <div className="absolute right-3 bottom-3 flex gap-6 px-[13px] py-1">
                      <button
                        type="button"
                        className="w-[56px] h-[30px] rounded-md border border-[#6C6C6C] text-[16px] text-[#6C6C6C]"
                        onClick={() => onEdit?.(review.id)}
                      >
                        수정
                      </button>

                      {/* 삭제 → 모달 오픈 */}
                      <button
                        type="button"
                        className="w-[56px] h-[30px] rounded-md bg-[#6C6C6C] text-[16px] text-white"
                        onClick={handleDeleteClick}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </article>

          {/* 확인 모달 */}
          <RemoveModal
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            onConfirm={handleConfirmDelete}
            title="리뷰를 삭제하시겠어요?"
            message={'삭제하면 다시 작성할 수 없어요.\n정말 삭제할까요?'}
            confirmText="삭제"
            cancelText="취소"
            preventBackdropClose={true}
          />
        </motion.li>
      )}
    </AnimatePresence>
  );
}
