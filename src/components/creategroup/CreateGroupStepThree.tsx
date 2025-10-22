import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useGroup } from '../../contexts/GroupContext';
import { useGroupMember } from '../../contexts/GroupMemberContext';
import { getProfile } from '../../lib/profile';
import type { StepTwoProps } from '../../types/group';
import { calcDday } from '../../utils/date';
import Modal from '../common/modal/Modal';
import MeetingHeader from '../common/prevgroup/MeetingHeader';
import MeetingTabs from '../common/prevgroup/MeetingTabs';
import CreateGroupNavigation from './CreateGroupNavigation';
import type { careers } from '../../types/careerType';

type StepThreeProps = Omit<StepTwoProps, 'onChange'>;

function CreateGroupStepThree({ formData, onPrev, onNext }: StepThreeProps) {
  const { user } = useAuth();
  const { fetchUserCareers } = useGroupMember();
  const [leaderCareers, setLeaderCareers] = useState<careers[]>([]);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [leaderName, setLeaderName] = useState('');
  const navigate = useNavigate();
  const { createGroup } = useGroup();

  // 모임 등록 함수
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await createGroup(formData);
      setOpen(true);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  // 프로필 정보
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      const profile = await getProfile(user.id);
      if (profile?.name) setLeaderName(profile.name);
    };
    fetchProfileData();
  }, [user]);

  // 대표 커리어
  useEffect(() => {
    const fetchCareerData = async () => {
      if (!user) return;
      const data = await fetchUserCareers(user.id);
      setLeaderCareers(data);
    };
    fetchCareerData();
  }, [user, fetchUserCareers]);

  // D-Day 계산
  const dday = calcDday(formData.startDate);

  return (
    <div className="flex flex-col p-8 bg-white rounded shadow space-y-6">
      <h2 className="text-2xl font-bold">미리보기 / 확정</h2>
      <hr className="mb-6 pb-3 border-brand" />

      <div className="space-y-8">
        {/* 상단 MeetingHeader */}
        <MeetingHeader
          groupId="preview-temp-id" // 스텝3에는 임시값 (원래는 {group.groupId} 들어감~)
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
          curriculum={formData.curriculum.map(c => ({
            title: c.title,
            detail: c.detail,
            files: c.files ? c.files.map(f => URL.createObjectURL(f)) : [],
          }))}
          leader={{
            name: leaderName || '이름 정보 없음',
            location: formData.group_region || '활동 지역 미입력',
            career:
              leaderCareers.length > 0
                ? leaderCareers.map(career => ({
                    company_name: career.company_name,
                    start_date: career.start_date,
                    end_date: career.end_date,
                    career_image_url: career.career_image_url,
                  }))
                : [],
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
          disableNext={submitting}
        />
      </div>

      {/* 완료 모달 */}
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="🎉 모임이 등록되었습니다!"
        message="이제 모임이 리스트에 바로 표시됩니다."
        actions={[
          {
            label: '모임 리스트로 이동',
            onClick: () => navigate('/grouplist'),
            variant: 'primary',
          },
        ]}
      />
    </div>
  );
}

export default CreateGroupStepThree;
