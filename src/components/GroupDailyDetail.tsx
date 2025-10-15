// src/pages/GroupContentDetail.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { dailyMock } from './common/GroupDailyContent';
import GroupDailyDetailEdit from './GroupDailyDetailEdit';

export type Daily = {
  id: number;
  title: string;
  date: string;
  views?: number;
  likedCount?: number;
  imageUrl?: string | null;
  content: string;
};

type Props = { id: number; onBack: () => void } | { id?: never; onBack?: never };

export default function GroupDailyDetail(props: Props) {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);

  const resolvedId =
    (('id' in props && props.id) as number | undefined) ??
    (params.id ? Number(params.id) : undefined);

  const goBack = 'onBack' in props && props.onBack ? props.onBack : () => navigate(-1);
  const daily = dailyMock.find(n => n.id === Number(resolvedId)) as Daily | undefined;

  if (!daily) {
    return (
      <div className="p-8 text-center">
        <p>⚠️ 해당 공지를 찾을 수 없습니다.</p>
        <button
          onClick={goBack}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          돌아가기
        </button>
      </div>
    );
  }

  const handleSave = (next: Daily) => {
    next;
    setEditMode(false);
  };

  const cardVariants = {
    initial: (dir: number) => ({ opacity: 0, x: dir > 0 ? 24 : -24 }),
    animate: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -24 : 24 }),
  };

  // editMode 전환 방향(디테일→수정: 오른쪽에서 들어오게, 수정→디테일: 반대)
  const dir = editMode ? 1 : -1;

  return (
    <div className="w-full">
      <AnimatePresence mode="wait" initial={false} custom={dir}>
        {editMode ? (
          <motion.div
            key="edit"
            layout
            custom={dir}
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <GroupDailyDetailEdit
              daily={daily}
              onCancel={() => setEditMode(false)}
              onSave={handleSave}
            />
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            layout
            custom={dir}
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <article className="mx-auto bg-white shadow-md border border-[#A3A3A3]">
              <header className="px-8 pt-6">
                <div className="flex">
                  <h1 className="text-xl font-bold text-gray-800 leading-snug mb-3">
                    {daily.title}
                  </h1>
                </div>
                <div className="flex items-center text-[#8C8C8C] text-md gap-3">
                  <span>{daily.date}</span>
                  <span>조회수 {daily.views ?? 0}</span>
                  <div className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-[15px] h-[15px] mb-1"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                      />
                    </svg>
                    <span className="leading-3">좋아요 {daily.likedCount ?? 0}</span>
                  </div>
                  <a href="/inquiry" className="text-sm text-end ml-auto text-[#8C8C8C]">
                    신고하기
                  </a>
                </div>
              </header>

              <div className="text-center">
                <div className="inline-block border-b-[1px] border-[#A3A3A3] w-[904px]" />
              </div>

              <section className="px-8 py-10 text-gray-800 leading-relaxed whitespace-pre-wrap">
                {daily.imageUrl ? (
                  <motion.img
                    key={daily.imageUrl}
                    layout="position"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    src={daily.imageUrl}
                    alt={daily.title}
                    className="w-full h-auto mb-6"
                  />
                ) : (
                  <motion.img
                    key="fallback-img"
                    layout="position"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    src="/images/nacta.png"
                    alt="낙타사진"
                    className="w-[290px] h-[160px] mb-6"
                  />
                )}
                {daily.content}
              </section>

              <motion.button
                whileTap={{ scale: 0.96 }}
                className="w-[84px] h-[32px] flex items-center gap-1 ml-auto mr-8 mb-6 text-[#0689E8] border border-[#0689E8] px-3 py-1 rounded-sm transition"
                onClick={() => {
                  /* TODO: 좋아요 토글 */
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-[15px] h-[15px]"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                  />
                </svg>
                <p className="leading-none">좋아요</p>
              </motion.button>

              <div className="text-center">
                <div className="inline-block border-b-[1px] border-[#A3A3A3] w-[904px]" />
              </div>

              <div className="flex text-lg font-bold text-gray-800 leading-snug my-3 mx-8">
                좋아요 한 멤버
              </div>

              <div className="flex gap-3 mx-8 mb-10 items-center">
                {Array.from({ length: Math.min(daily.likedCount ?? 0, 10) }).map((_, index) => (
                  <motion.img
                    key={index}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, delay: 0.02 * index }}
                    src="/images/user-profile.png"
                    alt="프로필사진"
                    className="w-[50px] h-[50px] rounded-full object-cover"
                  />
                ))}

                {(daily.likedCount ?? 0) > 10 && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.18, delay: 0.02 * 10 }}
                    className="flex justify-center items-center w-[50px] h-[50px] rounded-full border border-gray-300 text-gray-500 text-sm font-medium"
                  >
                    +{(daily.likedCount ?? 0) - 10}
                  </motion.span>
                )}
              </div>
            </article>

            <footer className="py-6 flex text-left justify-start">
              <button onClick={goBack} className="text-[#8C8C8C] py-2 transition text-md">
                &lt; 목록으로
              </button>
              <div className="ml-auto flex py-2">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  className="text-md w-[50px] h-[32px] flex justify-center items-center text-center mr-4 text-[#0689E8] border border-[#0689E8] rounded-sm transition"
                  onClick={() => {
                    /* TODO: 삭제 로직 */
                  }}
                >
                  삭제
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  className="text-md w-[50px] h-[32px] flex justify-center items-center text-center text-white bg-[#0689E8] border border-[#0689E8] rounded-sm transition"
                  onClick={() => setEditMode(true)}
                >
                  수정
                </motion.button>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
