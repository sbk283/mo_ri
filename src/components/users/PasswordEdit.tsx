// 비밀번호 확인 완료시 나오는 수정창.
import { Checkbox, Switch } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import InterestModal from '../common/modal/InterestModal';
import CareerModal, { type CareerItem } from '../common/modal/CareerModal';

function PasswordEdit() {
  const [checked, setChecked] = useState(false);

  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState('불주먹 햄스터');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const [selected, setSelected] = useState(['구기활동', 'IT']);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCareerModalOpen, setIsCareerModalOpen] = useState(false);
  const [careerList, setCareerList] = useState<CareerItem[]>([]);

  // 프로필 이미지 업로드 상태
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string>('/ham.png'); // 초기 이미지
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 미리보기 URL 관리 (메모리 누수 방지)
  useEffect(() => {
    if (!profileFile) return;
    const url = URL.createObjectURL(profileFile);
    setProfilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [profileFile]);

  // 파일 선택창 열기
  const openFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // 동일 파일 다시 선택 가능하게
      fileInputRef.current.click();
    }
  };

  // 파일 선택 처리
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileFile(file);
    // 여기서 서버 업로드/프로필 갱신 API 호출 연결 가능
    // 例) await uploadToSupabase(file).then(url => saveProfile(url));
  };

  // 이미지 제거
  const clearImage = () => {
    setProfileFile(null);
    setProfilePreview('/ham.png'); // 기본 이미지는 일단 햄찌로
  };

  const toggleInterest = (item: string) => {
    if (selected.includes(item)) {
      setSelected(selected.filter(i => i !== item));
    } else if (selected.length < 5) {
      setSelected([...selected, item]);
    }
  };

  return (
    <div>
      <div className="text-brand font-bold text-xl mb-[21px]">기본정보</div>

      {/* 박스 부분 */}
      <div className="border border-gray-300 rounded-[5px] py-[60px] px-[80px] mb-[39px] w-[1024px]">
        <div className="flex">
          {/* 왼쪽 - 이름 프로필 */}
          <div className="text-lg text-gray-200 font-semibold mr-[97px]">
            <div className="flex gap-[38px]">
              <label className="w-[100px] text-gray-400">프로필 사진</label>

              {/* 프로필 이미지 영역 (클릭 시 교체 가능) */}
              <div className="w-[170px] h-[170px] relative">
                <img
                  src={profilePreview}
                  alt="프로필"
                  className="w-full h-full object-cover rounded-[5px]"
                />

                {/* 우하단 수정 버튼 (클릭 시 파일 선택) */}
                <button
                  type="button"
                  onClick={openFilePicker}
                  className="absolute right-1 bottom-1"
                  aria-label="프로필 이미지 수정"
                >
                  <img src="/profilesave.svg" alt="수정" />
                </button>

                {/* 우상단 제거 버튼 */}
                {profileFile && (
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute right-1 top-1 bg-white/90 rounded-full p-1"
                    aria-label="프로필 이미지 제거"
                  >
                    <img src="/images/close_dark.svg" alt="삭제" className="w-4 h-4" />
                  </button>
                )}

                {/* 숨겨진 파일 입력기 */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  multiple={false}
                />
              </div>
            </div>
          </div>

          {/* 오른쪽 - 생년월일, 아이디, 닉네임, 비밀번호 */}
          <div className="text-lg text-gray-200 font-semibold">
            <div className="flex mb-[27px]">
              <label className="w-[100px] text-gray-400">이름</label>
              <p>홍길동</p>
            </div>
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
                    className="border border-gray-300 rounded px-2 py-1 w-[230px]"
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
                  <p className="w-[300px]">{nickname}</p>
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
          <div className="text-lg text-gray-400 font-semibold mr-[70px]">관심사</div>
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

        {/* 경력사항 */}
        <div className="flex items-center">
          <div className="text-lg text-gray-400 font-semibold mr-[60px]">경력사항</div>
          <div className="flex flex-col gap-1">
            {careerList.length === 0 ? (
              <p className="text-gray-300">등록된 경력이 없습니다. 경력사항을 추가해주세요.</p>
            ) : (
              careerList.map(item => (
                <p key={item.id} className="text-gray-700 text-sm">
                  <b>
                    기간 : {item.period} 경력 : {item.career} 첨부파일 :{' '}
                    {item.file && `(${item.file.name})`}
                  </b>
                </p>
              ))
            )}
          </div>

          <button
            onClick={() => setIsCareerModalOpen(true)}
            className="ml-auto text-sm text-gray-400 py-[6px] px-[14px] border border-gray-400 rounded-[5px] font-semibold mr-[4px]"
          >
            경력사항 추가하기
          </button>

          <CareerModal
            open={isCareerModalOpen}
            onClose={() => setIsCareerModalOpen(false)}
            careerList={careerList}
            setCareerList={setCareerList}
          />
        </div>

        <div className="border-b border-gray-300 opacity-30 my-[27px]" />

        {/* 마케팅 수신동의 */}
        <div>
          <div className="text-lg text-gray-400 font-semibold mb-[16px]">마케팅 수신동의</div>
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
            <Link to={'/privacy'} className="text-brand">
              전체보기
            </Link>
            <div className="flex gap-[10px] ml-auto">
              <div>전체 동의</div>
              <Switch checked={checked} onChange={value => setChecked(value)} />
            </div>
          </div>
        </div>
      </div>

      {/* 탈퇴하기 */}
      <Link
        to={'/deleteaccount'}
        className="flex justify-end font-normal text-[12px] text-gray-200 mr-[39px]"
      >
        회원 탈퇴 하기
      </Link>
    </div>
  );
}

export default PasswordEdit;
