// 마켓팅 동의 수정

import { Checkbox, Switch } from 'antd';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';

function ProfileMarketingEdit() {
  const { user } = useAuth();

  const [emailChecked, setEmailChecked] = useState(false);
  const [kakaoChecked, setKakaoChecked] = useState(false);
  const [allChecked, setAllChecked] = useState(false);

  // 프로필 불러오기
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('agree_email, agree_sms, agree_push')
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setEmailChecked(!!data.agree_email);
        setKakaoChecked(!!data.agree_sms);
        setAllChecked(!!data.agree_push);
      } else if (error) {
        console.error('프로필 불러오기 실패:', error);
      }
    })();
  }, [user]);

  // DB 업데이트 함수
  const updateMarketingAgreement = async (email: boolean, kakao: boolean, all: boolean) => {
    if (!user) return;

    const { error } = await supabase
      .from('user_profiles')
      .update({
        agree_email: email,
        agree_sms: kakao,
        agree_push: all,
        agree_updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (error) console.error('업데이트 실패:', error);
  };

  //  전체 동의 스위치 변경 시
  const handleAllChange = async (value: boolean) => {
    setAllChecked(value);
    setEmailChecked(value);
    setKakaoChecked(value);
    await updateMarketingAgreement(value, value, value);
  };

  //  개별 체크 변경 시 (즉시 DB 반영)
  const handleEmailChange = async (checked: boolean) => {
    setEmailChecked(checked);
    const newAll = checked && kakaoChecked;
    setAllChecked(newAll);
    await updateMarketingAgreement(checked, kakaoChecked, newAll);
  };

  const handleKakaoChange = async (checked: boolean) => {
    setKakaoChecked(checked);
    const newAll = emailChecked && checked;
    setAllChecked(newAll);
    await updateMarketingAgreement(emailChecked, checked, newAll);
  };

  return (
    <div>
      {' '}
      <div>
        <div className="text-lg text-gray-400 font-semibold mb-[16px]">마케팅 수신동의</div>
        <div className="text-md text-gray-200 mb-[22px]">
          수신 동의 시, 당사의 이벤트이벤트·프로모션·혜택 정보가 이메일, 알림 등을 통해 발송됩니다.
        </div>
        <div className="flex gap-[32px] mb-[34px]">
          <div className="flex gap-[10px] text-md text-gray-200">
            <Checkbox checked={emailChecked} onChange={e => handleEmailChange(e.target.checked)}>
              이메일
            </Checkbox>
          </div>
          <div className="flex gap-[10px] text-md text-gray-200">
            <Checkbox checked={kakaoChecked} onChange={e => handleKakaoChange(e.target.checked)}>
              카카오톡
            </Checkbox>
          </div>
        </div>
        <div className="flex gap-[27px] text-md text-gray-200">
          <div>개인정보 수집 및 이용동의</div>
          <Link to={'/privacy'} className="text-brand">
            전체보기
          </Link>
          <div className="flex gap-[10px] ml-auto">
            <div>전체 동의</div>
            <Switch checked={allChecked} onChange={value => handleAllChange(value)} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileMarketingEdit;
