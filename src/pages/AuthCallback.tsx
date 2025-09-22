import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SignUpBanner from '../components/layout/signup/SignUpBanner';

/**
 * - 인증 콜백 URL 처리
 * - 사용자에게 인증 진행 상태 안내
 * - 자동 인증 처리 완료 안내
 */

function AuthCallback() {
  const navigate = useNavigate();
  useEffect(() => {
    const timer = setTimeout(() => {}, 1500);
    // 클린업 함수
    return () => {
      clearTimeout(timer);
    };
  }, []);

  const handleClink = () => {
    navigate('/signup?step=3');
  };
  return (
    <div className="mt-[140px] mb-[100px]">
      <div className="border border-gray-300 rounded-[5px] bg-white w-[1326px] h-[737px] shadow-card mx-auto flex">
        <SignUpBanner />
        <div className=" y-full py-[40px] px-[107px]">
          <div className="flex items-center gap-4 mb-[180px]">
            <div className="text-xxl font-bold text-brand whitespace-nowrap">회원가입</div>
            <div className="flex items-center gap-3 whitespace-nowrap">
              <span className="text-brand font-bold text-lg">01_ 기본 정보 작성</span>
              <img className="w-[15px] h-[15px]" src="/arrow_sm.svg" alt="화살표" />
              <span className=" font-bold text-lg text-gray-600">02_ 관심사 선택</span>
            </div>
          </div>
          <div className="text-center mb-[200px]">
            <p className="font-bold mb-3 text-xl ">인증이 완료되었습니다.</p>
            <p className="text-lg text-gray-600 font-bold">회원가입을 계속 진행 해 주세요!</p>
          </div>
          <button
            onClick={handleClink}
            className="rounded-[5px] bg-brand text-white font-bold text-xxl w-[450px] h-[48px]"
          >
            다음 단계
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthCallback;
