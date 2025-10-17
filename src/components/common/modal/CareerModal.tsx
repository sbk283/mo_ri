// 경력 사항 추가 버튼 클릭시 나타나는 모달창
import { DatePicker, Modal } from 'antd';
import { Dayjs } from 'dayjs';
import { useEffect, useRef, useState } from 'react';

export type CareerItem = {
  id: string;
  period: string;
  career: string;
  file: File | null;
};

type CareerModalProps = {
  open: boolean;
  onClose: () => void;
  careerList: CareerItem[];
  // setCareerList: React.Dispatch<React.SetStateAction<CareerItem[]>>;
  onSave?: (updatedList: CareerItem[], originalList: CareerItem[]) => void | Promise<void>;
};

function CareerModal({ open, onClose, careerList, onSave }: CareerModalProps) {
  // 모달 내부에서만 사용하는 임시 경력 목록
  const [tempCareerList, setTempCareerList] = useState<CareerItem[]>([]);
  // 원본 리스트 저장 (변경사항 비교용)
  const [originalList, setOriginalList] = useState<CareerItem[]>([]);

  const [careerInput, setCareerInput] = useState<{
    startDate: Dayjs | null;
    endDate: Dayjs | null;
    career: string;
    file: File | null;
  }>({ startDate: null, endDate: null, career: '', file: null });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 모달이 열릴 때 현재 careerList를 복사해서 임시 목록으로 사용
  useEffect(() => {
    if (open) {
      const listCopy = [...careerList];
      setTempCareerList(listCopy);
      setOriginalList(listCopy);
    }
  }, [open, careerList]);

  // 경력 추가 버튼
  const handleAddCareer = () => {
    if (!careerInput.startDate || !careerInput.endDate || !careerInput.career) return;

    const period = `${careerInput.startDate.format('YYYY/MM/DD')} ~ ${careerInput.endDate.format('YYYY/MM/DD')}`;
    const newCareer: CareerItem = {
      id: Date.now().toString(),
      period,
      career: careerInput.career,
      file: careerInput.file,
    };

    setTempCareerList(prev => [...prev, newCareer]);
    setCareerInput({ startDate: null, endDate: null, career: '', file: null });
  };

  // 파일 선택
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCareerInput(prev => ({ ...prev, file: e.target.files![0] }));
    }
  };

  // 경력 삭제 (임시 목록에서만 삭제)
  const handleDeleteCareer = (careerId: string) => {
    setTempCareerList(prev => prev.filter(c => c.id !== careerId));
  };

  // 저장
  const handleSave = () => {
    // 부모 컴포넌트에 변경사항 전달 (DB 작업은 부모에서 수행)
    onSave?.(tempCareerList, originalList);
    // 모달 닫기
    onClose();
    // 입력 필드 초기화
    setCareerInput({ startDate: null, endDate: null, career: '', file: null });
  };

  // 변경사항이 있는지 확인
  const hasChanges =
    tempCareerList.length !== careerList.length ||
    JSON.stringify(tempCareerList) !== JSON.stringify(careerList);

  // 모달 닫기 (저장 안하고 닫으면 변경사항 무시)
  const handleCancel = () => {
    onClose();
    // 입력 필드 초기화
    setCareerInput({ startDate: null, endDate: null, career: '', file: null });
  };

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={900}>
      <div className="px-[30px] py-[40px]">
        <div className="text-lg font-bold text-gray-400 mb-[18px]">경력사항 추가</div>
        <div className="flex justify-between mb-[26px]">
          <div className="text-md text-black">
            <p>본인의 경력을 증빙할 수 있는 서류를 제출해 주세요.</p>
            <p>확인 후 인증 마크가 부여되어 신뢰도 있는 프로필로 보여집니다.</p>
          </div>
        </div>

        {/* 입력*/}

        <div className="flex items-center gap-6 mb-3">
          <div className="flex items-center gap-[10px]">
            <div className="text-md font-semibold text-gray-400">기간입력</div>
            <DatePicker.RangePicker
              value={
                careerInput.startDate && careerInput.endDate
                  ? [careerInput.startDate, careerInput.endDate]
                  : undefined
              }
              onChange={dates => {
                setCareerInput(prev => ({
                  ...prev,
                  startDate: dates ? dates[0] : null,
                  endDate: dates ? dates[1] : null,
                }));
              }}
              format="YYYY/MM/DD"
            />
          </div>

          <div className="flex items-center gap-[10px]">
            <div className="text-md font-semibold text-gray-400">경력</div>

            <input
              type="text"
              placeholder="회사명/직무"
              value={careerInput.career}
              onChange={e => setCareerInput(prev => ({ ...prev, career: e.target.value }))}
              className="p-[4px] border border-[#D9D9D9] rounded-[6px] w-[376px] placeholder:text-gray-300 "
            />
          </div>
        </div>

        {/* 파일첨부 / 경력 추가 */}
        <div className="flex justify-between items-center">
          <div className="flex gap-[10px] items-center">
            <label className="text-md font-semibold text-gray-400">첨부파일</label>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

            {/* 선택된 파일 이름 표시 */}

            <div>
              <span className="text-sm text-gray-700">
                {' '}
                {careerInput.file
                  ? `첨부된 파일 : ${careerInput.file.name}`
                  : '첨부된 파일이 없습니다. 파일 선택을 클릭해서 첨부파일을 등록해 보세요.'}
              </span>
            </div>
          </div>
          <div className="flex gap-[10px]">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className=" text-brand border border-brand py-1 px-3 rounded-[5px] text-sm "
            >
              파일 선택
            </button>
            <button
              onClick={handleAddCareer}
              className="bg-brand py-1 px-3 font-medium rounded-[5px] text-white"
            >
              경력 추가
            </button>
          </div>
        </div>

        <div className="border-b border-gray-300 opacity-30 my-[27px]" />

        {/* 추가된 경력 리스트 */}
        <div className="text-md font-semibold text-gray-400">등록된 경력 리스트</div>
        <div className="mt-2">
          {tempCareerList.length === 0 ? (
            <div className="text-sm text-black">
              등록된 경력이 없습니다. 경력추가를 눌러 경력을 추가해 보세요.
            </div>
          ) : (
            tempCareerList.map(item => (
              <div
                key={item.id}
                className="text-sm text-gray-700 mb-2 flex justify-between items-center"
              >
                <div>
                  <span className="mr-[15px]">
                    <b className="mr-[5px]">기간 : </b> {item.period}
                  </span>
                  <span className="mr-[15px]">
                    <b className="mr-[5px]">경력 :</b> {item.career}
                  </span>
                  <span className="mr-[15px]">
                    <b className="mr-[5px]">첨부된 파일 :</b>
                    {item.file ? `(${item.file.name})` : '없음'}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteCareer(item.id)}
                  className="bg-brand-red py-1 px-3 rounded-[5px] text-white"
                >
                  삭제
                </button>
              </div>
            ))
          )}
        </div>

        <div className="border-b border-gray-300 opacity-30 my-[27px]" />

        {/* 저장하지 않고 닫을 때 경고 메시지 */}
        {hasChanges && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-[5px] p-4 mb-[27px]">
            <div className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-yellow-600 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-sm font-semibold text-yellow-800">
                  저장되지 않은 변경사항이 있습니다
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  "저장하기" 버튼을 누르지 않고 창을 닫으면 추가하거나 삭제한 경력이 반영되지
                  않습니다.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 제출가능 서류 예시 */}
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
