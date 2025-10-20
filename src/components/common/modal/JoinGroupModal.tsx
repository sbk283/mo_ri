// 참가하기 버튼 누르면 실행되는 모달임 - 그룹써머리카드랑 다름.

import { useState } from 'react';
import MeetingCard from '../prevgroup/MeetingCard';
import SuccessModal from './SuccessModal';
import { useGroupMember } from '../../../contexts/GroupMemberContext';

export type JoinGroupData = {
  group_id: string;
  title: string;
  status: '모집중' | '모집종료' | '모임종료';
  category: string;
  subCategory: string;
  memberCount: number;
  memberLimit: number;
  duration: string;
  dday?: string;
  thumbnail?: string;
  desc?: string;
};

interface JoinGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (intro: string) => void;
  group: JoinGroupData;
}

function JoinGroupModal({ isOpen, onClose, group }: JoinGroupModalProps) {
  const [intro, setIntro] = useState('');
  const [successOpen, setSuccessOpen] = useState(false);
  const { joinGroup } = useGroupMember();

  if (!isOpen) return null;

  // 참가하기 로직
  const handleJoin = async () => {
    if (!group?.group_id) {
      console.error('group_id가 없습니다.');
      return;
    }

    const result = await joinGroup(group.group_id);

    if (result === 'success') {
      // 참가 성공 시 완료 모달 띄움.
      setSuccessOpen(true);
      setTimeout(() => {
        setSuccessOpen(false);
        onClose();
      }, 1500);
    } else if (result === 'already') {
      // 이미 가입된 경우 — 별도 알림 모달 띄우거나 그냥 무시
      console.log('이미 가입된 모임입니다.');
    } else {
      console.error('참가 실패');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* 모달 박스 */}
      <div className="relative z-10 w-[590px] rounded-lg bg-white p-6 shadow-lg">
        {/* 제목 */}
        <h2 className="text-center text-[28px] font-bold text-[#0689E8] mb-2">
          모임에 참가하시겠습니까?
        </h2>
        <p className="text-center text-[#3C3C3C] mb-6 text-md font-medium">
          안내된 모임정보를 다시 한번 확인해 주세요.
          <br />
          참가하시면 바로 모임에 가입이 됩니다.
        </p>

        {/* 요약 카드 (모달 전용) */}
        <div className="p-5">
          <MeetingCard
            title={group.title}
            status={group.status}
            dday={group.dday ?? 'D-0'}
            summary={group.desc ?? ''}
            category={group.category}
            subCategory={group.subCategory}
            participants={`${group.memberCount}/${group.memberLimit}`}
            duration={group.duration}
            width="100%"
            height="auto"
          />
        </div>

        {/* 자기소개 */}
        <div className="px-5">
          <label className="block text-md font-semibold mb-2">간략한 자기소개를 적어주세요.</label>
          <textarea
            value={intro}
            onChange={e => setIntro(e.target.value)}
            placeholder="참가신청 시 작성한 내용은 모임 담당자에게 전달되며 가입 심사에 사용됩니다."
            className="w-full h-32 border border-gray-300 rounded-sm p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-none resize-none mb-6 custom-scrollbar"
          />
        </div>

        {/* 버튼 영역 */}
        <div className="px-40">
          <div className="flex justify-between">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-sm border border-brand hover:bg-blue-600 hover:text-white hover:border-blue-600 text-brand font-semibold"
            >
              취소하기
            </button>
            <button
              onClick={handleJoin}
              className="px-6 py-2 rounded-sm bg-brand hover:bg-blue-600 text-white font-semibold"
            >
              참가하기
            </button>
          </div>
        </div>
      </div>

      {/* 참가 성공 모달 */}
      <SuccessModal
        isOpen={successOpen}
        message="참가 완료!"
        onClose={() => setSuccessOpen(false)}
      />
    </div>
  );
}

export default JoinGroupModal;
