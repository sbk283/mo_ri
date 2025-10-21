import { useAuth } from '../../contexts/AuthContext';

// 오류 메시지를 사용한 화면에 보여줄 함수
interface kakaoLoginButtonProps {
  children?: React.ReactNode;
  onError?: (error: string) => void;
  onSuccess?: (message: string) => Promise<void>;
}

function KakaoLoginButton({ onError, onSuccess }: kakaoLoginButtonProps) {
  // 카카오 로그인 사용
  const { signInWithKakao } = useAuth();
  // 카카오 로그인 실행
  const handleKakaoLogin = async () => {
    try {
      const { error } = await signInWithKakao();
      if (error && onError) {
        console.log('카카오로그인 에러 메시지:', error);
        onError(error);
      } else if (onSuccess) {
        await onSuccess('');
      }
    } catch (err) {
      console.log('카카오 로그인 오류 : ', err);
    }
  };

  return (
    <button
      className="flex items-center justify-center gap-6 w-[433px] border border-gray-300 rounded-sm p-3 hover:border-[#FFEB3B] transition-colors duration-300 font-bold text-[#6c6c6c] "
      type="button"
      onMouseEnter={e => {
        e.currentTarget.style.backgroundColor = '#FFEB3B';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.backgroundColor = '#fff';
      }}
      onClick={handleKakaoLogin}
    >
      {/* 카카오 아이콘 SVG */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 3C6.48 3 2 6.48 2 10.5C2 13.52 4.5 16.1 8 17.5L7 21L10.5 18.5C11.3 18.7 12.1 18.8 13 18.8C18.52 18.8 23 15.32 23 11.3C23 7.28 18.52 3.8 13 3.8C12.7 3.8 12.4 3.8 12.1 3.9C12.1 3.6 12 3.3 12 3Z"
          fill="#371D1E"
        />
      </svg>
      카카오 로그인
    </button>
  );
}

export default KakaoLoginButton;
