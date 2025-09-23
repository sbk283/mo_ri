import { Button } from 'antd';
import { useState } from 'react';

interface SignUpStep2Props {
  onSubmit: (selectedItems: string[]) => void;
}

const categories = [
  {
    label: '운동 / 건강',
    items: ['구기활동', '실내활동', '실외활동', '힐링/건강관리'],
    icon: '/images/health.svg',
  },
  {
    label: '취미 / 여가',
    items: ['예술/창작', '음악/공연/문화', '요리/제과제빵', '게임/오락'],
    icon: '/images/hobby.svg',
  },
  {
    label: '봉사 / 사회참여',
    items: ['복지/나눔', '캠페인'],
    icon: '/images/volunteer.svg',
  },
  {
    label: '스터디 / 자기계발',
    items: ['학습', 'IT'],
    icon: '/images/study.svg',
  },
];

function SignUpStep2({ onSubmit }: SignUpStep2Props) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSelect = (item: string) => {
    setSelected(prev => (prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]));
  };

  return (
    <div className="py-[40px] px-[90px]">
      <div className="flex items-center gap-4 mb-5">
        <div className="text-xxl font-bold text-brand whitespace-nowrap">회원가입</div>
        <div className="flex items-center gap-3 whitespace-nowrap">
          <span className=" font-bold text-gray-600 text-lg">01_ 기본 정보 작성</span>
          <img className="w-[15px] h-[15px]" src="/arrow_sm.svg" alt="화살표" />
          <span className=" font-bold text-lg  text-brand">02_ 관심사 선택</span>
        </div>
      </div>

      <div>
        {categories.map(({ label, items, icon }) => (
          <div key={label} className="mb-6">
            <div className="flex gap-3 border-b border-[#a3a3a3] py-2 mb-4">
              <img className="h-[29px]" src={icon} alt={label} />
              <p className="font-bold text-xl text-gray-[#3c3c3c]">{label}</p>
            </div>
            <div className="flex gap-[10px] text-lg font-bold text-gray-600">
              {items.map(item => (
                <button
                  key={item}
                  className={`border rounded-[5px] py-1 px-3 cursor-pointer hover:bg-brand hover:text-white hover:border-brand ${
                    selected.includes(item) ? 'bg-brand text-white border-brand' : ''
                  }`}
                  onClick={() => toggleSelect(item)}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ))}

        {selected.length === 0 && (
          <div className="mb-3 text-red-600 relative">
            <p className="absolute">최소 1개 이상 선택해 주세요.</p>
          </div>
        )}
        <div className="mb-14"></div>
        <Button
          htmlType="button"
          onClick={() => onSubmit(selected)}
          className="w-[100%] h-[48px] bg-brand text-white text-xl font-bold rounded-[5px]"
          disabled={selected.length === 0}
        >
          다음단계
        </Button>
      </div>
    </div>
  );
}

export default SignUpStep2;
