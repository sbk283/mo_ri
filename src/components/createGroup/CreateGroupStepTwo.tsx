// 모임 생성 - 02_ 상세 커리큘럼 작성
import MDEditor from '@uiw/react-md-editor';
import CreateGroupNavigation from './CreateGroupNavigation';
import { useCurriculum } from '../../hooks/useCurriculum';
import CurriculumCard from './CurriculumCard';
import CreateGroupExample from './CreateGroupExample';
import type { StepTwoProps } from '../../types/group';

function CreateGroupStepTwo({ formData, onChange, onPrev, onNext }: StepTwoProps) {
  const { files, setFiles, addCurriculum, updateCurriculum, removeCurriculum } = useCurriculum(
    formData.curriculum,
  );

  return (
    <div className="p-8 bg-white rounded shadow space-y-6" data-color-mode="light">
      <h2 className="text-2xl font-bold mb-6">상세 커리큘럼 작성</h2>
      <hr className="mb-6 pb-[51px] border-brand" />
      {/* 모임 간략 소개 */}
      <div className="flex">
        <label className="flex font-semibold text-lg pr-11">모임 간략 소개</label>
        <input
          type="text"
          placeholder="썸네일에 보여질 간략한 소개를 작성해 주세요."
          value={formData.summary}
          onChange={e => onChange('summary', e.target.value)}
          className="w-[732px] h-10 border placeholder:text-[#A6A6A6] border-brand rounded px-4 py-2"
        />
      </div>
      {/* 모임 소개 */}
      <div className="flex">
        <div className="flex items-start gap-1 pr-[53px]">
          <label className="pt-0.5 font-semibold text-lg leading-none">모임 소개</label>
          <div className="leading-none">
            <CreateGroupExample />
          </div>
        </div>
        <MDEditor
          value={formData.description}
          onChange={val => onChange('description', val || '')}
          height={300}
          className="w-[732px] h-[265px]"
        />
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
            // 어차피 이거는 뒤에서부터 삭제할거니까 있을 필욘 없긴한데 일단 주석처리해놂. (props도 옵셔널로 일단은 둿음), 개별로 삭제 처리 구현 하시나용?
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
      />
    </div>
  );
}

export default CreateGroupStepTwo;
