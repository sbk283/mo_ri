// 비밀번호 확인 완료시 나오는 수정창.
import { Checkbox, Switch } from 'antd';
import { useState } from 'react';

import { Link } from 'react-router-dom';
import InterestModal from '../common/modal/InterestModal';

function PasswordEdit() {
  const [checked, setChecked] = useState(false);

  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState('불주먹 햄스터');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const [selected, setSelected] = useState(['구기활동', 'IT']);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleInterest = (item: string) => {
    if (selected.includes(item)) {
      setSelected(selected.filter(i => i !== item));
    } else {
      if (selected.length < 5) {
        setSelected([...selected, item]);
      } else {
        alert('최대 5개까지 선택 가능합니다.');
      }
    }
  };

  return (
    <div>
      <div className="text-brand font-bold text-xl mb-[21px]">기본정보</div>
      {/* 박스 부분 */}
      <div className="border border-gray-300 rounded-[5px] py-[60px] px-[80px] mb-[39px] w-[1024px]">
        <div className="flex justify-between ">
          {/* 왼쪽 - 이름 프로필 */}
          <div className="text-lg text-gray-200 font-semibold mr-[97px]">
            <div className="flex gap-[38px] mb-[27px]">
              <label className="w-[100px] text-gray-400">이름</label>
              <p>홍길동</p>
            </div>
            <div className="flex gap-[38px]">
              <label className="w-[100px] text-gray-400">프로필 사진</label>
              <div className="w-[130px] h-[140px] relative">
                <img src="/ham.png" alt="" className="w-full h-full object-cover rounded-[5px] " />
                <button className="absolute right-1 bottom-1 ">
                  <img src="/profilesave.svg" alt="수정" />
                </button>
              </div>
            </div>
          </div>
          {/* 오른쪽 - 생년월일, 아이디, 닉네임, 비밀번호 */}
          <div className="text-lg text-gray-200 font-semibold flex-1">
            <div className="flex mb-[27px]">
              <label className="w-[100px] text-gray-400">생년월일</label>
              <p>1997.01.06</p>
            </div>
            <div className="flex  mb-[27px]">
              <label className="w-[100px] text-gray-400">아이디</label>
              <p>z.seon.dev@gmail.com</p>
            </div>
            <div className="flex mb-[27px] items-center">
              <label className="w-[100px] text-gray-400">닉네임</label>

              {editing ? (
                <>
                  <input
                    type="text"
                    value={nickname}
                    onChange={e => setNickname(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 flex-1"
                  />
                  <button
                    onClick={() => setEditing(false)}
                    className="text-sm text-brand py-[6px] px-[14px] border border-brand rounded-[5px] ml-[11px]"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => {
                      // 저장 로직 실행
                      console.log('닉네임 저장:', nickname);
                      setEditing(false);
                    }}
                    className="text-sm text-white bg-brand py-[6px] px-[14px] rounded-[5px] ml-[4px]"
                  >
                    완료
                  </button>
                </>
              ) : (
                <>
                  <p>{nickname}</p>
                  <button
                    onClick={() => setEditing(true)}
                    className="ml-auto text-sm text-gray-400 py-[6px] px-[14px] border border-gray-400 rounded-[5px]"
                  >
                    변경
                  </button>
                </>
              )}
            </div>

            {/* 비밀번호 */}
            <div className="flex mb-[27px] items-start">
              {editing ? (
                <div className="flex flex-col gap-2 flex-1">
                  {/* 새 비밀번호 */}
                  <div className="flex items-center gap-2">
                    <label className="w-[120px] text-gray-400">새 비밀번호</label>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 flex-1"
                    />
                  </div>

                  {/* 새 비밀번호 확인 */}
                  <div className="flex items-center gap-2">
                    <label className="w-[120px] text-gray-400">새 비밀번호 확인</label>
                    <input
                      type="password"
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 flex-1"
                    />
                  </div>

                  {/* 버튼 영역 */}
                  <div className="flex gap-2 mt-2 ml-[120px]">
                    <button
                      onClick={() => setEditing(false)}
                      className="text-sm text-gray-400 py-[6px] px-[14px] border border-gray-400 rounded-[5px]"
                    >
                      취소
                    </button>
                    <button
                      onClick={() => {
                        if (password === confirm) {
                          console.log('비밀번호 저장:', password);
                          setEditing(false);
                        } else {
                          alert('비밀번호가 일치하지 않습니다.');
                        }
                      }}
                      className="text-sm text-white bg-brand py-[6px] px-[14px] rounded-[5px]"
                    >
                      완료
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* 기본 상태 */}
                  <label className="w-[120px] text-gray-400">비밀번호</label>
                  <p className="flex-1">************</p>
                  <button
                    onClick={() => setEditing(true)}
                    className="ml-auto text-sm text-gray-400 py-[6px] px-[14px] border border-gray-400 rounded-[5px]"
                  >
                    변경
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="border-b border-gray-300 opacity-30 my-[27px]" />
        {/* 관심사 */}
        <div className="flex items-center">
          <div className="text-lg text-gray-400  font-semibold mr-[70px]">관심사</div>

          <div className="flex gap-[13px]">
            {selected.map(item => (
              <div key={item} className="bg-brand text-white py-[5px] px-[8px] rounded-[5px]">
                {item}
              </div>
            ))}
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="ml-auto text-sm text-gray-400 py-[6px] px-[14px] border border-gray-400 rounded-[5px] font-semibold mr-[4px]"
          >
            변경
          </button>

          <InterestModal
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            selected={selected}
            toggleInterest={toggleInterest}
          />
        </div>
        <div className="border-b border-gray-300 opacity-30 my-[27px]" />
        <div className="flex items-center">
          <div className="text-lg text-gray-400  font-semibold mr-[60px]">경령사항</div>
          <div>경력사항 부분 내용 없거나 늘어나거나 </div>
          <button className="ml-auto ext-sm text-gray-400 py-[6px] px-[14px] border border-gray-400 rounded-[5px] font-semibold mr-[4px]">
            경력사항 추가하기
          </button>
        </div>
        <div className="border-b border-gray-300 opacity-30 my-[27px]" />
        <div>
          <div className="text-lg text-gray-400  font-semibold mb-[16px]">마케팅 수신동의 </div>
          <div className="text-md text-gray-200 mb-[22px]">
            수신 동의 시, 당사의 이벤트이벤트·프로모션·혜택 정보가 이메일, 알림 등을 통해
            발송됩니다.
          </div>
          <div className="flex gap-[32px] mb-[34px]">
            <div className="flex gap-[10px] text-md text-gray-200">
              <Checkbox checked={checked} onChange={e => setChecked(e.target.checked)}>
                이메일
              </Checkbox>
            </div>
            <div className="flex gap-[10px] text-md text-gray-200">
              <Checkbox checked={checked} onChange={e => setChecked(e.target.checked)}>
                알림
              </Checkbox>
            </div>
          </div>
          <div className="flex gap-[27px] text-md text-gray-200">
            <div>개인정보 수집 및 이용동의</div>
            <Link to={'/'} className="text-brand">
              전체보기
            </Link>
            <div className=" flex gap-[10px] ml-auto">
              <div>동의 여부</div>
              <Switch checked={checked} onChange={value => setChecked(value)} />
            </div>
          </div>
        </div>
      </div>
      {/* 탈퇴하기 */}
      <Link to={'/'} className="flex justify-end font-normal text-[12px] text-gray-200 mr-[39px]">
        회원 탈퇴 하기
      </Link>
    </div>
  );
}

export default PasswordEdit;
