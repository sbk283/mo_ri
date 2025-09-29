// 모임 생성 - StepOne 기간 설정, 모임 유형 (자동 계산)
// 오늘 이전 날짜는 선택 불가능, 에러는 border + 메시지 표시
import { useEffect, useMemo, useState } from 'react';
import { diffDaysInclusive, toGroupTypeByRange } from '../../utils/date';
import type { GroupFormData } from '../../types/group';

type DateRangeSelectorProps = {
  startDate: string;
  endDate: string;
  groupType: GroupFormData['groupType'];
  onChange: <K extends 'startDate' | 'endDate' | 'groupType'>(
    field: K,
    value: GroupFormData[K],
  ) => void;
};

function DateRangeSelector({ startDate, endDate, groupType, onChange }: DateRangeSelectorProps) {
  // 선택한 기간 일수 계산
  const days = useMemo(() => diffDaysInclusive(startDate, endDate), [startDate, endDate]);

  // 기간에 따라 자동 모임 유형 계산
  const computedType = useMemo(() => toGroupTypeByRange(days), [days]);

  useEffect(() => {
    if (computedType !== groupType) {
      onChange('groupType', computedType);
    }
  }, [computedType, groupType, onChange]);

  // 오늘 날짜 (YYYY-MM-DD, 로컬 기준)
  const today = new Date();
  const timezoneOffset = today.getTimezoneOffset();
  const localTime = new Date(today.getTime() - timezoneOffset * 60000);
  const todayDate = localTime.toISOString().split('T')[0];

  // 에러 상태
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

  // groupType 라벨 매핑 (한글 표시용) - useMemo로 최적화
  const groupTypeLabel = useMemo(
    () => ({
      '': '',
      oneday: '원데이',
      short: '단기',
      long: '장기',
    }),
    [],
  );

  return (
    <section className="flex flex-col">
      {/* 기간 설정 */}
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
            value={groupTypeLabel[groupType]} // 한글 라벨 표시함. 원래는 영어로 나왔는데 그룹타입라벨 매핑하여 한글로 적용.
            readOnly
            className="flex items-center w-64 h-10 border border-gray-300 rounded px-4 py-2 placeholder:text-[#A6A6A6] bg-gray-100"
          />
        </div>
      </div>
    </section>
  );
}

export default DateRangeSelector;
