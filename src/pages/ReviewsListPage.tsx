// src/pages/ReviewsListPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { ReviewCard, type ReviewItem } from '../components/common/ReviewCard';
import ReviewDetailModal from '../components/common/modal/ReviewDetailModal';

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
      '파티장이 정말 좋습니다. 체계적으로 하고 파티도 여러 직업들로 잘 배분되어 있어서 좋네요. 어떤 아이템을 먹고 시작해야하는지도 잘 알려주고 클리어 팁도 잘 알려주고 너무 좋았어요. 완전 버스탄 기분이네요!',
    tags: ['강력추천', '다같이활동', '알찬커리큘럼'],
    authorMasked: 'zipgago*** 님의 후기',
    ad: true,
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
      '체계적인 커리큘럼과 피드백 덕분에 실무 감이 많이 늘었어요. 과제도 구체적이고, 팀프로젝트도 재미있었습니다.',
    tags: ['초보자추천', '전문적인운영', '친절한모임장'],
    authorMasked: 'design*** 님의 후기',
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
      '초보도 환영 분위기라 부담 없었고, 코스가 예뻐서 힐링이 됩니다. 덕분에 꾸준히 운동하게 되었어요!',
    tags: ['강력추천', '다같이활동', '좋은분위기'],
    authorMasked: 'runwith*** 님의 후기',
    ad: true,
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
      '툴 기초부터 실전 포스터 제작까지 실습 위주라 따라가기 좋았습니다. 선생님도 친절하고 피드백도 빨라서 좋았어요.',
    tags: ['초보자추천', '알찬커리큘럼', '친절한모임장'],
    authorMasked: 'photo*** 님의 후기',
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
      '파티 분배가 체계적이고 리더가 세심하게 챙겨주셔서 초보도 쉽게 따라갈 수 있었습니다. 덕분에 던전 공략이 훨씬 수월했어요!',
    tags: ['강력추천', '다같이활동', '알찬커리큘럼'],
    authorMasked: 'zipgago*** 님의 후기',
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
      '실제 회사 프로젝트 같은 과제를 받아서 하니 몰입감이 있었고, 팀별 피드백이 빨라서 학습 속도가 빨라졌습니다.',
    tags: ['실무감각업', '체계적인커리큘럼'],
    authorMasked: 'design*** 님의 후기',
    ad: true,
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
      '러닝 코스가 공원이라 경치가 너무 좋았고, 끝나고 같이 스트레칭하며 친해질 수 있어서 운동이 즐거워졌습니다.',
    tags: ['좋은분위기', '꾸준히운동', '초보환영'],
    authorMasked: 'runwith*** 님의 후기',
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
      '기초 도구부터 포스터 디자인까지 실습 위주라 금방 익숙해졌습니다. 강사님이 직접 예시 작업을 보여주셔서 이해가 빨랐어요.',
    tags: ['친절한강사', '알찬커리큘럼'],
    authorMasked: 'photo*** 님의 후기',
    ad: true,
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
      '룰 설명이 친절하고 진행 속도도 적당해서 처음 하는 사람도 쉽게 즐길 수 있었습니다. 게임 끝나고 간단히 식사도 함께했어요.',
    tags: ['친절한진행', '재밌는분위기'],
    authorMasked: 'meeple*** 님의 후기',
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
      '산행 속도를 맞춰주셔서 무리하지 않고 정상까지 갈 수 있었습니다. 준비물 체크리스트도 공유해주셔서 안전하게 다녀왔어요.',
    tags: ['등산초보', '체력관리'],
    authorMasked: 'hiking*** 님의 후기',
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
      '매주 미니 프로젝트를 만들며 코드리뷰를 받아 성장하는 느낌이 강했습니다. 질문이 많아도 다들 성심껏 답해주셔서 좋았어요.',
    tags: ['코드리뷰', '성장하는스터디'],
    authorMasked: 'frontend*** 님의 후기',
    ad: true,
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
      '현장에서 빛과 그림자를 보는 법을 배우니 이해가 확실히 됐습니다. 결과물을 바로 공유하고 피드백도 받아 만족스러웠습니다.',
    tags: ['현장실습', '사진초보'],
    authorMasked: 'shutter*** 님의 후기',
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
      '호흡법을 꼼꼼히 알려주셔서 자세가 훨씬 안정적이 됐습니다. 하루를 상쾌하게 시작할 수 있어 꾸준히 참여하고 있어요.',
    tags: ['마음의안정', '체형교정'],
    authorMasked: 'flow*** 님의 후기',
    ad: true,
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
      '실무에서 바로 적용 가능한 패턴을 배워 유용했습니다. 에러가 줄고 코드 리팩토링이 쉬워져서 프로젝트에 자신감이 붙었어요.',
    tags: ['실무중심', '타입설계'],
    authorMasked: 'tslover*** 님의 후기',
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
      '노출, 초점 같은 기본기를 반복 훈련하며 익히니까 사진 퀄리티가 점점 안정적이 됐습니다. 실습 비중이 많아 도움이 컸습니다.',
    tags: ['카메라기초', '연습중요'],
    authorMasked: 'lens*** 님의 후기',
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
      '트레이너가 주 단위로 목표를 설정해주셔서 체계적으로 훈련할 수 있었습니다. 참가자들끼리 응원해주니 동기부여도 컸어요.',
    tags: ['목표달성', '러닝초보'],
    authorMasked: 'pace*** 님의 후기',
  },
];

function ReviewsListPage() {
  // 데이터 상태
  const [bestItems] = useState<ReviewItem[]>(bestReview);
  const [items] = useState<ReviewItem[]>(defaultReviews);

  // 모달 상태
  const [openId, setOpenId] = useState<number | null>(null);
  const onCardClick = (id: number) => setOpenId(id);
  const onClose = () => setOpenId(null);

  // 공감 수 로컬 상태 (선택 사항)
  const [empathyMap, setEmpathyMap] = useState<Record<number, number>>({});
  const handleEmpathy = (id: number) =>
    setEmpathyMap(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));

  // 임시값
  const DEFAULT_CREATED_AT = '2025-09-30';

  const toDetail = (v: ReviewItem) => ({
    id: v.id,
    title: v.title,
    category: v.category,
    src: v.src, // 모달 히어로 이미지로 사용
    period: v.period ?? '',
    rating: v.rating ?? 5,
    authorMasked: v.authorMasked ?? 'anonymous***',
    created_at: v.created_at ?? DEFAULT_CREATED_AT,
    content: v.content,
    tags: v.tags ?? [],
    empathy: empathyMap[v.id] ?? 0,
  });

  // 선택된 카드 찾기
  const selected = useMemo(() => {
    if (openId == null) return undefined;
    const found = [...bestItems, ...items].find(v => v.id === openId);
    return found ? toDetail(found) : undefined;
  }, [openId, bestItems, items, empathyMap]);

  // ESC 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="mx-auto w-[1024px] pt-[120px] pb-[80px]">
      {/* 상단 텍스트 */}
      <div className="text-xl font-bold text-gray-400 mb-[21px]">후기리뷰</div>

      <div className="flex gap-[12px] mb-6">
        <div className="border-r border-brand border-[3px]" />
        <div className="text-gray-400">
          <div className="text-lg font-semibold">
            회원들이 남긴 모임 후기를 한곳에서 볼 수 있습니다.
          </div>
          <div className="text-md">
            다양한 경험과 생생한 이야기를 참고해 원하는 모임을 찾아보세요.
          </div>
        </div>
      </div>

      {/* 베스트 리뷰 리스트 */}
      <>
        <div className="text-black font-sans text-[23px] font-semibold leading-normal not-italic pb-[13px]">
          실제 참여자들이 적극 추천한 베스트 후기
        </div>

        <section className="space-y-4 mb-10">
          {bestItems.length === 0 ? (
            <div className="text-center text-gray-400 text-lg py-20 mb-20">
              <div>리뷰할 모임이 없습니다. 새로운 모임에 참여해 즐거운 활동을 시작해보세요!</div>
              <a href="/grouplist" className="text-[#0689E8] font-[15px] mt-[19px] inline-block">
                모임 참여하러 가기 {'>'}
              </a>
            </div>
          ) : (
            <ul
              className="grid gap-[15px] mb-[60px]
              grid-cols-2 sm:grid-cols-3 lg:grid-cols-4
              place-items-stretch overflow-x-auto pb-2 w-[1024px]"
            >
              {/* ✅ 여기서 bestItems만 map! (기존 코드의 중첩 map 버그 제거) */}
              {bestItems.map(item => (
                <li key={item.id} className="overflow-hidden">
                  <ReviewCard item={item} className="h-full" onClick={onCardClick} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 상세 모달 */}
        <ReviewDetailModal
          open={!!selected}
          review={selected}
          onClose={onClose}
          onEmpathy={handleEmpathy}
        />
      </>

      {/* 관심사 리뷰 리스트 */}
      <>
        <div className="text-black font-sans text-[23px] font-semibold leading-normal not-italic pb-[13px]">
          관심사에 맞춘 리뷰후기
        </div>

        <section className="space-y-4 mb-10">
          {items.length === 0 ? (
            <div className="text-center text-gray-400 text-lg py-20 mb-20">
              <div>리뷰할 모임이 없습니다. 새로운 모임에 참여해 즐거운 활동을 시작해보세요!</div>
              <a href="/grouplist" className="text-[#0689E8] font-[15px] mt-[19px] inline-block">
                모임 참여하러 가기 {'>'}
              </a>
            </div>
          ) : (
            <ul
              className="grid gap-[15px] mb-[60px]
              grid-cols-2 sm:grid-cols-3 lg:grid-cols-4
              place-items-stretch overflow-x-auto pb-2 w-[1024px]"
            >
              {items.map(item => (
                <li key={item.id} className="overflow-hidden">
                  <ReviewCard item={item} className="h-full" onClick={onCardClick} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </>
    </div>
  );
}

export default ReviewsListPage;
