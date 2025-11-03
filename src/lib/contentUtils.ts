// src/lib/contentUtils.ts
import { supabase } from '../lib/supabase';

export const DEFAULT_AVATAR = '/images/32px_favicon.svg';
export const NO_IMAGE = '/images/no_image.jpg';
export const today = () => new Date().toISOString().slice(0, 10);

const isHttp = (u?: string | null) => !!u && /^https?:\/\//i.test(u);
const isPublicPath = (u?: string | null) => !!u && /\/storage\/v1\/object\/public\//i.test(u);

export const resolveStorageUrl = (raw?: string | null): string | null => {
  if (!raw) return null;
  if (isHttp(raw) || isPublicPath(raw)) return raw;
  const key = raw.replace(/^group-post-images\//i, '');
  const { data } = supabase.storage.from('group-post-images').getPublicUrl(key);
  return data?.publicUrl ?? null;
};

export const getFirstImageUrl = (content?: string | null): string | null => {
  if (!content) return null;
  const htmlMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (htmlMatch?.[1]) return htmlMatch[1];
  const mdMatch = content.match(/!\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/);
  if (mdMatch?.[1]) return mdMatch[1];
  const urlMatch = content.match(/(https?:\/\/[^\s"'<>]+\.(?:png|jpe?g|gif|webp|avif|svg))/i);
  if (urlMatch?.[1]) return urlMatch[1];
  return null;
};

export const extractAllImageUrls = (content?: string | null): string[] => {
  if (!content) return [];
  const urls = new Set<string>();
  for (const m of content.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)) if (m[1]) urls.add(m[1]);
  for (const m of content.matchAll(/!\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/g))
    if (m[1]) urls.add(m[1]);
  for (const m of content.matchAll(/(https?:\/\/[^\s"'<>]+\.(?:png|jpe?g|gif|webp|avif|svg))/gi))
    if (m[1]) urls.add(m[1]);
  return Array.from(urls);
};

export const stripAllImages = (content?: string | null): string => {
  if (!content) return '';
  let out = content;
  out = out.replace(/<img[^>]*>/gi, '');
  out = out.replace(/!\[[^\]]*]\([^)]*\)/g, '');
  out = out.replace(
    /(^|\n)\s*(https?:\/\/[^\s"'<>]+\.(?:png|jpe?g|gif|webp|avif|svg))\s*/gi,
    (m, p1) => (p1 ? p1 : ''),
  );
  return out.trim();
};

export const ensureSubscribed = (ch: any) =>
  new Promise<any>(resolve => {
    if ((ch as any).state === 'joined') return resolve(ch);
    ch.subscribe((status: string) => {
      if (status === 'SUBSCRIBED') resolve(ch);
    });
  });
