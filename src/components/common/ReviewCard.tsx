import { useState } from 'react';

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
  tone = 'gray' as const,
  children,
}: {
  tone?: 'gray' | 'blue' | 'amber';
  children: React.ReactNode;
}) => {
  const map = {
    gray: 'bg-[#8C8C8C] border border-[#8c8c8c] text-white',
    blue: 'bg-white text-[#0689E8] border border-[#0689E8]',
    amber: 'text-[#6C6C6C] border border-[#6C6C6C]',
  } as const;
  return (
    <span
      className={`inline-flex items-center rounded-[5px] px-3 py-1 text-[17px] font-semibold gap-2 ${map[tone]}`}
    >
      {children}
    </span>
  );
};

const Star = ({ filled }: { filled: boolean }) => (
  <svg
    viewBox="0 0 20 20"
    className={`size-5 ${filled ? 'fill-amber-400' : 'fill-gray-300'}`}
    aria-hidden="true"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.1 3.38a1 1 0 0 0 .95.69h3.552c.967 0 1.371 1.24.588 1.81l-2.874 2.09a1 1 0 0 0-.364 1.118l1.1 3.38c.3.921-.755 1.688-1.54 1.118l-2.874-2.09a1 1 0 0 0-1.176 0l-2.874 2.09c-.785.57-1.84-.197-1.54-1.118l1.1-3.38a1 1 0 0 0-.364-1.118L1.86 8.807c-.783-.57-.379-1.81.588-1.81h3.552a1 1 0 0 0 .95-.69l1.1-3.38z" />
  </svg>
);

const Rating = ({ value }: { value: number }) => (
  <div className="flex items-center gap-2 pr-20">
    <span className="text-sm text-gray-600">별점</span>
    <div className="flex gap-1" aria-label={`별점 ${value}점 / 5점`}>
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} filled={n <= value} />
      ))}
    </div>
  </div>
);

export default function GroupReviewCard({ review, onEdit, onDelete, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <li className="rounded-[5px] overflow-hidden relative flex flex-col">
      <article className="rounded-md flex flex-col border border-[#eee] bg-white">
        {/* 상단 요약 */}
        <div className="p-5">
          <header className="flex items-center justify-start gap-3">
            <div className="flex flex-col">
              <h3 className="text-lg font-bold leading-tight line-clamp-1">{review.title}</h3>
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
                className="px-3 py-1 text-sm hover:bg-gray-50"
                onClick={() => setOpen(open => !open)}
                aria-expanded={open}
              >
                상세보기
              </button>
            </div>
          </header>
        </div>

        {/* 펼침 영역 */}
        {open && (
          <>
            <hr className="border-[#eee]" />
            <div className="relative p-3 flex flex-col flex-1 pb-12 m-4">
              <div className="mb-2 mt-5 flex items-center gap-4 border-b border-[#eee] pb-2">
                <h3 className="text-lg font-bold leading-tight line-clamp-1">{review.title}</h3>
                <Pill tone="blue">{review.category}</Pill>
                <Rating value={review.rating} />
                <p className="mt-1 text-xs text-gray-500 ml-auto">모임 기간 : {review.period}</p>
              </div>
              <p className="text-sm text-[#555] leading-6 whitespace-pre-line mb-4 mt-4">
                {review.content}
              </p>

              <div className="flex flex-wrap gap-2">
                {review.tags.map(t => (
                  <Pill key={t} tone="amber">
                    #{t}
                  </Pill>
                ))}
              </div>

              {/* 하단 고정 버튼 */}
              <div className="absolute right-3 bottom-3 flex gap-2">
                <button
                  type="button"
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => onEdit?.(review.id)}
                >
                  수정
                </button>
                <button
                  type="button"
                  className="rounded-md bg-[#6C6C6C] px-4 py-2 text-sm text-white"
                  onClick={() => onDelete?.(review.id)}
                >
                  삭제
                </button>
              </div>
            </div>
          </>
        )}
      </article>
    </li>
  );
}
