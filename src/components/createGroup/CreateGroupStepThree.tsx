// 모임 생성 - 03_ 미리보기 / 확정
import { useState } from 'react';
import MarkdownPreview from '@uiw/react-markdown-preview';
import Modal from '../common/modal/Modal';
import CreateGroupNavigation from './CreateGroupNavigation';
import { useNavigate } from 'react-router-dom';
import type { StepTwoProps } from '../../hooks/useCurriculum';

type StepThreeProps = Omit<StepTwoProps, 'onChange'>;

function CreateGroupStepThree({ formData, onPrev, onNext }: StepThreeProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = () => {
    setOpen(true);
  };

  return (
    <div className="p-8 bg-white rounded shadow space-y-6">
      <h2 className="text-2xl font-bold">미리보기 / 확정</h2>
      <div className="p-8 bg-white rounded shadow space-y-8">
        {/* 상단 - 대표 이미지 + 정보 */}
        <div className="flex gap-6">
          {/* 대표 이미지 */}
          <div className="w-60 h-40 rounded overflow-hidden">
            {formData.images[0] ? (
              <img
                src={URL.createObjectURL(formData.images[0])}
                alt="대표 이미지"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                이미지 없음
              </div>
            )}
          </div>

          {/* 기본 정보 */}
          <div className="flex-1 space-y-2">
            <h3 className="text-xl font-bold">{formData.title}</h3>
            <p className="text-gray-600">{formData.summary || '간략 소개 없음'}</p>
            <p className="text-gray-500 text-sm">
              지역: {formData.regionFree ? '지역 무관' : formData.region || '미정'} / 인원:{' '}
              {formData.memberCount}명 / 기간: {formData.startDate || '시작일 미정'} ~{' '}
              {formData.endDate || '종료일 미정'}
            </p>
            <button className="mt-2 px-4 py-1 bg-brand text-white rounded">참가하기</button>
          </div>
        </div>

        {/* 탭 - 모임 소개 / 커리큘럼 */}
        <div>
          <h4 className="font-semibold mb-2">모임 소개</h4>
          <MarkdownPreview source={formData.description || '소개 내용이 없습니다.'} />
        </div>

        {/* 커리큘럼 */}
        <div>
          <h4 className="font-semibold mb-2">커리큘럼</h4>
          <div className="space-y-4">
            {formData.curriculum.map((item, i) => (
              <div key={i} className="border rounded p-3">
                <p className="font-bold text-brand">{String(i + 1).padStart(2, '0')} 단계</p>
                <p className="text-lg font-semibold">{item.title || '제목 없음'}</p>
                <p className="text-gray-600">{item.detail || '내용 없음'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 상세 정보 테이블 */}
        <div>
          <h4 className="font-semibold mb-2">모임 상세 정보</h4>
          <table className="w-full border text-sm">
            <tbody>
              <tr className="border-b">
                <td className="bg-gray-50 px-4 py-2 w-32 font-medium">이름</td>
                <td className="px-4 py-2">{formData.title}</td>
              </tr>
              <tr className="border-b">
                <td className="bg-gray-50 px-4 py-2 font-medium">위치</td>
                <td className="px-4 py-2">
                  {formData.regionFree ? '지역 무관' : formData.region || '미정'}
                </td>
              </tr>
              <tr>
                <td className="bg-gray-50 px-4 py-2 font-medium">회차</td>
                <td className="px-4 py-2">총 {formData.curriculum.length}회</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 네비게이션 */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onPrev}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700"
          >
            이전 단계
          </button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-brand text-white rounded">
            생성 신청
          </button>
        </div>
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
