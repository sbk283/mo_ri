// 마이페이지 관심사 변경 모달

import { Modal } from 'antd';

interface InterestModalProps {
  open: boolean;
  onClose: () => void;
  selected: string[];
  toggleInterest: (item: string) => void;
}

const InterestModal = ({ open, onClose, selected, toggleInterest }: InterestModalProps) => {
  const interestOptions = [
    '구기활동',
    '실내활동',
    '힐링/건강관리',
    '실외활동',
    '학습/공부',
    'IT',
    '예술/창작',
    '음악/공연/문화',
    '요리/제과·제빵',
    '게임/오락',
    '복지/나눔',
    '캠페인',
  ];

  return (
    <Modal
      title="관심사 선택"
      open={open}
      onCancel={onClose}
      className="p-2 items-center "
      footer={[
        <button
          key="cancel"
          onClick={onClose}
          className="text-sm text-gray-400 py-[6px] px-[14px] border border-gray-400 rounded-[5px]"
        >
          취소
        </button>,
        <button
          key="ok"
          onClick={onClose}
          className="text-sm text-white bg-brand py-[6px] px-[14px] rounded-[5px] ml-[10px] mr-[10px]"
        >
          완료
        </button>,
      ]}
    >
      <div className="flex flex-wrap gap-2 mt-8">
        {interestOptions.map(item => (
          <button
            key={item}
            onClick={() => toggleInterest(item)}
            className={`py-[6px] px-[12px] rounded-[5px] border ${
              selected.includes(item)
                ? 'bg-brand text-white border-brand'
                : 'text-gray-500 border-gray-300'
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </Modal>
  );
};

export default InterestModal;
