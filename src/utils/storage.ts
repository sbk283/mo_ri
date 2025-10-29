// src/utils/storage.ts
import { supabase } from '../lib/supabase';

// 기본 아바타/기본 이미지 경로 상수
export const DEFAULT_AVATAR = '/profile_bg.png';

// 문자열이 유효한 값 인지 판정 (null, 'null', 공백 등 걸러냄)
export const isValidStr = (v?: string | null) => {
  if (!v) return false;
  const s = String(v).trim();
  return !!s && s.toLowerCase() !== 'null';
};

// 키 또는 URL을 '절대 공개 URL'로 정규화 (버킷 추론 포함)
export function toPublicUrl(raw?: string | null, fallbackBucket = 'avatars'): string | null {
  if (!isValidStr(raw)) return null;

  let s = String(raw).trim();

  // 이미 절대 URL이면 그대로 반환
  if (/^https?:\/\//i.test(s)) return s;

  // 흔한 접두 보정
  s = s.replace(/^\/+/, '');
  s = s.replace(/^object\/public\//, '');
  s = s.replace(/^public\//, '');

  // bucket/key 형태라면??~ 그대로 사용
  const i = s.indexOf('/');
  if (i > 0) {
    const bucket = s.slice(0, i);
    const key = s.slice(i + 1).replace(/^public\//, '');
    return supabase.storage.from(bucket).getPublicUrl(key).data?.publicUrl ?? null;
  }

  // 버킷 없는 키면 기본 버킷으로 처리
  return supabase.storage.from(fallbackBucket).getPublicUrl(s).data?.publicUrl ?? null;
}

// 아바타 전용: 없으면 기본 아바타 반환
export function toAvatarUrl(raw?: string | null): string {
  return toPublicUrl(raw, 'avatars') ?? DEFAULT_AVATAR;
}
