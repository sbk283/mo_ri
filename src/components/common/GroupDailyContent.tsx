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

  // 목록 state
  const [items, setItems] = useState<Daily[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 조회
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
        setLoading(false);
        return;
      }

      const mapped: Daily[] =
        (data ?? []).map((row: any, idx: number) => ({
          id: idx + 1, // 화면용 로컬 id
          title: row.post_title ?? '',
          content: row.post_body_md ?? '',
          date: (row.post_created_at ?? '').slice(0, 10),
          isRead: false,
          writer: row.user_profiles?.nickname ?? '익명',
          likedCount: 0,
          imageUrl: row.user_profiles?.avatar_url ?? null,
          // post_id: row.post_id  // 필요하면 타입 확장해서 보관
        })) ?? [];

      setItems(mapped);
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

  // 상세/작성 모드
  const [detailId, setDetailId] = useState<number | null>(null);
  const openDetail = (id: number) => setDetailId(id);
  const closeDetail = () => setDetailId(null);

  // 새 글 기본값
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

  // 작성 저장: DB insert → 재조회 → 상세 이동
  const handleCreateSave = async (next: Daily) => {
    if (!groupId) return;

    const { data: userRes, error: authErr } = await supabase.auth.getUser();
    if (authErr || !userRes?.user?.id) {
      console.error('[GroupDailyContent] auth error', authErr);
      return;
    }
    const userId = userRes.user.id;

    const { error } = await supabase.from('group_posts').insert({
      user_id: userId, // ✅ RLS with_check 통과
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

    // 재조회
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

    const mapped: Daily[] =
      (data ?? []).map((row: any, idx: number) => ({
        id: idx + 1,
        title: row.post_title ?? '',
        content: row.post_body_md ?? '',
        date: (row.post_created_at ?? '').slice(0, 10),
        isRead: false,
        writer: row.user_profiles?.nickname ?? '익명',
        likedCount: 0,
        imageUrl: row.user_profiles?.avatar_url ?? null,
      })) ?? [];

    setItems(mapped);
    setIsCreating(false);
    setPage(1);
    setDetailId(mapped[0]?.id ?? null);
  };

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
              <div className="p-6 text-center text-gray-500">불러오는 중...</div>
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
                      <img
                        src={daily.imageUrl ?? '/images/nacta.png'}
                        alt="썸네일"
                        className="w-[290px] h-[160px] object-cover"
                      />
                      <h3 className="mt-1 line-clamp-1 text-md font-bold text-[#000]">
                        {daily.title}
                      </h3>
                      <span className="text-sm text-gray-400">{daily.date}</span>
                      <div className="flex w-full justify-between">
                        {daily.writer && (
                          <span className="text-sm text-gray-400">{daily.writer}</span>
                        )}
                        {daily.likedCount !== undefined && (
                          <span className="text-sm text-gray-400">💜좋아요{daily.likedCount}</span>
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
            <GroupDailyDetail id={detailId} onBack={closeDetail} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
