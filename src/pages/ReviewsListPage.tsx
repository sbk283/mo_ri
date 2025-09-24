import { useState } from 'react';
import { ReviewCard, type ReviewItem } from '../components/common/ReviewCard';

const bestReview: ReviewItem[] = [
  {
    id: 1,
    title: '마비노기 던전 공파 모집',
    category: '취미/여가',
    avatarSrc: '../../../public/bruce.jpg',
    quote:
      '파티장이 정말 좋습니다. 체계적으로 하고 파티도 잘 배분되어 있어서 좋네요. 초보도 따라가기 쉬웠습니다.',
    authorMasked: 'zipgago*** 님의 후기',
  },
  {
    id: 2,
    title: '주 2회 실무형 피그마',
    category: '스터디/학습',
    avatarSrc: '../../../public/bruce.jpg',
    quote: '커리큘럼이 탄탄하고 피드백이 빨라서 실무 감각을 키우는 데 큰 도움이 됐습니다.',
    authorMasked: 'design*** 님의 후기',
  },
  {
    id: 3,
    title: '주말 러닝 메이트 구해요',
    category: '운동/건강',
    avatarSrc: '../../../public/bruce.jpg',
    quote: '초보도 환영 분위기라 부담 없었고, 코스가 예뻐서 힐링이 됩니다.',
    authorMasked: 'runwith*** 님의 후기',
  },
  {
    id: 4,
    title: '한 달 완성 포토샵',
    category: '스터디/학습',
    avatarSrc: '../../../public/bruce.jpg',
    quote: '툴 기초부터 실전 포스터 제작까지 실습 위주라 따라가기 좋았습니다.',
    authorMasked: 'photo*** 님의 후기',
  },
];
const defaultReviews: ReviewItem[] = [
  {
    id: 1,
    title: '마비노기 던전 공파 모집',
    category: '취미/여가',
    avatarSrc: '../../../public/bruce.jpg',
    quote:
      '파티장이 정말 좋습니다. 체계적으로 하고 파티도 잘 배분되어 있어서 좋네요. 초보도 따라가기 쉬웠습니다.',
    authorMasked: 'zipgago*** 님의 후기',
  },
  {
    id: 2,
    title: '주 2회 실무형 피그마',
    category: '스터디/학습',
    avatarSrc: '../../../public/bruce.jpg',
    quote: '커리큘럼이 탄탄하고 피드백이 빨라서 실무 감각을 키우는 데 큰 도움이 됐습니다.',
    authorMasked: 'design*** 님의 후기',
  },
  {
    id: 3,
    title: '주말 러닝 메이트 구해요',
    category: '운동/건강',
    avatarSrc: '../../../public/bruce.jpg',
    quote: '초보도 환영 분위기라 부담 없었고, 코스가 예뻐서 힐링이 됩니다.',
    authorMasked: 'runwith*** 님의 후기',
  },
  {
    id: 4,
    title: '한 달 완성 포토샵',
    category: '스터디/학습',
    avatarSrc: '../../../public/bruce.jpg',
    quote: '툴 기초부터 실전 포스터 제작까지 실습 위주라 따라가기 좋았습니다.',
    authorMasked: 'photo*** 님의 후기',
  },
  {
    id: 5,
    title: '보드게임 번개 모임',
    category: '취미/여가',
    avatarSrc: '../../../public/bruce.jpg',
    quote: '처음 가도 금방 친해져요. 룰 설명이 친절하고 진행이 매끄러웠습니다.',
    authorMasked: 'meeple*** 님의 후기',
  },
  {
    id: 6,
    title: '초보 등산 모임',
    category: '운동/건강',
    avatarSrc: '../../../public/bruce.jpg',
    quote: '페이스를 잘 맞춰주셔서 무리 없이 완주했어요. 준비물 가이드도 세세해서 좋았습니다.',
    authorMasked: 'hiking*** 님의 후기',
  },
  {
    id: 7,
    title: '자바스크립트 스터디',
    category: '스터디/학습',
    avatarSrc: '../../../public/bruce.jpg',
    quote: '매주 코드리뷰와 과제가 있어서 실력이 빠르게 늘었어요.',
    authorMasked: 'frontend*** 님의 후기',
  },
  {
    id: 8,
    title: '사진 초급 야외 출사',
    category: '취미/여가',
    avatarSrc: '../../../public/bruce.jpg',
    quote: '구도와 빛 보는 법을 현장에서 배우니 이해가 쏙쏙 들어왔습니다.',
    authorMasked: 'shutter*** 님의 후기',
  },
  {
    id: 9,
    title: '요가로 아침 열기',
    category: '운동/건강',
    avatarSrc: '../../../public/bruce.jpg',
    quote: '동작 난이도 조절이 좋아서 초보도 무리 없이 따라갈 수 있었어요.',
    authorMasked: 'flow*** 님의 후기',
  },
  {
    id: 10,
    title: '타입스크립트 실전 과제반',
    category: '스터디/학습',
    avatarSrc: '../../../public/bruce.jpg',
    quote: '실무 예제로 타입 설계 감이 잡혔어요. 에러 줄고 리팩토링이 쉬워졌습니다.',
    authorMasked: 'tslover*** 님의 후기',
  },
  {
    id: 11,
    title: '주말 카메라 입문',
    category: '취미/여가',
    avatarSrc: '../../../public/bruce.jpg',
    quote: '노출과 초점 기본기를 반복 연습해서 실수가 줄었어요.',
    authorMasked: 'lens*** 님의 후기',
  },
  {
    id: 12,
    title: '저녁 러닝 5K 달성반',
    category: '운동/건강',
    avatarSrc: '../../../public/bruce.jpg',
    quote: '체계적인 페이스 조절 덕분에 목표 달성이 쉬웠습니다.',
    authorMasked: 'pace*** 님의 후기',
  },
];

function ReviewsListPage() {
  const [bestItems, setBestItems] = useState<ReviewItem[]>(bestReview);
  const [items, setItems] = useState<ReviewItem[]>(defaultReviews);

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
          {items.length === 0 ? (
            // 빈 상태
            <div className="text-center text-gray-400 text-lg py-20 mb-20">
              <div>리뷰할 모임이 없습니다. 새로운 모임에 참여해 즐거운 활동을 시작해보세요!</div>
              <a href="/grouplist" className="text-[#0689E8] font-[15px] mt-[19px] inline-block">
                모임 참여하러 가기 {`>`}
              </a>
            </div>
          ) : (
            <ul
              className="grid gap-[15px] mb-[60px]
              grid-cols-2 sm:grid-cols-3 lg:grid-cols-4
              place-items-stretch overflow-x-auto pb-2 w-[1024px]"
            >
              {bestItems.map(item => (
                <li key={item.id} className="overflow-hidden">
                  <ReviewCard item={item} className="h-full" />
                </li>
              ))}
            </ul>
          )}
        </section>
      </>

      {/* 관심사 리뷰 리스트 */}
      <>
        <div className="text-black font-sans text-[23px] font-semibold leading-normal not-italic pb-[13px]">
          관심사에 맞춘 리뷰후기
        </div>
        <section className="space-y-4 mb-10">
          {items.length === 0 ? (
            // 빈 상태
            <div className="text-center text-gray-400 text-lg py-20 mb-20">
              <div>리뷰할 모임이 없습니다. 새로운 모임에 참여해 즐거운 활동을 시작해보세요!</div>
              <a href="/grouplist" className="text-[#0689E8] font-[15px] mt-[19px] inline-block">
                모임 참여하러 가기 {`>`}
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
                  <ReviewCard item={item} className="h-full" />
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
