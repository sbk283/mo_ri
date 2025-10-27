// src/hooks/useGroupReviews.ts
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export type LoadedReview = {
  review_id: string;
  author_id: string;
  authorMasked: string;
  rating: number;
  content: string;
  created_at: string;
  tags: string[]; // 라벨 배열
};

function maskAuthor(author_id: string) {
  // author_id 해시 일부를 마스킹 닉네임으로 사용
  const short = author_id.replace(/-/g, '').slice(0, 6);
  return `${short}***`;
}

export function useGroupReviews(groupId?: string, limit = 5) {
  const [items, setItems] = useState<LoadedReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) return;
    let ignore = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        // 1) 본문
        const { data: reviews, error: revErr } = await supabase
          .from('group_reviews')
          .select('review_id, author_id, rating, pros_text, created_at')
          .eq('group_id', groupId)
          .order('created_at', { ascending: false })
          .limit(limit);
        if (revErr) throw revErr;

        const base = reviews ?? [];
        if (base.length === 0) {
          if (!ignore) setItems([]);
          return;
        }

        // 2) 태그
        const ids = base.map(r => r.review_id);
        const { data: tagRows, error: tagErr } = await supabase
          .from('group_review_tags')
          .select('review_id, tag_code');
        if (tagErr) throw tagErr;

        const { data: dictRows, error: dictErr } = await supabase
          .from('review_tag_dict')
          .select('tag_code, label');
        if (dictErr) throw dictErr;

        const labelByCode = Object.fromEntries((dictRows ?? []).map(d => [d.tag_code, d.label]));
        const tagsByReview: Record<string, string[]> = {};
        (tagRows ?? [])
          .filter(tr => ids.includes(tr.review_id))
          .forEach(tr => {
            const label = labelByCode[tr.tag_code] ?? tr.tag_code;
            (tagsByReview[tr.review_id] ??= []).push(label);
          });

        const merged: LoadedReview[] = base.map(r => ({
          review_id: r.review_id,
          author_id: r.author_id,
          authorMasked: maskAuthor(r.author_id),
          rating: r.rating,
          content: r.pros_text ?? '',
          created_at: r.created_at,
          tags: tagsByReview[r.review_id] ?? [],
        }));

        if (!ignore) setItems(merged);
      } catch (e: any) {
        if (!ignore) setErr(e?.message ?? '리뷰를 불러오지 못했습니다.');
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [groupId, limit]);

  return { items, loading, error };
}
