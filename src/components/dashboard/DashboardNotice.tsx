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
    title: '[공지] 신규 모임 시스템 업데이트 안내',
    content:
      '안녕하세요! 모임 시스템이 새롭게 개선되었습니다. 검색 속도와 추천 정확도가 향상되었으니 많은 이용 바랍니다.',
    date: '2025-06-01',
    isRead: false,
  },
  {
    id: 2,
    title: '서버 점검 공지 (6월 10일 새벽)',
    content:
      '6월 10일 새벽 2시부터 4시까지 서버 점검이 진행됩니다. 점검 시간 동안 로그인 및 글쓰기 기능이 제한됩니다.',
    date: '2025-06-08',
    isRead: true,
  },
  {
    id: 3,
    title: '🔥 여름 한정 이벤트 시작!',
    content:
      '이벤트 기간 동안 모임에 참여하면 포인트가 두 배로 적립됩니다. 자세한 내용은 이벤트 페이지를 참고해주세요.',
    date: '2025-07-01',
    isRead: false,
  },
  {
    id: 4,
    title: '[필독] 회원정보 보호 정책 변경 안내',
    content:
      '개인정보 보호를 위해 보안 정책이 강화되었습니다. 비밀번호를 변경해주시면 더 안전하게 이용하실 수 있습니다.',
    date: '2025-07-05',
    isRead: true,
  },
  {
    id: 5,
    title: '🌟 신규 취미 카테고리 오픈 안내',
    content: '요리, 그림, 코딩 등 다양한 취미 모임이 새로 추가되었습니다. 지금 바로 참여해보세요!',
    date: '2025-07-07',
    isRead: false,
  },
  {
    id: 6,
    title: '7월 인기 모임 TOP 10 공개',
    content:
      '7월 한 달간 가장 많은 참여를 기록한 모임을 소개합니다! 당신의 모임도 포함되어 있을까요?',
    date: '2025-07-31',
    isRead: true,
  },
  {
    id: 7,
    title: '[업데이트] 프로필 커버 이미지 기능 추가',
    content: '이제 프로필 페이지에서 커버 이미지를 설정할 수 있습니다. 나만의 개성을 표현해보세요!',
    date: '2025-08-03',
    isRead: false,
  },
  {
    id: 8,
    title: '시스템 오류 복구 안내',
    content: '일시적으로 발생한 알림 지연 현상이 복구되었습니다. 이용에 불편을 드려 죄송합니다.',
    date: '2025-08-07',
    isRead: true,
  },
  {
    id: 9,
    title: '📢 8월 모임 리더 모집 공고',
    content: '리더로 선정되면 포인트와 배지를 지급합니다. 당신의 열정으로 모임을 이끌어주세요!',
    date: '2025-08-10',
    isRead: false,
  },
  {
    id: 10,
    title: '[점검 완료] 채팅 기능 안정화 안내',
    content:
      '8월 12일 새벽 점검이 완료되었습니다. 채팅 기능이 더 빠르고 안정적으로 개선되었습니다.',
    date: '2025-08-12',
    isRead: true,
  },
  {
    id: 11,
    title: '✨ 신규 유저 환영 이벤트 진행 중',
    content:
      '지금 회원가입하면 1,000포인트가 즉시 지급됩니다! 친구 초대 시 추가 보너스도 받아가세요.',
    date: '2025-08-15',
    isRead: false,
  },
  {
    id: 12,
    title: '[공지] 모바일 앱 알림 기능 개선',
    content: '이제 앱에서도 댓글, 좋아요 알림을 실시간으로 받을 수 있습니다.',
    date: '2025-08-18',
    isRead: true,
  },
  {
    id: 13,
    title: '⚙️ 서비스 이용 약관 개정 안내',
    content:
      '8월 25일부터 새로운 이용 약관이 적용됩니다. 주요 변경 사항은 약관 페이지에서 확인해주세요.',
    date: '2025-08-20',
    isRead: false,
  },
  {
    id: 14,
    title: '서버 유지보수 작업 안내',
    content: '9월 1일 오전 3시부터 5시까지 서비스가 일시 중단됩니다. 이용에 참고해주세요.',
    date: '2025-08-30',
    isRead: true,
  },
  {
    id: 15,
    title: '🎉 추석 맞이 포인트 이벤트!',
    content: '추석 연휴 기간 동안 모임 활동 시 보너스 포인트가 두 배로 적립됩니다.',
    date: '2025-09-10',
    isRead: false,
  },
  {
    id: 16,
    title: '[안내] 신고 기능 강화 및 정책 변경',
    content: '악성 유저 제재를 강화하기 위해 신고 시스템이 개선되었습니다.',
    date: '2025-09-13',
    isRead: true,
  },
  {
    id: 17,
    title: '9월 인기 글 선정 이벤트 결과 발표',
    content: '가장 많은 공감을 받은 글을 공개합니다! 당첨자는 포인트 보상과 함께 소개됩니다.',
    date: '2025-09-20',
    isRead: false,
  },
  {
    id: 18,
    title: '🎁 신규 뱃지 시스템 도입 안내',
    content: '활동 레벨에 따라 뱃지가 자동으로 지급됩니다. 나의 뱃지를 프로필에서 확인해보세요!',
    date: '2025-09-25',
    isRead: true,
  },
  {
    id: 19,
    title: '[공지] 게시글 신고 처리 지연 안내',
    content: '최근 신고량 증가로 인해 일부 처리에 지연이 발생하고 있습니다. 빠르게 개선하겠습니다.',
    date: '2025-09-30',
    isRead: true,
  },
  {
    id: 20,
    title: '🍂 가을 시즌 테마 적용 안내',
    content: 'UI 색상이 가을 감성으로 변경되었습니다. 따뜻한 분위기를 느껴보세요.',
    date: '2025-10-01',
    isRead: false,
  },
  {
    id: 21,
    title: '[업데이트] 댓글 수정 기능 추가',
    content: '작성한 댓글을 5분 이내에 수정할 수 있는 기능이 추가되었습니다.',
    date: '2025-10-05',
    isRead: false,
  },
  {
    id: 22,
    title: '📱 모바일 UI 개선 공지',
    content: '모바일 환경에서 리스트 가독성이 향상되었습니다. 또한 스크롤 성능이 최적화되었습니다.',
    date: '2025-10-07',
    isRead: true,
  },
  {
    id: 23,
    title: '🔒 보안 강화 업데이트 완료',
    content: '비밀번호 암호화 수준이 상향되었습니다. 더 안전한 환경에서 서비스를 이용하세요.',
    date: '2025-10-09',
    isRead: true,
  },
  {
    id: 24,
    title: '🧩 커뮤니티 기능 정식 오픈!',
    content: '이제 모임원끼리 자유롭게 글을 작성하고 댓글을 달 수 있습니다. 첫 글을 작성해보세요!',
    date: '2025-10-10',
    isRead: false,
  },
  {
    id: 25,
    title: '🎈 1주년 기념 감사 이벤트 진행 중',
    content: '1년 동안 함께 해주신 여러분 감사합니다! 풍성한 혜택이 준비되어 있습니다.',
    date: '2025-10-15',
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
