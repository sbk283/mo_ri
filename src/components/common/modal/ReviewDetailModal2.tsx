// 코드 백업 ReviewDetailModal.tsx
// // src/components/common/ReviewDetailModal.tsx
// import { AnimatePresence, motion } from 'framer-motion';
// import { useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';

// export type ReviewDetail = {
//   id: number;
//   title: string;
//   category: string;
//   src: string;
//   period: string;
//   rating: 1 | 2 | 3 | 4 | 5;
//   authorMasked: string;
//   created_at: string;
//   content: string;
//   tags: string[];
//   empathy: number;
//   ad?: boolean;
// };

// type Props = {
//   open: boolean;
//   review?: ReviewDetail;
//   onClose: () => void;
//   onEmpathy?: (id: number) => void;
// };

// export default function ReviewDetailModal({ open, review, onClose, onEmpathy }: Props) {
//   const backdropRef = useRef<HTMLDivElement>(null);
//   const navigate = useNavigate();

//   // 바디 스크롤 락
//   useEffect(() => {
//     if (!open) return;
//     const prev = document.body.style.overflow;
//     document.body.style.overflow = 'hidden';
//     return () => {
//       document.body.style.overflow = prev;
//     };
//   }, [open]);

//   // ESC 닫기
//   useEffect(() => {
//     if (!open) return;
//     const onKey = (e: KeyboardEvent) => {
//       if (e.key === 'Escape') onClose();
//     };
//     window.addEventListener('keydown', onKey);
//     return () => window.removeEventListener('keydown', onKey);
//   }, [open, onClose]);

//   if (typeof window === 'undefined') return null;
//   if (!open || !review) return null;

//   const report = () => navigate('/inquiry');

//   return (
//     <AnimatePresence>
//       {open && (
//         <motion.div
//           ref={backdropRef}
//           className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-4"
//           onClick={e => {
//             // 배경(자기 자신) 클릭일 때만 닫기
//             if (e.target === e.currentTarget) onClose();
//           }}
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//           aria-modal="true"
//           role="dialog"
//         >
//           <motion.div
//             className="w-full max-w-[539px] max-h-[85vh] bg-white rounded-sm overflow-hidden shadow-xl flex flex-col"
//             initial={{ y: 24, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             exit={{ y: 24, opacity: 0 }}
//           >
//             {/* 헤더: 히어로 이미지 + 타이틀 */}
//             <div className="relative h-[294px] shrink-0">
//               <img
//                 src={review.src}
//                 alt=""
//                 className="absolute inset-0 w-full h-full object-cover"
//               />
//               <div className="absolute inset-0 bg-black/40" />
//               <div className="relative h-full px-6 py-5 text-white flex flex-col justify-end">
//                 <div className="flex items-center gap-3">
//                   {/* 제목 + 트로피 */}
//                   <div className="flex items-center gap-2 min-w-0">
//                     <h3 className="flex-1 min-w-0 flex items-center gap-1 text-lg font-bold hover:underline">
//                       <span className="truncate">{review.title}</span>
//                     </h3>
//                     {review.ad && (
//                       <img
//                         src="/images/trophy.svg"
//                         alt="trophy"
//                         className="w-4 h-4 flex-shrink-0"
//                       />
//                     )}
//                   </div>

//                   {/* 카테고리 */}
//                   <span className="text-sm font-semibold bg-white text-[#0689E8] border border-[#0689E8] px-2 py-0.5 rounded-sm">
//                     {review.category}
//                   </span>
//                 </div>

//                 <p className="mt-1 text-sm text-white/90">모임 기간 : {review.period}</p>

//                 {/* 별점 */}
//                 <div
//                   className="mt-2 flex items-center gap-1"
//                   aria-label={`별점 ${review.rating}점`}
//                 >
//                   {Array.from({ length: 5 }).map((_, i) => (
//                     <img
//                       key={i}
//                       className="w-5 h-5"
//                       src={i < review.rating ? '/images/star_gold.svg' : '/images/star_dark.svg'}
//                       alt={i < review.rating ? '노란별' : '빈별'}
//                     />
//                   ))}
//                 </div>
//               </div>
//             </div>

//             {/* 본문: 스크롤 영역 */}
//             <div className="p-6 overflow-y-auto">
//               <div className="border rounded-xl p-4 relative">
//                 <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
//                   <span className="font-semibold text-md text-[#B8641B]">
//                     {review.authorMasked}
//                   </span>
//                   <span className="text-sm text-[#939393]">작성일자: {review.created_at}</span>
//                 </div>

//                 <p className="text-black leading-6 text-md whitespace-pre-line">{review.content}</p>

//                 {/* 태그 */}
//                 <div className="mt-4 flex flex-wrap gap-2">
//                   {review.tags.map(tag => (
//                     <span
//                       key={tag}
//                       className="text-sm border font-semibold rounded-sm px-3 py-1 text-black bg-white"
//                     >
//                       # {tag}
//                     </span>
//                   ))}
//                 </div>

//                 {/* 하단 행동 */}
//                 <div className="mt-6 flex items-center justify-between">
//                   <span className="text-[#E9A107] text-md">공감+{review.empathy}</span>
//                   <button
//                     type="button"
//                     className="text-gray-400 hover:text-gray-600"
//                     onClick={report}
//                   >
//                     신고하기
//                   </button>
//                 </div>
//               </div>

//               {/* 공감 버튼: 카드 바깥, 배경 위 */}
//               <div className="mt-4">
//                 <button
//                   type="button"
//                   onClick={() => onEmpathy?.(review.id)}
//                   className="inline-flex items-center gap-2 px-5 py-3 rounded-sm bg-[#2A91E5] text-white font-semibold hover:brightness-95"
//                 >
//                   <span>공감하기</span>
//                 </button>
//               </div>
//             </div>
//           </motion.div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// }
