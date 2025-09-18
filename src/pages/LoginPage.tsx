import Footer from '../components/Footer';
import Header from '../components/Header';

function LoginPage() {
  return (
    <div>
      <Header isLoggedIn={false} />
      {/* 박스 */}
      <div className="mt-[140px] mb-[100px]">
        <div className="border border-gray-300 rounded-[5px] bg-white w-[1326px] h-[737px] shadow-card mx-auto flex">
          {/* 왼쪽 */}
          <div>
            <img src="./loginimage.svg" alt="로그인" />
            <div className="flex">
              <img src="./images/footerLogo.svg" alt="Mo:ri" />
              <p>
                다양한 관심사를 바탕으로 한 자기계발 모임 플랫폼. 참여와 기록을 통해 성장과 커리어를
                이어갑니다.
              </p>
            </div>
          </div>
          {/* 오른쪽 */}
          <div></div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default LoginPage;
