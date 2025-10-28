// src/pages/ReviewsListPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { ReviewCard, type ReviewItem } from '../components/common/ReviewCard';
import ReviewDetailModal, { type ReviewDetail } from '../components/common/modal/ReviewDetailModal';
import ArrayDropdown from '../components/common/ArrayDropdown';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { supabase } from '../lib/supabase';

const fmt = (d?: string | null) => (d ? d.replace(/-/g, '.') : '');
const NO_IMAGE = '/images/no_image.jpg';

// DB 타입
type ReviewRow = {
  review_id: string;
  group_id: string;
  author_id: string;
  rating: number;
  pros_text: string | null;
  created_at: string;
  groups: {
    group_title: string | null;
    image_urls: string[] | null;
    status: string | null;
    group_start_day: string | null;
    group_end_day: string | null;
    sub_id: string | null;
    categories_sub: {
      categories_major: { category_major_name: string | null } | null;
    } | null;
  } | null;
};

type ProfileRow = { user_id: string; nickname: string | null };
type TagDict = { tag_code: string; label: string };
type TagRow = { review_id: string; tag_code: string };
type LikeRow = { review_id: string };

export default function ReviewsListPage({ groupId }: { groupId?: string }) {
  const [bestItems, setBestItems] = useState<ReviewItem[]>([]);
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [numToReviewId, setNumToReviewId] = useState<Record<number, string>>({});
  const [openId, setOpenId] = useState<number | null>(null);
  const [sortMode, setSortMode] = useState<'latest' | 'popular'>('latest');

  const [empathyByNumId, setEmpathyByNumId] = useState<Record<number, number>>({});
  const [likedByNumId, setLikedByNumId] = useState<Set<number>>(new Set());

  // 태그 라벨 사전 / 모달에서 재조회한 태그
  const [labelByCode, setLabelByCode] = useState<Record<string, string>>({});
  const [modalTags, setModalTags] = useState<string[] | null>(null);

  const withEmpathy = (it: ReviewItem) => ({ ...it, empathy: empathyByNumId[it.id] ?? 0 });

  useEffect(() => {
    let ignore = false;

    (async () => {
      setLoading(true);
      try {
        const { data: u } = await supabase.auth.getUser();
        const myId = u?.user?.id ?? null;

        // 1) 태그 사전
        const { data: dict } = await supabase
          .from('review_tag_dict')
          .select('tag_code,label')
          .returns<TagDict[]>();
        const _labelByCode = Object.fromEntries((dict ?? []).map(d => [d.tag_code, d.label]));
        if (!ignore) setLabelByCode(_labelByCode);

        // 2) 리뷰 + 그룹 + 대카테고리 조인 추가
        const selectSQL = `
  review_id, group_id, author_id, rating, pros_text, created_at,
  groups:group_id (
    group_title, image_urls, status, group_start_day, group_end_day, sub_id,
    categories_sub:sub_id (
      categories_major:major_id ( category_major_name )
    )
  )
` as const;

        let query = supabase
          .from('group_reviews')
          .select(selectSQL)
          .order('created_at', { ascending: false })
          .limit(100);

        if (groupId) query = query.eq('group_id', String(groupId));

        const { data: rows, error: revErr } = await query.returns<ReviewRow[]>();
        if (revErr) throw revErr;

        if (!rows?.length) {
          if (!ignore) {
            setBestItems([]);
            setItems([]);
            setEmpathyByNumId({});
            setLikedByNumId(new Set());
            setNumToReviewId({});
          }
          return;
        }

        // 3) 작성자 닉네임
        const authorIds = [...new Set(rows.map(r => r.author_id))];
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('user_id, nickname')
          .in('user_id', authorIds)
          .returns<ProfileRow[]>();
        const nicknameByUserId = Object.fromEntries(
          (profiles ?? []).map(p => [p.user_id, p.nickname ?? '익명']),
        );

        // 4) 리뷰별 태그(모두 로드 — 제한 없음)
        const reviewIds = rows.map(r => r.review_id);
        const { data: tagRows } = await supabase
          .from('group_review_tags')
          .select('review_id, tag_code')
          .in('review_id', reviewIds)
          .order('tag_code', { ascending: true })
          .returns<TagRow[]>();

        const tagsByReview: Record<string, string[]> = {};
        (tagRows ?? []).forEach(tr => {
          const label = _labelByCode[tr.tag_code] ?? tr.tag_code;
          (tagsByReview[tr.review_id] ??= []).push(label);
        });

        // 5) 공감 카운트
        const { data: likeRows } = await supabase
          .from('review_likes')
          .select('review_id')
          .in('review_id', reviewIds)
          .returns<LikeRow[]>();
        const countByReviewId: Record<string, number> = {};
        (likeRows ?? []).forEach(r => {
          countByReviewId[r.review_id] = (countByReviewId[r.review_id] ?? 0) + 1;
        });

        // 6) 내가 공감한 리뷰
        let myLiked = new Set<string>();
        if (myId) {
          const { data: mine } = await supabase
            .from('review_likes')
            .select('review_id')
            .eq('user_id', myId)
            .in('review_id', reviewIds)
            .returns<LikeRow[]>();
          if (mine?.length) myLiked = new Set(mine.map(x => x.review_id));
        }

        // 7) 화면 매핑 (category를 대카테고리로)
        const numMap: Record<number, string> = {};
        const mapped: ReviewItem[] = rows.map((r, idx) => {
          const g = r.groups;
          const statusKor: ReviewItem['status'] =
            (g?.status ?? '').toLowerCase() === 'closed' ? '종료' : '진행중';
          const start = fmt(g?.group_start_day);
          const end = fmt(g?.group_end_day);
          const rating = Math.min(5, Math.max(1, Number(r.rating || 5))) as 1 | 2 | 3 | 4 | 5;

          const numId = idx + 1;
          numMap[numId] = r.review_id;

          // 대카테고리명
          const major = g?.categories_sub?.categories_major?.category_major_name?.trim() || '기타';

          return {
            id: numId,
            title: g?.group_title ?? '(제목 없음)',
            category: major,
            src: g?.image_urls?.[0] || NO_IMAGE,
            status: statusKor,
            rating,
            period: start && end ? `${start} - ${end}` : '',
            content: r.pros_text ?? '',
            tags: [...new Set(tagsByReview[r.review_id] ?? [])],
            created_at: r.created_at,
            empathy: countByReviewId[r.review_id] ?? 0,
            created_id: nicknameByUserId[r.author_id] || '익명',
          };
        });

        // 8) 베스트 4 추출(공감 높은 순) — 리뷰에도 그대로 포함
        const best = [...mapped].sort((a, b) => (b.empathy ?? 0) - (a.empathy ?? 0)).slice(0, 4);
        const rest = mapped;

        // 공감/내공감 화면 상태
        const empathyByNum: Record<number, number> = {};
        const likedByNum = new Set<number>();
        Object.entries(numMap).forEach(([numIdStr, rid]) => {
          const numId = Number(numIdStr);
          empathyByNum[numId] = countByReviewId[rid] ?? 0;
          if (myLiked.has(rid)) likedByNum.add(numId);
        });

        if (!ignore) {
          setBestItems(best);
          setItems(rest);
          setNumToReviewId(numMap);
          setEmpathyByNumId(eMap => ({ ...eMap, ...empathyByNum }));
          setLikedByNumId(likedByNum);
        }
      } catch (e) {
        console.error('[ReviewsListPage] load error', e);
        if (!ignore) {
          setBestItems([]);
          setItems([]);
          setEmpathyByNumId({});
          setLikedByNumId(new Set());
          setNumToReviewId({});
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [groupId]);

  // 모달 열릴 때 해당 리뷰 태그 재조회(최신 DB 기준으로 덮어쓰기)
  useEffect(() => {
    (async () => {
      if (openId == null) {
        setModalTags(null);
        return;
      }
      const reviewId = numToReviewId[openId];
      if (!reviewId) return;

      const { data: tagRows, error } = await supabase
        .from('group_review_tags')
        .select('tag_code')
        .eq('review_id', reviewId)
        .order('tag_code', { ascending: true })
        .returns<TagRow[]>();

      if (error) {
        console.error('[ReviewsListPage] modal tag reload error', error);
        setModalTags(null);
        return;
      }

      const labels = (tagRows ?? []).map(tr => labelByCode[tr.tag_code] ?? tr.tag_code);
      setModalTags([...new Set(labels)]);
    })();
  }, [openId, numToReviewId, labelByCode]);

  // 정렬
  const sortedItems = useMemo(() => {
    const base = [...items];
    if (sortMode === 'latest') {
      return base.sort(
        (a, b) =>
          (b.created_at ? +new Date(b.created_at) : 0) -
          (a.created_at ? +new Date(a.created_at) : 0),
      );
    }
    return base.sort((a, b) => {
      const ea = empathyByNumId[a.id] ?? 0;
      const eb = empathyByNumId[b.id] ?? 0;
      if (eb !== ea) return eb - ea;
      if ((b.rating ?? 0) !== (a.rating ?? 0)) return (b.rating ?? 0) - (a.rating ?? 0);
      return (
        (b.created_at ? +new Date(b.created_at) : 0) - (a.created_at ? +new Date(a.created_at) : 0)
      );
    });
  }, [items, empathyByNumId, sortMode]);

  // 공감 클릭
  const handleEmpathy = async (numId: number) => {
    const reviewId = numToReviewId[numId];
    if (!reviewId) return;

    const { data: u } = await supabase.auth.getUser();
    const myId = u?.user?.id;
    if (!myId) {
      alert('로그인이 필요합니다.');
      return;
    }
    if (likedByNumId.has(numId)) {
      alert('이미 공감했습니다.');
      return;
    }

    const { error } = await supabase
      .from('review_likes')
      .insert({ review_id: reviewId, user_id: myId });
    // @ts-ignore 중복 코드 허용(23505)
    if (error && error.code !== '23505') {
      console.error('empathy insert error', error);
      return;
    }

    setEmpathyByNumId(prev => ({ ...prev, [numId]: (prev[numId] ?? 0) + 1 }));
    setLikedByNumId(prev => new Set(prev).add(numId));
  };

  // 상세 변환 (모달은 항상 modalTags 우선)
  const DEFAULT_CREATED_AT = '2025-09-30';
  const toDetail = (v: ReviewItem): ReviewDetail => ({
    id: v.id,
    title: v.title,
    category: v.category,
    src: v.src,
    rating: v.rating,
    period: v.period ?? '',
    content: v.content,
    tags: modalTags ?? v.tags ?? [],
    creator_id: v.created_id,
    created_at: v.created_at ?? DEFAULT_CREATED_AT,
    empathy: empathyByNumId[v.id] ?? 0,
  });

  const selected: ReviewDetail | null = useMemo(() => {
    if (openId == null) return null;
    const found = [...bestItems, ...items].find(v => v.id === openId);
    return found ? toDetail(found) : null;
  }, [openId, bestItems, items, empathyByNumId, modalTags]);

  const sortOptions = ['최신순', '인기순'];
  const mapLabelToValue = (label: string): 'latest' | 'popular' =>
    label === '최신순' ? 'latest' : 'popular';
  const mapValueToLabel = (val: 'latest' | 'popular') => (val === 'latest' ? '최신순' : '인기순');

  return (
    <div className="mx-auto w-[1024px] pt-[120px] pb-[80px]">
      <div className="text-xl font-bold text-gray-400 mb-[17px]">후기리뷰</div>
      <div className="flex mb-[43px] gap-[12px]">
        <div className="border-r border-brand border-[3px]" />
        <div>
          <div className="text-lg font-bold text-gray-400 mb-[5px]">
            회원들이 남긴 모임 후기를 한곳에서 볼 수 있습니다.
          </div>
          <div className="text-md text-gray-400">
            다양한 경험과 생생한 이야기를 참고해 원하는 모임을 찾아보세요.
          </div>
        </div>
      </div>

      {/* 베스트 (공감 상위 4) */}
      <div className="text-black text-xl font-semibold pb-[13px]">
        실제 참여자들이 적극 추천한 베스트 후기
      </div>
      {loading ? (
        <div className="mb-[60px]">
          <LoadingSpinner />
        </div>
      ) : bestItems.length === 0 ? (
        <div className="text-gray-500 mb-[60px]">표시할 베스트 후기가 없습니다.</div>
      ) : (
        <ul className="grid gap-[15px] mb-[60px] grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {bestItems.map(item => (
            <li key={item.id}>
              <ReviewCard item={withEmpathy(item)} className="h-full" onClick={setOpenId} />
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <ReviewDetailModal
          open
          review={selected}
          onClose={() => setOpenId(null)}
          onEmpathy={() => handleEmpathy(selected.id)}
        />
      )}

      {/* 관심사 섹션 */}
      <div className="flex items-center justify-between pb-[13px]">
        <div className="text-black text-xl font-semibold">관심사에 맞춘 리뷰후기</div>
        <ArrayDropdown
          options={sortOptions}
          value={mapValueToLabel(sortMode)}
          onChange={label => setSortMode(mapLabelToValue(label))}
        />
      </div>
      {loading ? (
        <LoadingSpinner />
      ) : items.length === 0 ? (
        <div className="text-gray-500">등록된 후기가 아직 없어요.</div>
      ) : (
        <ul className="grid gap-[15px] mb-[60px] grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {sortedItems.map(item => (
            <li key={item.id}>
              <ReviewCard item={withEmpathy(item)} className="h-full" onClick={setOpenId} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
