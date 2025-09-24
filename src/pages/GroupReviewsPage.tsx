import { motion } from 'framer-motion';
import { useState } from 'react';
import ReviewBar, { type GroupReview } from '../components/common/ReviewBar';
import GroupManagerLayout from '../components/layout/GroupManagerLayout';

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
  // 상태를 mockReviews로 초기화
  const [items, setItems] = useState<GroupReview[]>(mockReviews);

  const handleEdit = (id: number) => {
    // TODO: 편집 모달 열기 or 라우팅
    console.log('edit', id);
  };

  const handleDelete = (id: number) => {
    // 삭제 시 상태에서 제거 → 렌더에도 즉시 반영
    setItems(prev => prev.filter(it => it.id !== id));
  };

  // 애니 ease 프리셋
  const ease: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

  return (
    <GroupManagerLayout>
      {/* 상단 텍스트 */}
      <div className="text-xl font-bold text-gray-400 mb-[21px]">모임관리 {'>'} 후기/리뷰 관리</div>

      <div className="flex gap-[12px] mb-6">
        <div className="border-r border-brand border-[3px]" />
        <div className="text-gray-400">
          <div className="text-lg font-semibold">
            내가 남긴 모든 후기와 리뷰를 한눈에 모아볼 수 있습니다.
          </div>
          <div className="text-md">작성한 후기들을 확인하며 소중한 경험을 관리해보세요.</div>
        </div>
      </div>

      {/* 리뷰 리스트 */}
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
          <ul className="flex flex-col gap-4">
            {/* items로 렌더 */}
            {items.map(item => (
              <motion.li
                key={item.id}
                layout // 레이아웃 자연스럽게
                initial={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
                transition={{ duration: 0.22, ease }}
                className="overflow-hidden" // 높이 접힘 시 튀는 것 방지
              >
                <ReviewBar review={item} onEdit={handleEdit} onDelete={handleDelete} />
              </motion.li>
            ))}
          </ul>
        )}
      </section>
    </GroupManagerLayout>
  );
}

export default GroupReviewsPage;
