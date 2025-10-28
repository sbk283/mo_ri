// src/components/dashboard/DashboardNotice.tsx
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import GroupPagination from '../common/GroupPagination';
import { supabase } from '../../lib/supabase';
import GroupContentDetailEdit from './GroupContentDetailEdit';
import type { Notice } from '../../types/notice';

const ITEMS_PER_PAGE = 10;
const BUCKET = 'group-post-images';
const PREFIX = 'notice';
const today = () => new Date().toISOString().slice(0, 10);

type NoticeRow = Notice & {
  post_id: string;
  likes: number;
  liked: boolean;
};

const isHttp = (u?: string | null) => !!u && /^https?:\/\//i.test(u);
const isPublicPath = (u?: string | null) => !!u && /\/storage\/v1\/object\/public\//i.test(u);

const buildKey = (groupId: string, filename: string) => {
  const ts = Date.now();
  const ext = (filename.split('.').pop() || 'png').toLowerCase();
  const uuid = (
    typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${ts}`
  ) as string;
  return `${PREFIX}/${groupId}/${ts}-${uuid}.${ext}`;
};

const resolvePostImageUrl = (raw?: string | null, groupId?: string | null): string | null => {
  if (!raw) return null;
  if (isHttp(raw) || isPublicPath(raw)) return raw;
  let key = raw.replace(/^\/+/, '');
  if (groupId && !key.startsWith(`${PREFIX}/${groupId}/`)) {
    if (key.startsWith(`${groupId}/`)) key = `${PREFIX}/${key}`;
    else key = `${PREFIX}/${groupId}/${key}`;
  }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(key);
  return data?.publicUrl ?? null;
};

const resolveAllImageSrcInHtml = (html?: string | null, groupId?: string | null): string => {
  if (!html) return '';
  return html.replace(/<img\b([^>]*?)\bsrc=["']([^"']+)["']([^>]*)>/gi, (_m, pre, src, post) => {
    const resolved = resolvePostImageUrl(src, groupId) || src;
    return `<img${pre}src="${resolved}"${post}>`;
  });
};

async function externalizeInlineImages(html: string, groupId: string): Promise<string> {
  const matches = Array.from(
    html.matchAll(/<img\b[^>]*\bsrc=["'](data:image\/[^"']+)["'][^>]*>/gi),
  );
  if (matches.length === 0) return html;

  let out = html;
  for (const m of matches) {
    const dataUrl = m[1] as string;
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const mime = blob.type || 'image/png';
      const ext = mime.split('/')[1] || 'png';
      const key = buildKey(groupId, `inline.${ext}`);

      const { error: upErr } = await supabase.storage.from(BUCKET).upload(key, blob, {
        upsert: false,
        cacheControl: '3600',
        contentType: mime,
      });
      if (upErr) continue;

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(key);
      if (data?.publicUrl) out = out.replace(dataUrl, data.publicUrl);
    } catch {
      // skip
    }
  }
  return out;
}

export function DashboardNotice({
  groupId,
  boardType = 'notice',
  createRequestKey = 0,
  onCraftingChange,
}: {
  groupId?: string;
  boardType?: string;
  createRequestKey?: number;
  onCraftingChange?: (v: boolean) => void;
}) {
  const [isHost, setIsHost] = useState(false);
  const [creating, setCreating] = useState(false);
  const prevKey = useRef(createRequestKey);

  const [items, setItems] = useState<NoticeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [likeBusy, setLikeBusy] = useState<Set<string>>(new Set()); // post_id 단위 락

  // 호스트 여부
  useEffect(() => {
    let ignore = false;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id;
      if (!groupId || !userId) {
        if (!ignore) setIsHost(false);
        return;
      }
      const { data } = await supabase
        .from('group_members')
        .select('member_role')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .maybeSingle();
      if (!ignore) setIsHost(String(data?.member_role ?? '').toLowerCase() === 'host');
    })();
    return () => {
      ignore = true;
    };
  }, [groupId]);

  // 작성 트리거
  useEffect(() => {
    if (createRequestKey > prevKey.current && isHost) setCreating(true);
    prevKey.current = createRequestKey;
  }, [createRequestKey, isHost]);
  useEffect(() => {
    onCraftingChange?.(creating);
  }, [creating, onCraftingChange]);

  // 목록 불러오기(+ 좋아요 집계)
  const reload = async (): Promise<NoticeRow[]> => {
    if (!groupId) return [];
    setLoading(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id ?? null;
      setMyUserId(userId);

      const { data: posts, error: postsErr } = await supabase
        .from('group_posts')
        .select('post_id, post_title, post_body_md, post_created_at, view_count')
        .eq('group_id', groupId)
        .eq('board_type', boardType)
        .order('post_created_at', { ascending: false });
      if (postsErr) throw postsErr;

      // 읽음
      let readSet = new Set<string>();
      if (userId && posts?.length) {
        const ids = posts.map(p => p.post_id);
        const { data: reads } = await supabase
          .from('group_post_reads')
          .select('post_id')
          .eq('user_id', userId)
          .in('post_id', ids);
        if (reads?.length) readSet = new Set(reads.map(r => r.post_id as string));
      }

      // 좋아요 전체 + 내 좋아요
      const likeCountById: Record<string, number> = {};
      const myLiked = new Set<string>();
      if (posts?.length) {
        const ids = posts.map(p => p.post_id);
        const { data: likesAll } = await supabase
          .from('group_post_likes')
          .select('post_id, user_id')
          .in('post_id', ids);
        (likesAll ?? []).forEach(r => {
          likeCountById[r.post_id] = (likeCountById[r.post_id] ?? 0) + 1;
          if (userId && r.user_id === userId) myLiked.add(r.post_id);
        });
      }

      const mapped: NoticeRow[] =
        (posts ?? []).map((r, i) => ({
          id: i + 1,
          post_id: r.post_id,
          title: r.post_title ?? '',
          content: resolveAllImageSrcInHtml(r.post_body_md ?? '', groupId),
          date: (r.post_created_at ?? '').slice(0, 10),
          isRead: readSet.has(r.post_id),
          views: Number(r.view_count ?? 0),
          likes: likeCountById[r.post_id] ?? 0,
          liked: myLiked.has(r.post_id),
        })) ?? [];

      setItems(mapped);
      return mapped;
    } catch (e) {
      console.error('reload error', e);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, [groupId, boardType]);

  // 유틸: post_id로 단일 항목 갱신
  const patchItem = (postId: string, updater: (cur: NoticeRow) => NoticeRow) => {
    setItems(prev => prev.map(it => (it.post_id === postId ? updater(it) : it)));
  };

  // 서버 진실값으로 재조정
  const reconcileLikeFromServer = async (postId: string) => {
    const { data: all } = await supabase
      .from('group_post_likes')
      .select('post_id, user_id')
      .eq('post_id', postId);

    const count = (all ?? []).length;
    const liked = !!(all ?? []).find(r => r.user_id === myUserId);
    patchItem(postId, cur => ({ ...cur, likes: count, liked }));
  };

  // 좋아요 토글(낙관적 → 서버 → 재조정)
  const toggleLike = async (postId: string) => {
    if (!myUserId) {
      alert('로그인이 필요합니다.');
      return;
    }
    // 락
    setLikeBusy(prev => {
      if (prev.has(postId)) return prev;
      const next = new Set(prev);
      next.add(postId);
      return next;
    });

    // 현재 스냅샷
    const cur = items.find(it => it.post_id === postId);
    if (!cur) {
      // 해제 락
      setLikeBusy(prev => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
      return;
    }

    const optimisticLiked = !cur.liked;

    // 1) 낙관적 반영
    patchItem(postId, c => ({
      ...c,
      liked: optimisticLiked,
      likes: Math.max(0, c.likes + (optimisticLiked ? 1 : -1)),
    }));

    // 2) 서버 적용
    try {
      if (optimisticLiked) {
        const { error } = await supabase
          .from('group_post_likes')
          .insert({ post_id: postId, user_id: myUserId });
        // @ts-ignore 23505(중복) 허용
        if (error && error.code !== '23505') throw error;
      } else {
        const { error } = await supabase
          .from('group_post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', myUserId);
        if (error) throw error;
      }
    } catch (e) {
      console.error('toggle like error', e);
      // 실패 시 즉시 서버값으로 재조정
      await reconcileLikeFromServer(postId);
    } finally {
      // 3) 최종 서버값으로 한 번 더 맞춤(경쟁/레이스 대비)
      await reconcileLikeFromServer(postId);
      // 락 해제
      setLikeBusy(prev => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    }
  };

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

  // 상세
  const [detailIdx, setDetailIdx] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);

  const openDetail = async (localId: number) => {
    const idx = items.findIndex(n => n.id === localId);
    if (idx < 0) return;

    const t = items[idx];
    const { data: u } = await supabase.auth.getUser();
    const userId = u?.user?.id;

    if (groupId && userId && t?.post_id) {
      const wasRead = t.isRead;
      const base = supabase
        .from('group_post_reads')
        .upsert(
          { post_id: t.post_id, user_id: userId },
          { onConflict: 'post_id,user_id', ignoreDuplicates: true },
        );
      const { data: inserted, error: insErr } = await base.select('post_id');
      if (!wasRead && inserted && inserted.length > 0) {
        patchItem(t.post_id, cur => ({ ...cur, isRead: true, views: cur.views + 1 }));
      } else {
        patchItem(t.post_id, cur => ({ ...cur, isRead: true }));
      }
      if (
        insErr && // @ts-ignore
        insErr.code !== '23505'
      )
        console.error('insert read error', insErr);
    }

    setDetailIdx(idx);
    setEditing(false);
    setCreating(false);
  };

  const closeDetail = () => {
    setDetailIdx(null);
    setEditing(false);
    setCreating(false);
  };

  // 작성/수정/삭제 (기존 로직 유지)
  const handleCreateSave = async (next: Notice) => {
    if (!groupId || !isHost) return;
    const { data: u } = await supabase.auth.getUser();
    const userId = u?.user?.id;
    if (!userId) return;

    const cleanedHtml = await externalizeInlineImages(next.content || '', groupId);
    const normalizedHtml = resolveAllImageSrcInHtml(cleanedHtml, groupId);

    const { data: ins, error } = await supabase
      .from('group_posts')
      .insert({
        user_id: userId,
        group_id: groupId,
        board_type: boardType,
        post_title: next.title,
        post_body_md: normalizedHtml,
      })
      .select('post_id')
      .single();

    if (error || !ins) {
      console.error('create error', error);
      return;
    }

    const list = await reload();
    if (!list.length) {
      setCreating(false);
      setPage(1);
      setDetailIdx(null);
      setEditing(false);
      return;
    }

    const first = list[0];
    setPage(1);
    setCreating(false);

    const base = supabase
      .from('group_post_reads')
      .upsert(
        { post_id: first.post_id, user_id: userId },
        { onConflict: 'post_id,user_id', ignoreDuplicates: true },
      );
    const { data: inserted, error: insErr } = await base.select('post_id');
    if (
      insErr && // @ts-ignore
      insErr.code !== '23505'
    )
      console.error('insert read error', insErr);

    if (inserted && inserted.length > 0) {
      patchItem(first.post_id, cur => ({ ...cur, isRead: true, views: cur.views + 1 }));
    } else {
      patchItem(first.post_id, cur => ({ ...cur, isRead: true }));
    }

    setDetailIdx(first.id - 1);
    setEditing(false);
  };

  const handleDetailSave = async (next: Notice) => {
    if (detailIdx == null || !groupId) return;
    const target = items[detailIdx];
    if (!target) return;

    const cleanedHtml = await externalizeInlineImages(next.content || '', groupId);
    const normalizedHtml = resolveAllImageSrcInHtml(cleanedHtml, groupId);

    const { error } = await supabase
      .from('group_posts')
      .update({ post_title: next.title, post_body_md: normalizedHtml })
      .eq('post_id', target.post_id);
    if (error) {
      console.error('update error', error);
      return;
    }

    patchItem(target.post_id, cur => ({ ...cur, title: next.title, content: normalizedHtml }));
    setEditing(false);
    setCreating(false);
  };

  const handleDetailDelete = async () => {
    if (detailIdx == null) return;
    const target = items[detailIdx];
    if (!target) return;
    if (!window.confirm('삭제할까요?')) return;

    const { error } = await supabase.from('group_posts').delete().eq('post_id', target.post_id);
    if (error) {
      console.error('delete error', error);
      return;
    }

    const rest = items.filter((_, i) => i !== detailIdx).map((r, i) => ({ ...r, id: i + 1 }));
    setItems(rest);
    setDetailIdx(null);
    setEditing(false);
    setCreating(false);
  };

  const current = detailIdx != null ? items[detailIdx] : null;

  // 렌더
  return (
    <div className="w-[975px] bg-white overflow-hidden">
      <AnimatePresence mode="wait">
        {creating ? (
          <motion.div
            key="notice-create"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <GroupContentDetailEdit
              notice={{ id: 0, title: '', content: '', date: today(), isRead: false, views: 0 }}
              onCancel={() => setCreating(false)}
              onSave={handleCreateSave}
            />
          </motion.div>
        ) : detailIdx == null ? (
          <motion.div
            key="notice-list"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {loading ? (
              <div className="p-6 text-center text-gray-500">불러오는 중…</div>
            ) : items.length === 0 ? (
              <div className="p-6 text-center text-gray-500">등록된 공지가 없습니다.</div>
            ) : (
              <>
                <div className="flex justify-between items-center py-2 bg-[#F4F4F4] border-b border-b-[#A3A3A3] text-[#808080]">
                  <div className="w-[520px] truncate font-semibold pl-7 text-md">제목</div>
                  <div className="w-[120px] text-center text-md">작성일자</div>
                  <div className="w-[80px] text-center text-md">조회수</div>
                  <div className="w-[80px] text-center text-md">좋아요</div>
                  {!isHost && <div className="w-[50px] text-center mr-7 text-sm">상태</div>}
                </div>

                <div className="flex flex-col divide-y divide-dashed divide-gray-300">
                  {pageItems.map(n => (
                    <div
                      key={n.post_id}
                      className="flex justify-between items-center py-3 hover:bg-gray-50 text-left"
                    >
                      <button
                        type="button"
                        onClick={() => openDetail(n.id)}
                        className="w-[520px] truncate font-semibold pl-7 text-[#111] text-left focus:outline-none"
                        title={n.title}
                      >
                        {n.title}
                      </button>

                      <span className="w-[120px] text-center text-gray-400 text-sm">{n.date}</span>
                      <span className="w-[80px] text-center text-gray-400 text-sm">
                        {n.views ?? 0}
                      </span>

                      <button
                        type="button"
                        onClick={() => toggleLike(n.post_id)}
                        disabled={likeBusy.has(n.post_id)}
                        className={`w-[80px] text-center text-sm font-semibold ${
                          n.liked ? 'text-[#0689E8]' : 'text-[#6C6C6C]'
                        } ${likeBusy.has(n.post_id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        aria-pressed={n.liked}
                      >
                        {n.liked ? '좋아요 취소' : '좋아요'} {n.likes}
                      </button>

                      {!isHost && (
                        <span
                          className={`w-[50px] h-[25px] rounded-full font-bold text-white text-sm flex items-center justify-center mr-7 ${
                            n.isRead ? 'bg-[#C4C4C4]' : 'bg-[#FF5252]'
                          }`}
                        >
                          {n.isRead ? '읽음' : '안읽음'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <GroupPagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </>
            )}
          </motion.div>
        ) : editing ? (
          <motion.div
            key="notice-edit"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {current && (
              <GroupContentDetailEdit
                notice={current}
                onCancel={() => setEditing(false)}
                onSave={handleDetailSave}
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="notice-detail"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <article className="mx-auto bg-white shadow-md border border-[#A3A3A3] min-h-[450px]">
              <header className="px-8 pt-6">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-gray-800 leading-none">{current?.title}</h1>
                  {!isHost && (
                    <span
                      className={`w-[52px] h-[25px] rounded-full font-bold text-white text-sm flex items-center justify-center leading-none ${
                        current?.isRead ? 'bg-[#C4C4C4]' : 'bg-[#FF5252]'
                      }`}
                    >
                      {current?.isRead ? '읽음' : '안읽음'}
                    </span>
                  )}
                </div>

                <div className="flex items-center text-[#8C8C8C] text-sm gap-3">
                  <span>{current?.date}</span>
                  <span>조회수 {current?.views ?? 0}</span>

                  {current && (
                    <button
                      type="button"
                      onClick={() => toggleLike(current.post_id)}
                      disabled={likeBusy.has(current.post_id)}
                      className={`ml-2 text-sm font-semibold ${
                        current.liked ? 'text-[#0689E8]' : 'text-[#6C6C6C]'
                      } ${likeBusy.has(current.post_id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      aria-pressed={current.liked}
                    >
                      {current.liked ? '좋아요 취소' : '좋아요'} {current.likes}
                    </button>
                  )}
                </div>
              </header>

              <div className="text-center">
                <div className="inline-block border-b border-[#A3A3A3] w-[910px]" />
              </div>

              <section className="px-8 py-10 text-gray-800 leading-relaxed">
                <div
                  dangerouslySetInnerHTML={{ __html: current?.content || '' }}
                  className="prose max-w-none ql-editor"
                  style={{ padding: 0 }}
                />
              </section>
            </article>

            <footer className="pt-6 flex text-left justify-start">
              <button onClick={closeDetail} className="text-[#8C8C8C] py-2 text-md">
                &lt; 목록으로
              </button>

              {(boardType !== 'notice' || isHost) && (
                <div className="ml-auto flex py-2">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    className="text-md w-[50px] h-[32px] flex justify-center items-center text-center mr-4 text-[#0689E8] border border-[#0689E8] rounded-sm"
                    onClick={handleDetailDelete}
                  >
                    삭제
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    className="text-md w-[50px] h-[32px] flex justify-center items-center text-center text-white bg-[#0689E8] border border-[#0689E8] rounded-sm"
                    onClick={() => setEditing(true)}
                  >
                    수정
                  </motion.button>
                </div>
              )}
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DashboardNotice;
