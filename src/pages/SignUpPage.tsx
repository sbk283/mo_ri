import { useState } from 'react';
import SignUpStep1 from '../components/layout/signup/SignUpStep1';
import SignUpEmail from '../components/layout/signup/SignUpEmail';
import SignUpStep2 from '../components/layout/signup/SignUpStep2';
import SignUpStep3 from '../components/layout/signup/SignUpStep3';
import SignUpBanner from '../components/layout/signup/SignUpBanner';

export type BasicInfo = {
  name: string;
  birth: string;
  email: string;
  password: string;
};

const SignUpPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [basicInfo, setBasicInfo] = useState<BasicInfo | null>(null);

  // 1. 기본 정보 완료 → step 2로, 이메일 정보 저장
  const handleBasicSubmit = (data: BasicInfo) => {
    setBasicInfo(data);
    setStep(2);
    // email로 인증 코드 전송 API 호출
  };

  // 2. 이메일 인증 완료 → step 3로
  const handleEmailVerified = () => {
    setStep(3);
  };

  // 3. 관심사/카테고리 등록 완료 → 사용자 홈 또는 로그인 등 이동
  const handleCategorySubmit = (categoryData: any) => {
    setStep(4);
  };

  return (
    <div className="mt-[140px] mb-[100px]">
      <div className="border border-gray-300 rounded-[5px] bg-white w-[1326px] h-[737px] shadow-card mx-auto flex">
        <SignUpBanner />
        <div className="">
          {step === 1 && <SignUpStep1 onNext={handleBasicSubmit} initialData={basicInfo} />}
          {step === 2 && (
            <SignUpEmail email={basicInfo?.email ?? ''} onVerified={handleEmailVerified} />
          )}
          {step === 3 && <SignUpStep2 onSubmit={handleCategorySubmit} />}
          {step === 4 && <SignUpStep3 />}
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
