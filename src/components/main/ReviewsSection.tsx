// src/sections/ReviewsSection.tsx
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Plus from '../../../public/images/plus.svg';
import { ReviewCard, type ReviewItem } from '../common/ReviewCard';
import ReviewDetailModal, { type ReviewDetail } from '../common/modal/ReviewDetailModal';

export const defaultMock: ReviewItem[] = [
  {
    id: 1,
    title: '마비노기 던전 공파 모집',
    category: '취미/여가',
    status: '종료',
    src: '/bruce.jpg',
    rating: 5,
    period: '2023.01 - 2023.02',
    created_at: '2023-02-20',
    content:
      '파티장이 정말 좋습니다. 체계적으로 하고 파티도 여러 직업들로 잘 배분되어 있어서 좋네요. 어떤 아이템을 먹고 시작해야하는지도 잘 알려주고 클리어 팁도 잘 알려주고 너무 좋았어요. 완전 버스탄 기분이네요! 완전 버스탄 기분이네요!완전 버스탄 기분이네요!완전 버스탄 기분이들어서 좋았어요! ㅇ흐흐흐ㅎ후훟흐흐흐흐흐흫흐',
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
    created_at: '2023-04-15',
    content:
      '체계적인 커리큘럼과 피드백 덕분에 실무 감이 많이 늘었어요. 과제도 구체적이고, 팀프로젝트도 재미있었습니다.',
    tags: ['초보자추천', '전문적인운영', '친절한모임장'],
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
    created_at: '2023-05-10',
    content:
      '초보도 환영 분위기라 부담 없었고, 코스가 예뻐서 힐링이 됩니다. 덕분에 꾸준히 운동하게 되었어요!',
    tags: ['강력추천', '다같이활동', '좋은분위기'],
    authorMasked: 'runwith*** 님의 후기',
  },
  {
    id: 4,
    title: '한 달 완성 포토샵',
    category: '스터디/학습',
    src: '/bruce.jpg',
    status: '종료',
    rating: 4,
    period: '2023.02 - 2023.03',
    created_at: '2023-03-30',
    content:
      '툴 기초부터 실전 포스터 제작까지 실습 위주라 따라가기 좋았습니다. 선생님도 친절하고 피드백도 빨라서 좋았어요.',
    tags: ['초보자추천', '알찬커리큘럼', '친절한모임장'],
    authorMasked: 'photo*** 님의 후기',
    ad: true,
  },
];

// 섹션 컴포넌트 (배너 포함)
export default function ReviewsSection({ items = defaultMock }: { items?: ReviewItem[] }) {
  const [openId, setOpenId] = useState<number | null>(null);
  const [empathyMap, setEmpathyMap] = useState<Record<number, number>>({}); // id별 공감수 로컬 상태

  // ESC 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const onCardClick = (id: number) => setOpenId(id);
  const onClose = () => setOpenId(null);

  // ReviewItem -> ReviewDetail 매핑
  const toDetail = (it: ReviewItem): ReviewDetail => ({
    id: it.id,
    title: it.title,
    category: it.category,
    src: it.src,
    period: it.period,
    rating: it.rating,
    authorMasked: it.authorMasked,
    created_at: it.created_at || '',
    content: it.content,
    tags: it.tags,
    empathy: empathyMap[it.id] ?? 0,
    ad: !!it.ad,
  });

  // 선택된 리뷰 찾기 + 매핑
  const selected: ReviewDetail | null = useMemo(() => {
    if (!openId) return null;
    const found = items.find(i => i.id === openId);
    return found ? toDetail(found) : null;
  }, [openId, items, empathyMap]);

  // 공감하기 핸들러 (모달 버튼에서 호출)
  const handleEmpathy = (id: number) => {
    setEmpathyMap(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  };

  return (
    <div className="bg-[#F9FBFF] border-t border-b border-solid border-[#DBDBDB]">
      <div className="mx-auto w-[1024px]">
        {/* 섹션 헤더 */}
        <div className="flex items-end pt-[80px] pb-[36px]">
          <div className="mr-4">
            <p className="font-semibold text-lg">믿고 참여하는</p>
            <p className="font-semibold text-xxl">Mo:ri 의 모임 후기!</p>
          </div>
          <div>
            <Link to="/reviews" className="flex text-sm pb-2 gap-1 items-center">
              <img src={Plus} alt="더보기" />
              더보기
            </Link>
          </div>
        </div>

        {/* 후기 카드 리스트 */}
        <div className="flex gap-[21px]">
          {items.map(item => (
            <ReviewCard key={item.id} item={item} onClick={onCardClick} />
          ))}
        </div>

        {/* 상세 모달 */}
        <ReviewDetailModal
          open={!!selected}
          review={selected ?? undefined}
          onClose={onClose}
          onEmpathy={handleEmpathy}
        />
      </div>

      {/* 서비스소개및 배너 */}
      <div className="pt-[135px] pb-[74px] ">
        <div className="mx-auto bg-white shadow-card w-[1024px] h-[233px] flex py-[23px] relative">
          {/* 서비스소개 */}
          <div className="pl-[24px]">
            <Link to={'/serviceint'}>
              <div className="bg-brand w-[230px] h-[246px] rounded-[5px] rounded-tr-[50px] py-[36px] px-[32px] absolute bottom-[23px]">
                <span className="text-white font-bold text-sm">어려운 분들께</span>
                <p className="text-white text-xxl font-bold flex gap-2 items-center">
                  서비스소개 <img src="./linkarrow.svg" alt="이동" />
                </p>
                <p className="text-white pt-2 text-sm w-[129px] ">
                  모임생성부터 참가까지 사이트를 이용할 수 있는 방법을 알려드립니다.
                </p>
              </div>
            </Link>
          </div>
          {/* 배너노출 */}
          <div className="flex gap-[31px] absolute right-[35px]">
            <div className="w-[213px] h-[187px] rounded-[5px] bg-gray-300 overflow-hidden">
              <a
                href="https://greenart.co.kr/?ACE_REF=adwords_g&ACE_KW=%EA%B7%B8%EB%A6%B0%EC%BB%B4%ED%93%A8%ED%84%B0%EC%95%84%ED%8A%B8%ED%95%99%EC%9B%90&gad_source=1&gad_campaignid=16820849449&gbraid=0AAAAADsHW8xXw-LjNJLTj-a4cz89UEwrZ&gclid=CjwKCAjwlaTGBhANEiwAoRgXBSJt5jhL98x5f0HeijEpTTFfMbSh92Ajsj93QWomKrWQLhbmuKCJEhoCmZ8QAvD_BwE"
                target="_blank"
              >
                <img
                  className="w-[100%] y-[100%] object-cover"
                  src="./pro_banner2.jpg"
                  alt="그린컴퓨터아트학원"
                />
              </a>
            </div>
            <div className="w-[213px] h-[187px] rounded-[5px] bg-gray-300 overflow-hidden">
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSfArAWTcEHht9c693B3wVQWWl-15gaT9seoM6JsCWUnpBqCTA/viewform?pli=1"
                target="_blank"
              >
                <img
                  className="w-[100%] y-[100%] object-cover"
                  src="./pro_banner1.jpg"
                  alt="제휴배너이름"
                />
              </a>
            </div>
            <div className="w-[213px] h-[187px] rounded-[5px] bg-gray-300 overflow-hidden">
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSfArAWTcEHht9c693B3wVQWWl-15gaT9seoM6JsCWUnpBqCTA/viewform?pli=1"
                target="_blank"
              >
                <img
                  className="w-[100%] y-[100%] object-cover"
                  src="./pro_banner1.jpg"
                  alt="제휴배너이름"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
