// src/sections/ReviewsSection.tsx
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ReviewCard, type ReviewItem } from '../common/ReviewCard';
import ReviewDetailModal, { type ReviewDetail } from '../common/modal/ReviewDetailModal';
import { supabase } from '../../lib/supabase';

const NO_IMAGE = '/images/no_image.jpg';
const fmt = (d?: string | null) => (d ? d.replace(/-/g, '.') : '');
const statusKor = (v?: string | null): '진행중' | '종료' =>
  (v ?? '').toLowerCase() === 'closed' ? '종료' : '진행중';

// DB Row Types
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

export default function ReviewsSection({ items = [] as ReviewItem[] }: { items?: ReviewItem[] }) {
  const [topItems, setTopItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 모달
  const [openId, setOpenId] = useState<number | null>(null);

  // 공감 (DB 기반)
  const [empathyByNumId, setEmpathyByNumId] = useState<Record<number, number>>({});
  const [likedByNumId, setLikedByNumId] = useState<Set<number>>(new Set());
  const [numToReviewId, setNumToReviewId] = useState<Record<number, string>>({});

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
        const labelByCode = Object.fromEntries((dict ?? []).map(d => [d.tag_code, d.label]));

        // 2) 리뷰 + 그룹 + 대카테고리
        const selectSQL = `
  review_id, group_id, author_id, rating, pros_text, created_at,
  groups:group_id (
    group_title, image_urls, status, group_start_day, group_end_day, sub_id,
    categories_sub:sub_id (
      categories_major:major_id ( category_major_name )
    )
  )
` as const;

        const { data: rows, error: revErr } = await supabase
          .from('group_reviews')
          .select(selectSQL)
          .order('created_at', { ascending: false })
          .limit(100)
          .returns<ReviewRow[]>();

        if (revErr) throw revErr;

        if (!rows?.length) {
          if (!ignore) {
            setTopItems([]);
            setEmpathyByNumId({});
            setLikedByNumId(new Set());
            setNumToReviewId({});
            setLoading(false);
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

        // 4) 리뷰별 태그
        const reviewIds = rows.map(r => r.review_id);
        const { data: tagRows } = await supabase
          .from('group_review_tags')
          .select('review_id, tag_code')
          .in('review_id', reviewIds)
          .order('tag_code', { ascending: true })
          .returns<TagRow[]>();

        const tagsByReview: Record<string, string[]> = {};
        (tagRows ?? []).forEach(tr => {
          const label = labelByCode[tr.tag_code] ?? tr.tag_code;
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

        // 6) 내가 누른 공감
        let myLikedSet = new Set<string>();
        if (myId) {
          const { data: mine } = await supabase
            .from('review_likes')
            .select('review_id')
            .eq('user_id', myId)
            .in('review_id', reviewIds)
            .returns<LikeRow[]>();
          myLikedSet = new Set((mine ?? []).map(x => x.review_id));
        }

        // 7) 화면 매핑 (id: 1..N)
        const numMap: Record<number, string> = {};
        const mapped: ReviewItem[] = rows.map((r, idx) => {
          const g = r.groups;
          const start = fmt(g?.group_start_day);
          const end = fmt(g?.group_end_day);
          const rating = Math.min(5, Math.max(1, Number(r.rating || 5))) as 1 | 2 | 3 | 4 | 5;
          const major = g?.categories_sub?.categories_major?.category_major_name?.trim() || '기타';

          const numId = idx + 1;
          numMap[numId] = r.review_id;

          return {
            id: numId,
            title: g?.group_title ?? '(제목 없음)',
            category: major,
            src: g?.image_urls?.[0] || NO_IMAGE,
            status: statusKor(g?.status),
            rating,
            period: start && end ? `${start} - ${end}` : '',
            content: r.pros_text ?? '',
            tags: [...new Set(tagsByReview[r.review_id] ?? [])],
            created_at: r.created_at,
            empathy: countByReviewId[r.review_id] ?? 0,
            created_id: nicknameByUserId[r.author_id] || '익명',
          };
        });

        // 8) 베스트 4
        const best4 = [...mapped]
          .sort((a, b) => {
            const ea = a.empathy ?? 0;
            const eb = b.empathy ?? 0;
            if (eb !== ea) return eb - ea;
            const ta = a.created_at ? +new Date(a.created_at) : 0;
            const tb = b.created_at ? +new Date(b.created_at) : 0;
            return tb - ta;
          })
          .slice(0, 4);

        // 9) 공감 상태 주입
        const empathyByNum: Record<number, number> = {};
        const likedNums = new Set<number>();
        Object.entries(numMap).forEach(([numIdStr, rid]) => {
          const numId = Number(numIdStr);
          empathyByNum[numId] = countByReviewId[rid] ?? 0;
          if (myLikedSet.has(rid)) likedNums.add(numId);
        });

        if (!ignore) {
          setTopItems(best4);
          setNumToReviewId(numMap);
          setEmpathyByNumId(empathyByNum);
          setLikedByNumId(likedNums);
        }
      } catch (e) {
        console.error('[ReviewsSection] load error', e);
        if (!ignore) {
          setTopItems([]);
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
  }, []);

  // 상세 변환
  const toDetail = (v: ReviewItem): ReviewDetail => ({
    id: v.id,
    title: v.title,
    category: v.category,
    src: v.src,
    rating: v.rating,
    period: v.period ?? '',
    content: v.content,
    tags: v.tags ?? [],
    creator_id: v.created_id,
    created_at: v.created_at ?? '',
    empathy: empathyByNumId[v.id] ?? v.empathy ?? 0,
  });

  const selected: ReviewDetail | null = useMemo(() => {
    if (openId == null) return null;
    const found = topItems.find(v => v.id === openId);
    return found ? toDetail(found) : null;
  }, [openId, topItems, empathyByNumId]);

  // DB 공감
  const handleEmpathy = async (numId: number) => {
    const rid = numToReviewId[numId];
    if (!rid) return;

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

    const { error } = await supabase.from('review_likes').insert({ review_id: rid, user_id: myId });
    // @ts-ignore 중복 코드 허용(23505)
    if (error && error.code !== '23505') {
      console.error('[ReviewsSection] empathy insert error', error);
      alert('공감 처리 중 오류가 발생했습니다.');
      return;
    }

    // 로컬 반영
    setEmpathyByNumId(prev => ({ ...prev, [numId]: (prev[numId] ?? 0) + 1 }));
    setLikedByNumId(prev => new Set(prev).add(numId));
  };

  return (
    <div className="bg-[#F9FBFF] border-t border-b border-solid border-[#DBDBDB]">
      <div className="mx-auto w-[1024px]">
        {/* 섹션 헤더 */}
        <div className="flex items-end pt-[80px] pb-[36px]">
          <div className="mr-4">
            <p className="font-semibold text-lg">믿고 참여하는</p>
            <p className="font-semibold text-xxl">Mo:ri 의 모임 후기!</p>
          </div>
          <div>
            <Link to="/reviews" className="flex text-sm pb-2 gap-1 items-center">
              <img src="/images/plus.svg" alt="더보기" />
              더보기
            </Link>
          </div>
        </div>

        {/* 후기 카드 리스트 (공감 상위 4개) */}
        <div className="flex gap-[21px]">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="w-[240px] h-[280px] rounded-sm border border-[#E5E5E5] bg-white"
              >
                <div className="h-[72px] bg-[#D7EAFE]" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded w-5/6" />
                  <div className="h-3 bg-gray-200 rounded w-4/6" />
                </div>
              </div>
            ))
          ) : topItems.length === 0 ? (
            <div className="text-gray-500">표시할 후기가 없습니다.</div>
          ) : (
            topItems.map(item => (
              <ReviewCard
                key={item.id}
                item={{ ...item, empathy: empathyByNumId[item.id] ?? item.empathy ?? 0 }}
                onClick={setOpenId}
              />
            ))
          )}
        </div>

        {/* 상세 모달 */}
        <AnimatePresence initial={false} mode="wait">
          {selected && (
            <ReviewDetailModal
              key={`review-${selected.id}`}
              open
              review={selected}
              onClose={() => setOpenId(null)}
              onEmpathy={() => handleEmpathy(selected.id)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* === 서비스소개 및 배너 === */}
      <div className="pt-[135px] pb-[74px] ">
        <div className="mx-auto bg-white shadow-card w-[1024px] h-[233px] flex py-6 relative">
          {/* 서비스소개 */}
          <div className="pl-6">
            <Link to={'/serviceint'}>
              <div className="bg-brand w-[230px] h-[246px] rounded-[5px] rounded-tr-[50px] py-[36px] px-[32px] absolute bottom-[23px]">
                <span className="text-white font-bold text-sm">어려운 분들께</span>
                <p className="text-white text-xxl font-bold flex gap-2 items-center">
                  서비스소개 <img src="./linkarrow.svg" alt="이동" />
                </p>
                <p className="text-white pt-2 text-sm w-[129px] ">
                  모임생성부터 참가까지 사이트를 이용할 수 있는 방법을 알려드립니다.
                </p>
              </div>
            </Link>
          </div>
          {/* 배너노출 */}
          <div className="flex gap-[31px] absolute right-[35px]">
            <div className="w-[213px] h-[187px] rounded-[5px] bg-gray-300 overflow-hidden">
              <a
                href="https://greenart.co.kr/?ACE_REF=adwords_g&ACE_KW=%EA%B7%B8%EB%A6%B0%EC%BB%B4%ED%93%A8%ED%84%B0%EC%95%84%ED%8A%B8%ED%95%99%EC%9B%90&gad_source=1&gad_campaignid=16820849449&gbraid=0AAAAADsHW8xXw-LjNJLTj-a4cz89UEwrZ&gclid=CjwKCAjwlaTGBhANEiwAoRgXBSJt5jhL98x5f0HeijEpTTFfMbSh92Ajsj93QWomKrWQLhbmuKCJEhoCmZ8QAvD_BwE"
                target="_blank"
              >
                <img
                  className="w-[100%] y-[100%] object-cover"
                  src="./pro_banner2.jpg"
                  alt="그린컴퓨터아트학원"
                />
              </a>
            </div>
            <div className="w-[213px] h-[187px] rounded-[5px] bg-gray-300 overflow-hidden">
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSfArAWTcEHht9c693B3wVQWWl-15gaT9seoM6JsCWUnpBqCTA/viewform?pli=1"
                target="_blank"
              >
                <img
                  className="w-[100%] y-[100%] object-cover"
                  src="./pro_banner1.jpg"
                  alt="제휴배너이름"
                />
              </a>
            </div>
            <div className="w-[213px] h-[187px] rounded-[5px] bg-gray-300 overflow-hidden">
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSfArAWTcEHht9c693B3wVQWWl-15gaT9seoM6JsCWUnpBqCTA/viewform?pli=1"
                target="_blank"
              >
                <img
                  className="w-[100%] y-[100%] object-cover"
                  src="./pro_banner1.jpg"
                  alt="제휴배너이름"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
