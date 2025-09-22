// 모임 생성 - 03_ 미리보기 / 확정
import { useState } from 'react';
import MarkdownPreview from '@uiw/react-markdown-preview';
import Modal from '../common/modal/Modal';
import CreateGroupNavigation from './CreateGroupNavigation';
import { Navigate, useNavigate } from 'react-router-dom';

interface StepThreeProps {
  formData: {
    title: string;
    region: string;
    memberCount: number;
    description: string;
    curriculum: string[];
  };
  onPrev?: () => void;
  onNext?: () => void;
}

function CreateGroupStepThree({ formData, onPrev, onNext }: StepThreeProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = () => {
    setOpen(true);
  };

  return (
    <div className="p-8 bg-white rounded shadow space-y-6">
      <h2 className="text-2xl font-bold">미리보기 / 확정</h2>

      {/* 기본 정보 */}
      <div className="border rounded p-4">
        <h3 className="text-xl font-semibold">{formData.title}</h3>
        <p className="text-gray-600">
          지역: {formData.region || '지역 미정'} / 인원: {formData.memberCount}명
        </p>
      </div>

      {/* Markdown Preview */}
      <div>
        <h4 className="font-semibold mb-2">모임 소개</h4>
        <MarkdownPreview source={formData.description || '소개 내용이 없습니다.'} />
      </div>

      {/* 커리큘럼 */}
      <div>
        <h4 className="font-semibold mb-2">커리큘럼</h4>
        {formData.curriculum.length > 0 ? (
          <ul className="list-disc pl-5 space-y-1">
            {formData.curriculum.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">커리큘럼이 등록되지 않았습니다.</p>
        )}
      </div>

      {/* 생성 신청 버튼 */}
      <div className="flex justify-end">
        <CreateGroupNavigation
          step={3}
          totalSteps={3}
          onPrev={onPrev!}
          onNext={onNext!}
          onSubmit={handleSubmit}
        />
      </div>
      {/* 완료 모달 */}
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="🎉 신청이 완료되었습니다."
        message="관리자 승인 후 모임 생성이 완료됩니다."
        actions={[
          {
            label: '이전 페이지로',
            onClick: () => navigate(-1),
            variant: 'primary',
          },
        ]}
      />
    </div>
  );
}

export default CreateGroupStepThree;
