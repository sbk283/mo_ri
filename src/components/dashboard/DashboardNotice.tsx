// src/components/dashboard/DashboardNotice.tsx
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import GroupPagination from '../common/GroupPagination';
import GroupContentDetail from './GroupContentDetail';
import type { Notice } from '../../types/notice';
import GroupContentDetailEdit from './GroupContentDetailEdit';
import { loadArray, saveArray, LS_KEYS } from '../../utils/storage';

export const noticeMock: Notice[] = [
  {
    id: 1,
    title:
      '[필독!] 마비노기 던전 레이드 파티원 모집 공지사항입니다. 아래 글을 잘 확인해주세요. 페이지 1번이래요',
    content:
      '안녕하세요! 이번 주 마비노기 던전 레이드 파티 모집 공지입니다. 참여를 원하시는 분은 사전에 장비 점검과 물약 준비를 꼭 완료해주세요. 신청 마감은 수요일까지입니다. 안녕하세요! 이번 주 마비노기 던전 레이드 파티 모집 공지입니다. 참여를 원하시는 분은 사전에 장비 점검과 물약 준비를 꼭 완료해주세요. 신청 마감은 수요일까지입니다. 안녕하세요! 이번 주 마비노기 던전 레이드 파티 모집 공지입니다. 참여를 원하시는 분은 사전에 장비 점검과 물약 준비를 꼭 완료해주세요. 신청 마감은 수요일까지입니다. 안녕하세요! 이번 주 마비노기 던전 레이드 파티 모집 공지입니다. 참여를 원하시는 분은 사전에 장비 점검과 물약 준비를 꼭 완료해주세요. 신청 마감은 수요일까지입니다.안녕하세요! 이번 주 마비노기 던전 레이드 파티 모집 공지입니다. 참여를 원하시는 분은 사전에 장비 점검과 물약 준비를 꼭 완료해주세요. 신청 마감은 수요일까지입니다. 안녕하세요! 이번 주 마비노기 던전 레이드 파티 모집 공지입니다. 참여를 원하시는 분은 사전에 장비 점검과 물약 준비를 꼭 완료해주세요. 신청 마감은 수요일까지입니다. 안녕하세요! 이번 주 마비노기 던전 레이드 파티 모집 공지입니다. 참여를 원하시는 분은 사전에 장비 점검과 물약 준비를 꼭 완료해주세요. 신청 마감은 수요일까지입니다. 안녕하세요! 이번 주 마비노기 던전 레이드 파티 모집 공지입니다. 참여를 원하시는 분은 사전에 장비 점검과 물약 준비를 꼭 완료해주세요. 신청 마감은 수요일까지입니다.안녕하세요! 이번 주 마비노기 던전 레이드 파티 모집 공지입니다. 참여를 원하시는 분은 사전에 장비 점검과 물약 준비를 꼭 완료해주세요. 신청 마감은 수요일까지입니다. 안녕하세요! 이번 주 마비노기 던전 레이드 파티 모집 공지입니다. 참여를 원하시는 분은 사전에 장비 점검과 물약 준비를 꼭 완료해주세요. 신청 마감은 수요일까지입니다. 안녕하세요! 이번 주 마비노기 던전 레이드 파티 모집 공지입니다. 참여를 원하시는 분은 사전에 장비 점검과 물약 준비를 꼭 완료해주세요. 신청 마감은 수요일까지입니다. 안녕하세요! 이번 주 마비노기 던전 레이드 파티 모집 공지입니다. 참여를 원하시는 분은 사전에 장비 점검과 물약 준비를 꼭 완료해주세요. 신청 마감은 수요일까지입니다.',
    date: '2025-06-26',
    isRead: true,
  },
  // ...중략(기존 mock 그대로 유지)
  {
    id: 21,
    title: '[필독!] 마비노기 던전 레이드 파티원 모집 공지사항입니다. 아래 글을 잘 확인해주세요.',
    content:
      '레이드 종료 후 만족도 조사를 진행할 예정입니다. 설문에 참여해주신 분께는 감사의 마음으로 소정의 쿠폰을 드립니다. 여러분의 의견을 기다립니다!',
    date: '2025-06-26',
    isRead: true,
  },
];

const ITEMS_PER_PAGE = 10;

const today = () => new Date().toISOString().slice(0, 10);

export function DashboardNotice({ createRequestKey = 0 }: { createRequestKey?: number }) {
  const [isCreating, setIsCreating] = useState(false);
  const prevKey = useRef(createRequestKey);

  useEffect(() => {
    if (createRequestKey > prevKey.current) {
      setIsCreating(true);
    }
    prevKey.current = createRequestKey;
  }, [createRequestKey]);

  useEffect(() => {
    const existing = loadArray<Notice>(LS_KEYS.notices, []);
    if (!existing || existing.length === 0) {
      saveArray(LS_KEYS.notices, noticeMock);
    }
  }, []);

  const [items, setItems] = useState<Notice[]>(() =>
    loadArray<Notice>(LS_KEYS.notices, noticeMock),
  );

  useEffect(() => {
    saveArray(LS_KEYS.notices, items);
  }, [items]);

  const [detailId, setDetailId] = useState<number | null>(null);

  const [page, setPage] = useState(1);
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE)),
    [items.length],
  );
  const pageItems = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return items.slice(start, end);
  }, [page, items]);

  const openDetail = (id: number) => setDetailId(id);
  const closeDetail = () => setDetailId(null);

  // 새 글 기본값
  const emptyNotice: Notice = {
    id: 0,
    title: '',
    content: '',
    date: today(),
    isRead: false,
  };

  // 작성 저장 (prepend + 1페이지 이동)
  const handleCreateSave = (next: Notice) => {
    const nextId = (items.length ? Math.max(...items.map(n => n.id)) : 0) + 1;
    const toInsert: Notice = {
      ...next,
      id: nextId,
      date: next.date || today(),
      isRead: false,
    };
    setItems(prev => [toInsert, ...prev]);
    {
      /* 변경: setItems 후 useEffect가 자동 저장됨 */
    }
    setIsCreating(false);
    setPage(1);
    setDetailId(nextId); // 저장 직후 상세페이지 이동
  };

  return (
    <div className="w-[970px] bg-white overflow-hidden ">
      <AnimatePresence mode="wait">
        {isCreating ? (
          // ===== 작성(에디트) 뷰 =====
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
        ) : detailId == null ? (
          // ===== 리스트 뷰 =====
          <motion.div
            key="notice-list"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {/* 헤더 */}
            <div className="flex justify-between items-center py-2 bg-[#F4F4F4] border-b border-b-[#A3A3A3] text-[#808080]">
              <div className="w-[700px] truncate font-semibold pl-7 text-md">제목</div>
              <div className="w-[150px] text-center text-md">작성일자</div>
              <div className="w-[50px] text-center mr-7 text-sm">상태</div>
            </div>

            {/* 목록 */}
            <div className="flex flex-col divide-y divide-dashed divide-gray-300">
              {pageItems.map(notice => (
                <button
                  key={notice.id}
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

                  <span className="w-[150px] text-center text-gray-400 text-sm">{notice.date}</span>

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

            {/* 페이지네이션 */}
            <GroupPagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </motion.div>
        ) : (
          // ===== 상세 뷰 =====
          <motion.div
            key="notice-detail"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {/* 변경: 상세 컴포넌트는 localStorage에서 다시 찾아 렌더링하도록 구현됨 */}
            <GroupContentDetail id={detailId} onBack={closeDetail} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DashboardNotice;
