// 마이페이지 관심사 변경 모달
import { Modal } from 'antd';

interface InterestModalProps {
  open: boolean;
  onClose: () => void;
  selected: string[];
  toggleInterest: (item: string) => void;
}

const MAX = 5;

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

  const isMax = selected.length >= MAX;

  return (
    <Modal
      title="관심사 선택"
      open={open}
      onCancel={onClose}
      className="p-2 items-center"
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
      {/* 개수 안내 */}
      <div className="mb-3 text-xs">
        <span className="text-gray-400">
          선택 {selected.length}/{MAX}
        </span>
        {isMax && <span className="ml-2 text-red-500">최대 {MAX}개까지 선택 가능합니다.</span>}
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        {interestOptions.map(item => {
          const active = selected.includes(item);
          const disable = !active && isMax;
          return (
            <button
              key={item}
              onClick={() => toggleInterest(item)}
              disabled={disable}
              aria-pressed={active}
              aria-disabled={disable}
              className={[
                'py-[6px] px-[12px] rounded-[5px] border transition',
                active
                  ? 'bg-brand text-white border-brand'
                  : 'text-gray-500 border-gray-300 hover:border-brand',
                disable ? 'opacity-50 cursor-not-allowed hover:border-gray-300' : 'cursor-pointer',
              ].join(' ')}
            >
              {item}
            </button>
          );
        })}
      </div>
    </Modal>
  );
};

export default InterestModal;
