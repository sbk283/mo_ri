import Footer from '../components/Footer';
import Header from '../components/Header';
import AiGroupsSection from '../components/main/AiGroupsSection';
import CategorySection from '../components/main/CategorySection';
import IntroSection from '../components/main/IntroSection';
import PopularGroupsSection from '../components/main/PopularGroupsSection';
import ReviewsSection from '../components/main/ReviewsSection';

function Index() {
  return (
    <div>
      <Header />
      <IntroSection />
      <CategorySection />
      <PopularGroupsSection />
      <AiGroupsSection />
      <ReviewsSection />
      <Footer />
    </div>
  );
}

export default Index;
