import { useCallback, useMemo, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { useCurriculum } from "../../hooks/useCurriculum";
import type { CurriculumItem, StepTwoProps } from "../../types/group";
import CreateGroupExample from "./CreateGroupExample";
import CreateGroupNavigation from "./CreateGroupNavigation";
import CurriculumCard from "./CurriculumCard";
import RichTextEditor from "./RichTextEditor";

function CreateGroupStepTwo({
  formData,
  onChange,
  onPrev,
  onNext,
}: StepTwoProps) {
  const { addCurriculum, updateCurriculum, removeCurriculum } = useCurriculum();

  const [tempSummary, setTempSummary] = useState<string>(formData.summary);

  // 모임 소개 (RichText)
  const handleDescriptionChange = useCallback(
    (content: string) => onChange("description", content),
    [onChange],
  );

  // 본문 이미지 핸들러
  const handleImagesChange = useCallback((images: File[]) => {
    // console.log('본문 이미지:', images);
  }, []);

  // 간략 소개
  const handleSummaryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setTempSummary(value);
      onChange("summary", value);
    },
    [onChange],
  );

  // 커리큘럼 개별 필드 수정
  const handleCurriculumChange = useCallback(
    <K extends keyof CurriculumItem>(
      index: number,
      field: K,
      value: CurriculumItem[K],
    ) => {
      updateCurriculum(index, field, value, formData.curriculum, (next) =>
        onChange("curriculum", next),
      );
    },
    [formData.curriculum, onChange, updateCurriculum],
  );

  // 커리큘럼 파일 변경
  const handleCurriculumFileChange = useCallback(
    (index: number, files: File[]) => {
      updateCurriculum(index, "files", files, formData.curriculum, (next) =>
        onChange("curriculum", next),
      );
    },
    [formData.curriculum, onChange, updateCurriculum],
  );

  // 커리큘럼 추가
  const handleAddCurriculum = useCallback(
    (index: number) => {
      addCurriculum(
        formData.curriculum,
        (next) => onChange("curriculum", next),
        index,
      );
    },
    [formData.curriculum, onChange, addCurriculum],
  );

  // 커리큘럼 삭제
  const handleRemoveCurriculum = useCallback(
    (index: number) => {
      removeCurriculum(index, formData.curriculum, (next) =>
        onChange("curriculum", next),
      );
    },
    [formData.curriculum, onChange, removeCurriculum],
  );

  // 리치 텍스트 에디터 메모이제이션
  const richTextEditor = useMemo(
    () => (
      <RichTextEditor
        value={formData.description}
        onChange={handleDescriptionChange}
        onImagesChange={handleImagesChange}
        placeholder="모임을 자세히 소개해 주세요"
      />
    ),
    [formData.description, handleDescriptionChange, handleImagesChange],
  );

  // 유효성 검사
  const isValid =
    formData.summary.trim().length > 0 &&
    formData.description.trim().length > 0 &&
    formData.curriculum.length >= 2 &&
    formData.curriculum.every(
      (item) => item.title.trim().length > 0 && item.detail.trim().length > 0,
    );

  return (
    <div className="p-8 bg-white rounded shadow space-y-6">
      <h2 className="flex justify-start text-2xl font-bold mb-6">
        상세 커리큘럼 작성
      </h2>
      <hr className="mb-6 pb-[51px] border-brand" />

      {/* 요약 */}
      <div className="flex">
        <label className="flex font-semibold text-lg pr-11">
          모임 간략 소개
        </label>
        <input
          type="text"
          value={tempSummary}
          onChange={handleSummaryChange}
          placeholder="썸네일에 보여질 간략한 소개를 작성해 주세요."
          className="w-[732px] h-10 border border-gray-300 rounded px-4 py-2 placeholder:text-[#A6A6A6]"
        />
      </div>

      {/* 모임 소개 */}
      <div className="flex">
        <div className="flex items-start gap-1 pr-[51px]">
          <label className="pt-0.5 font-semibold text-lg leading-none">
            모임 소개
          </label>
          <CreateGroupExample />
        </div>
        <div className="w-[732px] h-[274px] overflow-y-auto custom-scrollbar z-[0]">
          {richTextEditor}
        </div>
      </div>

      {/* 커리큘럼 */}
      <DragDropContext
        onDragEnd={(result) => {
          if (!result.destination) return; // 드롭 안 하면 무시

          const items = Array.from(formData.curriculum);
          const [reordered] = items.splice(result.source.index, 1);
          items.splice(result.destination.index, 0, reordered);

          onChange("curriculum", items); // 순서 업데이트
        }}
      >
        <Droppable droppableId="curriculum-list">
          {(provided) => (
            <div
              className="space-y-6"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {formData.curriculum.map((item, i) => (
                <Draggable key={i} draggableId={String(i)} index={i}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <CurriculumCard
                        index={i}
                        item={item}
                        onChange={handleCurriculumChange}
                        onFileChange={handleCurriculumFileChange}
                        onAdd={handleAddCurriculum}
                        onRemove={handleRemoveCurriculum}
                        dragHandleProps={provided.dragHandleProps}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <CreateGroupNavigation
        step={2}
        totalSteps={3}
        onPrev={onPrev || (() => {})}
        onNext={onNext || (() => {})}
        disableNext={!isValid}
      />
    </div>
  );
}

export default CreateGroupStepTwo;
