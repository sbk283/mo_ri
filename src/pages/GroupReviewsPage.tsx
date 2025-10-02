import { motion } from 'framer-motion';
import { useState } from 'react';
import GroupManagerLayout from '../components/layout/GroupManagerLayout';
import ReviewBar from '../components/common/ReviewBar';
import type { ReviewItem } from '../components/common/ReviewCard';

const mockReviews: ReviewItem[] = [
  {
    id: 1,
    title: '단기 속성 피그마 스터디하기',
    category: '스터디/학습',
    status: '종료',
    src: '/public/bruce.jpg',
    rating: 5,
    period: '2025.02.12 ~ 2025.02.20',
    content:
      '짧은 기간인데도 화면 설계 → 컴포넌트화 → 프로토타입까지 흐름이 딱 잡혔어요. 실습 비중이 높아서 손에 바로 익고, 과제 피드백이 구체적이라 어디를 고쳐야 하는지 바로 알 수 있었음.',
    tags: ['강력추천', '알찬커리큘럼', '친절한모임장'],
    authorMasked: 'zipgago*** 님의 후기',
    ad: false,
  },
  {
    id: 2,
    title: '주 2회 실무형 피그마',
    category: '스터디/학습',
    status: '종료',
    src: '/public/bruce.jpg',
    rating: 4,
    period: '2025.03.01 ~ 2025.03.21',
    content:
      '디자인 시스템과 오토 레이아웃을 실무 예제로 다뤄서 바로 프로젝트에 써먹기 좋았어요. 과제 제출 후 코멘트가 세세해서 성장 포인트가 명확했는데, 난이도가 살짝 높아서 초반엔 적응이 필요함.',
    tags: ['알찬커리큘럼', '전문적인운영', '초보자추천'],
    authorMasked: 'design*** 님의 후기',
    ad: true,
  },
  {
    id: 3,
    title: 'UX 라이팅 원데이',
    category: '스터디/학습',
    status: '종료',
    src: '/public/bruce.jpg',
    rating: 5,
    period: '2025.04.06',
    content:
      '버튼 라벨, 알림 문구, 에러 메시지처럼 바로 적용 가능한 사례를 중심으로 배우니까 효과가 확 느껴졌어요. 톤앤매너 가이드 만드는 방법이 특히 유익했고, 실제 서비스 문구를 고쳐보는 실습이 재미있었음.',
    tags: ['재참여하고싶어요', '좋은분위기', '전문적인운영'],
    authorMasked: 'uxwriter*** 님의 후기',
    ad: false,
  },
];

function GroupReviewsPage() {
  // 상태를 mockReviews로 초기화
  const [items, setItems] = useState<ReviewItem[]>(mockReviews);

  const handleEdit = (id: number) => {
    // TODO: 편집 모달 열기 or 라우팅
    // console.log('edit', id);
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
            <a href="/grouplist" className="text-[#0689E8] font-md mt-[19px] inline-block">
              모임 참여하러 가기 {`>`}
            </a>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {/* items로 렌더 */}
            {items.map(item => (
              <motion.ul
                key={item.id}
                layout // 레이아웃 자연스럽게
                initial={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
                transition={{ duration: 0.22, ease }}
                className="overflow-hidden" // 높이 접힘 시 튀는 것 방지
              >
                <ReviewBar review={item} onEdit={handleEdit} onDelete={handleDelete} />
              </motion.ul>
            ))}
          </ul>
        )}
      </section>
    </GroupManagerLayout>
  );
}

export default GroupReviewsPage;
