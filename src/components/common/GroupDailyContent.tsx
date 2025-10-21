// src/components/common/GroupDailyContent.tsx
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Daily } from '../../types/daily';
import GroupPagination from '../common/GroupPagination';
import GroupDailyDetail from '../GroupDailyDetail';
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

type DailyWithPostId = Daily & { postId: string };

export default function GroupDailyContent({
  groupId,
  createRequestKey = 0,
}: {
  groupId?: string;
  createRequestKey?: number;
}) {
  const user = useCurrentUser();

  const [isCreating, setIsCreating] = useState(false);
  const prevKey = useRef(createRequestKey);

  useEffect(() => {
    if (createRequestKey > prevKey.current) setIsCreating(true);
    prevKey.current = createRequestKey;
  }, [createRequestKey]);

  const [items, setItems] = useState<DailyWithPostId[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // ✅ postId → 작성자 avatar_url 매핑 (타입/프롭 변경 없이 별도 상태로 보관)
  const [profileByPostId, setProfileByPostId] = useState<Record<string, string | null>>({});

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
          post_title,
          post_body_md,
          post_created_at,
          user_profiles:user_profiles!group_posts_user_id_fkey(nickname, avatar_url)
        `,
        )
        .eq('group_id', groupId)
        .eq('board_type', 'daily')
        .order('post_created_at', { ascending: false });

      if (ignore) return;

      if (error) {
        console.error('[GroupDailyContent] load error', {
          message: error.message,
          details: (error as any).details,
          hint: (error as any).hint,
          code: error.code,
        });
        setItems([]);
        setProfileByPostId({});
        setLoading(false);
        return;
      }

      const mapped: DailyWithPostId[] =
        (data ?? []).map((row: any, idx: number) => {
          const content: string = row.post_body_md ?? '';
          const thumbnail = getFirstImageUrl(content); // 목록 썸네일: 본문 첫 이미지
          return {
            id: idx + 1,
            postId: row.post_id,
            title: row.post_title ?? '',
            content,
            date: (row.post_created_at ?? '').slice(0, 10),
            isRead: false,
            writer: row.user_profiles?.nickname ?? '익명',
            likedCount: 0,
            imageUrl: thumbnail,
          };
        }) ?? [];

      // 작성자 프로필 매핑 채우기
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

  // 페이지네이션
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [items.length]);
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE)),
    [items.length],
  );
  const pageItems = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return items.slice(start, end);
  }, [page, items]);

  const [detailId, setDetailId] = useState<number | null>(null);
  const openDetail = (id: number) => setDetailId(id);
  const closeDetail = () => setDetailId(null);

  const selectedDaily = useMemo(
    () => (detailId ? (items.find(d => d.id === detailId) ?? null) : null),
    [detailId, items],
  );

  const emptyDaily: Daily = {
    id: 0,
    title: '',
    content: '',
    date: today(),
    isRead: false,
    writer: user?.nickname ?? '익명',
    likedCount: 0,
    imageUrl: user?.profileImageUrl ?? null, // 새 글 작성 전 미리보기 용
  };

  const handleCreateSave = async (next: Daily) => {
    if (!groupId) return;

    const { data: userRes, error: authErr } = await supabase.auth.getUser();
    if (authErr || !userRes?.user?.id) {
      console.error('[GroupDailyContent] auth error', authErr);
      return;
    }
    const userId = userRes.user.id;

    const { error } = await supabase.from('group_posts').insert({
      user_id: userId,
      group_id: groupId,
      board_type: 'daily',
      post_title: next.title,
      post_body_md: next.content,
    });

    if (error) {
      console.error('[GroupDailyContent] insert error', {
        message: error.message,
        details: (error as any).details,
        hint: (error as any).hint,
        code: error.code,
      });
      return;
    }

    // 재조회 (썸네일/프로필 포함)
    const { data, error: loadErr } = await supabase
      .from('group_posts')
      .select(
        `
        post_id,
        post_title,
        post_body_md,
        post_created_at,
        user_profiles:user_profiles!group_posts_user_id_fkey(nickname, avatar_url)
      `,
      )
      .eq('group_id', groupId)
      .eq('board_type', 'daily')
      .order('post_created_at', { ascending: false });

    if (loadErr) {
      console.error('[GroupDailyContent] reload error', {
        message: loadErr.message,
        details: (loadErr as any).details,
        hint: (loadErr as any).hint,
        code: loadErr.code,
      });
      return;
    }

    const mapped: DailyWithPostId[] =
      (data ?? []).map((row: any, idx: number) => {
        const content: string = row.post_body_md ?? '';
        const thumbnail = getFirstImageUrl(content);
        return {
          id: idx + 1,
          postId: row.post_id,
          title: row.post_title ?? '',
          content,
          date: (row.post_created_at ?? '').slice(0, 10),
          isRead: false,
          writer: row.user_profiles?.nickname ?? '익명',
          likedCount: 0,
          imageUrl: thumbnail,
        };
      }) ?? [];

    const profiles: Record<string, string | null> = {};
    (data ?? []).forEach((row: any) => {
      profiles[row.post_id] = row.user_profiles?.avatar_url ?? null;
    });

    setItems(mapped);
    setProfileByPostId(profiles);
    setIsCreating(false);
    setPage(1);
    setDetailId(mapped[0]?.id ?? null);
  };

  // 상세 저장(수정): DB update → 목록 반영 (썸네일 재계산 포함)
  const handleUpdateSave = async (next: DailyWithPostId) => {
    const { error: updErr } = await supabase
      .from('group_posts')
      .update({
        post_title: next.title,
        post_body_md: next.content,
      })
      .eq('post_id', next.postId);

    if (updErr) {
      console.error('[GroupDailyContent] update error', updErr);
      return;
    }

    // 화면 갱신 (첫 이미지 다시 계산)
    const newThumb = getFirstImageUrl(next.content);
    setItems(prev =>
      prev.map(it =>
        it.postId === next.postId
          ? { ...it, title: next.title, content: next.content, imageUrl: newThumb }
          : it,
      ),
    );
  };

  // 삭제
  const handleDelete = async (postId: string) => {
    const { error: delErr } = await supabase.from('group_posts').delete().eq('post_id', postId);
    if (delErr) {
      console.error('[GroupDailyContent] delete error', delErr);
      return;
    }
    setItems(prev => prev.filter(it => it.postId !== postId));
    setDetailId(null);
  };

  // 로딩 스켈레톤 카드
  const SkeletonCard = () => (
    <div className="relative flex h-[233px] flex-col rounded-sm bg-white text-left transition px-4 py-1">
      <div className="w-[290px] h-[160px] bg-gray-200 animate-pulse rounded-sm" />
      <div className="mt-2 h-[18px] w-[70%] bg-gray-200 animate-pulse rounded" />
      <div className="mt-1 h-[14px] w-[40%] bg-gray-200 animate-pulse rounded" />
      <div className="mt-1 h-[14px] w-[50%] bg-gray-200 animate-pulse rounded" />
    </div>
  );

  return (
    <div className="w-[970px] bg-white overflow-hidden">
      <AnimatePresence mode="wait">
        {isCreating ? (
          // ===== 작성(에디트) 뷰 =====
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
          // ===== 리스트 뷰 =====
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
                      {/* 본문 첫 이미지 썸네일 */}
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
                        {/* 작성자 프로필 사진 + 닉네임 */}
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

                        {/* 좋아요(하트 SVG + 숫자) */}
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
          // ===== 상세 뷰 =====
          <motion.div
            key="daily-detail"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {selectedDaily ? (
              <GroupDailyDetail
                daily={selectedDaily}
                onBack={closeDetail}
                onSave={handleUpdateSave}
                onDelete={() => handleDelete(selectedDaily.postId)}
              />
            ) : (
              <div className="p-8 text-center">
                <p>⚠️ 해당 글을 찾을 수 없습니다.</p>
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
