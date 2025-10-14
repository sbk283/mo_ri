import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { StepTwoProps } from '../../types/group';
import { calcDday } from '../../utils/date';
import Modal from '../common/modal/Modal';
import MeetingHeader from '../common/prevgroup/MeetingHeader';
import CreateGroupNavigation from './CreateGroupNavigation';
import MeetingTabs from '../common/prevgroup/MeetingTabs';

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
      <hr className="mb-6 pb-3 border-brand" />
      <div className="space-y-8">
        {/* 상단 MeetingHeader */}
        <MeetingHeader
          title={formData.title}
          status="모집중"
          category={formData.interestMajor}
          subCategory={formData.interestSub}
          summary={formData.summary}
          dday={dday}
          duration={`${formData.startDate} ~ ${formData.endDate}`}
          participants={`0/${formData.memberCount}`}
          images={formData.images.map(file => URL.createObjectURL(file))}
          isFavorite={false}
          mode="preview"
          onFavoriteToggle={() => {}}
          onApply={() => {}}
        />

        {/* 모임 소개 - 이 안에 모임장, 커리큘럼 다모아놈 */}
        <MeetingTabs
          intro={formData.description}
          curriculum={formData.curriculum.map((c, i) => ({
            title: c.title,
            detail: c.detail,
            files: formData.files?.[i]?.map(f => URL.createObjectURL(f)) ?? [],
          }))}
          leader={{
            name: formData.leaderName,
            location: formData.leaderLocation,
            career: formData.leaderCareer,
          }}
        />
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
            label: '모임 페이지로',
            onClick: () => navigate('/grouplist'),
            variant: 'primary',
          },
        ]}
      />
    </div>
  );
}

export default CreateGroupStepThree;
