import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { StepTwoProps } from '../../types/group';
import CreateGroupNavigation from './CreateGroupNavigation';
import MeetingHeader from '../common/prevgroup/MeetingHeader';
import Modal from '../common/modal/Modal';

type StepThreeProps = Omit<StepTwoProps, 'onChange'>;

// 유틸 함수 (날짜 계산 함수)
function calcDday(startDate: string): string {
  if (!startDate) return 'D-?';
  const today = new Date();
  const start = new Date(startDate);
  const diff = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? `D-${diff}` : `D+${Math.abs(diff)}`;
}

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

        {/* 기본 정보 */}
        {/* <div className="flex-1 space-y-2">
          <h3 className="text-xl font-bold">{formData.title}</h3>
          <p className="text-gray-600">{formData.summary || '간략 소개 없음'}</p>
          <p className="text-gray-500 text-sm">
            지역: {formData.regionFree ? '지역 무관' : formData.region || '미정'} / 인원:{' '}
            {formData.memberCount}명 / 기간: {formData.startDate || '시작일 미정'} ~{' '}
            {formData.endDate || '종료일 미정'}
          </p>
          <button className="mt-2 px-4 py-1 bg-brand text-white rounded cursor-default">
            참가하기
          </button>
        </div> */}

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
