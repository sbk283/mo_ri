// 참가하기 버튼 누르면 실행되는 모달임 - 그룹써머리카드랑 다름.

import { useState } from 'react';
import GroupSummaryCard from '../../common/GroupSummaryCard';

export type JoinGroupData = {
  title: string;
  status: '모집중' | '모집예정' | '서비스종료';
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

function JoinGroupModal({ isOpen, onClose, onSubmit, group }: JoinGroupModalProps) {
  const [intro, setIntro] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* 모달 박스 */}
      <div className="relative z-10 w-[590px] rounded-lg bg-white p-6 shadow-lg">
        {/* 제목 */}
        <h2 className="text-center text-xl font-bold text-[#0689E8] mb-2">
          모임에 참가하시겠습니까?
        </h2>
        <p className="text-center text-gray-600 mb-6">
          모임비 입금방법과 유의 사항을 확인해 주세요. <br />
          참가신청 후 모임 담당자가 확인합니다.
        </p>

        {/* 요약 카드 (모달 전용) */}
        <div className="mb-6">
          <GroupSummaryCard {...group} />
        </div>

        {/* 자기소개 */}
        <label className="block text-sm font-semibold mb-2">간략한 자기소개를 적어주세요.</label>
        <textarea
          value={intro}
          onChange={e => setIntro(e.target.value)}
          placeholder="참가신청 시 작성한 내용은 모임 담당자에게 전달되며 가입 심사에 사용됩니다."
          className="w-full h-32 border border-gray-300 rounded-sm p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand resize-none mb-6 custom-scrollbar"
        />

        {/* 버튼 영역 */}
        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
          >
            취소하기
          </button>
          <button
            onClick={() => onSubmit(intro)}
            className="px-6 py-2 rounded-md bg-[#0689E8] hover:bg-blue-600 text-white font-semibold"
          >
            참가하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default JoinGroupModal;
