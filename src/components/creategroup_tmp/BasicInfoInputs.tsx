// 모임 이름, 인원 수
// 일단 이건 컴포넌트 분리하다가 남은 거라, 필요하면 추후 분리 가능
import { useState } from 'react';
import '../../index.css';

type BasicInfoInputsProps = {
  title: string;
  memberCount: number;
  onChange: (field: 'title' | 'memberCount', value: string | number) => void;
};

function BasicInfoInputs({ title, memberCount, onChange }: BasicInfoInputsProps) {
  const [isShaking, setIsShaking] = useState(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value.length > 30) {
      // maxLength를 초과하려고 할 때
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500); // 애니메이션 끝나면 해제
    } else {
      onChange('title', value);
    }
  };

  return (
    <section className="grid grid-cols-2 gap-6">
      {/* 모임 이름 */}
      <div className="flex whitespace-nowrap col-span-2">
        <label className="flex items-center pr-[56px] text-lg font-semibold mb-2">모임 이름</label>
        <div className="flex">
          <input
            type="text"
            placeholder="모임명을 입력하세요"
            maxLength={30}
            value={title}
            onChange={handleTitleChange}
            className={`border rounded-sm px-4 py-2 w-[485px] placeholder:text-[#A6A6A6]
              focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand
              ${title.length >= 30 ? 'focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 border-red-500' : 'border-gray-300'}
              ${isShaking ? 'animate-shake' : ''}`}
          />
          <p
            className={`text-sm mt-5 ml-3 text-right ${
              title.length >= 30 ? ' text-red-500' : 'text-gray-400'
            }`}
          >
            {title.length} / 30자
          </p>
        </div>
      </div>

      {/* 인원 수 */}
      <div className="flex gap-[71px]">
        <label className="block font-semibold text-lg mb-2">인원 수</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            value={memberCount || ''}
            onChange={e => onChange('memberCount', Number(e.target.value))}
            className="border border-gray-300 rounded-sm px-4 py-2 w-32 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
          />
          <span className="font-medium text-md">명</span>
        </div>
      </div>
    </section>
  );
}

export default BasicInfoInputs;
