import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { StepTwoProps } from '../../types/group';
import CreateGroupNavigation from './CreateGroupNavigation';
import MeetingHeader from '../common/prevgroup/MeetingHeader';
import Modal from '../common/modal/Modal';
import { calcDday } from '../../utils/date';
import MeetingCurriculum from '../common/prevgroup/MeetingCurriculum';

type StepThreeProps = Omit<StepTwoProps, 'onChange'>;

function CreateGroupStepThree({ formData, onPrev, onNext }: StepThreeProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = () => {
    setOpen(true);
  };

  // 이미지 URL 변환 (최대 9장)
  // const imageUrls = formData.images.slice(0, 9).map(file => URL.createObjectURL(file));

  // D-Day 계산
  const dday = calcDday(formData.startDate);

  return (
    <div className="flex flex-col p-8 bg-white rounded shadow space-y-6">
      <h2 className="text-2xl font-bold">미리보기 / 확정</h2>
      <hr className="mb-6 pb-[51px] border-brand" />
      <div className="p-8 bg-white rounded shadow space-y-8">
        {/* 상단 MeetingHeader */}
        <MeetingHeader
          formData={formData}
          dday={dday}
          isFavorite={false}
          mode="preview"
          onFavoriteToggle={() => {}}
          onApply={() => {}}
        />

        {/* 모임 소개 */}
        <div>
          <h4 className="font-semibold mb-2">모임 소개</h4>
          <div
            className="prose max-w-none border p-4 rounded"
            dangerouslySetInnerHTML={{
              __html: formData.description || '<p>소개 내용이 없습니다.</p>',
            }}
          />
        </div>

        {/* 커리큘럼 */}
        <MeetingCurriculum formData={formData} />

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
