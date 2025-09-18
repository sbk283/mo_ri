import AiGroupsSection from '../components/main/AiGroupsSection';
import CategorySection from '../components/main/CategorySection';
import IntroSection from '../components/main/IntroSection';
import PopularGroupsSection from '../components/main/PopularGroupsSection';
import ReviewsSection from '../components/main/ReviewsSection';
// 메인 홈 페이지 입니다.

function Index() {
  return (
    <div>
      <IntroSection />
      <CategorySection />
      <PopularGroupsSection />
      <AiGroupsSection />
      <ReviewsSection />
    </div>
  );
}

export default Index;
