// src/pages/GroupContentDetail.tsx
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { noticeMock, type Notice } from './DashboardNotice';
import GroupContentDetailEdit from './GroupContentDetailEdit';

type Props =
  | { id: number; onBack: () => void } // 라우팅 없이 사용
  | { id?: never; onBack?: never }; // 라우팅으로 사용

export default function GroupContentDetail(props: Props) {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();

  // 라우팅/프롭스로부터 id 해석
  const resolvedId =
    (('id' in props && props.id) as number | undefined) ??
    (params.id ? Number(params.id) : undefined);

  const goBack = 'onBack' in props && props.onBack ? props.onBack : () => navigate(-1);

  // 초기 데이터 찾고, 이후 편집 반영을 위해 로컬 상태로 보관
  const initial = noticeMock.find(n => n.id === Number(resolvedId));
  const [current, setCurrent] = useState<Notice | undefined>(initial);
  const [editMode, setEditMode] = useState(false);

  if (!current) {
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

  const handleSave = (next: Notice) => {
    setCurrent(next); // 로컬 상태 업데이트
    setEditMode(false);
  };

  const cardVariants = {
    initial: (dir: number) => ({ opacity: 0, x: dir > 0 ? 24 : -24 }),
    animate: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -24 : 24 }),
  };

  // 디테일→수정: 오른쪽에서 슬라이드 인, 수정→디테일: 반대
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
            <GroupContentDetailEdit
              notice={current}
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
              {/* 제목 + 날짜 + 조회수 */}
              <header className="px-8 pt-6">
                <div className="flex">
                  <h1 className="text-xl font-bold text-gray-800 leading-snug mb-3">
                    {current.title}
                  </h1>
                  <span
                    className={`w-[50px] h-[25px] rounded-full font-bold text-white text-sm
                      flex items-center justify-center ml-4 leading-none
                      ${current.isRead ? 'bg-[#C4C4C4]' : 'bg-[#FF5252]'}`}
                  >
                    {current.isRead ? '읽음' : '안읽음'}
                  </span>
                </div>
                <div className="flex items-center text-[#8C8C8C] text-sm gap-3">
                  <span>{current.date}</span>
                  <span>조회수 {current.views ?? 0}</span>
                </div>
              </header>

              <div className="text-center">
                <div className="inline-block border-b-[1px] border-[#A3A3A3] w-[904px]" />
              </div>

              {/* 본문 내용 */}
              <section className="px-8 py-10 text-gray-800 leading-relaxed whitespace-pre-wrap">
                {current.content}
              </section>
            </article>

            {/* 목록/수정/삭제 */}
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
