type Props = {
  region: string;
  regionFree: boolean;
  onChange: (field: 'region' | 'regionFree', value: string | boolean) => void;
};

function RegionSelector({ region, regionFree, onChange }: Props) {
  return (
    <section>
      <label className="block font-semibold mb-2">지역 선택</label>
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="지역을 입력하세요"
          value={region}
          onChange={e => onChange('region', e.target.value)}
          className="border rounded px-4 py-2 flex-1"
          disabled={regionFree}
        />
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={regionFree}
            onChange={e => onChange('regionFree', e.target.checked)}
          />
          지역 무관
        </label>
      </div>
    </section>
  );
}

export default RegionSelector;
