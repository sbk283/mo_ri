// 날짜 관련 유틸

export function diffDaysInclusive(startDateISO: string, endDateISO: string) {
  if (!startDateISO || !endDateISO) return null;
  const startDateAtMidnight = new Date(`${startDateISO}T00:00:00`);
  const endDateAtMidnight = new Date(`${endDateISO}T00:00:00`);
  if (isNaN(startDateAtMidnight.getTime()) || isNaN(endDateAtMidnight.getTime())) return null;
  const MS_PER_DAY = 86_400_000;
  const diffMs = endDateAtMidnight.getTime() - startDateAtMidnight.getTime();
  return Math.floor(diffMs / MS_PER_DAY) + 1; // 포함일
}

// 장기,단기,원데이
export function toGroupTypeByRange(totalDaysInclusive: number | null) {
  if (totalDaysInclusive == null) return '';
  if (totalDaysInclusive <= 1) return 'oneday';
  if (totalDaysInclusive < 31) return 'short';
  return 'long';
}

// D-day 얼마나 남았는지
export function calcDday(startDate: string): string {
  if (!startDate) return 'D-?';

  const today = new Date();
  const start = new Date(startDate);

  const diff = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return diff >= 0 ? `D-${diff}` : `D+${Math.abs(diff)}`;
}
