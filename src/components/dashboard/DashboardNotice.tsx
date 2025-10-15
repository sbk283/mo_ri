import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState } from 'react';
import GroupPagination from '../common/GroupPagination';
import GroupContentDetail from './GroupContentDetail';

export type Notice = {
  id: number;
  title: string;
  content: string;
  date: string; // YYYY-MM-DD
  views?: number;
  isRead: boolean;
};

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
  {
    id: 2,
    title:
      '[필독!] 마비노기 던전 레이드 파티원 모집 공지사항입니다. 아래 글을 잘 확인해주세요. 페이지 1번이래요. 와랄랄랄라',
    content:
      '이번 레이드는 초보자도 참여할 수 있으며, 공략 설명과 역할 분배를 사전에 진행합니다. 회복 포션과 부활 스크롤은 필수이며, 음성 채팅 참여가 권장됩니다.',
    date: '2025-06-26',
    isRead: false,
  },
  {
    id: 3,
    title: '[필독!] 마비노기 던전 레이드 파티원 모집 공지사항입니다. 아래 글을 잘 확인해주세요.',
    content:
      '참가 인원은 총 8명으로 제한되며, 선착순으로 모집됩니다. 시간 약속을 반드시 지켜주시고, 무단 이탈 시 다음 참여가 제한될 수 있습니다.',
    date: '2025-06-26',
    isRead: false,
  },
  {
    id: 4,
    title: '[필독!] 마비노기 던전 레이드 파티원 모집 공지사항입니다. 아래 글을 잘 확인해주세요.',
    content:
      '이번 레이드의 보상은 난이도에 따라 달라집니다. 상위 난이도에서는 희귀 장비와 한정 칭호를 얻을 수 있으니 도전해보세요. 연습 파티도 운영됩니다.',
    date: '2025-06-26',
    isRead: true,
  },
  {
    id: 5,
    title: '[필독!] 마비노기 던전 레이드 파티원 모집 공지사항입니다. 아래 글을 잘 확인해주세요.',
    content:
      '레이드 진행은 오후 8시에 시작하며, 입장은 10분 전부터 가능합니다. 모든 참여자는 디스코드 채널에 입장 후 대기해 주세요. 시간 엄수 부탁드립니다.',
    date: '2025-06-26',
    isRead: false,
  },
  {
    id: 6,
    title: '[필독!] 마비노기 던전 레이드 파티원 모집 공지사항입니다. 아래 글을 잘 확인해주세요.',
    content:
      '공략 영상과 매뉴얼이 새롭게 업데이트되었습니다. 특히 2페이즈 보스의 패턴이 변경되었으니 반드시 확인 후 참여 바랍니다. 영상은 게시판에서 확인 가능합니다.',
    date: '2025-06-26',
    isRead: true,
  },
  {
    id: 7,
    title: '[필독!] 마비노기 던전 레이드 파티원 모집 공지사항입니다. 아래 글을 잘 확인해주세요.',
    content:
      '레이드 참여 전 장비 강화 수치와 세트 효과를 점검해주세요. 스탯이 부족한 경우 입장 제한이 있을 수 있습니다. 지원 장비는 별도로 대여 가능합니다.',
    date: '2025-06-26',
    isRead: false,
  },
  {
    id: 8,
    title: '[필독!] 마비노기 던전 레이드 파티원 모집 공지사항입니다. 아래 글을 잘 확인해주세요.',
    content:
      '이번 주에는 신규 보스 “시간의 파수꾼”이 추가됩니다. 강력한 광역 공격을 사용하므로 회피 타이밍이 중요합니다. 사전 모의전도 함께 열립니다.',
    date: '2025-06-26',
    isRead: true,
  },
  {
    id: 9,
    title: '[필독!] 마비노기 던전 레이드 파티원 모집 공지사항입니다. 아래 글을 잘 확인해주세요.',
    content:
      '파티 구성은 탱커 1명, 딜러 5명, 힐러 2명으로 진행됩니다. 역할이 겹치지 않도록 사전 조율이 필요합니다. 파티장은 전체 진행 상황을 책임집니다.',
    date: '2025-06-26',
    isRead: false,
  },
  {
    id: 10,
    title: '[필독!] 마비노기 던전 레이드 파티원 모집 공지사항입니다. 아래 글을 잘 확인해주세요.',
    content:
      '던전 내에서는 채팅 스팸이나 욕설이 금지됩니다. 모두가 즐겁게 플레이할 수 있도록 예절을 지켜주세요. 신고가 누적되면 제재가 있을 수 있습니다.',
    date: '2025-06-26',
    isRead: true,
  },
  {
    id: 11,
    title:
      '[필독!] 마비노기 던전 레이드 파티원 모집 공지사항입니다. 아래 글을 잘 확인해주세요. 페이지 2번이래요.',
    content:
      '두 번째 페이지의 레이드 모집입니다. 이번 주에는 추가 보상이 주어질 예정이니 많은 참여 부탁드립니다. 희귀한 장비 획득 기회도 놓치지 마세요!',
    date: '2025-06-26',
    isRead: false,
  },
  {
    id: 12,
    title:
      '[필독!] 마비노기 던전 레이드 파티원 모집 공지사항입니다. 아래 글을 잘 확인해주세요. 페이지 2번이래요. 와랄랄랄ㄹ라라루',
    content:
      '이번 레이드는 신규 유저 환영 이벤트와 함께 진행됩니다. 공략이 어려운 구간은 베테랑 유저가 도와드립니다. 협동이 중요하니 팀워크를 유지해주세요.',
    date: '2025-06-26',
    isRead: true,
  },
  {
    id: 13,
    title: '[필독!] 마비노기 던전 레이드 파티원 모집 공지사항입니다. 아래 글을 잘 확인해주세요.',
    content:
      '특별히 이번 주에는 보스 처치 시 경험치 보너스가 50% 추가됩니다. 레벨업이 필요한 유저라면 꼭 참여해보세요. 세부 일정은 공지 게시판 참고!',
    date: '2025-06-26',
    isRead: false,
  },
  {
    id: 14,
    title: '[필독!] 마비노기 던전 레이드 파티원 모집 공지사항입니다. 아래 글을 잘 확인해주세요.',
    content:
      '레이드 성공 시 주어지는 토큰으로 한정 상점을 이용할 수 있습니다. 교환 가능 아이템 목록은 별도 게시글로 확인 가능합니다. 교환은 계정 단위로 적용됩니다.',
    date: '2025-06-26',
    isRead: true,
  },
  {
    id: 15,
    title: '[필독!] 마비노기 던전 레이드 파티원 모집 공지사항입니다. 아래 글을 잘 확인해주세요.',
    content:
      '서버 점검 이후 일부 보스 패턴이 변경되었습니다. 기존 공략과 다른 부분이 있으니 수정된 공략 영상을 참고해주세요. 관련 질문은 댓글로 남겨주세요.',
    date: '2025-06-26',
    isRead: false,
  },
  {
    id: 16,
    title: '[필독!] 마비노기 던전 레이드 파티원 모집 공지사항입니다. 아래 글을 잘 확인해주세요.',
    content:
      '참여자 전원에게는 레이드 참여 기념 아이콘이 지급됩니다. 이벤트 기간은 일주일이며, 중복 참여는 가능하지만 보상은 1회만 지급됩니다.',
    date: '2025-06-26',
    isRead: true,
  },
  {
    id: 17,
    title: '[필독!] 마비노기 던전 레이드 파티원 모집 공지사항입니다. 아래 글을 잘 확인해주세요.',
    content:
      '이번 주는 신규 던전 추가로 인해 입장 인원이 조정됩니다. 각 파티는 6명으로 제한되며, 효율적인 분배를 위해 직업군별로 신청을 받습니다.',
    date: '2025-06-26',
    isRead: false,
  },
  {
    id: 18,
    title: '[필독!] 마비노기 던전 레이드 파티원 모집 공지사항입니다. 아래 글을 잘 확인해주세요.',
    content:
      '공지사항을 꼭 숙지하시고 참여해주세요. 일부 구간에서 버그가 발생할 수 있으며, 발견 시 즉시 신고 부탁드립니다. 버그 제보자에게는 소정의 보상이 지급됩니다.',
    date: '2025-06-26',
    isRead: true,
  },
  {
    id: 19,
    title: '[필독!] 마비노기 던전 레이드 파티원 모집 공지사항입니다. 아래 글을 잘 확인해주세요.',
    content:
      '이번 주 레이드에는 신규 전설 장비 “시간의 검”이 드롭됩니다. 매우 낮은 확률이지만 도전할 가치는 충분합니다. 파티원과의 협력으로 클리어해보세요.',
    date: '2025-06-26',
    isRead: false,
  },
  {
    id: 20,
    title: '[필독!] 마비노기 던전 레이드 파티원 모집 공지사항입니다. 아래 글을 잘 확인해주세요.',
    content:
      '레이드 종료 후 만족도 조사를 진행할 예정입니다. 설문에 참여해주신 분께는 감사의 마음으로 소정의 쿠폰을 드립니다. 여러분의 의견을 기다립니다!',
    date: '2025-06-26',
    isRead: true,
  },
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

const DashboardNotice = () => {
  const [page, setPage] = useState(1);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(noticeMock.length / ITEMS_PER_PAGE)), []);
  const pageItems = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return noticeMock.slice(start, end);
  }, [page]);

  const [detailId, setDetailId] = useState<number | null>(null);
  const openDetail = (id: number) => setDetailId(id);
  const closeDetail = () => setDetailId(null);

  return (
    <div className="w-[970px] bg-white overflow-hidden ">
      <AnimatePresence mode="wait">
        {detailId == null ? (
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
            <GroupContentDetail id={detailId} onBack={closeDetail} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardNotice;
