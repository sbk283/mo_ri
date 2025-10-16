// 로컬스토리지 키
// DB 연결 전 임시 데이터입니다.
export const LS_KEYS = {
  notices: 'app:notices',
  dailies: 'app:dailies',
} as const;

// 배열 로드 (없으면 fallback 반환)
export function loadArray<T>(key: string, fallback: T[]): T[] {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

// 배열 저장
export function saveArray<T>(key: string, data: T[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(data));
}
