// 커리큘럼 (스텝투)
import type { CurriculumItem } from '../../hooks/useCurriculum';
import { useState } from 'react';

interface CurriculumCardProps {
  index: number;
  item: CurriculumItem;
  onChange: (index: number, field: keyof CurriculumItem, value: string) => void;
  onRemove: (index: number) => void;
  onFileChange: (index: number, files: File[]) => void; // 파일 여러 장 전달하도록 변경
  onAdd: (index: number) => void;
}

function CurriculumCard({
  index,
  item,
  onChange,
  onRemove,
  onFileChange,
  onAdd,
}: CurriculumCardProps) {
  // 로컬 미리보기 상태
  const [previews, setPreviews] = useState<string[]>([]);

  const MAX_PICK = 3; // 한 번에 선택/보여줄 최대 장수

  const handleFileChange = (files: FileList | null) => {
    if (!files) return;
    const selectedFiles = Array.from(files).slice(0, MAX_PICK);

    // 미리보기 URL 생성
    const urls = selectedFiles.map(file => URL.createObjectURL(file));
    // 기존 previews + 새로 추가된 previews (최대 3장)
    const nextPreviews = [...previews, ...urls].slice(0, MAX_PICK);
    setPreviews(nextPreviews);

    onFileChange(index, selectedFiles);
  };

  // 이미지 미리보기 파일 삭제
  const handleRemove = (removeIndex: number) => {
    const nextImages = previews.filter((_, i) => i !== removeIndex);
    setPreviews(nextImages);
  };

  return (
    <div className="rounded space-y-3 relative">
      <div className="flex gap-2 items-start">
        {/* 01번에만 커리큘럼 라벨 표시, 나머지는 placeholder div */}
        {index === 0 ? (
          <label className="flex font-semibold text-lg w-[150px]">커리큘럼</label>
        ) : (
          <div className="w-[150px]" />
        )}

        <span className="font-semibold text-[28px] pr-[10px] text-gray-200">
          {String(index + 1).padStart(2, '0')}
        </span>

        <div className="flex w-[582px] h-10 gap-2">
          <input
            type="text"
            placeholder="단계 제목을 정해주세요."
            value={item.title}
            onChange={e => onChange(index, 'title', e.target.value)}
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 placeholder:text-[#A6A6A6]"
          />
        </div>

        <label className="flex items-center justify-center h-10 w-20 border whitespace-nowrap placeholder:text-[#A6A6A6] border-gray-300 rounded-sm cursor-pointer text-sm text-[#5D5C5C]">
          <img src="/images/file_blue.svg" alt="파일첨부" />
          파일첨부
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={e => handleFileChange(e.target.files)}
          />
        </label>
      </div>

      <div className="flex justify-end">
        <textarea
          placeholder="각 단계별 상세 진행 내용을 설명해 주세요.&#10;각 단계에서는 무엇을, 어떻게 진행되는지 작성해 주세요."
          value={item.detail}
          onChange={e => onChange(index, 'detail', e.target.value)}
          className="w-[730px] h-[159px] resize-none mr-4 border py-3 px-3 placeholder:text-[#A6A6A6] border-gray-300 rounded-sm"
        />
      </div>

      {/* 파일 미리보기 - 항상 3칸 보여줌 */}
      <div className="flex mt-2 gap-[362px]">
        <div className="flex gap-2 pl-[150px]">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="relative w-20 h-20 border border-[#D9D9D9] rounded-[5px] overflow-hidden flex items-center justify-center bg-white"
            >
              {previews[i] ? (
                <>
                  <img
                    src={previews[i]}
                    alt={`preview-${i}`}
                    className="w-full h-full object-cover"
                  />
                  {/* ========== X 버튼!!! ========== */}
                  <button
                    type="button"
                    onClick={() => handleRemove(i)}
                    className="absolute top-1 right-1"
                  >
                    <img src="/images/close_dark.svg" alt="x버튼" className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <span className="text-gray-300 text-xs">+</span>
              )}
            </div>
          ))}
        </div>

        {/* 개별 추가/삭제 버튼 */}
        <div className="flex justify-end gap-2 mr-4 pl-2">
          {index >= 2 ? (
            <>
              <button
                type="button"
                onClick={() => onAdd(index)}
                className="w-12 h-7 border border-brand text-brand rounded-sm text-md font-semibold"
              >
                추가
              </button>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="w-12 h-7 bg-brand text-white rounded-sm text-md font-semibold"
              >
                삭제
              </button>
            </>
          ) : (
            <>
              <div className="w-12 h-7"></div>
              <button
                type="button"
                onClick={() => onAdd(index)}
                className="w-12 h-7 border border-brand text-brand rounded-sm text-md font-semibold"
              >
                추가
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CurriculumCard;
