// src/components/dashboard/DashboardNotice.tsx
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import GroupPagination from '../common/GroupPagination';
import type { Notice } from '../../types/notice';
import { supabase } from '../../lib/supabase';
import GroupContentDetailEdit from './GroupContentDetailEdit';

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
  const [isCreating, setIsCreating] = useState(false);
  const prevKey = useRef(createRequestKey);

  // 작성 트리거 수신 → 작성모드 진입
  useEffect(() => {
    if (createRequestKey > prevKey.current) setIsCreating(true);
    prevKey.current = createRequestKey;
  }, [createRequestKey]);

  // 작성 상태 변경 시 부모에게 알림
  useEffect(() => {
    onCraftingChange?.(isCreating);
  }, [isCreating, onCraftingChange]);

  // ===== 목록 로드 =====
  const [items, setItems] = useState<NoticeRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const reload = async () => {
    if (!groupId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('group_posts')
      .select('post_id, post_title, post_body_md, post_created_at')
      .eq('group_id', groupId)
      .eq('board_type', boardType)
      .order('post_created_at', { ascending: false });

    if (error) {
      console.error('[DashboardNotice] load error', error);
      setItems([]);
      setLoading(false);
      return;
    }

    const mapped: NoticeRow[] =
      (data ?? []).map((row, idx) => ({
        id: idx + 1,
        post_id: row.post_id,
        title: row.post_title ?? '',
        content: row.post_body_md ?? '',
        date: (row.post_created_at ?? '').slice(0, 10),
        isRead: false,
      })) ?? [];

    setItems(mapped);
    setLoading(false);
  };

  useEffect(() => {
    reload();
  }, [groupId, boardType]);

  // ===== 페이지네이션 =====
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

  // ===== 상세/수정 모드 =====
  const [detailIdx, setDetailIdx] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const openDetail = (localListId: number) => {
    const idx = items.findIndex(n => n.id === localListId);
    if (idx >= 0) {
      setDetailIdx(idx);
      setIsEditing(false);
      setIsCreating(false);
    }
  };
  const closeDetail = () => {
    setDetailIdx(null);
    setIsEditing(false);
    setIsCreating(false);
  };

  const emptyNotice: Notice = {
    id: 0,
    title: '',
    content: '',
    date: today(),
    isRead: false,
  };

  // ===== 생성 =====
  const handleCreateSave = async (next: Notice) => {
    if (!groupId) return;

    const { data: userRes, error: authErr } = await supabase.auth.getUser();
    if (authErr || !userRes?.user?.id) {
      console.error('[DashboardNotice] auth error', authErr);
      return;
    }
    const userId = userRes.user.id;

    const { error } = await supabase.from('group_posts').insert({
      user_id: userId,
      group_id: groupId,
      board_type: boardType,
      post_title: next.title,
      post_body_md: next.content, // HTML 그대로 저장 (이미지 태그 포함)
    });

    if (error) {
      console.error('[DashboardNotice] insert error', error);
      return;
    }

    await reload();
    setIsCreating(false);
    setPage(1);
    setDetailIdx(0);
    setIsEditing(false);
  };

  // ===== 수정 저장 =====
  const handleDetailSave = async (next: Notice) => {
    if (detailIdx == null) return;
    const target = items[detailIdx];
    if (!target) return;

    const { error } = await supabase
      .from('group_posts')
      .update({
        post_title: next.title,
        post_body_md: next.content, // HTML 그대로 저장 (이미지 태그 포함)
      })
      .eq('post_id', target.post_id);

    if (error) {
      console.error('[DashboardNotice] update error', error);
      return;
    }

    const copy = [...items];
    copy[detailIdx] = { ...copy[detailIdx], title: next.title, content: next.content };
    setItems(copy);
    setIsEditing(false);
    setIsCreating(false);
  };

  // ===== 삭제 =====
  const handleDetailDelete = async () => {
    if (detailIdx == null) return;
    const target = items[detailIdx];
    if (!target) return;

    const ok = window.confirm('정말 삭제하시겠습니까? 삭제 후에는 되돌릴 수 없습니다.');
    if (!ok) return;

    const { error } = await supabase.from('group_posts').delete().eq('post_id', target.post_id);
    if (error) {
      console.error('[DashboardNotice] delete error', error);
      return;
    }

    const rest = items
      .filter((_, i) => i !== detailIdx)
      .map((row, idx) => ({ ...row, id: idx + 1 }));
    setItems(rest);
    setDetailIdx(null);
    setIsEditing(false);
    setIsCreating(false);
  };

  const current = detailIdx != null ? items[detailIdx] : null;

  return (
    <div className="w-[975px] bg-white overflow-hidden ">
      <AnimatePresence mode="wait">
        {isCreating ? (
          <motion.div
            key="notice-create"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <GroupContentDetailEdit
              notice={emptyNotice}
              onCancel={() => setIsCreating(false)}
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
              <div className="p-6 text-center text-gray-500">
                불러오는 중입니다. 잠시만 기다려주세요.
              </div>
            ) : items.length === 0 ? (
              <div className="p-6 text-center text-gray-500">등록된 공지가 없습니다.</div>
            ) : (
              <>
                <div className="flex justify-between items-center py-2 bg-[#F4F4F4] border-b border-b-[#A3A3A3] text-[#808080]">
                  <div className="w-[700px] truncate font-semibold pl-7 text-md">제목</div>
                  <div className="w-[150px] text-center text-md">작성일자</div>
                  <div className="w-[50px] text-center mr-7 text-sm">상태</div>
                </div>

                <div className="flex flex-col divide-y divide-dashed divide-gray-300">
                  {pageItems.map(notice => (
                    <button
                      key={notice.post_id}
                      type="button"
                      onClick={() => openDetail(notice.id)}
                      className="flex justify-between items-center py-3 hover:bg-gray-50 text-left focus:outline-none"
                    >
                      <span
                        className="w-[700px] truncate font-semibold pl-7 transition text-[#111]"
                        title={notice.title}
                      >
                        {notice.title}
                      </span>
                      <span className="w-[150px] text-center text-gray-400 text-sm">
                        {notice.date}
                      </span>
                      <span
                        className={`w-[50px] h-[25px] rounded-full font-bold text-white text-sm
                        flex items-center justify-center mr-7
                        ${notice.isRead ? 'bg-[#C4C4C4]' : 'bg-[#FF5252]'}`}
                      >
                        {notice.isRead ? '읽음' : '안읽음'}
                      </span>
                    </button>
                  ))}
                </div>

                <GroupPagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </>
            )}
          </motion.div>
        ) : isEditing ? (
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
                onCancel={() => setIsEditing(false)}
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
                <div className="flex">
                  <h1 className="text-xl font-bold text-gray-800 leading-snug mb-3">
                    {current?.title}
                  </h1>
                  <span
                    className={`w-[50px] h-[25px] rounded-full font-bold text-white text-sm
                      flex items-center justify-center ml-4 leading-none
                      ${current?.isRead ? 'bg-[#C4C4C4]' : 'bg-[#FF5252]'}`}
                  >
                    {current?.isRead ? '읽음' : '안읽음'}
                  </span>
                </div>
                <div className="flex items-center text-[#8C8C8C] text-sm gap-3">
                  <span>{current?.date}</span>
                </div>
              </header>

              <div className="text-center">
                <div className="inline-block border-b-[1px] border-[#A3A3A3] w-[910px]" />
              </div>

              {/* HTML 렌더링 (이미지 포함) */}
              <section className="px-8 py-10 text-gray-800 leading-relaxed">
                <div
                  dangerouslySetInnerHTML={{ __html: current?.content || '' }}
                  className="prose max-w-none ql-editor"
                  style={{ padding: 0 }}
                />
              </section>
            </article>

            <footer className="pt-6 flex text-left justify-start">
              <button onClick={closeDetail} className="text-[#8C8C8C] py-2 transition text-md">
                &lt; 목록으로
              </button>

              <div className="ml-auto flex py-2">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  className="text-md w-[50px] h-[32px] flex justify-center items-center text-center mr-4 text-[#0689E8] border border-[#0689E8] rounded-sm transition"
                  onClick={handleDetailDelete}
                >
                  삭제
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  className="text-md w-[50px] h-[32px] flex justify-center items-center text-center text-white bg-[#0689E8] border border-[#0689E8] rounded-sm transition"
                  onClick={() => setIsEditing(true)}
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

export default DashboardNotice;
