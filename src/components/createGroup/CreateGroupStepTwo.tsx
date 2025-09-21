// 모임 생성 - 02_ 상세 커리큘럼 작성
import MDEditor from '@uiw/react-md-editor';
import CreateGroupNavigation from './CreateGroupNavigation';

interface StepTwoProps {
  formData: {
    description: string;
    curriculum: string[];
  };
  onChange: (field: string, value: string | string[]) => void;
  onPrev?: () => void;
  onNext?: () => void;
}

function CreateGroupStepTwo({ formData, onChange, onPrev, onNext }: StepTwoProps) {
  const updateCurriculum = (index: number, value: string) => {
    const newCurriculum = [...formData.curriculum];
    newCurriculum[index] = value;
    onChange('curriculum', newCurriculum);
  };

  return (
    <div className="p-8 bg-white rounded shadow" data-color-mode="light">
      <h2 className="text-2xl font-bold mb-6">상세 커리큘럼 작성</h2>

      {/* Markdown Editor */}
      <div className="mb-6">
        <label className="block mb-2 text-gray-700">모임 소개 (Markdown)</label>
        <MDEditor
          value={formData.description}
          onChange={val => onChange('description', val || '')}
        />
      </div>

      {/* 커리큘럼 */}
      <div className="space-y-4">
        {formData.curriculum.map((item, i) => (
          <input
            key={i}
            type="text"
            placeholder={`커리큘럼 ${i + 1}`}
            value={item}
            onChange={e => updateCurriculum(i, e.target.value)}
            className="w-full border px-4 py-2 rounded"
          />
        ))}
        <button
          type="button"
          onClick={() => onChange('curriculum', [...formData.curriculum, ''])}
          className="px-3 py-2 bg-blue-500 text-white rounded"
        >
          커리큘럼 추가
        </button>
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
