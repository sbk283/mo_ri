// 마켓팅 동의 수정

import { Checkbox, Switch } from 'antd';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function ProfileMarketingEdit() {
  const [emailChecked, setEmailChecked] = useState(false);
  const [kakaoChecked, setKakaoChecked] = useState(false);
  const [allChecked, setAllChecked] = useState(false);

  // 마케팅 동의(전체)
  useEffect(() => {
    if (allChecked) {
      setEmailChecked(true);
      setKakaoChecked(true);
    } else {
      setEmailChecked(false);
      setKakaoChecked(false);
    }
  }, [allChecked]);

  // 개별 체크박스 상태 변경 / 전체 동의 동기화
  useEffect(() => {
    if (emailChecked && kakaoChecked) {
      setAllChecked(true);
    } else {
      setAllChecked(false);
    }
  }, [emailChecked, kakaoChecked]);

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
            <Checkbox checked={emailChecked} onChange={e => setEmailChecked(e.target.checked)}>
              이메일
            </Checkbox>
          </div>
          <div className="flex gap-[10px] text-md text-gray-200">
            <Checkbox checked={kakaoChecked} onChange={e => setKakaoChecked(e.target.checked)}>
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
            <Switch checked={allChecked} onChange={value => setAllChecked(value)} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileMarketingEdit;
