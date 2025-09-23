// 커리큘럼 (스텝투)
import type { CurriculumItem } from '../../hooks/useCurriculum';

interface CurriculumCardProps {
  index: number;
  item: CurriculumItem;
  onChange: (index: number, field: keyof CurriculumItem, value: string) => void;
  onRemove: (index: number) => void;
  onFileChange: (index: number, file: File | null) => void;
}

function CurriculumCard({ index, item, onChange, onRemove, onFileChange }: CurriculumCardProps) {
  return (
    <div className="rounded p-4 space-y-3 relative">
      <div className="flex gap-2 items-center">
        <label className="flex font-semibold text-lg pr-16">커리큘럼</label>
        <span className="font-semibold text-[28px] pr-[10px] text-gray-200">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="flex w-[582px] h-10 gap-2">
          <input
            type="text"
            placeholder="단계 제목을 정해주세요."
            value={item.title}
            onChange={e => onChange(index, 'title', e.target.value)}
            className="flex-1 border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
        <label className="flex items-center justify-center h-10 w-20 border whitespace-nowrap placeholder:text-[#A6A6A6] border-gray-300 rounded-sm cursor-pointer text-sm text-[#5D5C5C]">
          <img src="/images/file_blue.svg" alt="파일첨부" />
          파일첨부
          <input
            type="file"
            className="hidden"
            onChange={e => onFileChange(index, e.target.files?.[0] || null)}
          />
        </label>
        {/* {index >= 2 && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="w-[84px] h-6 bg-brand text-white rounded-sm text-md font-semibold"
          >
            삭제
          </button>
        )} */}
      </div>
      <div className="flex justify-end">
        <textarea
          placeholder="각 단계별 상세 진행 내용을 설명해 주세요.&#10;각 단계에서는 무엇을, 어떻게 진행되는지 작성해 주세요."
          value={item.detail}
          onChange={e => onChange(index, 'detail', e.target.value)}
          className="w-[732px] h-[159px] border py-3 px-3 placeholder:text-[#A6A6A6] border-gray-300 rounded-sm"
        />
      </div>
    </div>
  );
}

export default CurriculumCard;
