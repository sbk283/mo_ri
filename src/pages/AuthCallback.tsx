import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignUpBanner from '../components/layout/signup/SignUpBanner';
import { Button } from 'antd';
import { supabase } from '../lib/supabase';
import type { profileInsert } from '../types/profileType';
import { createProfile } from '../lib/profile';

function AuthCallback() {
  const [msg, setMsg] = useState<string>('인증 처리 중...');
  const [countDown, setCountDown] = useState(0);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    if (!hasProfile) {
      navigate('/signup?step=3');
    } else {
      // 프로필 있고 관심사 있으면
      navigate('/');
    }
  };

  const handleAuthCallback = async (): Promise<void> => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        setMsg(`인증 오류 : ${error.message}`);
        return;
      }

      if (data.session?.user) {
        const user = data.session.user;
        const isAuthLogin = ['kakao', 'google'].includes(user.app_metadata.provider || '');
        const isKakaoLogin = user.app_metadata.provider === 'kakao';
        const isGoogleLogin = user.app_metadata.provider === 'google';

        let nickName = user.user_metadata.nickName;
        const email = user.email || '';
        const name = user.user_metadata.name || '사용자';

        if (isAuthLogin && !nickName) {
          nickName =
            user.app_metadata.full_name ||
            user.app_metadata.name ||
            user.user_metadata.full_name ||
            user.user_metadata.name ||
            user.email?.split('@')[0] ||
            (isKakaoLogin ? '카카오사용자' : isGoogleLogin ? '구글사용자' : '사용자');
        }

        // 프로필 조회
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('user_id')
          .eq('user_id', user.id)
          .single();

        if (!existingProfile && nickName) {
          const newProfile: profileInsert = { user_id: user.id, nickname: nickName, email, name };
          const result = await createProfile(newProfile);

          if (!result) {
            setMsg('생성 실패! 관리자에게 문의하세요.');
            setHasProfile(false);
            return;
          }
        }

        setHasProfile(true);

        // 관심사 조회
        const { data: interestsList, error: interestsError } = await supabase
          .from('user_interests')
          .select('interest_id')
          .eq('user_id', user.id);

        if (interestsError) {
          setMsg('오류가 발생했습니다.');
          setShouldRedirect(false);
          return;
        }

        if (!interestsList || interestsList.length === 0) {
          setMsg('회원가입을 축하합니다! 다음 단계로 이동합니다.');
          setShouldRedirect(true);
          setHasProfile(false); // 관심사 없을 때
        } else {
          setMsg('로그인 완료! 홈으로 이동합니다.');
          setShouldRedirect(true);
          setHasProfile(true); // 관심사 있음
        }
      } else {
        setMsg('✨ 인증 정보가 존재하지 않습니다. 다시 가입해주세요.');
      }
    } catch (err) {
      console.error('인증 콜백 처리 중 오류:', err);
      setMsg('✨ 인증 처리 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleAuthCallback();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (shouldRedirect) {
      setCountDown(3);
      const timer = setInterval(() => {
        setCountDown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            if (hasProfile) {
              navigate('/'); // 관심사 있을 때 홈으로 이동
            } else {
              navigate('/signup?step=3'); // 관심사 없을 때 관심사 선택 페이지로 이동
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [shouldRedirect, hasProfile, navigate]);

  return (
    <div className="mt-[140px] mb-[100px]">
      <div className="border border-gray-300 rounded-[5px] bg-white w-[1326px] h-[737px] shadow-card mx-auto flex">
        <SignUpBanner />
        <div className="y-full py-[40px] px-[107px]">
          <div className="flex items-center gap-4 mb-[180px]">
            <div className="text-xxl font-bold text-brand whitespace-nowrap">회원가입</div>
            <div className="flex items-center gap-3 whitespace-nowrap">
              <span className="text-brand font-bold text-lg">01_ 기본 정보 작성</span>
              <img className="w-[15px] h-[15px]" src="/arrow_sm.svg" alt="화살표" />
              <span className="font-bold text-lg text-gray-600">02_ 관심사 선택</span>
            </div>
          </div>
          <div className="text-center mb-[200px]">
            <p className="font-bold mb-3 text-xl">{msg}</p>
            {shouldRedirect && <p className="text-lg font-bold">로딩중{countDown}초 후</p>}
          </div>
          <Button
            htmlType="submit"
            onClick={handleClick}
            className="w-[450px] h-[48px] bg-brand text-white text-xl font-bold rounded-[5px]"
          >
            다음단계
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AuthCallback;
