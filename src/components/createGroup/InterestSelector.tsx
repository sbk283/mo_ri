// 관심사 설정

import interestOptions from '../../constants/interestOptions';

type Props = {
  major: string;
  sub: string;
  onChange: (field: 'interestMajor' | 'interestSub', value: string) => void;
};

function InterestSelector({ major, sub, onChange }: Props) {
  return (
    <section className="flex gap-11">
      <label className="flex font-semibold mb-2 text-lg">관심사 설정</label>
      <div className="flex  gap-4">
        <select
          value={major}
          onChange={e => {
            onChange('interestMajor', e.target.value);
            onChange('interestSub', ''); // 대분류 바뀌면 중분류 초기화
          }}
          className="border h-10 w-[214px] rounded-sm px-4 py-2 "
        >
          <option value="">대분류 선택</option>
          {Object.keys(interestOptions).map(m => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <select
          value={sub}
          onChange={e => onChange('interestSub', e.target.value)}
          disabled={!major}
          className="border h-10 w-[214px] rounded-sm px-4 py-2"
        >
          <option value="">중분류 선택</option>
          {(interestOptions[major] ?? []).map(s => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}

export default InterestSelector;
