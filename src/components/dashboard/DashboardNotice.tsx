import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import GroupPagination from '../common/GroupPagination';
import { supabase } from '../../lib/supabase';
import GroupContentDetailEdit from './GroupContentDetailEdit';
import type { Notice } from '../../types/notice';

const ITEMS_PER_PAGE = 10;
const today = () => new Date().toISOString().slice(0, 10);

type NoticeRow = Notice & { post_id: string };

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
  const [roleLoaded, setRoleLoaded] = useState(false);

  // 호스트 여부 확인
  useEffect(() => {
    let ignore = false;
    (async () => {
      setRoleLoaded(false);
      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id;
      if (!groupId || !userId) {
        if (!ignore) {
          setIsHost(false);
          setRoleLoaded(true);
        }
        return;
      }

      const { data } = await supabase
        .from('group_members')
        .select('member_role')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .maybeSingle();

      const host = String(data?.member_role ?? '').toLowerCase() === 'host';
      if (!ignore) {
        setIsHost(host);
        setRoleLoaded(true);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [groupId]);

  // 작성 모드 관리
  const [creating, setCreating] = useState(false);
  const prevKey = useRef(createRequestKey);
  useEffect(() => {
    if (createRequestKey > prevKey.current && isHost) setCreating(true);
    prevKey.current = createRequestKey;
  }, [createRequestKey, isHost]);
  useEffect(() => {
    onCraftingChange?.(creating);
  }, [creating, onCraftingChange]);

  // 공지 목록 상태
  const [items, setItems] = useState<NoticeRow[]>([]);
  const [loading, setLoading] = useState(true);

  // 목록 불러오기 (DB가 관리하는 view_count 사용)
  const reload = async () => {
    if (!groupId) return;
    setLoading(true);
    try {
      const { data: posts, error: postsErr } = await supabase
        .from('group_posts')
        .select('post_id, post_title, post_body_md, post_created_at, view_count')
        .eq('group_id', groupId)
        .eq('board_type', boardType)
        .order('post_created_at', { ascending: false });
      if (postsErr) throw postsErr;

      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id ?? null;

      // 내 읽음 집합
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

      // 매핑
      const mapped: NoticeRow[] =
        (posts ?? []).map((r, i) => ({
          id: i + 1,
          post_id: r.post_id,
          title: r.post_title ?? '',
          content: r.post_body_md ?? '',
          date: (r.post_created_at ?? '').slice(0, 10),
          isRead: readSet.has(r.post_id),
          views: Number(r.view_count ?? 0), // ✅ DB 카운터 그대로 사용
        })) ?? [];

      setItems(mapped);
    } catch (e) {
      console.error('reload error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, [groupId, boardType]);

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

  const [detailIdx, setDetailIdx] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);

  // 상세 진입 시: 읽음 upsert만 하고, 처음 읽는 경우에만 로컬에서 views +1 (DB 트리거도 +1)
  const openDetail = async (localId: number) => {
    const idx = items.findIndex(n => n.id === localId);
    if (idx < 0) return;

    const t = items[idx];
    const { data: u } = await supabase.auth.getUser();
    const userId = u?.user?.id;
    if (!groupId || !userId || !t?.post_id) return;

    const wasRead = t.isRead;

    // 읽음 upsert (group_id 넣지 말 것)
    const { error } = await supabase
      .from('group_post_reads')
      .upsert({ post_id: t.post_id, user_id: userId }, { onConflict: 'post_id,user_id' });

    if (error) {
      console.error('upsert read error', error);
    } else {
      // 처음 읽는 경우에만 로컬 +1 (DB 트리거도 +1 되었음)
      setItems(prev => {
        const copy = [...prev];
        const cur = copy[idx];
        if (!cur) return prev;
        copy[idx] = {
          ...cur,
          isRead: true,
          views: wasRead ? cur.views : cur.views + 1,
        };
        return copy;
      });
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

  const emptyNotice: Notice = {
    id: 0,
    title: '',
    content: '',
    date: today(),
    isRead: false,
    views: 0,
  };

  // 작성/수정/삭제
  const handleCreateSave = async (next: Notice) => {
    if (!groupId || !isHost) return;
    const { data: u } = await supabase.auth.getUser();
    const userId = u?.user?.id;
    if (!userId) return;

    const { error } = await supabase.from('group_posts').insert({
      user_id: userId,
      group_id: groupId,
      board_type: boardType,
      post_title: next.title,
      post_body_md: next.content,
    });
    if (error) {
      console.error('create error', error);
      return;
    }

    await reload();
    setCreating(false);
    setPage(1);
    setDetailIdx(0);
    setEditing(false);
  };

  const handleDetailSave = async (next: Notice) => {
    if (detailIdx == null) return;
    const target = items[detailIdx];
    if (!target) return;

    const { error } = await supabase
      .from('group_posts')
      .update({ post_title: next.title, post_body_md: next.content })
      .eq('post_id', target.post_id);
    if (error) {
      console.error('update error', error);
      return;
    }

    const copy = [...items];
    copy[detailIdx] = { ...copy[detailIdx], title: next.title, content: next.content };
    setItems(copy);
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

  // 렌더링
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
              notice={emptyNotice}
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
                {/* 헤더: 호스트면 상태 컬럼 숨김 */}
                <div className="flex justify-between items-center py-2 bg-[#F4F4F4] border-b border-b-[#A3A3A3] text-[#808080]">
                  <div className="w-[600px] truncate font-semibold pl-7 text-md">제목</div>
                  <div className="w-[120px] text-center text-md">작성일자</div>
                  <div className="w-[100px] text-center text-md">조회수</div>
                  {!isHost && <div className="w-[50px] text-center mr-7 text-sm">상태</div>}
                </div>

                <div className="flex flex-col divide-y divide-dashed divide-gray-300">
                  {pageItems.map(n => (
                    <button
                      key={n.post_id}
                      type="button"
                      onClick={() => openDetail(n.id)}
                      className="flex justify-between items-center py-3 hover:bg-gray-50 text-left focus:outline-none"
                    >
                      <span
                        className="w-[600px] truncate font-semibold pl-7 text-[#111]"
                        title={n.title}
                      >
                        {n.title}
                      </span>
                      <span className="w-[120px] text-center text-gray-400 text-sm">{n.date}</span>
                      <span className="w-[100px] text-center text-gray-400 text-sm">
                        {n.views ?? 0}
                      </span>
                      {!isHost && (
                        <span
                          className={`w-[50px] h-[25px] rounded-full font-bold text-white text-sm flex items-center justify-center mr-7 ${
                            n.isRead ? 'bg-[#C4C4C4]' : 'bg-[#FF5252]'
                          }`}
                        >
                          {n.isRead ? '읽음' : '안읽음'}
                        </span>
                      )}
                    </button>
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
            <article className="mx-auto bg-white shadow-md border border-[#A3A3A3] min-h-[550px]">
              <header className="px-8 pt-6">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-gray-800 leading-none">{current?.title}</h1>
                  {/* 호스트면 읽음/안읽음 뱃지 숨김 */}
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

            {/* 수정/삭제 버튼 */}
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
