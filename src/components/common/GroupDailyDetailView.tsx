// src/components/GroupDailyDetailView.tsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import AvatarImg from "../common/AvatarImg";
import ConfirmModal from "../common/modal/ConfirmModal";
import { resolveStorageUrl } from "../../lib/contentUtils";
import { supabase } from "../../lib/supabase";
import GroupDailyDetailEdit from "../GroupDailyDetailEdit";

type DailyModel = {
  postId: string;
  userId: string;
  title: string;
  content: string;
  date: string;
  likedCount?: number;
  viewCount?: number;
};

type GroupDailyDetailViewProps = {
  daily: DailyModel;
  currentUserId: string | null;
  likeCount: number;
  liked: boolean;
  onToggleLike: () => Promise<void>;
  onDelete: (postId: string) => Promise<void>;
  onSave: (next: any) => Promise<void>;
  closeDetail: () => void;
};

export default function GroupDailyDetailView({
  daily,
  currentUserId,
  likeCount,
  liked,
  onToggleLike,
  onDelete,
  onSave,
  closeDetail,
}: GroupDailyDetailViewProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [editMode, setEditMode] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);

  const [likers, setLikers] = useState<{
    entries: { userId: string; avatarUrl: string | null }[];
    total: number;
  }>({ entries: [], total: 0 });

  const canEditDelete = !!currentUserId && currentUserId === daily.userId;

  // QS 헬퍼
  const setQS = (next: Record<string, string | undefined>, replace = false) => {
    const cur = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([k, v]) => {
      if (v == null) cur.delete(k);
      else cur.set(k, v);
    });
    setSearchParams(cur, { replace });
  };

  // 편집 탭에서 새로고침하면 상세로 복귀
  useEffect(() => {
    const post = searchParams.get("post");
    if (post) setQS({ post, view: "detail" }, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 좋아요한 멤버 목록
  const fetchLikers = async () => {
    const { data: likeRows, error: likeErr } = await supabase
      .from("group_post_likes")
      .select("user_id")
      .eq("post_id", daily.postId);

    if (likeErr) {
      console.error("[DetailView] load likes error", likeErr);
      setLikers({ entries: [], total: 0 });
      return;
    }

    const userIds = (likeRows ?? []).map((r) => (r as any).user_id as string);
    const total = userIds.length;
    if (!userIds.length) return setLikers({ entries: [], total: 0 });

    const { data: profiles, error: profErr } = await supabase
      .from("user_profiles")
      .select("user_id, avatar_url")
      .in("user_id", userIds);

    if (profErr) {
      console.error("[DetailView] load profiles error", profErr);
      setLikers({
        entries: userIds.map((uid) => ({ userId: uid, avatarUrl: null })),
        total,
      });
      return;
    }

    const map = new Map<string, string | null>();
    for (const p of (profiles ?? []) as any[]) {
      const resolved = resolveStorageUrl(p.avatar_url) ?? p.avatar_url ?? null;
      map.set(p.user_id, resolved);
    }
    const entries = userIds.map((uid) => ({
      userId: uid,
      avatarUrl: map.get(uid) ?? null,
    }));
    setLikers({ entries, total });
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await fetchLikers();
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [daily.postId]);

  // 좋아요 토글
  const handleToggleLikeDetail = async () => {
    await onToggleLike();
    setTimeout(() => void fetchLikers(), 400);
  };

  const MAX_VISIBLE = 12;
  const visibleEntries = likers.entries.slice(0, MAX_VISIBLE);
  const overflow = Math.max(0, (likers.total ?? 0) - visibleEntries.length);

  return (
    <AnimatePresence mode="wait" initial={false}>
      {editMode ? (
        <motion.div
          key="edit"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <GroupDailyDetailEdit
            daily={daily as any}
            onCancel={() => {
              setEditMode(false);
              setQS({ post: daily.postId, view: "detail" }, true);
            }}
            onSave={async (next) => {
              await onSave(next);
              setEditMode(false);
              setQS({ post: daily.postId, view: "detail" }, true);
            }}
          />
        </motion.div>
      ) : (
        <motion.div
          key="detail"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <article className="mx-auto bg-white shadow-md border border-[#A3A3A3] min-h-[500px]">
            {/* 헤더 */}
            <header className="px-8 pt-6">
              <div className="flex">
                <h1 className="text-xl font-bold text-gray-800 leading-none mb-3">
                  {daily.title}
                </h1>
              </div>
              <div className="flex items-center text-[#8C8C8C] text-md gap-3">
                <span>{daily.date}</span>
                <span>조회수 {daily.viewCount ?? 0}</span>
                <div className="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#6c6c6c"
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
                  <span className="leading-3">좋아요 {likeCount}</span>
                </div>
                <a
                  href="/inquiry"
                  className="text-sm text-end ml-auto text-[#8C8C8C]"
                >
                  신고하기
                </a>
              </div>
            </header>

            {/* 헤더-본문 사이 구분선 */}
            <div className="text-center">
              <div className="inline-block border-b-[1px] border-[#A3A3A3] w-[910px]" />
            </div>

            {/* 본문 */}
            <section className="px-8 py-8 min-h-[200px]">
              {typeof daily.content === "string" &&
              daily.content.trim().startsWith("<") ? (
                <div
                  className={[
                    "rich-text text-gray-800 leading-relaxed",
                    // heading 스타일 강제 적용
                    "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2",
                    "[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-2",
                    "[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1",
                    // 문단 간 간격
                    "[&_p]:mb-2",
                    // 리스트 간격
                    "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-2",
                    "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-2",
                  ].join(" ")}
                  dangerouslySetInnerHTML={{ __html: daily.content }}
                />
              ) : (
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {daily.content}
                </div>
              )}
            </section>

            {/* 좋아요 버튼 */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              className="min-w-[84px] h-[32px] flex items-center gap-1 ml-auto mr-8 mb-2 text-brand border border-brand px-3 py-1 rounded-sm transition"
              onClick={handleToggleLikeDetail}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill={liked ? "currentColor" : "none"}
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
              <p className="leading-none">{liked ? "좋아요 취소" : "좋아요"}</p>
            </motion.button>

            <div>
              {/* 좋아요 버튼 아래 보더 라인 */}
              <div className="text-center">
                <div className="inline-block border-b-[1px] border-[#A3A3A3] w-[910px]" />
              </div>

              {/* 좋아요한 멤버 섹션 */}
              <section className="px-8 pb-8 pt-4 mt-auto min-h-[120px]">
                <span className="block text-lg text-[#3C3C3C] font-semibold mb-2">
                  좋아요한 멤버
                </span>

                <div className="flex flex-wrap items-center gap-2 min-h-[32px]">
                  {likers.total > 0 ? (
                    <>
                      {visibleEntries.map((e) => (
                        <AvatarImg
                          key={e.userId}
                          src={e.avatarUrl}
                          alt="좋아요한 멤버"
                        />
                      ))}
                      {overflow > 0 && (
                        <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-[11px] text-gray-600">
                          +{overflow}
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-sm text-[#B3B3B3]">
                      첫 좋아요를 눌러보세요
                    </span>
                  )}
                </div>
              </section>
            </div>
          </article>

          {/* 푸터 */}
          <footer className="py-6 flex text-left justify-start">
            <button
              onClick={() => {
                closeDetail();
                setQS({ post: undefined, view: undefined });
              }}
              className="text-[#8C8C8C] py-2 transition text-md"
            >
              &lt; 목록으로
            </button>
            {canEditDelete ? (
              <div className="ml-auto flex py-2">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  className="text-md w-[50px] h-[32px] flex justify-center items-center text-center mr-4 text-brand border border-brand rounded-sm transition"
                  onClick={() => setOpenConfirm(true)}
                >
                  삭제
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  className="text-md w-[50px] h-[32px] flex justify-center items-center text-center text-white bg-brand border border-brand rounded-sm transition"
                  onClick={() => {
                    setEditMode(true);
                    setQS({ post: daily.postId, view: "edit" });
                  }}
                >
                  수정
                </motion.button>
              </div>
            ) : (
              <div
                className="ml-auto flex py-2"
                style={{ width: 50 + 8 + 50 }}
              />
            )}
          </footer>
        </motion.div>
      )}

      {/* 삭제 확인 모달 */}
      <ConfirmModal
        open={openConfirm}
        title="정말 삭제하시겠습니까?"
        message={"삭제 후 되돌릴 수 없습니다.\n이 게시글을 삭제하시겠습니까?"}
        confirmText="삭제"
        cancelText="취소"
        onConfirm={async () => {
          setOpenConfirm(false);
          await onDelete(daily.postId);
          setQS({ post: undefined, view: undefined });
        }}
        onClose={() => setOpenConfirm(false)}
        preventBackdropClose={false}
      />
    </AnimatePresence>
  );
}
