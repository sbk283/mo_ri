// 경력 사항 추가 버튼 클릭시 나타나는 모달창
import { Modal } from 'antd';
import { useRef, useState } from 'react';

export type CareerItem = {
  id: number;
  period: string;
  career: string;
  file: File | null;
};

type CareerModalProps = {
  open: boolean;
  onClose: () => void;
  careerList: CareerItem[];
  setCareerList: React.Dispatch<React.SetStateAction<CareerItem[]>>;
  onSave?: () => void;
};

function CareerModal({ open, onClose, careerList, setCareerList, onSave }: CareerModalProps) {
  const [careerInput, setCareerInput] = useState<{
    period: string;
    career: string;
    file: File | null;
  }>({ period: '', career: '', file: null });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 경력 추가 버튼
  const handleAddCareer = () => {
    if (!careerInput.period || !careerInput.career) return; // 입력 체크
    const newCareer = { ...careerInput, id: Date.now() };
    setCareerList(prev => [...prev, newCareer]);
    setCareerInput({ period: '', career: '', file: null });
  };

  // 파일 선택
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCareerInput(prev => ({ ...prev, file: e.target.files![0] }));
    }
  };
  // 파일 버튼 클릭
  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };
  // 저장
  const handleSave = () => {
    console.log('경력 목록:', careerList);
    // TODO: 서버 업로드 로직
    // 저장 완료 콜백 호출 (선택사항)
    onSave?.();
    // 모달 닫기
    onClose();
    // 입력 필드 초기화
    setCareerInput({ period: '', career: '', file: null });
  };

  // 모달 취소/닫기 시에도 입력 필드 초기화
  const handleCancel = () => {
    setCareerInput({ period: '', career: '', file: null });
    onClose();
  };

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={900}>
      <div className="px-[30px] py-[40px]">
        <div className="text-lg font-bold text-gray-400 mb-[18px]">경력사항 추가</div>
        <div className="flex justify-between">
          <div className="text-md text-black">
            <p>본인의 경력을 증빙할 수 있는 서류를 제출해 주세요.</p>
            <p>확인 후 인증 마크가 부여되어 신뢰도 있는 프로필로 보여집니다.</p>
          </div>
        </div>
        <div className="border-b border-gray-300 opacity-30 my-[27px]" />

        {/* 입력*/}
        <div className="flex justify-between gap-3 mb-3">
          <div className="flex gap-[10px]">
            <div className="text-md font-semibold text-gray-400">기간입력</div>
            <input
              type="text"
              placeholder="YYYY.MM ~ YYYY.MM"
              value={careerInput.period}
              onChange={e => setCareerInput(prev => ({ ...prev, period: e.target.value }))}
              className="pl-[5px] border border-gray-300 rounded w-[180px] placeholder:text-gray-300"
            />
          </div>

          <div className="flex gap-[10px]">
            <div className="text-md font-semibold text-gray-400">경력</div>
            <input
              type="text"
              placeholder="회사명/직무"
              value={careerInput.career}
              onChange={e => setCareerInput(prev => ({ ...prev, career: e.target.value }))}
              className="pl-[5px] border border-gray-300 rounded w-[300px] placeholder:text-gray-300 "
            />
          </div>
          <div className="flex gap-[8px]">
            <button
              onClick={handleFileButtonClick}
              className="bg-brand text-white px-4 rounded-[5px]"
            >
              파일첨부
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            <button onClick={handleAddCareer} className="bg-gray-300 px-4 rounded-[5px] text-white">
              경력 추가
            </button>
          </div>
        </div>

        {/* 추가된 경력 리스트 */}
        <div className="mt-2">
          {careerList.map(item => (
            <div key={item.id} className="text-sm text-gray-700 mb-1 flex justify-between">
              <span>
                <b>기간 :</b> {item.period}, <b>경력 :</b> {item.career}, <b>첨부된 파일 :</b>
                {item.file ? `(${item.file.name})` : '없음'}
              </span>
              <button
                onClick={() => setCareerList(prev => prev.filter(c => c.id !== item.id))}
                className="bg-brand-red px-4 rounded-[5px] text-white"
              >
                삭제
              </button>
            </div>
          ))}
        </div>

        {/* 제출가능 서류 예시 */}
        <div className="border-b border-gray-300 opacity-30 my-[27px]" />
        <div className="text-md font-bold text-gray-400 mb-[18px]">제출 가능한 서류 예시</div>
        <div className="text-sm text-black mb-[44px]">
          <p>
            졸업 증명서, 경력 증명서, 재직 증명서, 근로계약서 사본, 프리랜서 계약서, 프로젝트 확인서
            등
          </p>
          <p>제출한 서류가 있는 경력은 인증마크가 부여됩니다.</p>
        </div>
        <div className="flex justify-center">
          <button
            onClick={handleSave}
            className="text-center bg-brand text-md text-white font-medium py-[7px] px-[37px] rounded-[5px]"
          >
            저장하기
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default CareerModal;
