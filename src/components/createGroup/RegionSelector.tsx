type Props = {
  region: string;
  regionFree: boolean;
  onChange: (field: 'region' | 'regionFree', value: string | boolean) => void;
};

function RegionSelector({ region, regionFree, onChange }: Props) {
  return (
    <section className="flex">
      <label className="font-semibold mb-2 text-lg">지역 선택</label>
      <div className="flex items-center pl-[56px]">
        <input
          type="text"
          placeholder="지역을 입력하세요"
          value={region}
          onChange={e => onChange('region', e.target.value)}
          className="border border-brand rounded-sm placeholder:text-[#A6A6A6] px-4 py-2 flex-1"
          disabled={regionFree}
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
          onChange={e => onChange('regionFree', e.target.checked)}
        />
        지역 무관
      </label>
    </section>
  );
}

export default RegionSelector;
