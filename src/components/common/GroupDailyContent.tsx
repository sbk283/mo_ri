// src/components/common/GroupDailyContent.tsx
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Daily } from '../../types/daily';
import GroupPagination from './GroupPagination';
import GroupDailyDetailEdit from '../GroupDailyDetailEdit';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { supabase } from '../../lib/supabase';

const ITEMS_PER_PAGE = 6;
const today = () => new Date().toISOString().slice(0, 10);

const getFirstImageUrl = (content: string | null | undefined): string | null => {
  if (!content) return null;

  const htmlMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (htmlMatch?.[1]) return htmlMatch[1];

  const mdMatch = content.match(/!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/);
  if (mdMatch?.[1]) return mdMatch[1];

  const urlMatch = content.match(/(https?:\/\/[^\s"'<>]+\.(?:png|jpe?g|gif|webp|avif|svg))/i);
  if (urlMatch?.[1]) return urlMatch[1];

  return null;
};

// 상세 이미지 파싱 유틸 (UI 변경 없음)
const extractAllImageUrls = (content?: string | null): string[] => {
  if (!content) return [];
  const urls = new Set<string>();
  for (const m of content.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)) if (m[1]) urls.add(m[1]);
  for (const m of content.matchAll(/!\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/g))
    if (m[1]) urls.add(m[1]);
  for (const m of content.matchAll(/(https?:\/\/[^\s"'<>]+\.(?:png|jpe?g|gif|webp|avif|svg))/gi))
    if (m[1]) urls.add(m[1]);
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

type DailyWithPostId = Daily & {
  postId: string;
  userId: string; // 권한 판별용
  groupId: string; // 필요시 확장
  viewCount: number;
};

export default function GroupDailyContent({
  groupId,
  createRequestKey = 0,
  onCraftingChange,
}: {
  groupId?: string;
  createRequestKey?: number;
  onCraftingChange?: (v: boolean) => void;
}) {
  // useCurrentUser는 { id, nickname, profileImageUrl }를 반환한다고 가정
  const user = useCurrentUser();
  const currentUserId = user?.id ?? null;

  const [isCreating, setIsCreating] = useState(false);
  const prevKey = useRef(createRequestKey);

  // 외부 트리거 → 작성 모드 진입
  useEffect(() => {
    if (createRequestKey > prevKey.current) setIsCreating(true);
    prevKey.current = createRequestKey;
  }, [createRequestKey]);

  // 작성 모드 변경 시 부모 알림
  useEffect(() => {
    onCraftingChange?.(isCreating);
  }, [isCreating, onCraftingChange]);

  useEffect(() => () => onCraftingChange?.(false), [onCraftingChange]);

  const [items, setItems] = useState<DailyWithPostId[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [profileByPostId, setProfileByPostId] = useState<Record<string, string | null>>({});

  // 목록 로드 (UI 유지)
  useEffect(() => {
    if (!groupId) return;
    let ignore = false;

    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('group_posts')
        .select(
          `
          post_id,
          group_id,
          user_id,
          post_title,
          post_body_md,
          post_created_at,
          view_count,
          user_profiles:user_profiles!group_posts_user_id_fkey(nickname, avatar_url)
        `,
        )
        .eq('group_id', groupId)
        .eq('board_type', 'daily')
        .order('post_created_at', { ascending: false });

      if (ignore) return;

      if (error) {
        console.error('[GroupDailyContent] load error', error);
        setItems([]);
        setProfileByPostId({});
        setLoading(false);
        return;
      }

      const mapped: DailyWithPostId[] = (data ?? []).map((row: any, idx: number) => {
        const content: string = row.post_body_md ?? '';
        const thumbnail = getFirstImageUrl(content);
        return {
          id: idx + 1,
          postId: row.post_id,
          groupId: row.group_id,
          userId: row.user_id,
          title: row.post_title ?? '',
          content,
          date: (row.post_created_at ?? '').slice(0, 10),
          isRead: false,
          writer: row.user_profiles?.nickname ?? '익명',
          likedCount: 0,
          imageUrl: thumbnail,
          viewCount: row.view_count ?? 0,
        };
      });

      const profiles: Record<string, string | null> = {};
      (data ?? []).forEach((row: any) => {
        profiles[row.post_id] = row.user_profiles?.avatar_url ?? null;
      });

      setItems(mapped);
      setProfileByPostId(profiles);
      setLoading(false);
    })();

    return () => {
      ignore = true;
    };
  }, [groupId]);

  // 조회수 (RPC 제거 그대로)
  const viewedKey = (postId: string) => `viewed_${postId}_${today()}`;
  const hasViewed = (postId: string) => {
    try {
      return sessionStorage.getItem(viewedKey(postId)) === '1';
    } catch {
      return false;
    }
  };
  const markViewed = (postId: string) => {
    try {
      sessionStorage.setItem(viewedKey(postId), '1');
    } catch {}
  };

  const bumpViewCount = async (postId: string) => {
    if (!groupId || hasViewed(postId)) return;
    const { data: sel, error: selErr } = await supabase
      .from('group_posts')
      .select('view_count')
      .eq('post_id', postId)
      .single();

    if (!selErr) {
      const next = (sel?.view_count ?? 0) + 1;
      const { error: updErr } = await supabase
        .from('group_posts')
        .update({ view_count: next })
        .eq('post_id', postId);
      if (!updErr) {
        setItems(prev => prev.map(it => (it.postId === postId ? { ...it, viewCount: next } : it)));
        markViewed(postId);
      }
    }
  };

  // 페이지네이션 (UI 유지)
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
  const openDetail = (id: number) => {
    setDetailId(id);
    setIsCreating(false);
    const post = items.find(d => d.id === id);
    if (post) void bumpViewCount(post.postId);
  };
  const closeDetail = () => setDetailId(null);

  const selectedDaily = useMemo<DailyWithPostId | null>(
    () => (detailId ? (items.find(d => d.id === detailId) ?? null) : null),
    [detailId, items],
  );

  // 작성용 기본값 (UI 유지)
  const emptyDaily: Daily = {
    id: 0,
    title: '',
    content: '',
    date: today(),
    isRead: false,
    writer: user?.nickname ?? '익명',
    likedCount: 0,
    imageUrl: user?.profileImageUrl ?? null,
  };

  // 작성 저장 (UI 영향 없음)
  const handleCreateSave = async (next: Daily) => {
    if (!groupId) return;
    const { data: userRes } = await supabase.auth.getUser();
    const userId = userRes?.user?.id;
    if (!userId) return;

    const { error } = await supabase.from('group_posts').insert({
      user_id: userId,
      group_id: groupId,
      board_type: 'daily',
      post_title: next.title,
      post_body_md: next.content,
    });
    if (error) {
      console.error('[GroupDailyContent] insert error', error);
      return;
    }
    setIsCreating(false);
    setPage(1);
  };

  // 수정 저장 — 서버/클라 모두 권한 체크 (UI 변경 없음)
  const handleUpdateSave = async (next: DailyWithPostId) => {
    if (!currentUserId || currentUserId !== next.userId) {
      alert('작성자만 수정할 수 있습니다.');
      return;
    }

    const { error } = await supabase
      .from('group_posts')
      .update({ post_title: next.title, post_body_md: next.content })
      .eq('post_id', next.postId)
      .eq('user_id', currentUserId);

    if (error) {
      console.error('[GroupDailyContent] update error', error);
      alert('수정 권한이 없거나 오류가 발생했습니다.');
      return;
    }

    setItems(prev =>
      prev.map(it =>
        it.postId === next.postId ? { ...it, title: next.title, content: next.content } : it,
      ),
    );
  };

  // 삭제 — 서버/클라 모두 권한 체크 (UI 변경 없음)
  const handleDelete = async (postId: string) => {
    const target = items.find(it => it.postId === postId);
    if (!target) return;

    if (!currentUserId || currentUserId !== target.userId) {
      alert('작성자만 삭제할 수 있습니다.');
      return;
    }

    const { error } = await supabase
      .from('group_posts')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', currentUserId);

    if (error) {
      console.error('[GroupDailyContent] delete error', error);
      alert('삭제 권한이 없거나 오류가 발생했습니다.');
      return;
    }

    setItems(prev => prev.filter(it => it.postId !== postId));
    setDetailId(null);
  };

  // 로딩 스켈레톤 (UI 그대로)
  const SkeletonCard = () => (
    <div className="relative flex h-[233px] flex-col rounded-sm bg-white text-left transition px-4 py-1">
      <div className="w-[290px] h-[160px] bg-gray-200 animate-pulse rounded-sm" />
      <div className="mt-2 h-[18px] w-[70%] bg-gray-200 animate-pulse rounded" />
      <div className="mt-1 h-[14px] w-[40%] bg-gray-200 animate-pulse rounded" />
      <div className="mt-1 h-[14px] w-[50%] bg-gray-200 animate-pulse rounded" />
    </div>
  );

  // ===== 상세 화면(내장) — 기존 UI 그대로, 버튼만 조건부 표시 =====
  const DetailView = ({ d }: { d: DailyWithPostId }) => {
    const [editMode, setEditMode] = useState(false);
    const allImages = useMemo(() => extractAllImageUrls(String(d.content ?? '')), [d.content]);
    const contentWithoutImages = useMemo(
      () => stripAllImages(String(d.content ?? '')),
      [d.content],
    );
    const canEditDelete = !!currentUserId && currentUserId === d.userId;

    // 기존 클래스/마크업 유지
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
              daily={d}
              onCancel={() => setEditMode(false)}
              onSave={next => {
                handleUpdateSave(next as DailyWithPostId);
                setEditMode(false);
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
              <header className="px-8 pt-6">
                <div className="flex">
                  <h1 className="text-xl font-bold text-gray-800 leading-snug mb-3">{d.title}</h1>
                </div>
                <div className="flex items-center text-[#8C8C8C] text-md gap-3">
                  <span>{d.date}</span>
                  <span>조회수 {d.viewCount ?? 0}</span>
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
                    <span className="leading-3">좋아요 {d.likedCount ?? 0}</span>
                  </div>
                  <a href="/inquiry" className="text-sm text-end ml-auto text-[#8C8C8C]">
                    신고하기
                  </a>
                </div>
              </header>

              <div className="text-center">
                <div className="inline-block border-b-[1px] border-[#A3A3A3] w-[910px]" />
              </div>

              <section className="px-8 py-8 text-gray-800 leading-relaxed">
                {allImages.length > 0 && (
                  <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {allImages.map((src, i) => (
                      <motion.img
                        key={`${src}-${i}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        src={src}
                        alt={`${d.title} 이미지 ${i + 1}`}
                        className="w-full h-auto rounded-sm object-cover"
                      />
                    ))}
                  </div>
                )}

                {typeof d.content === 'string' && d.content.trim().startsWith('<') ? (
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
                <div className="inline-block border-b-[1px] border-[#A3A3A3] w-[910px]" />
              </div>
            </article>

            <footer className="py-6 flex text-left justify-start">
              <button onClick={closeDetail} className="text-[#8C8C8C] py-2 transition text-md">
                &lt; 목록으로
              </button>

              {/* ⬇️ 버튼 UI/클래스는 그대로. 작성자만 표시 */}
              {canEditDelete ? (
                <div className="ml-auto flex py-2">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    className="text-md w-[50px] h-[32px] flex justify-center items-center text-center mr-4 text-[#0689E8] border border-[#0689E8] rounded-sm transition"
                    onClick={() => handleDelete(d.postId)}
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
              ) : (
                // 레이아웃 흔들림 방지용 빈 공간 (UI 유지)
                <div className="ml-auto flex py-2" style={{ width: 50 + 8 + 50 }} />
              )}
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <div className="w-[975px] bg-white overflow-hidden">
      <AnimatePresence mode="wait">
        {isCreating ? (
          // 작성 뷰 (UI 그대로)
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
          // 리스트 뷰 (UI 그대로)
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
              <div className="p-6 text-center text-gray-500">등록된 글이 없습니다.</div>
            ) : (
              <>
                <div className="grid grid-cols-3 auto-rows-fr gap-3 py-6">
                  {pageItems.map(daily => (
                    <button
                      key={daily.id}
                      type="button"
                      onClick={() => openDetail(daily.id)}
                      className="relative flex h-[233px] flex-col rounded-sm bg-white text-left transition px-4 py-1"
                    >
                      {/* 썸네일 (UI 그대로) */}
                      {daily.imageUrl ? (
                        <img
                          src={daily.imageUrl}
                          alt="썸네일"
                          className="w-[290px] h-[160px] object-cover rounded-sm"
                        />
                      ) : (
                        <div className="w-[290px] h-[160px] bg-gray-200 animate-pulse rounded-sm flex items-center justify-center">
                          <span className="text-gray-400 text-sm">이미지 없음</span>
                        </div>
                      )}

                      <h3 className="mt-1 line-clamp-1 text-md font-bold text-[#000]">
                        {daily.title || '제목 없음'}
                      </h3>
                      <span className="text-sm text-gray-400">작성일자: {daily.date}</span>

                      <div className="flex w-full justify-between items-center">
                        {/* 작성자 프로필 + 닉네임 (UI 그대로) */}
                        {daily.writer && (
                          <div className="flex items-center justify-center gap-1 leading-none">
                            {profileByPostId[daily.postId] ? (
                              <img
                                src={profileByPostId[daily.postId] as string}
                                alt={`${daily.writer} 프로필`}
                                className="w-[13px] h-[13px] rounded-full object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="w-[13px] h-[13px] rounded-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-500">
                                ?
                              </div>
                            )}
                            <span className="text-sm text-[#666] flex items-center pt-[2px]">
                              {daily.writer}
                            </span>
                          </div>
                        )}

                        {/* 좋아요 (UI 그대로) */}
                        {daily.likedCount !== undefined && (
                          <div className="flex items-center gap-1 text-sm text-[#8c8c8c] justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                              className="w-[13px] h-[13px] mb-1"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                              />
                            </svg>
                            <span className="leading-none">좋아요 {daily.likedCount ?? 0}</span>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <GroupPagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </>
            )}
          </motion.div>
        ) : (
          // 상세 뷰(내장) — 기존 UI 그대로
          <motion.div
            key="daily-detail"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {selectedDaily ? (
              <DetailView d={selectedDaily} />
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
