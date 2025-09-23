// 모임 생성 - StepOne 지역 설정

type RegionSelectorProps = {
  region: string;
  regionFree: boolean;
  onChange: (field: 'region' | 'regionFree', value: string | boolean) => void;
};

function RegionSelector({ region, regionFree, onChange }: RegionSelectorProps) {
  return (
    <section className="flex">
      <label className="font-semibold mb-2 text-lg">지역 선택</label>
      <div className="flex items-center pl-[56px]">
        <input
          type="text"
          readOnly={regionFree}
          placeholder="지역을 입력하세요"
          value={region}
          onChange={e => onChange('region', e.target.value)}
          className={[
            'border rounded-sm px-4 py-2 flex-1 placeholder:text-[#A6A6A6]',
            regionFree
              ? 'border-gray-300 bg-gray-100 placeholder:text-[#A6A6A6]'
              : 'border-gray-300 bg-white text-black focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand',
          ].join(' ')}
        />
      </div>
      <label
        className={[
          'flex pl-3 items-center gap-2 cursor-pointer text-md',
          regionFree ? 'text-black font-semibold' : 'text-[#A6A6A6] font-semibold',
        ].join(' ')}
      >
        <input
          type="checkbox"
          checked={regionFree}
          readOnly
          onChange={e => onChange('regionFree', e.target.checked)}
          className="bg-gray-100"
        />
        지역 무관
      </label>
    </section>
  );
}

export default RegionSelector;
