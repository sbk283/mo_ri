import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import goodImg from '/images/good.png';

export type ReviewDetail = {
  id: number;
  title: string;
  category: string;
  src: string;
  period: string;
  rating: 1 | 2 | 3 | 4 | 5;
  created_at: string;
  content: string;
  tags: string[];
  empathy: number;
  creator_id: string;
};

type Props = {
  open: boolean;
  review?: ReviewDetail;
  onClose: () => void;
  onEmpathy?: (id: number) => void;
};

function formatYyDdMmHhMmSs(input: string | number | Date, tzOffsetMin = 0) {
  const d0 = new Date(input);
  if (isNaN(d0.getTime())) return String(input ?? '');
  const d = new Date(d0.getTime() + tzOffsetMin * 60 * 1000); // KST 고정하려면 9*60
  const yy = String(d.getFullYear()).slice(-2);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${yy}-${dd}-${mm} ${hh}-${mi}-${ss}`;
}

export default function ReviewDetailModal({ open, review, onClose, onEmpathy }: Props) {
  const navigate = useNavigate();

  // 스크롤 락
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // ESC 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !review) return null;

  const report = () => navigate('/inquiry');
  const created = formatYyDdMmHhMmSs(review.created_at /* , 9*60 */);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-4"
          onClick={e => {
            if (e.target === e.currentTarget) onClose();
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-modal="true"
          role="dialog"
        >
          {/* 모달 박스 */}
          <motion.div
            className="relative w-[539px] max-h-[85vh] bg-white rounded-sm overflow-y-auto shadow-xl"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
          >
            {/* 뒤 레이어 (위: 이미지 294px / 아래: 흰 배경) */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-white" />
              <img
                src={review.src}
                alt=""
                className="absolute top-0 left-0 w-full h-[294px] object-cover"
              />
              <div className="absolute top-0 left-0 w-full h-[294px] bg-black/40" />
            </div>

            {/* 상단 정보 */}
            <div className="relative z-10 h-[294px] flex flex-col justify-end px-6 pb-16 text-white">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <h3 className="flex-1 min-w-0 text-lg font-bold truncate">{review.title}</h3>
                </div>
                <span className="text-sm font-semibold border border-[#FF5252] bg-white text-[#FF5252] px-2 py-0.5 rounded-sm">
                  {review.category}
                </span>
              </div>
              <p className="mt-1 text-sm">모임 기간 : {review.period}</p>
              <div className="mt-2 flex items-center gap-1" aria-label={`별점 ${review.rating}점`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <img
                    key={i}
                    className="w-5 h-5"
                    src={i < review.rating ? '/images/star_gold.svg' : '/images/star_dark.svg'}
                    alt={i < review.rating ? '노란별' : '빈별'}
                  />
                ))}
              </div>
            </div>

            {/* 본문 카드 */}
            <div className="relative z-20 -mt-12 px-6">
              <div className="border rounded-sm px-4 py-6 bg-white">
                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                  <span className="font-semibold text-md text-[#B8641B]">
                    {review.creator_id} 님의 후기
                  </span>
                  <span className="text-sm text-[#939393]">작성일자: {created}</span>
                </div>

                <p className="text-black leading-6 text-md whitespace-pre-line">{review.content}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {review.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-sm border font-semibold rounded-sm px-3 py-1 text-black bg-white"
                    >
                      # {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <span className="text-[#E9A107] text-md">공감 +{review.empathy}</span>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600"
                    onClick={report}
                  >
                    신고하기
                  </button>
                </div>
              </div>
            </div>

            {/* 하단 버튼 영역 */}
            <div className="px-6 pt-4 pb-6 bg-white relative z-20 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => onEmpathy?.(review.id)}
                className="w-[112px] h-[32px] inline-flex justify-center items-center rounded-sm bg-[#0689E8] text-white font-semibold text-md hover:brightness-95"
              >
                <img src={goodImg} alt="공감하기" className="w-4 h-4 mr-1" />
                공감하기
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
