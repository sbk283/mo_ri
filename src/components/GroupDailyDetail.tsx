// src/components/common/GroupDailyDetail.tsx
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import GroupDailyDetailEdit from './GroupDailyDetailEdit';
import type { Daily } from '../types/daily';

type DailyWithPostId = Daily & { postId: string };

type Props = {
  daily: DailyWithPostId;
  onBack: () => void;
  onSave: (next: DailyWithPostId) => void;
  onDelete?: () => Promise<void> | void;
};

const extractAllImageUrls = (content?: string | null): string[] => {
  if (!content) return [];
  const urls = new Set<string>();

  for (const m of content.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)) {
    if (m[1]) urls.add(m[1]);
  }

  for (const m of content.matchAll(/!\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    if (m[1]) urls.add(m[1]);
  }

  for (const m of content.matchAll(/(https?:\/\/[^\s"'<>]+\.(?:png|jpe?g|gif|webp|avif|svg))/gi)) {
    if (m[1]) urls.add(m[1]);
  }

  return Array.from(urls);
};

const stripAllImages = (content?: string | null): string => {
  if (!content) return '';
  let out = content;

  out = out.replace(/<img[^>]*>/gi, '');

  out = out.replace(/!\[[^\]]*]\([^)]*\)/g, '');

  out = out.replace(
    /(^|\n)\s*(https?:\/\/[^\s"'<>]+\.(?:png|jpe?g|gif|webp|avif|svg))\s*/gi,
    (m, p1) => (p1 ? p1 : ''),
  );

  return out.trim();
};

export default function GroupDailyDetail({ daily, onBack, onSave, onDelete }: Props) {
  const [editMode, setEditMode] = useState(false);

  const handleSave = (next: Daily) => {
    onSave({ ...daily, ...next });
    setEditMode(false);
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    const ok = window.confirm('정말 삭제할까요? 되돌릴 수 없어요.');
    if (!ok) return;
    await onDelete();
    onBack();
  };

  const allImages = useMemo(
    () => extractAllImageUrls(String(daily.content ?? '')),
    [daily.content],
  );

  const contentWithoutImages = useMemo(
    () => stripAllImages(String(daily.content ?? '')),
    [daily.content],
  );

  const cardVariants = {
    initial: (dir: number) => ({ opacity: 0, x: dir > 0 ? 24 : -24 }),
    animate: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -24 : 24 }),
  };
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

              <section className="px-8 py-8 text-gray-800 leading-relaxed">
                {allImages.length > 0 && (
                  <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {allImages.map((src, i) => (
                      <motion.img
                        key={`${src}-${i}`}
                        layout="position"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        src={src}
                        alt={`${daily.title} 이미지 ${i + 1}`}
                        className="w-full h-auto rounded-sm object-cover"
                      />
                    ))}
                  </div>
                )}

                {typeof daily.content === 'string' && daily.content.trim().startsWith('<') ? (
                  <div
                    className="prose max-w-none whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: contentWithoutImages }}
                  />
                ) : (
                  <div className="whitespace-pre-wrap">{contentWithoutImages}</div>
                )}
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

              <footer className="py-6 flex text-left justify-start mx-8">
                <button onClick={onBack} className="text-[#8C8C8C] py-2 transition text-md">
                  &lt; 목록으로
                </button>
                <div className="ml-auto flex py-2">
                  {onDelete && (
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      className="text-md w-[50px] h-[32px] flex justify-center items-center text-center mr-4 text-[#0689E8] border border-[#0689E8] rounded-sm transition"
                      onClick={handleDelete}
                    >
                      삭제
                    </motion.button>
                  )}
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    className="text-md w-[50px] h-[32px] flex justify-center items-center text-center text-white bg-[#0689E8] border border-[#0689E8] rounded-sm transition"
                    onClick={() => setEditMode(true)}
                  >
                    수정
                  </motion.button>
                </div>
              </footer>
            </article>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
