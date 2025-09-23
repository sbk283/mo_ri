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
    <section className="flex flex-col">
      <div className="flex gap-[56px]">
        <label className="flex items-center font-semibold mb-2 text-lg">기간 설정</label>
        <div className="flex text-[#A6A6A6] items-center gap-4">
          <input
            type="date"
            value={startDate}
            onChange={e => onChange('startDate', e.target.value)}
            className={[
              'border border-gray-300 rounded-sm px-4 py-2 w-1/2',
              startDate ? 'text-black' : 'text-[#A6A6A6]',
            ].join(' ')}
          />
          <input
            type="date"
            value={endDate}
            onChange={e => onChange('endDate', e.target.value)}
            className={[
              'border border-gray-300 rounded-sm px-4 py-2 w-1/2',
              endDate ? 'text-black' : 'text-[#A6A6A6]',
            ].join(' ')}
          />
        </div>
      </div>
      {/* 모임 유형 */}
      <div className="flex mt-7">
        <div className="flex gap-[56px]">
          <label className="flex items-center font-semibold mb-2 text-lg">모임 유형</label>
          <input
            placeholder="모임 기간 선택 시 자동 설정됩니다."
            type="text"
            value={groupType}
            readOnly
            className="flex items-center w-64 h-10 border border-gray-300 rounded px-4 py-2 placeholder:text-[#A6A6A6] bg-gray-100"
          />
        </div>
      </div>
    </section>
  );
}

export default DateRangeSelector;
