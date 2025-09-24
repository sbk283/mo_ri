// 모임 생성 - StepOne 기간 설정, 모임 유형 (모임 유형 : 자동으로 날짜 계산 함수 넣음)
// 오늘 이전 날짜는 선택 불가능하게끔 만들고, 에러는 border + 메시지로 표시
import { useEffect, useMemo, useState } from 'react';
import { diffDaysInclusive, toGroupTypeByRange } from '../../utils/date';

type DateRangeSelectorProps = {
  startDate: string;
  endDate: string;
  groupType: string;
  onChange: (field: 'startDate' | 'endDate' | 'groupType', value: string) => void;
};

function DateRangeSelector({ startDate, endDate, groupType, onChange }: DateRangeSelectorProps) {
  const days = useMemo(() => diffDaysInclusive(startDate, endDate), [startDate, endDate]);
  const computedType = useMemo(() => toGroupTypeByRange(days), [days]);

  useEffect(() => {
    if (computedType !== groupType) onChange('groupType', computedType);
  }, [computedType, groupType, onChange]);

  // 오늘 날짜를 YYYY-MM-DD 형식으로 변환 (로컬 기준)
  const today = new Date();
  const timezoneOffset = today.getTimezoneOffset();
  const localTime = new Date(today.getTime() - timezoneOffset * 60000);
  const todayDate = localTime.toISOString().split('T')[0];

  // 에러 메시지 상태
  const [error, setError] = useState('');

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    onChange(field, value);
    if (value.length === 10) {
      if (value < todayDate) {
        setError('오늘 이전 날짜는 선택할 수 없습니다.');
        return;
      }
      if (field === 'endDate' && startDate && value < startDate) {
        setError('종료일은 시작일 이후여야 합니다.');
        return;
      }
      setError('');
    }
  };

  return (
    <section className="flex flex-col">
      <div className="flex gap-[56px]">
        <label className="flex items-center font-semibold mb-2 text-lg">기간 설정</label>
        <div className="flex text-[#A6A6A6] items-center gap-4">
          <input
            type="date"
            value={startDate || ''}
            onChange={e => handleDateChange('startDate', e.target.value)}
            min={todayDate}
            className={[
              'border rounded-sm px-4 py-2 w-1/2 focus:outline-none focus:ring-1',
              error
                ? 'border-red-500 ring-red-500 text-black'
                : 'border-gray-300 focus:ring-brand focus:border-brand',
              startDate ? 'text-black' : 'text-[#A6A6A6]',
            ].join(' ')}
          />

          <input
            type="date"
            value={endDate || ''}
            onChange={e => handleDateChange('endDate', e.target.value)}
            min={startDate || todayDate}
            className={[
              'border rounded-sm px-4 py-2 w-1/2 focus:outline-none focus:ring-1',
              error
                ? 'border-red-500 ring-red-500 text-black'
                : 'border-gray-300 focus:ring-brand focus:border-brand',
              endDate ? 'text-black' : 'text-[#A6A6A6]',
            ].join(' ')}
          />
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && <p className="text-red-500 text-sm mt-1 ml-[122px]">{error}</p>}

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
