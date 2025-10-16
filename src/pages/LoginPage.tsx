import { useState } from 'react';
import SignUpBanner from '../components/layout/signup/SignUpBanner';
import GoogleLoginButton from '../components/login/GoogleLoginButton';
import KakaoLoginButton from '../components/login/KakaoLoginButton';

export type FieldData = {
  name: (string | number)[];
  value?: any;
  touched?: boolean;
  validating?: boolean;
  errors?: any[];
};

function LoginPage() {  
  const [msg, setMsg] = useState<string>('');

  return (
    <div>
      {/* 박스 */}
      <div className="mt-[140px] mb-[100px]">
        <div className="border border-gray-300 rounded-[5px] bg-white w-[1326px] h-[737px] shadow-card mx-auto flex">
          {/* 왼쪽 */}
          <SignUpBanner />
          {/* 오른쪽 */}
          <div className="w-[50%] y-full py-[160px] px-[107px]">
            <div className="pr-4">
              <div className="flex justify-center items-center mb-10 gap-4">
                <div className="w-[135px] h-[60px]">
                  <img className="w-full h-full" src="/images/mori_logo.svg" alt="Mo:ri" />
                </div>
                <div className="text-lg ml-5">
                  <p>mo:ri 에 오신 걸 환영합니다.</p>
                  <p className="font-bold">로그인 후 더 많은 모임을 만나보세요!</p>
                </div>
              </div>
              <div className="border-t py-12 flex flex-col gap-7">
                <KakaoLoginButton onError={error => setMsg(`카카오 로그인 오류 : ${error}`)} />
                <GoogleLoginButton
                  onError={error => setMsg(`구글 로그인 오류 : ${error}`)}
                  onSuccess={message => setMsg(message)}
                />
              </div>
              {msg && (
                <p
                  style={{
                    marginTop: '5px',
                    padding: '8px',
                    backgroundColor: msg.includes('성공') ? 'var(--success-50)' : '#fef2f2',
                    color: msg.includes('성공') ? '#000' : '#dc2626',
                  }}
                >
                  {msg}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
