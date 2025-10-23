// 임시 보관
// // src/components/common/GroupDailyDetail.tsx
// import { AnimatePresence, motion } from 'framer-motion';
// import { useEffect, useMemo, useState } from 'react';
// import GroupDailyDetailEdit from './GroupDailyDetailEdit';
// import type { Daily } from '../types/daily';
// import { useCurrentUser } from '../hooks/useCurrentUser';

// type DailyWithPostId = Daily & {
//   postId: string;
//   userId?: string;
//   groupId?: string;
//   viewCount?: number;
//   likedUsers?: Array<{ userId: string; nickname?: string | null; avatarUrl?: string | null }>;
// };

// type Props = {
//   daily: DailyWithPostId;
//   onBack: () => void;
//   onSave: (next: DailyWithPostId) => void;
//   onDelete?: () => Promise<void> | void;
// };

// const extractAllImageUrls = (content?: string | null): string[] => {
//   if (!content) return [];
//   const urls = new Set<string>();
//   for (const m of content.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)) if (m[1]) urls.add(m[1]);
//   for (const m of content.matchAll(/!\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/g))
//     if (m[1]) urls.add(m[1]);
//   for (const m of content.matchAll(/(https?:\/\/[^\s"'<>]+\.(?:png|jpe?g|gif|webp|avif|svg))/gi))
//     if (m[1]) urls.add(m[1]);
//   return Array.from(urls);
// };

// const stripAllImages = (content?: string | null): string => {
//   if (!content) return '';
//   let out = content;
//   out = out.replace(/<img[^>]*>/gi, '');
//   out = out.replace(/!\[[^\]]*]\([^)]*\)/g, '');
//   out = out.replace(
//     /(^|\n)\s*(https?:\/\/[^\s"'<>]+\.(?:png|jpe?g|gif|webp|avif|svg))\s*/gi,
//     (m, p1) => (p1 ? p1 : ''),
//   );
//   return out.trim();
// };

// export default function GroupDailyDetail({ daily, onBack, onSave, onDelete }: Props) {
//   const user = useCurrentUser();
//   const [editMode, setEditMode] = useState(false);
//   const [isHost, setIsHost] = useState(false);

//   // ✅ 모임장 여부 확인
//   useEffect(() => {
//     const checkHost = async () => {
//       if (!daily.groupId || !user?.id) return;
//       const { data, error } = await supabase.rpc('is_group_host', {
//         p_group_id: daily.groupId,
//         p_user_id: user.id,
//       });
//       if (!error && data === true) setIsHost(true);
//     };
//     checkHost();
//   }, [daily.groupId, user?.id]);

//   const handleSave = (next: Daily) => {
//     onSave({ ...daily, ...next });
//     setEditMode(false);
//   };

//   const handleDelete = async () => {
//     if (!onDelete) return;
//     const ok = window.confirm('정말 삭제할까요? 되돌릴 수 없어요.');
//     if (!ok) return;
//     await onDelete();
//     onBack();
//   };

//   const allImages = useMemo(
//     () => extractAllImageUrls(String(daily.content ?? '')),
//     [daily.content],
//   );
//   const contentWithoutImages = useMemo(
//     () => stripAllImages(String(daily.content ?? '')),
//     [daily.content],
//   );

//   const likedAvatars = useMemo(() => {
//     const list = (daily.likedUsers ?? [])
//       .map(u => ({
//         src: u.avatarUrl ?? '',
//         nickname: u.nickname ?? '알 수 없음',
//         userId: u.userId,
//       }))
//       .filter((u, i, arr) => arr.findIndex(x => x.userId === u.userId) === i)
//       .filter(u => !!u.src);
//     return list;
//   }, [daily.likedUsers]);

//   const VISIBLE_MAX = 10;
//   const visibleAvatars = likedAvatars.slice(0, VISIBLE_MAX);
//   const totalCount = typeof daily.likedCount === 'number' ? daily.likedCount : likedAvatars.length;
//   const overflowCount = Math.max(totalCount - visibleAvatars.length, 0);

//   const cardVariants = {
//     initial: (dir: number) => ({ opacity: 0, x: dir > 0 ? 24 : -24 }),
//     animate: { opacity: 1, x: 0 },
//     exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -24 : 24 }),
//   };
//   const dir = editMode ? 1 : -1;

//   const isAuthor = daily.userId === user?.id;
//   const canEdit = isAuthor;
//   const canDelete = isAuthor || isHost;

//   return (
//     <div className="w-full">
//       <AnimatePresence mode="wait" initial={false} custom={dir}>
//         {editMode ? (
//           <motion.div
//             key="edit"
//             layout
//             custom={dir}
//             variants={cardVariants}
//             initial="initial"
//             animate="animate"
//             exit="exit"
//             transition={{ duration: 0.22, ease: 'easeOut' }}
//           >
//             <GroupDailyDetailEdit
//               daily={daily}
//               onCancel={() => setEditMode(false)}
//               onSave={handleSave}
//             />
//           </motion.div>
//         ) : (
//           <motion.div
//             key="detail"
//             layout
//             custom={dir}
//             variants={cardVariants}
//             initial="initial"
//             animate="animate"
//             exit="exit"
//             transition={{ duration: 0.22, ease: 'easeOut' }}
//           >
//             <article className="mx-auto bg-white shadow-md border border-[#A3A3A3] min-h-[500px]">
//               <header className="px-8 pt-6">
//                 <div className="flex">
//                   <h1 className="text-xl font-bold text-gray-800 leading-snug mb-3">
//                     {daily.title}
//                   </h1>
//                 </div>
//                 <div className="flex items-center text-[#8C8C8C] text-md gap-3">
//                   <span>{daily.date}</span>
//                   <span>조회수 {daily.viewCount ?? 0}</span>
//                   <div className="flex items-center gap-1">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       strokeWidth="1.5"
//                       stroke="currentColor"
//                       className="w-[15px] h-[15px] mb-1"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
//                       />
//                     </svg>
//                     <span className="leading-3">좋아요 {daily.likedCount ?? 0}</span>
//                   </div>
//                   <a href="/inquiry" className="text-sm text-end ml-auto text-[#8C8C8C]">
//                     신고하기
//                   </a>
//                 </div>
//               </header>

//               <div className="text-center">
//                 <div className="inline-block border-b-[1px] border-[#A3A3A3] w-[910px]" />
//               </div>

//               <section className="px-8 py-8 text-gray-800 leading-relaxed">
//                 {allImages.length > 0 && (
//                   <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
//                     {allImages.map((src, i) => (
//                       <motion.img
//                         key={`${src}-${i}`}
//                         layout="position"
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         transition={{ duration: 0.2 }}
//                         src={src}
//                         alt={`${daily.title} 이미지 ${i + 1}`}
//                         className="w-full h-auto rounded-sm object-cover"
//                       />
//                     ))}
//                   </div>
//                 )}

//                 {typeof daily.content === 'string' && daily.content.trim().startsWith('<') ? (
//                   <div
//                     className="prose max-w-none whitespace-pre-wrap"
//                     dangerouslySetInnerHTML={{ __html: contentWithoutImages }}
//                   />
//                 ) : (
//                   <div className="whitespace-pre-wrap">{contentWithoutImages}</div>
//                 )}
//               </section>

//               {(visibleAvatars.length > 0 || overflowCount > 0) && (
//                 <div className="px-8 pb-4">
//                   <div className="flex items-center">
//                     <div className="flex -space-x-2">
//                       {visibleAvatars.map(u => (
//                         <img
//                           key={u.userId}
//                           src={u.src}
//                           alt={u.nickname ?? '프로필'}
//                           title={u.nickname ?? '프로필'}
//                           className="w-9 h-9 rounded-full object-cover ring-2 ring-white border border-gray-200"
//                         />
//                       ))}
//                       {overflowCount > 0 && (
//                         <div
//                           className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 text-sm font-medium flex items-center justify-center ring-2 ring-white border border-gray-200"
//                           title={`외 ${overflowCount}명`}
//                         >
//                           +{overflowCount}
//                         </div>
//                       )}
//                     </div>
//                     <span className="ml-3 text-sm text-gray-500">좋아요를 눌렀어요</span>
//                   </div>
//                 </div>
//               )}
//             </article>

//             <footer className="py-6 flex text-left justify-start">
//               <button onClick={onBack} className="text-[#8C8C8C] py-2 transition text-md">
//                 &lt; 목록으로
//               </button>
//               <div className="ml-auto flex py-2">
//                 {canDelete && (
//                   <motion.button
//                     whileTap={{ scale: 0.96 }}
//                     className="text-md w-[50px] h-[32px] flex justify-center items-center text-center mr-4 text-[#0689E8] border border-[#0689E8] rounded-sm transition"
//                     onClick={handleDelete}
//                   >
//                     삭제
//                   </motion.button>
//                 )}
//                 {canEdit && (
//                   <motion.button
//                     whileTap={{ scale: 0.96 }}
//                     className="text-md w-[50px] h-[32px] flex justify-center items-center text-center text-white bg-[#0689E8] border border-[#0689E8] rounded-sm transition"
//                     onClick={() => setEditMode(true)}
//                   >
//                     수정
//                   </motion.button>
//                 )}
//               </div>
//             </footer>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }
