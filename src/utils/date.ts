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

export function toGroupTypeByRange(totalDaysInclusive: number | null) {
  if (totalDaysInclusive == null) return '';
  if (totalDaysInclusive <= 1) return 'oneday';
  if (totalDaysInclusive < 30) return 'short';
  return 'long';
}

// D-day 얼마나 남았는지. -유비-
export function calcDday(startDate: string): string { // 시작 날짜를 받아서 'D-3' 이나 'D+2' 같은 글자로 바꿔줌
  if (!startDate) return 'D-?'; // 날짜가 없으면 몰라요(?) 하고 리턴

  const today = new Date(); // 지금 날짜랑 시간을 가져옮ㅁ
  const start = new Date(startDate); // 시작 날짜 글자를 날짜 형태로 바꿔요

  const diff = Math.ceil( // 며칠 차이인지 구해서 `올림` 해요 (0.1일도 1일로!!! 반올림아니고 그냥 바로 업업)
    (start.getTime() - today.getTime()) / // 시작 − 지금 = 남은 시간(밀리초)
      (1000 * 60 * 60 * 24), // 밀리초를 하루(일)로 나눠요
  );

  return diff >= 0 // 0 이상이면 아직 안 지났거나 오늘인것임!!!
    ? `D-${diff}` // 예: 3이면 'D-3'
    : `D+${Math.abs(diff)}`; // 음수면 이미 지난거이ㅏㅁ 절댓값 붙여 'D+2'
}
