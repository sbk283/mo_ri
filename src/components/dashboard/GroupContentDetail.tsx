// 관리가 용이하게 DashBoardNotice로 이동됨

// // src/components/dashboard/GroupContentDetail.tsx
// import { AnimatePresence, motion } from 'framer-motion';
// import { useEffect, useState } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { supabase } from '../../lib/supabase';
// import GroupContentDetailEdit from './GroupContentDetailEdit';
// import type { Notice } from '../../types/notice';

// export default function GroupContentDetail() {
//   const { id: groupId } = useParams<{ id: string }>();
//   const navigate = useNavigate();

//   const [notice, setNotice] = useState<Notice | null>(null);
//   const [editMode, setEditMode] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [postId, setPostId] = useState<string | null>(null);

//   // 게시글 불러오기 (그룹의 최신 공지 1건)
//   useEffect(() => {
//     if (!groupId) return;

//     let ignore = false;
//     (async () => {
//       setLoading(true);
//       const { data, error } = await supabase
//         .from('group_posts')
//         .select('post_id, post_title, post_body_md, post_created_at')
//         .eq('group_id', groupId)
//         .eq('board_type', 'notice')
//         .order('post_created_at', { ascending: false })
//         .limit(1)
//         .single();

//       if (ignore) return;

//       if (error || !data) {
//         console.error('[GroupContentDetail] load error', {
//           message: error?.message,
//           details: (error as any)?.details,
//           hint: (error as any)?.hint,
//           code: error?.code,
//         });
//         setNotice(null);
//       } else {
//         setNotice({
//           id: 1,
//           title: data.post_title ?? '',
//           content: data.post_body_md ?? '',
//           date: (data.post_created_at ?? '').slice(0, 10),
//           isRead: false,
//         });
//         setPostId(data.post_id);
//       }
//       setLoading(false);
//     })();

//     return () => {
//       ignore = true;
//     };
//   }, [groupId]);

//   // 저장 (수정/신규)
//   const handleSave = async (next: Notice) => {
//     if (!groupId) return;

//     const { data: userRes, error: authErr } = await supabase.auth.getUser();
//     if (authErr || !userRes?.user?.id) {
//       console.error('[GroupContentDetail] auth error', authErr);
//       return;
//     }
//     const userId = userRes.user.id;

//     if (postId) {
//       const { error } = await supabase
//         .from('group_posts')
//         .update({
//           post_title: next.title,
//           post_body_md: next.content,
//         })
//         .eq('post_id', postId);

//       if (error) {
//         console.error('[GroupContentDetail] update error', {
//           message: error.message,
//           details: (error as any).details,
//           hint: (error as any).hint,
//           code: error.code,
//         });
//         return;
//       }
//     } else {
//       const { data, error } = await supabase
//         .from('group_posts')
//         .insert({
//           user_id: userId, // ✅ RLS with_check 통과
//           group_id: groupId,
//           board_type: 'notice',
//           post_title: next.title,
//           post_body_md: next.content,
//         })
//         .select('post_id')
//         .single();

//       if (error) {
//         console.error('[GroupContentDetail] insert error', {
//           message: error.message,
//           details: (error as any).details,
//           hint: (error as any).hint,
//           code: error.code,
//         });
//         return;
//       }
//       if (data?.post_id) setPostId(data.post_id);
//     }

//     setNotice(next);
//     setEditMode(false);
//   };

//   // 삭제
//   const handleDelete = async () => {
//     if (!postId) return;
//     const ok = window.confirm('정말 삭제할까요? 삭제 후 되돌릴 수 없어요.');
//     if (!ok) return;

//     const { error } = await supabase.from('group_posts').delete().eq('post_id', postId);
//     if (error) {
//       console.error('[GroupContentDetail] delete error', {
//         message: error.message,
//         details: (error as any).details,
//         hint: (error as any).hint,
//         code: error.code,
//       });
//       return;
//     }
//     navigate(-1);
//   };

//   const cardVariants = {
//     initial: (dir: number) => ({ opacity: 0, x: dir > 0 ? 24 : -24 }),
//     animate: { opacity: 1, x: 0 },
//     exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -24 : 24 }),
//   };

//   const dir = editMode ? 1 : -1;

//   if (loading) {
//     return <div className="p-10 text-center text-gray-500">게시글을 불러오는 중...</div>;
//   }

//   if (!notice) {
//     return (
//       <div className="p-8 text-center">
//         <p>⚠️ 해당 공지를 찾을 수 없습니다.</p>
//         <button
//           onClick={() => navigate(-1)}
//           className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//         >
//           돌아가기
//         </button>
//       </div>
//     );
//   }

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
//             <GroupContentDetailEdit
//               notice={notice}
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
//             <article className="mx-auto bg-white shadow-md border border-[#A3A3A3]">
//               {/* 제목 + 날짜 + 읽음상태 */}
//               <header className="px-8 pt-6">
//                 <div className="flex">
//                   <h1 className="text-xl font-bold text-gray-800 leading-snug mb-3">
//                     {notice.title}
//                   </h1>
//                   <span
//                     className={`w-[50px] h-[25px] rounded-full font-bold text-white text-sm
//                       flex items-center justify-center ml-4 leading-none
//                       ${notice.isRead ? 'bg-[#C4C4C4]' : 'bg-[#FF5252]'}`}
//                   >
//                     {notice.isRead ? '읽음' : '안읽음'}
//                   </span>
//                 </div>
//                 <div className="flex items-center text-[#8C8C8C] text-sm gap-3">
//                   <span>{notice.date}</span>
//                 </div>
//               </header>

//               <div className="text-center">
//                 <div className="inline-block border-b-[1px] border-[#A3A3A3] w-[904px]" />
//               </div>

//               {/* 본문 */}
//               <section className="px-8 py-10 text-gray-800 leading-relaxed whitespace-pre-wrap">
//                 {notice.content}
//               </section>
//             </article>

//             {/* 목록/수정/삭제 */}
//             <footer className="py-6 flex text-left justify-start">
//               <button
//                 onClick={() => navigate(-1)}
//                 className="text-[#8C8C8C] py-2 transition text-md"
//               >
//                 &lt; 목록으로
//               </button>
//               <div className="ml-auto flex py-2">
//                 <motion.button
//                   whileTap={{ scale: 0.96 }}
//                   className="text-md w-[50px] h-[32px] flex justify-center items-center text-center mr-4 text-[#0689E8] border border-[#0689E8] rounded-sm transition"
//                   onClick={handleDelete}
//                 >
//                   삭제
//                 </motion.button>
//                 <motion.button
//                   whileTap={{ scale: 0.96 }}
//                   className="text-md w-[50px] h-[32px] flex justify-center items-center text-center text-white bg-[#0689E8] border border-[#0689E8] rounded-sm transition"
//                   onClick={() => setEditMode(true)}
//                 >
//                   수정
//                 </motion.button>
//               </div>
//             </footer>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }
