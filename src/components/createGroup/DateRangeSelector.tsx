// 기간 설정, 모임 유형 (모임 유형 : 자동으로 날짜 계산 함수 넣음)

import { useEffect, useMemo } from 'react';
import { diffDaysInclusive, toGroupTypeByRange } from '../../utils/date';

type Props = {
  startDate: string;
  endDate: string;
  groupType: string;
  onChange: (field: 'startDate' | 'endDate' | 'groupType', value: string) => void;
};

function DateRangeSelector({ startDate, endDate, groupType, onChange }: Props) {
  const days = useMemo(() => diffDaysInclusive(startDate, endDate), [startDate, endDate]);
  const computedType = useMemo(() => toGroupTypeByRange(days), [days]);

  useEffect(() => {
    if (computedType !== groupType) onChange('groupType', computedType);
  }, [computedType, groupType, onChange]);

  return (
    <section>
      <label className="flex font-semibold mb-2">기간 설정</label>
      <div className="flex gap-4">
        <input
          type="date"
          value={startDate}
          onChange={e => onChange('startDate', e.target.value)}
          className="border rounded px-4 py-2 w-1/2"
        />
        <input
          type="date"
          value={endDate}
          onChange={e => onChange('endDate', e.target.value)}
          className="border rounded px-4 py-2 w-1/2"
        />
      </div>
      <div className="flex">
        <div className="mt-4">
          <label className="block font-semibold mb-2">모임 유형</label>
          <input
            type="text"
            value={groupType}
            readOnly
            className="border rounded px-4 py-2 w-40 bg-gray-100"
          />
        </div>
      </div>
    </section>
  );
}

export default DateRangeSelector;
