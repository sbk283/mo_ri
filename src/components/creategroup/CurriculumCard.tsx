import type { CurriculumItem } from "../../types/group";

interface CurriculumCardProps {
  index: number;
  item: CurriculumItem;
  onChange: <K extends keyof CurriculumItem>(
    index: number,
    field: K,
    value: CurriculumItem[K],
  ) => void;
  onRemove: (index: number) => void;
  onFileChange: (index: number, files: File[]) => void;
  onAdd: (index: number) => void;
  dragHandleProps?: any;
}

function CurriculumCard({
  index,
  item,
  onChange,
  onRemove,
  onFileChange,
  onAdd,
  dragHandleProps,
}: CurriculumCardProps) {
  const MAX_PICK = 3;

  const handleFileChange = (files: FileList | null) => {
    if (!files) return;
    const selected = Array.from(files).slice(0, MAX_PICK);
    const prevFiles = item.files ?? [];
    const nextFiles = [...prevFiles, ...selected].slice(0, MAX_PICK);
    onFileChange(index, nextFiles);
  };

  const handleRemoveFile = (removeIndex: number) => {
    const nextFiles = (item.files ?? []).filter((_, i) => i !== removeIndex);
    onFileChange(index, nextFiles);
  };

  return (
    <div className="rounded space-y-3 relative">
      <div className="flex gap-2 items-start">
        {index === 0 ? (
          <label className="flex font-semibold text-lg w-[150px]">
            커리큘럼
          </label>
        ) : (
          <div className="w-[150px]" />
        )}

        <span
          {...dragHandleProps}
          className="font-semibold text-[28px] pr-[10px] text-gray-200 cursor-grab"
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        <div className="flex w-[582px] h-10 gap-2">
          <input
            type="text"
            value={item.title}
            onChange={(e) => onChange(index, "title", e.target.value)}
            placeholder="단계 제목을 정해주세요."
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 placeholder:text-[#A6A6A6]"
          />
        </div>

        <label className="flex items-center justify-center h-10 w-20 border border-gray-300 rounded-sm cursor-pointer text-sm text-[#5D5C5C] gap-1">
          <img src="/images/file_blue.svg" alt="파일첨부" />
          파일첨부
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files)}
          />
        </label>
      </div>

      {/* 상세 내용 */}
      <div className="flex justify-end">
        <textarea
          value={item.detail}
          onChange={(e) => onChange(index, "detail", e.target.value)}
          placeholder="각 단계별 상세 진행 내용을 설명해 주세요."
          className="w-[730px] h-[159px] resize-none mr-4 border border-gray-300 rounded-sm px-3 py-2 placeholder:text-[#A6A6A6]"
        />
      </div>

      <div className="flex justify-between">
        {/* 파일 미리보기 */}
        <div className="bg-white w-[430px]">
          {item.files && item.files.length > 0 && (
            <div className="flex gap-2 pl-[150px] mt-2">
              {item.files.map((file, i) => (
                <div
                  key={i}
                  className="relative w-20 h-20 border rounded overflow-hidden"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`preview-${i}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(i)}
                    className="absolute top-1 right-1"
                  >
                    <img
                      src="/images/close_dark.svg"
                      alt="삭제"
                      className="w-4 h-4"
                    />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* 추가/삭제 버튼 */}
        <div className="flex justify-end gap-2 mr-4">
          <button
            type="button"
            onClick={() => onAdd(index)}
            className="w-12 h-7 border border-brand text-brand rounded-sm text-md font-semibold"
          >
            추가
          </button>
          {index >= 2 && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="w-12 h-7 bg-brand text-white rounded-sm text-md font-semibold"
            >
              삭제
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CurriculumCard;
