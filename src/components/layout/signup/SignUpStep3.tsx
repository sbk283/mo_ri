import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';

function SignUpStep3() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/');
  };
  return (
    <div className="py-[160px] px-[90px]">
      <div className="text-center">
        <p className="font-bold text-brand text-xxl pt-[70px] mb-4">🎉회원가입이 완료되었습니다.</p>
        <p className="font-bold text-xl text-gray-600 mb-[80px]">
          mo:ri 와 함께 성장의 여정을 시작하세요!
        </p>
        <Button
          onClick={handleClick}
          className="w-[450px] h-[48px] bg-brand text-white text-xl font-bold rounded-[5px]"
        >
          메인 홈페이지로 이동
        </Button>
      </div>
    </div>
  );
}

export default SignUpStep3;
