import { useState, useEffect } from 'react';
import MeetingCard from '../prevgroup/MeetingCard';

export type JoinGroupData = {
  groupId: string;
  title: string;
  status: '모집중' | '모집종료' | '모임종료';
  category: string;
  subCategory: string;
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

function JoinGroupModal({ isOpen, onClose, onSubmit, group }: JoinGroupModalProps) {
  const [intro, setIntro] = useState('');

  // 모달이 닫힐 때 입력 초기화 (UX 보완)
  useEffect(() => {
    if (!isOpen) setIntro('');
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* 모달 박스 */}
      <div className="relative z-10 w-[590px] rounded-lg bg-white p-6 shadow-lg">
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
            key={group.groupId}
            groupId={group.groupId}
            groupCapacity={group.memberLimit}
            title={group.title}
            status={group.status}
            dday={group.dday ?? ''}
            summary={group.desc}
            category={group.category}
            subCategory={group.subCategory}
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
              onClick={() => onSubmit(intro)}
              className="px-6 py-2 rounded-sm bg-brand hover:bg-blue-600 text-white font-semibold"
            >
              참가하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JoinGroupModal;
