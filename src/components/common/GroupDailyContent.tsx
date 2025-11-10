// src/components/common/GroupDailyContent.tsx
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Daily } from "../../types/daily";
import GroupPagination from "./GroupPagination";
import GroupDailyDetailEdit from "../GroupDailyDetailEdit";
import AvatarImg from "./AvatarImg";

import { useCurrentUser } from "../../hooks/useCurrentUser";
import {
  today,
  resolveStorageUrl,
  getFirstImageUrl,
  NO_IMAGE,
} from "../../lib/contentUtils";
import {
  fetchDailyList,
  createDaily,
  updateDaily,
  deleteDaily,
  bumpDailyView,
} from "../../lib/dailyPosts";
import { useDailyLikes } from "../../hooks/useDailyLikes";
import GroupDailyDetailView from "./GroupDailyDetailView";

type DailyWithPostId = Daily & {
  postId: string;
  userId: string;
  groupId: string;
  viewCount: number;
};

const ITEMS_PER_PAGE = 6;
const reindex = (arr: DailyWithPostId[]) =>
  arr.map((it, idx) => ({ ...it, id: idx + 1 }));

export default function GroupDailyContent({
  groupId,
  createRequestKey = 0,
  onCraftingChange,
}: {
  groupId?: string;
  createRequestKey?: number;
  onCraftingChange?: (v: boolean) => void;
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const user = useCurrentUser(); // { id, nickname, profileImageUrl }
  const currentUserId = user?.id ?? null;
  const currentAvatar = user?.profileImageUrl ?? null;

  const [isCreating, setIsCreating] = useState(false);
  const prevKey = useRef(createRequestKey);

  const [items, setItems] = useState<DailyWithPostId[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [profileByPostId, setProfileByPostId] = useState<
    Record<string, string | null>
  >({});

  // 좋아요 상태/실시간 훅
  const {
    likeCountMap,
    likedByMe,
    prime,
    toggleLike,
    setupRealtime,
    teardownRealtime,
  } = useDailyLikes();

  // URL QS 헬퍼
  const setQS = (next: Record<string, string | undefined>, replace = false) => {
    const cur = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([k, v]) => {
      if (v == null) cur.delete(k);
      else cur.set(k, v);
    });
    setSearchParams(cur, { replace });
  };

  // 외부 트리거 → 작성 모드 진입
  useEffect(() => {
    if (createRequestKey > prevKey.current) setIsCreating(true);
    prevKey.current = createRequestKey;
  }, [createRequestKey]);

  // 작성 모드 변경 시 상위 알림
  useEffect(() => {
    onCraftingChange?.(isCreating);
  }, [isCreating, onCraftingChange]);

  useEffect(() => () => onCraftingChange?.(false), [onCraftingChange]);

  // 목록 로드
  useEffect(() => {
    if (!groupId) return;
    let mounted = true;

    (async () => {
      setLoading(true);
      const { data, error } = await fetchDailyList(groupId);
      if (!mounted) return;

      if (error || !data) {
        console.error("[GroupDailyContent] load error", error);
        setItems([]);
        setProfileByPostId({});
        setLoading(false);
        teardownRealtime();
        return;
      }

      const mapped: DailyWithPostId[] = data.map((row: any, idx: number) => {
        const content: string = row.post_body_md ?? "";
        const thumbRaw = getFirstImageUrl(content);
        const thumbnail = resolveStorageUrl(thumbRaw) ?? thumbRaw ?? NO_IMAGE;

        return {
          id: idx + 1,
          postId: row.post_id,
          groupId: row.group_id,
          userId: row.user_id,
          title: row.post_title ?? "",
          content,
          date: (row.post_created_at ?? "").slice(0, 10),
          isRead: false,
          writer: row.user_profiles?.nickname ?? "익명",
          likedCount: 0, // likeCountMap으로 덮어씀
          imageUrl: thumbnail,
          viewCount: row.view_count ?? 0,
        };
      });

      setItems(mapped);
      setProfileByPostId(
        Object.fromEntries(
          data.map((r: any) => [
            r.post_id,
            r.user_profiles?.avatar_url ?? null,
          ]),
        ),
      );

      const postIds = data.map((r: any) => r.post_id) as string[];
      await prime(postIds, currentUserId);
      setupRealtime(groupId, postIds);

      setLoading(false);
    })();

    return () => {
      mounted = false;
      teardownRealtime();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, currentUserId]);

  // 페이지네이션
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [items.length]);
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE)),
    [items.length],
  );
  const pageItems = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return items.slice(start, start + ITEMS_PER_PAGE);
  }, [page, items]);

  // 상세 선택/닫기
  const [detailId, setDetailId] = useState<number | null>(null);
  const selectedDaily = useMemo<DailyWithPostId | null>(
    () => (detailId ? (items.find((d) => d.id === detailId) ?? null) : null),
    [detailId, items],
  );

  // [핵심] URL → 상태 복원 (새로고침 시 상세 유지, 편집은 상세로 교정)
  useEffect(() => {
    const postId = searchParams.get("post");
    if (!postId || items.length === 0) return;

    const idx = items.findIndex((n) => n.postId === postId);
    if (idx >= 0) {
      setDetailId(items[idx].id);
      // 요구사항 2: 편집으로 새로고침 시에도 상세로 복원
      setQS({ post: postId, view: "detail" }, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, searchParams]);

  const openDetail = (id: number) => {
    setDetailId(id);
    setIsCreating(false);
    const post = items.find((d) => d.id === id);
    if (post) {
      // 상세 상태 URL 기록
      setQS({ post: post.postId, view: "detail" });

      void bumpDailyView(post.postId).then(() =>
        setItems((prev) =>
          prev.map((it) =>
            it.postId === post.postId
              ? { ...it, viewCount: (it.viewCount ?? 0) + 1 }
              : it,
          ),
        ),
      );
    }
  };

  const closeDetail = () => {
    setDetailId(null);
    setQS({ post: undefined, view: undefined });
  };

  // 작성용 기본값
  const emptyDaily: Daily = {
    id: 0,
    title: "",
    content: "",
    date: today(),
    isRead: false,
    writer: user?.nickname ?? "익명",
    likedCount: 0,
    imageUrl: user?.profileImageUrl ?? null,
  };

  // 생성
  const handleCreateSave = async (next: Daily) => {
    if (!groupId) return;
    const { data: inserted, error } = await createDaily(
      groupId,
      next.title,
      next.content,
    );
    if (error || !inserted) {
      console.error("[GroupDailyContent] insert error", error);
      return;
    }

    const newItem: DailyWithPostId = {
      id: 0,
      postId: inserted.post_id,
      groupId: inserted.group_id,
      userId: inserted.user_id,
      title: next.title ?? "",
      content: next.content ?? "",
      date: (inserted.post_created_at ?? today()).slice(0, 10),
      isRead: false,
      writer: user?.nickname ?? "익명",
      likedCount: 0,
      imageUrl:
        resolveStorageUrl(getFirstImageUrl(next.content)) ??
        getFirstImageUrl(next.content),
      viewCount: 0,
    };

    setItems((prev) => {
      const withNew = [newItem, ...prev];
      const re = reindex(withNew);
      setDetailId(re[0].id);
      return re;
    });

    // 생성 직후 상세로 진입하므로 URL 기록
    setQS({ post: newItem.postId, view: "detail" });

    void bumpDailyView(newItem.postId);
    setIsCreating(false);
    setPage(1);
  };

  // 수정
  const handleUpdateSave = async (next: DailyWithPostId) => {
    const uid = currentUserId;
    if (!uid || uid !== next.userId) {
      alert("작성자만 수정할 수 있습니다.");
      return;
    }
    const { error } = await updateDaily(
      next.postId,
      uid,
      next.title,
      next.content,
    );
    if (error) {
      console.error("[GroupDailyContent] update error", error);
      alert("수정 권한이 없거나 오류가 발생했습니다.");
      return;
    }
    setItems((prev) =>
      prev.map((it) =>
        it.postId === next.postId
          ? { ...it, title: next.title, content: next.content }
          : it,
      ),
    );

    // 저장 후에도 상세 유지
    setQS({ post: next.postId, view: "detail" }, true);
  };

  // 삭제
  const handleDelete = async (postId: string) => {
    const target = items.find((it) => it.postId === postId);
    if (!target) return;

    const uid = currentUserId;
    if (!uid || uid !== target.userId) {
      alert("작성자만 삭제할 수 있습니다.");
      return;
    }
    const { error } = await deleteDaily(postId, uid);
    if (error) {
      console.error("[GroupDailyContent] delete error", error);
      alert("삭제 권한이 없거나 오류가 발생했습니다.");
      return;
    }
    setItems((prev) => prev.filter((it) => it.postId !== postId));
    setDetailId(null);
    setQS({ post: undefined, view: undefined });
  };

  // 로딩 스켈레톤
  const SkeletonCard = () => (
    <div className="relative flex h-[233px] flex-col rounded-sm bg-white text-left transition px-4 py-1">
      <div className="w-[290px] h-[160px] bg-gray-100 rounded-sm" />
      <div className="mt-2 h-[18px] w-[70%] bg-gray-100 rounded" />
      <div className="mt-1 h-[14px] w-[40%] bg-gray-100 rounded" />
      <div className="mt-1 h-[14px] w-[50%] bg-gray-100 rounded" />
    </div>
  );

  return (
    <div className="w-[975px] bg-white overflow-hidden">
      <AnimatePresence mode="wait">
        {isCreating ? (
          // 작성 뷰
          <motion.div
            key="daily-create"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <GroupDailyDetailEdit
              daily={emptyDaily}
              onCancel={() => setIsCreating(false)}
              onSave={handleCreateSave}
            />
          </motion.div>
        ) : detailId == null ? (
          // 리스트 뷰
          <motion.div
            key="daily-list"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {loading ? (
              <div className="grid grid-cols-3 auto-rows-fr gap-3 py-6">
                {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                등록된 글이 없습니다.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 auto-rows-fr gap-3 py-6">
                  {pageItems.map((daily) => {
                    const likeCount =
                      likeCountMap[daily.postId] ?? daily.likedCount ?? 0;
                    const thumb =
                      resolveStorageUrl(daily.imageUrl) ??
                      daily.imageUrl ??
                      NO_IMAGE;

                    return (
                      <button
                        key={daily.id}
                        type="button"
                        onClick={() => openDetail(daily.id)}
                        className="relative flex h-[233px] flex-col rounded-sm bg-white text-left transition px-4 py-1"
                      >
                        {/* 썸네일 */}
                        <img
                          src={thumb}
                          alt="썸네일"
                          className="w-[290px] h-[160px] object-cover rounded-sm"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = NO_IMAGE;
                          }}
                        />

                        <h3 className="mt-1 line-clamp-1 text-md font-bold text-[#000]">
                          {daily.title || "제목 없음"}
                        </h3>
                        <span className="text-sm text-gray-400">
                          작성일자: {daily.date}
                        </span>

                        <div className="flex w-full justify-between items-center">
                          {/* 작성자 프로필 + 닉네임 */}
                          {daily.writer && (
                            <div className="flex items-center justify-center gap-1 leading-none">
                              <AvatarImg
                                src={
                                  profileByPostId[daily.postId] as string | null
                                }
                                alt={`${daily.writer} 프로필`}
                                className="w-[13px] h-[13px] rounded-full object-cover border border-gray-200"
                              />
                              <span className="text-sm text-[#666] flex items-center pt-[2px]">
                                {daily.writer}
                              </span>
                            </div>
                          )}

                          {/* 좋아요 (UI 그대로, 값만 연결) */}
                          <div className="flex items-center gap-1 text-sm text-[#8c8c8c] justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="#6c6c6c"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                              className="w-[13px] h-[13px]"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                              />
                            </svg>
                            <span className="leading-none">
                              좋아요 {likeCount}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <GroupPagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </>
            )}
          </motion.div>
        ) : (
          // 상세 뷰
          <motion.div
            key="daily-detail"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {selectedDaily ? (
              <GroupDailyDetailView
                daily={selectedDaily}
                currentUserId={currentUserId}
                // currentAvatar={currentAvatar}
                likeCount={
                  likeCountMap[selectedDaily.postId] ??
                  selectedDaily.likedCount ??
                  0
                }
                liked={!!likedByMe[selectedDaily.postId]}
                onToggleLike={() =>
                  toggleLike(selectedDaily.postId, currentUserId)
                }
                onDelete={async (pid: string) => handleDelete(pid)}
                onSave={async (next: any) => handleUpdateSave(next)}
                closeDetail={closeDetail}
              />
            ) : (
              <div className="p-8 text-center">
                <p>해당 글을 찾을 수 없습니다.</p>
                <button
                  onClick={closeDetail}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  돌아가기
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
