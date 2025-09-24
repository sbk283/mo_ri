// 2025-09-24 업데이트: ReactQuill 안정성을 위한 useCallback, useMemo 추가
import { useState, useEffect, useCallback, useMemo } from 'react';
import CreateGroupNavigation from './CreateGroupNavigation';
import { useCurriculum } from '../../hooks/useCurriculum';
import CurriculumCard from './CurriculumCard';
import CreateGroupExample from './CreateGroupExample';
import type { StepTwoProps } from '../../types/group';
import RichTextEditor from './RichTextEditor';

function CreateGroupStepTwo({ formData, onChange, onPrev, onNext }: StepTwoProps) {
  const { files, setFiles, addCurriculum, updateCurriculum, removeCurriculum } = useCurriculum(
    formData.curriculum,
  );

  // 2025-09-24 업데이트: RichTextEditor에서 업로드된 이미지 파일들 보관 (실제 서버 업로드용)
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const handleImagesChange = useCallback((images: File[]) => {
    setImageFiles(prev => [...prev, ...images]); // 2025-09-24 업데이트: 기존 파일들에 새 파일들 추가
  }, []);

  const isValid =
    formData.summary.trim().length > 0 &&
    formData.description.trim().length > 0 &&
    formData.curriculum.length >= 2 &&
    formData.curriculum.every(
      item => item.title.trim().length > 0 && item.detail.trim().length > 0,
    );

  // 2025-09-24 업데이트: 모임 간략 소개 관리 - formData.summary와 연결하여 RichTextEditor 사라짐 문제 해결
  const [tempSummary, setTempSummary] = useState<string>(formData.summary);

  // 2025-09-24 업데이트: formData.summary가 변경될 때 tempSummary 동기화
  useEffect(() => {
    setTempSummary(formData.summary);
  }, [formData.summary]);

  // 2025-09-24 업데이트: onChange 함수 메모이제이션으로 RichTextEditor 안정성 향상
  const handleDescriptionChange = useCallback(
    (content: string) => {
      onChange('description', content);
    },
    [onChange],
  );

  // 2025-09-24 업데이트: RichTextEditor 메모이제이션 - 완전히 안정적인 의존성으로 리렌더링 방지
  const richTextEditor = useMemo(
    () => (
      <RichTextEditor
        value={formData.description}
        onChange={handleDescriptionChange}
        onImagesChange={handleImagesChange}
        placeholder="모임을 자세히 소개해 주세요"
      />
    ),
    [handleDescriptionChange, handleImagesChange], // 2025-09-24 업데이트: formData.description과 editorKey 제거
  );

  return (
    <div className="p-8 bg-white rounded shadow space-y-6">
      <h2 className="text-2xl font-bold mb-6">상세 커리큘럼 작성</h2>
      <hr className="mb-6 pb-[51px] border-brand" />

      {/* 모임 간략 소개 */}
      <div className="flex">
        <label className="flex font-semibold text-lg pr-11">모임 간략 소개</label>
        <input
          type="text"
          placeholder="썸네일에 보여질 간략한 소개를 작성해 주세요."
          value={tempSummary}
          onChange={e => {
            setTempSummary(e.target.value);
            onChange('summary', e.target.value); // 2025-09-24 업데이트: tempSummary와 formData.summary 동시 업데이트
          }}
          className="w-[732px] h-10 border placeholder:text-[#A6A6A6] border-gray-300 rounded px-4 py-2 
                     focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
        />
      </div>

      {/* 모임 소개 (RichTextEditor 적용) */}
      <div className="flex">
        <div className="flex items-start gap-1 pr-[53px]">
          <label className="pt-0.5 font-semibold text-lg leading-none">모임 소개</label>
          <div className="leading-none">
            <CreateGroupExample />
          </div>
        </div>
        <div className="w-[732px] h-[265px]">{richTextEditor}</div>
      </div>

      {/* 커리큘럼 */}
      <div className="space-y-6">
        {formData.curriculum.map((item, i) => (
          <CurriculumCard
            key={i}
            index={i}
            item={item}
            onChange={(index, field, value) =>
              updateCurriculum(index, field, value, formData.curriculum, next =>
                onChange('curriculum', next),
              )
            }
            onRemove={index =>
              removeCurriculum(index, formData.curriculum, next => onChange('curriculum', next))
            }
            onFileChange={(index, file) => {
              const newFiles = [...files];
              newFiles[index] = file;
              setFiles(newFiles);
            }}
          />
        ))}

        {/* 추가/삭제 버튼 */}
        <div className="mt-4 flex justify-end">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                addCurriculum(formData.curriculum, next => onChange('curriculum', next))
              }
              className="w-[84px] h-6 border border-brand text-brand rounded-sm text-md font-semibold"
            >
              추가
            </button>
            <button
              type="button"
              onClick={() =>
                removeCurriculum(formData.curriculum.length - 1, formData.curriculum, next =>
                  onChange('curriculum', next),
                )
              }
              className="w-[84px] h-6 bg-brand text-white rounded-sm text-md font-semibold"
              disabled={formData.curriculum.length <= 2}
            >
              삭제
            </button>
          </div>
        </div>
      </div>

      {/* 네비게이션 */}
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
