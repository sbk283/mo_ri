// 모임 이름, 인원 수
// 일단 이건 컴포넌트 분리하다가 남은 다 요기에 때려박았는데, 필요하면 컴포넌트 추후 분리 할게요

type Props = {
  title: string;
  memberCount: number;
  onChange: (field: 'title' | 'memberCount', value: string | number) => void;
};

function BasicInfoInputs({ title, memberCount, onChange }: Props) {
  return (
    <section className="grid grid-cols-2 gap-6">
      <div className="flex whitespace-nowrap col-span-2">
        <label className="flex items-center pr-[56px] text-lg font-semibold mb-2">모임 이름</label>
        <input
          type="text"
          placeholder="모임명을 입력하세요"
          value={title}
          onChange={e => onChange('title', e.target.value)}
          className="border border-brand rounded-sm px-4 py-2 w-[485px] placeholder:text-[#A6A6A6]"
        />
      </div>

      <div className="flex gap-[71px]">
        <label className="block font-semibold text-lg mb-2">인원 수</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            value={memberCount}
            onChange={e => onChange('memberCount', Number(e.target.value))}
            className="border border-brand rounded-sm  px-4 py-2 w-32"
          />
          <span className="font-medium text-md">명</span>
        </div>
      </div>
    </section>
  );
}

export default BasicInfoInputs;``