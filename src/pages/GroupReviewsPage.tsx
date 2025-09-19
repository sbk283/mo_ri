import GroupManagerLayout from '../components/layout/GroupManagerLayout';
import ReviewCard, { type GroupReview } from '../components/common/ReviewCard';

const mockReviews: GroupReview[] = [
  {
    id: 1,
    title: '단기 속성 피그마 스터디하기',
    category: '스터디/학습',
    status: '종료',
    rating: 5,
    period: '2025.02.12 ~ 2025.02.20',
    content:
      '파티장이 정말 좋습니다. 체계적으로 하고 파티도 여러 직업들로 잘 배분되어 있어요. 어떤 아이템을 먹고 시작해야하는지도 잘 알려주고 클리어 팁도 잘 알려주고 너무 좋았어요. 완전 버스탄 기분이네요!',
    tags: ['강력추천', '친절한모임장'],
  },
  {
    id: 2,
    title: '주 2회 실무형 피그마',
    category: '스터디/학습',
    status: '종료',
    rating: 4,
    period: '2025.03.01 ~ 2025.03.21',
    content: '짧고 굵게 배우기 좋아. 과제 피드백이 특히 도움 됨.',
    tags: ['다양한 활동', '초보자 추천'],
  },
  {
    id: 3,
    title: 'UX 라이팅 원데이',
    category: '스터디/학습',
    status: '종료',
    rating: 5,
    period: '2025.04.06',
    content: '실전 예제가 많아서 바로 적용 가능!',
    tags: ['재참여하고싶어요', '전문적인 운영'],
  },
];

function GroupReviewsPage() {
  const handleEdit = (id: number) => {
    // TODO: 편집 모달 열기 or 라우팅
    console.log('edit', id);
  };

  const handleDelete = (id: number) => {
    // TODO: 삭제 확인 후 API 호출
    console.log('delete', id);
  };

  return (
    <GroupManagerLayout>
      {/* 상단 텍스트 */}
      <div className="text-xl font-bold text-gray-400 mb-[21px]">모임관리 {'>'} 후기/리뷰 관리</div>

      <div className="flex gap-[12px] mb-6">
        <div className="border-r border-brand border-[3px]" />
        <div className="text-gray-400">
          <div className="text-lg font-semibold">관심 있는 모임을 한곳에서 모아볼 수 있습니다.</div>
          <div className="text-md">
            찜한 모임의 일정과 정보를 확인하며 원하는 모임에 쉽게 참여해보세요.
          </div>
        </div>
      </div>

      {/* 리뷰 리스트 */}
      <section className="space-y-4 mb-10">
        {mockReviews.map(item => (
          <ReviewCard key={item.id} review={item} onEdit={handleEdit} onDelete={handleDelete} />
        ))}
      </section>
    </GroupManagerLayout>
  );
}

export default GroupReviewsPage;
