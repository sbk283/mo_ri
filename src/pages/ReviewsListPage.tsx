// src/pages/ReviewsListPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { ReviewCard, type ReviewItem } from '../components/common/ReviewCard';
import ReviewDetailModal, { type ReviewDetail } from '../components/common/modal/ReviewDetailModal';
import ArrayDropdown from '../components/common/ArrayDropdown';
// import { useAuth } from '../contexts/AuthContext';

// ---- 목업 데이터 ----
const bestReview: ReviewItem[] = [
  {
    id: 1,
    title: '마비노기 던전 공파 모집',
    category: '취미/여가',
    src: '/bruce.jpg',
    status: '종료',
    rating: 5,
    period: '2023.01 - 2023.02',
    content:
      '파티장이 정말 좋습니다. 체계적으로 하고 파티도 여러 직업들로 잘 배분되어 있어서 좋네요. ' +
      '처음 참여했을 때는 긴장도 많이 했는데, 친절하게 설명해주셔서 금방 적응할 수 있었습니다. ' +
      '아이템 사용법이나 던전 공략 순서도 꼼꼼히 알려주셔서 혼자 했으면 힘들었을 부분들을 쉽게 클리어할 수 있었어요. ' +
      '특히 초보자도 부담 없이 참여할 수 있도록 분위기를 만들어주셔서 더욱 즐거웠습니다. ' +
      '같이 했던 분들과도 금방 친해져서 게임 끝나고도 따로 대화 나누며 즐거운 시간을 보낼 수 있었어요.',
    tags: ['강력추천', '다같이활동', '알찬커리큘럼'],
    authorMasked: 'zipgago*** 님의 후기',
    ad: true,
    created_at: '2023-11-14',
    empathy: 1234,
  },
  {
    id: 2,
    title: '주 2회 실무형 피그마',
    category: '스터디/학습',
    src: '/bruce.jpg',
    status: '종료',
    rating: 4,
    period: '2023.03 - 2023.04',
    content:
      '커리큘럼이 정말 알차게 구성되어 있어서 초반에는 기초부터 차근차근 배우고, 후반에는 실무에서 바로 활용할 수 있는 프로젝트까지 진행했습니다. ' +
      '과제 피드백도 빠르고 구체적으로 주셔서 성장 속도가 빨랐습니다. ' +
      '같이 공부하는 팀원들과도 협업할 수 있어서 협업 툴을 사용하는 방법도 자연스럽게 익혔습니다. ' +
      '특히 발표와 코드 리뷰 시간을 통해 다른 사람들의 시각을 접할 수 있어 유익했습니다. ' +
      '다만 주차별 과제가 많아서 초반엔 다소 부담이 되었지만 그만큼 배우는 게 많았습니다.',
    tags: ['초보자추천', '전문적인운영', '친절한모임장'],
    authorMasked: 'design*** 님의 후기',
    created_at: '2024-07-22',
    empathy: 987,
  },
  {
    id: 3,
    title: '주말 러닝 메이트 구해요',
    category: '운동/건강',
    src: '/bruce.jpg',
    status: '진행중',
    rating: 5,
    period: '2023.05 - 2023.06',
    content:
      '초보도 환영하는 분위기라 부담이 없었고, 러닝 코스가 예쁘고 달리기 후 스트레칭도 함께 하니 건강 관리에 큰 도움이 되었습니다. ' +
      '특히 혼자 운동할 때는 쉽게 포기했는데, 함께 달리니 꾸준히 할 수 있었어요. ' +
      '주말마다 정기적으로 만나니 생활 리듬도 좋아졌습니다. ' +
      '비슷한 목표를 가진 사람들과 함께해서 서로 응원하고 동기부여를 받을 수 있었습니다. ' +
      '끝나고는 가볍게 식사도 하면서 교류가 이어져서 러닝이 단순한 운동이 아닌 즐거운 모임이 되었습니다.',
    tags: ['강력추천', '다같이활동', '좋은분위기'],
    authorMasked: 'runwith*** 님의 후기',
    ad: true,
    created_at: '2025-03-09',
    empathy: 876,
  },
  {
    id: 4,
    title: '한 달 완성 포토샵',
    category: '스터디/학습',
    src: '/bruce.jpg',
    status: '종료',
    rating: 4,
    period: '2023.02 - 2023.03',
    content:
      '기초 도구 사용법부터 실전 포스터 제작까지 짧은 기간에 많은 걸 배울 수 있었습니다. ' +
      '수업이 실습 위주라 바로바로 따라 하며 익히기 좋았고, 강사님도 친절하게 하나씩 알려주셨습니다. ' +
      '과제도 현실적인 주제로 주셔서 실무에 가까운 경험을 해볼 수 있었어요. ' +
      '특히 레이어 관리나 색감 보정 부분에서 많은 팁을 얻었습니다. ' +
      '디자인에 처음 도전했는데 자신감이 많이 생겼습니다.',
    tags: ['초보자추천', '알찬커리큘럼', '친절한모임장'],
    authorMasked: 'photo*** 님의 후기',
    created_at: '2024-05-30',
    empathy: 765,
  },
];

const defaultReviews: ReviewItem[] = [
  {
    id: 1,
    title: '마비노기 던전 공파 모집',
    category: '취미/여가',
    src: '/bruce.jpg',
    status: '종료',
    rating: 5,
    period: '2023.01 - 2023.02',
    content:
      '파티 분배가 체계적이고 리더가 세심하게 챙겨주셔서 초보도 쉽게 따라갈 수 있었습니다. ' +
      '던전 공략에 필요한 장비나 아이템도 미리 안내받아 준비할 수 있어 좋았어요. ' +
      '처음 보는 사람들과도 금방 친해져서 팀워크가 자연스럽게 맞춰졌습니다. ' +
      '전투 중에도 리더가 중간중간 상황을 설명해줘서 당황하지 않고 진행할 수 있었습니다. ' +
      '다음에도 꼭 다시 참여하고 싶은 경험이었습니다.',
    tags: ['강력추천', '다같이활동', '알찬커리큘럼'],
    authorMasked: 'zipgago*** 님의 후기',
    created_at: '2023-08-03',
    empathy: 64,
  },
  {
    id: 2,
    title: '주 2회 실무형 피그마',
    category: '스터디/학습',
    src: '/bruce.jpg',
    status: '종료',
    rating: 4,
    period: '2023.03 - 2023.04',
    content:
      '실제 회사에서 진행하는 것처럼 과제가 주어지고, 이를 팀 단위로 해결해가는 과정이 좋았습니다. ' +
      '강사님이 빠른 피드백을 주셔서 학습 효율이 높았습니다. ' +
      '실무에서 바로 쓸 수 있는 툴 사용법을 알게 되었고, 다른 팀원의 작업 방식을 보면서 배울 수 있었습니다. ' +
      '시간이 빠듯하긴 했지만 그만큼 몰입해서 배울 수 있었습니다. ' +
      '디자인 협업의 흐름을 알게 된 것이 가장 큰 수확이었습니다.',
    tags: ['전문적인운영', '초보자추천', '친절한모임장'],
    authorMasked: 'design*** 님의 후기',
    ad: true,
    created_at: '2024-02-15',
    empathy: 41,
  },
  {
    id: 3,
    title: '주말 러닝 메이트 구해요',
    category: '운동/건강',
    src: '/bruce.jpg',
    status: '진행중',
    rating: 5,
    period: '2023.05 - 2023.06',
    content:
      '러닝 코스가 공원이라 경치가 좋았고, 함께 달리는 분위기가 밝아 동기부여가 많이 됐습니다. ' +
      '혼자 운동하면 지루할 수 있는데 같이 하니 시간 가는 줄 몰랐습니다. ' +
      '운동 후에는 서로의 기록을 공유하며 응원해주는 문화도 인상 깊었습니다. ' +
      '체력에 맞춰서 조율해주셔서 초보자도 무리 없이 즐길 수 있었습니다. ' +
      '덕분에 매주 운동하는 습관이 자리잡았습니다.',
    tags: ['좋은분위기', '다같이활동', '재참여하고싶어요'],
    authorMasked: 'runwith*** 님의 후기',
    created_at: '2025-01-27',
    empathy: 89,
  },
  {
    id: 4,
    title: '한 달 완성 포토샵',
    category: '스터디/학습',
    src: '/bruce.jpg',
    status: '종료',
    rating: 4,
    period: '2023.07 - 2023.08',
    content:
      '기초 도구부터 포스터 디자인까지 실습 위주라 금방 익숙해졌습니다. ' +
      '강사님이 직접 예시 작업을 보여주셔서 이해가 빨랐습니다. ' +
      '과제는 현실적인 주제를 다뤄서 재미있었고, 직접 만든 결과물을 공유하면서 성취감을 느낄 수 있었습니다. ' +
      '질문이 많아도 성심껏 답해주셔서 도움이 많이 되었습니다. ' +
      '짧은 시간이었지만 디자인에 대한 자신감을 얻게 되었습니다.',
    tags: ['알찬커리큘럼', '친절한모임장'],
    authorMasked: 'photo*** 님의 후기',
    ad: true,
    created_at: '2024-10-11',
    empathy: 32,
  },
  {
    id: 5,
    title: '보드게임 번개 모임',
    category: '취미/여가',
    src: '/bruce.jpg',
    status: '진행중',
    rating: 5,
    period: '2023.09 - 2023.10',
    content:
      '보드게임 규칙 설명이 친절하고 진행 속도도 적당해서 초보자도 쉽게 즐길 수 있었습니다. ' +
      '게임 도중에도 룰을 잘 모르는 사람을 도와줘서 모두가 재미있게 참여할 수 있었습니다. ' +
      '게임이 끝난 후에는 간단히 식사를 함께하며 자연스럽게 대화를 이어갈 수 있었습니다. ' +
      '분위기가 밝고 자유로워서 부담 없이 새로운 사람들과 어울릴 수 있었습니다. ' +
      '다양한 게임을 경험하면서 색다른 즐거움을 느낄 수 있었습니다.',
    tags: ['좋은분위기', '강력추천'],
    authorMasked: 'meeple*** 님의 후기',
    created_at: '2023-12-19',
    empathy: 76,
  },
  {
    id: 6,
    title: '초보 등산 모임',
    category: '운동/건강',
    src: '/bruce.jpg',
    status: '종료',
    rating: 3,
    period: '2023.11 - 2023.12',
    content:
      '산행 속도를 맞춰주셔서 무리하지 않고 정상까지 갈 수 있었습니다. ' +
      '등산 경험이 많지 않았는데도 준비물 체크리스트를 공유해주셔서 안전하게 다녀올 수 있었습니다. ' +
      '산 정상에서 함께 찍은 단체 사진이 좋은 추억이 되었습니다. ' +
      '날씨가 다소 변덕스러웠지만 다 같이 대비해서 큰 문제는 없었습니다. ' +
      '체력 관리의 중요성을 새삼 깨닫는 계기가 되었습니다.',
    tags: ['재참여하고싶어요', '다같이활동'],
    authorMasked: 'hiking*** 님의 후기',
    created_at: '2024-04-28',
    empathy: 18,
  },
  {
    id: 7,
    title: '자바스크립트 스터디',
    category: '스터디/학습',
    src: '/bruce.jpg',
    status: '진행중',
    rating: 5,
    period: '2024.01 - 2024.02',
    content:
      '매주 미니 프로젝트를 만들며 코드 리뷰를 받아 성장하는 느낌이 강했습니다. ' +
      '질문이 많아도 팀원들이 성심껏 답해주셔서 좋았습니다. ' +
      '스터디 리더가 학습 방향을 잘 잡아줘서 혼란 없이 배울 수 있었습니다. ' +
      '주차별 과제가 실제 개발과 유사해서 실무 감각을 익히는 데 도움이 되었습니다. ' +
      '서로의 코드를 비교하며 다양한 접근 방식을 배우는 게 유익했습니다.',
    tags: ['강력추천', '알찬커리큘럼', '다같이활동'],
    authorMasked: 'frontend*** 님의 후기',
    ad: true,
    created_at: '2025-06-17',
    empathy: 103,
  },
  {
    id: 8,
    title: '사진 초급 야외 출사',
    category: '취미/여가',
    src: '/bruce.jpg',
    status: '종료',
    rating: 4,
    period: '2024.03',
    content:
      '현장에서 빛과 그림자를 보는 법을 배우니 이해가 확실히 됐습니다. ' +
      '사진 결과물을 바로 공유하고 피드백을 받아 만족스러웠습니다. ' +
      '강사님이 실습 중간마다 포인트를 짚어주셔서 좋았습니다. ' +
      '비슷한 수준의 사람들과 함께라 부담 없이 의견을 나눌 수 있었습니다. ' +
      '사진을 찍는 즐거움이 커져서 계속 취미로 이어가고 싶어졌습니다.',
    tags: ['초보자추천', '친절한모임장'],
    authorMasked: 'shutter*** 님의 후기',
    created_at: '2023-09-25',
    empathy: 27,
  },
  {
    id: 9,
    title: '요가로 아침 열기',
    category: '운동/건강',
    src: '/bruce.jpg',
    status: '진행중',
    rating: 5,
    period: '2024.04 - 2024.05',
    content:
      '호흡법을 꼼꼼히 알려주셔서 자세가 훨씬 안정적이 되었습니다. ' +
      '매일 아침 요가를 통해 하루를 상쾌하게 시작할 수 있었습니다. ' +
      '선생님이 동작 하나하나를 교정해주셔서 도움이 많이 되었습니다. ' +
      '함께 참여하는 사람들과도 자연스럽게 친해질 수 있었습니다. ' +
      '스트레스 해소와 체형 교정 효과를 동시에 느낄 수 있었습니다.',
    tags: ['좋은분위기', '재참여하고싶어요', '강력추천'],
    authorMasked: 'flow*** 님의 후기',
    ad: true,
    created_at: '2024-11-06',
    empathy: 55,
  },
  {
    id: 10,
    title: '타입스크립트 실전 과제반',
    category: '스터디/학습',
    src: '/bruce.jpg',
    status: '종료',
    rating: 5,
    period: '2024.06 - 2024.07',
    content:
      '실무에서 바로 적용 가능한 패턴을 배워 유용했습니다. ' +
      '과제마다 리팩토링을 반복하면서 코드 품질이 좋아졌습니다. ' +
      '에러 핸들링 방법도 배워 프로젝트 자신감이 붙었습니다. ' +
      '같이 공부하는 동료들과 코드 리뷰를 하며 다양한 접근법을 접할 수 있었습니다. ' +
      '현업에서 사용하는 사례를 접할 수 있어 도움이 되었습니다.',
    tags: ['알찬커리큘럼', '전문적인운영'],
    authorMasked: 'tslover*** 님의 후기',
    created_at: '2023-10-02',
    empathy: 39,
  },
  {
    id: 11,
    title: '주말 카메라 입문',
    category: '취미/여가',
    src: '/bruce.jpg',
    status: '진행중',
    rating: 4,
    period: '2024.08 - 2024.09',
    content:
      '노출, 초점 같은 기본기를 반복 훈련하며 익히니 사진 퀄리티가 점점 좋아졌습니다. ' +
      '실습 비중이 많아 배운 내용을 바로 적용할 수 있었습니다. ' +
      '강사님이 각자의 사진을 보고 구체적으로 피드백해주셔서 좋았습니다. ' +
      '비슷한 관심사를 가진 사람들과 함께라 즐겁게 배울 수 있었습니다. ' +
      '앞으로도 꾸준히 참여하고 싶은 마음이 들었습니다.',
    tags: ['초보자추천', '좋은분위기', '친절한모임장'],
    authorMasked: 'lens*** 님의 후기',
    created_at: '2025-08-21',
    empathy: 72,
  },
  {
    id: 12,
    title: '저녁 러닝 5K 달성반',
    category: '운동/건강',
    src: '/bruce.jpg',
    status: '종료',
    rating: 5,
    period: '2024.10 - 2024.11',
    content:
      '트레이너가 주 단위로 목표를 설정해주셔서 체계적으로 훈련할 수 있었습니다. ' +
      '함께 달리는 사람들이 응원해주니 동기부여가 커졌습니다. ' +
      '훈련이 점점 쌓이면서 체력이 늘어나는 걸 체감할 수 있었습니다. ' +
      '매주 기록을 확인하며 성취감을 느낄 수 있었습니다. ' +
      '러닝이 생활의 즐거움으로 자리 잡게 되었습니다.',
    tags: ['강력추천', '재참여하고싶어요', '다같이활동', '좋은분위기'],
    authorMasked: 'pace*** 님의 후기',
    created_at: '2025-05-05',
    empathy: 94,
  },
];

// ---- 공감 LocalStorage (회원 전용 스키마) ----
const SCHEMA_VERSION = 1 as const;
type LikeStore = {
  schema: typeof SCHEMA_VERSION;
  userId: string;
  ids: number[];
};

const LS_KEY = (userId: string) => `empathy:${userId}`;

function readLikedSet(userId: string): Set<number> {
  try {
    const raw = localStorage.getItem(LS_KEY(userId));
    if (!raw) return new Set();

    const parsed: unknown = JSON.parse(raw);

    // 새 포맷: { schema, userId, ids }
    if (
      parsed &&
      typeof parsed === 'object' &&
      (parsed as any).schema === SCHEMA_VERSION &&
      (parsed as any).userId === userId &&
      Array.isArray((parsed as any).ids)
    ) {
      return new Set<number>((parsed as any).ids as number[]);
    }

    // 옛 포맷(숫자 배열 등)은 무시
    return new Set();
  } catch {
    return new Set();
  }
}
function writeLikedSet(userId: string, set: Set<number>) {
  const payload: LikeStore = { schema: SCHEMA_VERSION, userId, ids: [...set] };
  localStorage.setItem(LS_KEY(userId), JSON.stringify(payload));
}

function ReviewsListPage() {
  // 로그인 유저 가정
  const currentUserId = 'user-001';

  const [bestItems] = useState<ReviewItem[]>(bestReview);
  const [items] = useState<ReviewItem[]>(defaultReviews);

  const [openId, setOpenId] = useState<number | null>(null);

  // 공감 상태: id별 최대값 반영
  const [empathyMap, setEmpathyMap] = useState<Record<number, number>>(() => {
    const initial: Record<number, number> = {};
    const push = (arr: ReviewItem[]) => {
      arr.forEach(v => {
        const val = Number(v.empathy ?? 0);
        initial[v.id] = Math.max(initial[v.id] ?? 0, val);
      });
    };
    push(bestReview);
    push(defaultReviews);
    return initial;
  });

  const [likedSet, setLikedSet] = useState<Set<number>>(() => readLikedSet(currentUserId));

  // 로그인 아이디 변경 시 로컬스토리지 재로드 (실서비스 연동 대비)
  useEffect(() => {
    setLikedSet(readLikedSet(currentUserId));
  }, [currentUserId]);

  const [sortMode, setSortMode] = useState<'latest' | 'popular'>('latest');

  const toDate = (s?: string) => (s ? new Date(s).getTime() : 0);
  const getEmpathy = (it: ReviewItem) => empathyMap[it.id] ?? it.empathy ?? 0;
  const withEmpathy = (it: ReviewItem) => ({ ...it, empathy: getEmpathy(it) });

  const sortedItems = useMemo(() => {
    const base = [...items];
    if (sortMode === 'latest') {
      return base.sort((a, b) => toDate((b as any).created_at) - toDate((a as any).created_at));
    }
    return base.sort((a, b) => {
      const ea = getEmpathy(a);
      const eb = getEmpathy(b);
      if (eb !== ea) return eb - ea;
      if ((b.rating ?? 0) !== (a.rating ?? 0)) return (b.rating ?? 0) - (a.rating ?? 0);
      return toDate((b as any).created_at) - toDate((a as any).created_at);
    });
  }, [items, empathyMap, sortMode]);

  const handleEmpathy = (id: number) => {
    if (likedSet.has(id)) {
      window.alert('이미 공감한 게시글입니다.');
      return;
    }
    setEmpathyMap(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
    const next = new Set(likedSet);
    next.add(id);
    setLikedSet(next);
    writeLikedSet(currentUserId, next);
  };

  const DEFAULT_CREATED_AT = '2025-09-30';
  const toDetail = (v: ReviewItem): ReviewDetail => ({
    id: v.id,
    title: v.title,
    category: v.category,
    src: v.src,
    rating: v.rating,
    period: v.period ?? '',
    content: v.content,
    tags: v.tags ?? [],
    authorMasked: v.authorMasked,
    created_at: (v as any).created_at ?? DEFAULT_CREATED_AT,
    ad: (v as any).ad,
    empathy: getEmpathy(v),
  });

  const selected: ReviewDetail | null = useMemo(() => {
    if (openId == null) return null;
    const found = [...bestItems, ...items].find(v => v.id === openId);
    return found ? toDetail(found) : null;
  }, [openId, bestItems, items, empathyMap]);

  const sortOptions = ['최신순', '인기순'];

  // option → sortMode 매핑
  const mapLabelToValue = (label: string): 'latest' | 'popular' =>
    label === '최신순' ? 'latest' : 'popular';

  const mapValueToLabel = (val: 'latest' | 'popular') => (val === 'latest' ? '최신순' : '인기순');

  return (
    <div className="mx-auto w-[1024px] pt-[120px] pb-[80px]">
      <div className="text-xl font-bold text-gray-400 mb-[21px]">후기리뷰</div>

      {/* 베스트 리뷰 */}
      <div className="text-black text-xl font-semibold pb-[13px]">
        실제 참여자들이 적극 추천한 베스트 후기
      </div>
      <ul className="grid gap-[15px] mb-[60px] grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {bestItems.map(item => (
          <li key={item.id}>
            <ReviewCard item={withEmpathy(item)} className="h-full" onClick={setOpenId} />
          </li>
        ))}
      </ul>

      {selected && (
        <ReviewDetailModal
          open
          review={selected}
          onClose={() => setOpenId(null)}
          onEmpathy={() => handleEmpathy(selected.id)}
        />
      )}

      {/* 관심사 리뷰 */}
      <div className="flex items-center justify-between pb-[13px]">
        <div className="text-black text-xl font-semibold">관심사에 맞춘 리뷰후기</div>
        <ArrayDropdown
          options={sortOptions}
          value={mapValueToLabel(sortMode)}
          onChange={label => setSortMode(mapLabelToValue(label))}
        />
      </div>
      <ul className="grid gap-[15px] mb-[60px] grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {sortedItems.map(item => (
          <li key={item.id}>
            <ReviewCard item={withEmpathy(item)} className="h-full" onClick={setOpenId} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ReviewsListPage;
