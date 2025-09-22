// 날짜 관련 유틸

export function diffDaysInclusive(start: string, end: string) {
  if (!start || !end) return null;
  const s = new Date(`${start}T00:00:00`);
  const e = new Date(`${end}T00:00:00`);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return null;
  return Math.floor((e.getTime() - s.getTime()) / 86400000) + 1; // 포함일
}

export function toGroupTypeByRange(days: number | null) {
  if (days == null) return '';
  if (days <= 1) return '원데이';
  if (days < 30) return '단기';
  return '장기';
}
