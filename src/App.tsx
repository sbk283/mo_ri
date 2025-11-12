import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { lazy, Suspense } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Protected from "./components/Protected";
import ScrollToTop from "./components/ScrollToTop";
import { useGoogleAnalytics } from "./hooks/useGoogleAnalytics";
import AdminProtected from "./components/AdminProtected";
import LoadingSpinner from "./components/common/LoadingSpinner";

// 페이지 lazy 로드
const Index = lazy(() => import("./pages/Index"));
const GroupManagerPage = lazy(() => import("./pages/GroupManagerPage"));
const JoinedGroupsPage = lazy(() => import("./pages/JoinedGroupsPage"));
const GroupWishListPage = lazy(() => import("./pages/GroupWishListPage"));
const ReviewsListPage = lazy(() => import("./pages/ReviewsListPage"));
const GroupReviewsPage = lazy(() => import("./pages/GroupReviewsPage"));
const GroupListPage = lazy(() => import("./pages/GroupListPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignUpPage = lazy(() => import("./pages/SignUpPage"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const MyPage = lazy(() => import("./pages/MyPage"));
const CreateGroupPage = lazy(() => import("./pages/CreateGroupPage"));
const GroupDetailPage = lazy(() => import("./pages/GroupDetailPage"));
const DirectChatPage = lazy(() => import("./pages/DirectChatPage"));
const GroupDashBoardPage = lazy(() => import("./pages/GroupDashBoardPage"));
const GroupContentPage = lazy(() => import("./pages/GroupContentPage"));
const GroupMemberPage = lazy(() => import("./pages/GroupMemberPage"));
const GroupSchedulePage = lazy(() => import("./pages/GroupSchedulePage"));
const MyPageSettingPage = lazy(() => import("./pages/MyPageSettingPage"));
const TermsPage = lazy(() => import("./pages/policies/TermsPage"));
const PrivacyPage = lazy(() => import("./pages/policies/PrivacyPage"));
const LocationServicePage = lazy(
  () => import("./pages/policies/LocationServicePage"),
);
const YouthPolicyPage = lazy(() => import("./pages/policies/YouthPolicyPage"));
const ReviewPolicyPage = lazy(
  () => import("./pages/policies/ReviewPolicyPage"),
);
const RefundPolicypage = lazy(
  () => import("./pages/policies/RefundPolicypage"),
);
const ServiceIntroducePage = lazy(() => import("./pages/ServiceIntroducePage"));
const MyPageFAQPage = lazy(() => import("./pages/MyPageFAQPage"));
const InquiryPage = lazy(() => import("./pages/InquiryPage"));
const MyInquiriesPage = lazy(() => import("./pages/MyInquiriesPage"));
const DeleteAccountPage = lazy(() => import("./pages/DeleteAccountPage"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

// GA 래퍼
const LayoutWithAnalytics = ({ children }: { children: React.ReactNode }) => {
  useGoogleAnalytics();
  return <>{children}</>;
};

export default function App() {
  return (
    <div>
      <Router>
        <LayoutWithAnalytics>
          <ScrollToTop />
          <Header />

          {/* 모든 lazy 컴포넌트 Suspense 처리 */}
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* 관리자 */}
              <Route
                path="/admin"
                element={
                  <AdminProtected>
                    <Admin />
                  </AdminProtected>
                }
              />

              {/* 홈 */}
              <Route path="/" element={<Index />} />

              {/* 모임관리 */}
              <Route
                path="/groupmanager"
                element={
                  <Protected>
                    <GroupManagerPage />
                  </Protected>
                }
              />
              <Route
                path="/joingroups"
                element={
                  <Protected>
                    <JoinedGroupsPage />
                  </Protected>
                }
              />
              <Route
                path="/groupwish"
                element={
                  <Protected>
                    <GroupWishListPage />
                  </Protected>
                }
              />

              {/* 리뷰 */}
              <Route path="/reviews" element={<ReviewsListPage />} />

              {/* 참여 모임 후기 */}
              <Route
                path="/groupreviews"
                element={
                  <Protected>
                    <GroupReviewsPage />
                  </Protected>
                }
              />

              {/* 리스트 */}
              <Route path="/grouplist" element={<GroupListPage />} />
              <Route path="/grouplist/:slug" element={<GroupListPage />} />

              {/* 인증 */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />

              {/* 마이페이지 */}
              <Route
                path="/mypage"
                element={
                  <Protected>
                    <MyPage />
                  </Protected>
                }
              />

              {/* 생성 */}
              <Route path="/creategroup" element={<CreateGroupPage />} />

              {/* 상세 */}
              <Route path="/groupdetail/:id" element={<GroupDetailPage />} />

              {/* 채팅 */}
              <Route
                path="/chat/:groupId/:targetUserId?"
                element={
                  <Protected>
                    <DirectChatPage />
                  </Protected>
                }
              />

              {/* 그룹 내 상세 페이지 */}
              <Route
                path="/groupdashboard/:id"
                element={<GroupDashBoardPage />}
              />
              <Route path="/groupcontent/:id" element={<GroupContentPage />} />
              <Route path="/groupmember/:id" element={<GroupMemberPage />} />
              <Route
                path="/groupschedule/:id"
                element={<GroupSchedulePage />}
              />

              {/* 마이페이지 설정 */}
              <Route
                path="/mypagesetting"
                element={
                  <Protected>
                    <MyPageSettingPage />
                  </Protected>
                }
              />

              {/* 정책/약관 */}
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route
                path="/location-service"
                element={<LocationServicePage />}
              />
              <Route path="/youth-policy" element={<YouthPolicyPage />} />
              <Route path="/review-policy" element={<ReviewPolicyPage />} />
              <Route path="/refund-policy" element={<RefundPolicypage />} />

              {/* 소개 */}
              <Route path="/serviceint" element={<ServiceIntroducePage />} />

              {/* 고객센터 */}
              <Route
                path="/faq"
                element={
                  <Protected>
                    <MyPageFAQPage />
                  </Protected>
                }
              />
              <Route
                path="/inquiry"
                element={
                  <Protected>
                    <InquiryPage />
                  </Protected>
                }
              />
              <Route
                path="/inquiry/history"
                element={
                  <Protected>
                    <MyInquiriesPage />
                  </Protected>
                }
              />

              {/* 탈퇴 */}
              <Route
                path="/deleteaccount"
                element={
                  <Protected>
                    <DeleteAccountPage />
                  </Protected>
                }
              />

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>

          <Footer />
        </LayoutWithAnalytics>
      </Router>
    </div>
  );
}
