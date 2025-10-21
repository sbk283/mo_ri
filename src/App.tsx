import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Header from './components/Header';
import Protected from './components/Protected';
import ScrollToTop from './components/ScrollToTop';
import AuthCallback from './pages/AuthCallback';
import CreateGroupPage from './pages/CreateGroupPage';
import DeleteAccountPage from './pages/DeleteAccountPage';
import DirectChatPage from './pages/DirectChatPage';
import GroupContentPage from './pages/GroupContentPage';
import GroupDashBoardPage from './pages/GroupDashBoardPage';
import GroupDetailPage from './pages/GroupDetailPage';
import GroupListPage from './pages/GroupListPage';
import GroupManagerPage from './pages/GroupManagerPage';
import GroupMemberPage from './pages/GroupMemberPage';
import GroupReviewsPage from './pages/GroupReviewsPage';
import GroupSchedulePage from './pages/GroupSchedulePage';
import GroupWishListPage from './pages/GroupWishListPage';
import Index from './pages/Index';
import InquiryPage from './pages/InquiryPage';
import JoinedGroupsPage from './pages/JoinedGroupsPage';
import LoginPage from './pages/LoginPage';
import MyInquiriesPage from './pages/MyInquiriesPage';
import MyPage from './pages/MyPage';
import MyPageFAQPage from './pages/MyPageFAQPage';
import MyPageSettingPage from './pages/MyPageSettingPage';
import NotFoundPage from './pages/NotFoundPage';
import LocationServicePage from './pages/policies/LocationServicePage';
import PrivacyPage from './pages/policies/PrivacyPage';
import RefundPolicypage from './pages/policies/RefundPolicypage';
import ReviewPolicyPage from './pages/policies/ReviewPolicyPage';
import TermsPage from './pages/policies/TermsPage';
import YouthPolicyPage from './pages/policies/YouthPolicyPage';
import ReviewListPage from './pages/ReviewsListPage';
import ServiceIntroducePage from './pages/ServiceIntroducePage';
import SignUpPage from './pages/SignUpPage';

// 컴포넌트 따라 각각 작업하시고, 혹시 서로의 코드를 수정해야할 일이 있으면
// 꼭 얘기후에 진행합시다~!(서로가 맘상하는 일 없도록~!!)
// NavLink or Link 는 작업하는 곳에서 상황에 맞게 알맞게 사용해 주세요..
// page 추가하는경우
// page 는 아래에 route 적용해주시고 {path='/???'} 이름 알려주세요~

function App() {
  return (
    <div>
      <Router>
        <ScrollToTop />
        <Header />
        <Routes>
          {/*메인 홈 */}
          <Route path="/" element={<Index />} />
          {/* 모임관리 - 생성한 모임 페이지 */}
          <Route
            path="/groupmanager"
            element={
              <Protected>
                <GroupManagerPage />
              </Protected>
            }
          />
          {/* 모임관리 - 참여한 모임 페이지 */}
          <Route
            path="/joingroups"
            element={
              <Protected>
                <JoinedGroupsPage />
              </Protected>
            }
          />
          {/* 모임관리 - 찜리스트 */}
          <Route
            path="/groupwish"
            element={
              <Protected>
                <GroupWishListPage />
              </Protected>
            }
          />
          {/* 리뷰 더보기 리스트 페이지 */}
          <Route path="/reviews" element={<ReviewListPage />} />
          {/* 모임관리 > 후기리뷰 */}
          <Route
            path="/groupreviews"
            element={
              <Protected>
                <GroupReviewsPage />
              </Protected>
            }
          />
          {/* 모임리스트 */}
          <Route path="/grouplist" element={<GroupListPage />} />
          <Route path="/grouplist/:slug" element={<GroupListPage />} />
          {/* 로그인 */}
          <Route path="/login" element={<LoginPage />} />
          {/* 회원가입 */}
          <Route path="/signup" element={<SignUpPage />} />
          {/* 이메일인증 */}
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
          {/* 모임생성 */}
          <Route path="/creategroup" element={<CreateGroupPage />} />
          {/* 모임 상세보기 */}
          <Route path="/groupdetail/:id" element={<GroupDetailPage />} />
          {/* 채팅 */}
          <Route
            path="/chat/:id"
            element={
              <Protected>
                <DirectChatPage />
              </Protected>
            }
          />
          {/* 모임 상세대시보드 */}
          <Route path="/groupdashboard/:id" element={<GroupDashBoardPage />} />
          {/* 모임 게시판 */}
          <Route path="/groupcontent/:id" element={<GroupContentPage />} />
          {/* 모임 멤버 */}
          <Route path="/groupmember/:id" element={<GroupMemberPage />} />
          {/* 모임 일정 */}
          <Route path="/groupschedule/:id" element={<GroupSchedulePage />} />
          {/* 마이페이지 회원설정 */}
          <Route
            path="/mypagesetting"
            element={
              <Protected>
                <MyPageSettingPage />
              </Protected>
            }
          />
          {/* 마이페이지 결제수단 */}
          {/* <Route path="/payments" element={<MyPagePaymentsPage />} /> */}
          {/* 아이디 찾기 */}
          {/* <Route path="/findid" element={<FindIdPage />} /> */}
          {/* 비밀번호 찾기 */}
          {/* <Route path="/findpw" element={<FindPwPage />} /> */}
          {/* 이용약관 */}
          <Route path="/terms" element={<TermsPage />} />
          {/* 개인정보 처리방침 */}
          <Route path="/privacy" element={<PrivacyPage />} />
          {/* 위치기반 서비스 관련 약관 */}
          <Route path="/location-service" element={<LocationServicePage />} />
          {/* 청소년 보호정책 */}
          <Route path="/youth-policy" element={<YouthPolicyPage />} />
          {/* 후기정책 */}
          <Route path="/review-policy" element={<ReviewPolicyPage />} />
          {/* 제휴/환불 */}
          <Route path="/refund-policy" element={<RefundPolicypage />} />
          {/* 서비스소개*/}
          <Route path="/serviceint" element={<ServiceIntroducePage />} />
          {/* 마이페이지 고객센터*/}
          <Route
            path="/faq"
            element={
              <Protected>
                <MyPageFAQPage />
              </Protected>
            }
          />
          {/* 마이페이지 1:1 문의 하기*/}
          <Route
            path="/inquiry"
            element={
              <Protected>
                <InquiryPage />
              </Protected>
            }
          />
          {/* 마이페이지 1:1 문의 내역*/}
          <Route
            path="/inquiry/history"
            element={
              <Protected>
                <MyInquiriesPage />
              </Protected>
            }
          />
          {/* 회원 탈퇴 */}
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
        <Footer />
      </Router>
    </div>
  );
}

export default App;
