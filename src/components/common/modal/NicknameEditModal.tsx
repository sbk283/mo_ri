import { useState } from 'react';

interface NicknameEditModalProps {
  currentNickname: string;
  onClose: () => void;
  onSave: (newNickname: string) => void;
}

function NicknameEditModal({ currentNickname, onClose, onSave }: NicknameEditModalProps) {
  const [tempNickname, setTempNickname] = useState(currentNickname);
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  // 유효성 검사
  const validateNickname = (value: string) => {
    if (!value) return '닉네임을 입력해주세요.';

    // 공백 포함 여부
    if (/\s/.test(value)) return '닉네임에 공백을 사용할 수 없습니다.';
    const trimmed = value.trim();

    // 글자수 제한
    if (trimmed.length < 2 || trimmed.length > 10)
      return '닉네임은 2자 이상, 10자 이하로 입력해주세요.';
    //특수문자 제한
    if (/[^\uAC00-\uD7A3a-zA-Z0-9]/.test(trimmed))
      return '특수문자 또는 자음/모음만 단독으로 사용할 수 없습니다.';
    // 자음모음 제한
    if (/[ㄱ-ㅎㅏ-ㅣ]/.test(trimmed)) return '자음 또는 모음만 단독으로 사용할 수 없습니다.';
    return '';
  };

  // 중복 확인 (서버와 연결 시 fetch로 대체)
  const handleCheckDuplicate = async () => {
    setIsChecking(true);
    setTimeout(() => {
      if (tempNickname === '홍길동') {
        setError('이미 사용 중인 닉네임입니다.');
        setIsAvailable(false);
      } else {
        setError('');
        setIsAvailable(true);
      }
      setIsChecking(false);
    }, 800);
  };

  //  저장
  const handleSave = () => {
    const errMsg = validateNickname(tempNickname);
    if (errMsg) return setError(errMsg);
    if (!isAvailable) return setError('닉네임 중복 확인을 해주세요.');
    onSave(tempNickname.trim());
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black/50 z-50 transition-opacity duration-300 ${
        isAvailable !== null ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        className={`bg-white rounded-[5px] p-6 w-[500px] transform transition-transform duration-300 ${
          isAvailable !== null ? 'scale-100' : 'scale-95'
        }`}
      >
        <h2 className="text-lg font-semibold mb-4 text-gray-800">닉네임 변경</h2>

        <input
          type="text"
          value={tempNickname}
          onChange={e => {
            const value = e.target.value;
            setTempNickname(value);

            const errMsg = validateNickname(value);
            setError(errMsg);

            setIsAvailable(false);
          }}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          className={`border rounded-[5px] placeholder:text-md placeholder:text-gray-200 px-3 py-2 w-full ${
            error ? 'border-brand-red' : isAvailable ? 'border-brand' : 'border-gray-300'
          }`}
          placeholder="새 닉네임을 입력하세요."
        />

        {error && <p className="text-brand-red text-xs mt-1">{error}</p>}
        {!error && isAvailable && (
          <p className="text-brand text-sm mt-1">사용 가능한 닉네임입니다.</p>
        )}

        <div className="flex justify-between mt-4">
          <button
            onClick={handleCheckDuplicate}
            disabled={isChecking}
            className={`text-sm border py-[6px] px-[12px] rounded-[5px] ${
              !!error
                ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                : 'border-brand text-brand'
            }`}
          >
            {isChecking ? '확인 중...' : '중복 확인'}
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="text-sm text-gray-500 border border-gray-300 py-[6px] px-[18px] rounded-[5px]"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={!isAvailable || !!error}
              className={`text-sm py-[6px] px-[18px] rounded-[5px] font-semibold ${
                !isAvailable || !!error
                  ? 'bg-brand text-white cursor-not-allowed'
                  : 'bg-brand text-white hover:bg-brand-dark'
              }`}
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NicknameEditModal;
