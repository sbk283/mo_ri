// src/components/common/GroupDailyContent.tsx
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Daily } from '../../types/daily';
import GroupPagination from './GroupPagination';
import GroupDailyDetailEdit from '../GroupDailyDetailEdit';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { supabase } from '../../lib/supabase';

const ITEMS_PER_PAGE = 6;
const today = () => new Date().toISOString().slice(0, 10);

// 기본 아바타 경로 (public/images/32px_favicon.svg)
const DEFAULT_AVATAR = '/images/32px_favicon.svg';

// 스토리지: group-post-images 버킷 키 → public URL
const isHttp = (u?: string | null) => !!u && /^https?:\/\//i.test(u);
const isPublicPath = (u?: string | null) => !!u && /\/storage\/v1\/object\/public\//i.test(u);
const resolveStorageUrl = (raw?: string | null): string | null => {
  if (!raw) return null;
  if (isHttp(raw) || isPublicPath(raw)) return raw;
  const key = raw.replace(/^group-post-images\//i, '');
  const { data } = supabase.storage.from('group-post-images').getPublicUrl(key);
  return data?.publicUrl ?? null;
};

// 공통 아바타 컴포넌트 (null/에러 → 기본 이미지로 대체)
function AvatarImg({
  src,
  alt,
  className = 'w-8 h-8 rounded-full object-cover border border-gray-200',
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  return (
    <img
      src={src || DEFAULT_AVATAR}
      alt={alt}
      className={className}
      onError={e => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = DEFAULT_AVATAR;
      }}
    />
  );
}

const getFirstImageUrl = (content: string | null | undefined): string | null => {
  if (!content) return null;

  const htmlMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (htmlMatch?.[1]) return htmlMatch[1];

  const mdMatch = content.match(/!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/);
  if (mdMatch?.[1]) return mdMatch[1];

  const urlMatch = content.match(/(https?:\/\/[^\s"'<>]+\.(?:png|jpe?g|gif|webp|avif|svg))/i);
  if (urlMatch?.[1]) return urlMatch[1];

  return null;
};

// 상세 이미지 파싱 유틸
const extractAllImageUrls = (content?: string | null): string[] => {
  if (!content) return [];
  const urls = new Set<string>();
  for (const m of content.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)) if (m[1]) urls.add(m[1]);
  for (const m of content.matchAll(/!\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/g))
    if (m[1]) urls.add(m[1]);
  for (const m of content.matchAll(/(https?:\/\/[^\s"'<>]+\.(?:png|jpe?g|gif|webp|avif|svg))/gi))
    if (m[1]) urls.add(m[1]);
  return Array.from(urls);
};
const stripAllImages = (content?: string | null): string => {
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

type DailyWithPostId = Daily & {
  postId: string;
  userId: string; // 권한 판별용
  groupId: string; // 필요시 확장
  viewCount: number;
};

// 리스트 재인덱싱 (id = 1..N)
const reindex = (arr: DailyWithPostId[]) => arr.map((it, idx) => ({ ...it, id: idx + 1 }));

export default function GroupDailyContent({
  groupId,
  createRequestKey = 0,
  onCraftingChange,
}: {
  groupId?: string;
  createRequestKey?: number;
  onCraftingChange?: (v: boolean) => void;
}) {
  // useCurrentUser는 { id, nickname, profileImageUrl }를 반환한다고 가정
  const user = useCurrentUser();
  const currentUserId = user?.id ?? null;

  const [isCreating, setIsCreating] = useState(false);
  const prevKey = useRef(createRequestKey);

  // 외부 트리거 → 작성 모드 진입
  useEffect(() => {
    if (createRequestKey > prevKey.current) setIsCreating(true);
    prevKey.current = createRequestKey;
  }, [createRequestKey]);

  // 작성 모드 변경 시 부모 알림
  useEffect(() => {
    onCraftingChange?.(isCreating);
  }, [isCreating, onCraftingChange]);

  useEffect(() => () => onCraftingChange?.(false), [onCraftingChange]);

  const [items, setItems] = useState<DailyWithPostId[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [profileByPostId, setProfileByPostId] = useState<Record<string, string | null>>({});

  // 좋아요 상태/카운트 맵
  const [likeCountMap, setLikeCountMap] = useState<Record<string, number>>({});
  const [likedByMe, setLikedByMe] = useState<Record<string, boolean>>({});

  // 목록 로드
  useEffect(() => {
    if (!groupId) return;
    let ignore = false;

    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('group_posts')
        .select(
          `
          post_id,
          group_id,
          user_id,
          post_title,
          post_body_md,
          post_created_at,
          view_count,
          user_profiles:user_profiles!group_posts_user_id_fkey(nickname, avatar_url)
        `,
        )
        .eq('group_id', groupId)
        .eq('board_type', 'daily')
        .order('post_created_at', { ascending: false });

      if (ignore) return;

      if (error) {
        console.error('[GroupDailyContent] load error', error);
        setItems([]);
        setProfileByPostId({});
        setLikeCountMap({});
        setLikedByMe({});
        setLoading(false);
        return;
      }

      const mapped: DailyWithPostId[] = (data ?? []).map((row: any, idx: number) => {
        const content: string = row.post_body_md ?? '';
        const thumbnail = resolveStorageUrl(getFirstImageUrl(content)) ?? getFirstImageUrl(content);
        return {
          id: idx + 1,
          postId: row.post_id,
          groupId: row.group_id,
          userId: row.user_id,
          title: row.post_title ?? '',
          content,
          date: (row.post_created_at ?? '').slice(0, 10),
          isRead: false,
          writer: row.user_profiles?.nickname ?? '익명',
          likedCount: 0, // 실제 값은 아래 like 통계에서 덮어씀
          imageUrl: thumbnail,
          viewCount: row.view_count ?? 0,
        };
      });

      const profiles: Record<string, string | null> = {};
      (data ?? []).forEach((row: any) => {
        profiles[row.post_id] = row.user_profiles?.avatar_url ?? null;
      });

      setItems(mapped);
      setProfileByPostId(profiles);
      setLoading(false);

      // 좋아요 통계 로드 (카운트 + 내가 눌렀는지)
      const postIds = (data ?? []).map((r: any) => r.post_id) as string[];
      if (postIds.length > 0) {
        await loadLikeStats(postIds);
      } else {
        setLikeCountMap({});
        setLikedByMe({});
      }
    })();

    return () => {
      ignore = true;
    };
  }, [groupId, currentUserId]);

  // 좋아요 통계 로더
  const loadLikeStats = async (postIds: string[]) => {
    // count (해당 post들만)
    const { data: countsData, error: countsErr } = await supabase
      .from('group_post_likes')
      .select('post_id')
      .in('post_id', postIds);

    const countMap: Record<string, number> = {};
    if (!countsErr && countsData) {
      for (const row of countsData) {
        const pid = (row as any).post_id as string;
        countMap[pid] = (countMap[pid] ?? 0) + 1;
      }
    }

    // 좋아요
    let likedMap: Record<string, boolean> = {};
    if (currentUserId) {
      const { data: mineData, error: mineErr } = await supabase
        .from('group_post_likes')
        .select('post_id')
        .eq('user_id', currentUserId)
        .in('post_id', postIds);

      if (!mineErr && mineData) {
        likedMap = Object.fromEntries(mineData.map((r: any) => [r.post_id as string, true]));
      }
    }

    setLikeCountMap(countMap);
    setLikedByMe(likedMap);
    setItems(prev => prev.map(it => ({ ...it, likedCount: countMap[it.postId] ?? 0 })));
  };

  // 조회수
  const viewedKey = (postId: string) => `viewed_${postId}_${today()}`;
  const hasViewed = (postId: string) => {
    try {
      return sessionStorage.getItem(viewedKey(postId)) === '1';
    } catch {
      return false;
    }
  };
  const markViewed = (postId: string) => {
    try {
      sessionStorage.setItem(viewedKey(postId), '1');
    } catch {}
  };

  const bumpViewCount = async (postId: string) => {
    if (!groupId || hasViewed(postId)) return;
    const { data: sel, error: selErr } = await supabase
      .from('group_posts')
      .select('view_count')
      .eq('post_id', postId)
      .single();

    if (!selErr) {
      const next = (sel?.view_count ?? 0) + 1;
      const { error: updErr } = await supabase
        .from('group_posts')
        .update({ view_count: next })
        .eq('post_id', postId);
      if (!updErr) {
        setItems(prev => prev.map(it => (it.postId === postId ? { ...it, viewCount: next } : it)));
        markViewed(postId);
      }
    }
  };

  // 좋아요 토글
  const toggleLike = async (
    postId: string,
    onDetailSync?: (liked: boolean) => void,
  ): Promise<{ ok: boolean; liked: boolean }> => {
    if (!currentUserId) {
      alert('로그인 후 이용해 주세요.');
      return { ok: false, liked: false };
    }
    const wasLiked = !!likedByMe[postId];
    const nextLiked = !wasLiked;

    // 낙관적 업데이트
    setLikedByMe(prev => ({ ...prev, [postId]: nextLiked }));
    setLikeCountMap(prev => ({
      ...prev,
      [postId]: Math.max(0, (prev[postId] ?? 0) + (nextLiked ? 1 : -1)),
    }));
    setItems(prev =>
      prev.map(it =>
        it.postId === postId
          ? { ...it, likedCount: Math.max(0, (it.likedCount ?? 0) + (nextLiked ? 1 : -1)) }
          : it,
      ),
    );
    onDetailSync?.(nextLiked);

    // 서버 반영
    if (wasLiked) {
      const { error } = await supabase
        .from('group_post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', currentUserId);

      if (error) {
        // 롤백
        setLikedByMe(prev => ({ ...prev, [postId]: true }));
        setLikeCountMap(prev => ({ ...prev, [postId]: (prev[postId] ?? 0) + 1 }));
        setItems(prev =>
          prev.map(it =>
            it.postId === postId ? { ...it, likedCount: (it.likedCount ?? 0) + 1 } : it,
          ),
        );
        onDetailSync?.(true);
        console.error('[like] unlike error', error);
        return { ok: false, liked: true };
      }
      return { ok: true, liked: false };
    } else {
      const { error } = await supabase
        .from('group_post_likes')
        .insert({ post_id: postId, user_id: currentUserId });

      if (error) {
        // 롤백
        setLikedByMe(prev => ({ ...prev, [postId]: false }));
        setLikeCountMap(prev => ({ ...prev, [postId]: Math.max(0, (prev[postId] ?? 1) - 1) }));
        setItems(prev =>
          prev.map(it =>
            it.postId === postId
              ? { ...it, likedCount: Math.max(0, (it.likedCount ?? 1) - 1) }
              : it,
          ),
        );
        onDetailSync?.(false);
        console.error('[like] like error', error);
        return { ok: false, liked: false };
      }
      return { ok: true, liked: true };
    }
  };

  // 페이지네이션
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [items.length]);
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE)),
    [items.length],
  );
  const pageItems = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return items.slice(start, start + ITEMS_PER_PAGE);
  }, [page, items]);

  // 상세 선택/닫기
  const [detailId, setDetailId] = useState<number | null>(null);
  const openDetail = (id: number) => {
    setDetailId(id);
    setIsCreating(false);
    const post = items.find(d => d.id === id);
    if (post) void bumpViewCount(post.postId);
  };
  const closeDetail = () => setDetailId(null);

  const selectedDaily = useMemo<DailyWithPostId | null>(
    () => (detailId ? (items.find(d => d.id === detailId) ?? null) : null),
    [detailId, items],
  );

  // 작성용 기본값
  const emptyDaily: Daily = {
    id: 0,
    title: '',
    content: '',
    date: today(),
    isRead: false,
    writer: user?.nickname ?? '익명',
    likedCount: 0,
    imageUrl: user?.profileImageUrl ?? null,
  };

  // 작성 저장: 생성 직후 상세 진입 시 조회수 1 보이도록 반영
  const handleCreateSave = async (next: Daily) => {
    if (!groupId) return;
    const { data: userRes } = await supabase.auth.getUser();
    const userId = userRes?.user?.id;
    if (!userId) return;

    const { data: inserted, error } = await supabase
      .from('group_posts')
      .insert({
        user_id: userId,
        group_id: groupId,
        board_type: 'daily',
        post_title: next.title,
        post_body_md: next.content,
      })
      .select('post_id, group_id, user_id, post_created_at')
      .single();

    if (error || !inserted) {
      console.error('[GroupDailyContent] insert error', error);
      return;
    }

    const newItem: DailyWithPostId = {
      id: 0, // reindex에서 1로 세팅
      postId: inserted.post_id,
      groupId: inserted.group_id,
      userId: inserted.user_id,
      title: next.title ?? '',
      content: next.content ?? '',
      date: (inserted.post_created_at ?? today()).slice(0, 10),
      isRead: false,
      writer: user?.nickname ?? '익명',
      likedCount: 0,
      imageUrl: resolveStorageUrl(getFirstImageUrl(next.content)) ?? getFirstImageUrl(next.content),
      viewCount: 0,
    };

    // 리스트에 넣고 상세 진입
    setItems(prev => {
      const withNew = [newItem, ...prev];
      const re = reindex(withNew);
      setDetailId(re[0].id); // 새 글 상세로 진입
      return re;
    });

    // 생성 직후 화면에서 "조회수 1" 낙관 반영
    setItems(prev => prev.map(it => (it.postId === newItem.postId ? { ...it, viewCount: 1 } : it)));

    // 서버 카운터도 +1 (세션키로 당일 중복 방지 + 상태 반영)
    void bumpViewCount(newItem.postId);

    setIsCreating(false);
    setPage(1);
  };

  // 수정 저장
  const handleUpdateSave = async (next: DailyWithPostId) => {
    if (!currentUserId || currentUserId !== next.userId) {
      alert('작성자만 수정할 수 있습니다.');
      return;
    }

    const { error } = await supabase
      .from('group_posts')
      .update({ post_title: next.title, post_body_md: next.content })
      .eq('post_id', next.postId)
      .eq('user_id', currentUserId);

    if (error) {
      console.error('[GroupDailyContent] update error', error);
      alert('수정 권한이 없거나 오류가 발생했습니다.');
      return;
    }

    setItems(prev =>
      prev.map(it =>
        it.postId === next.postId ? { ...it, title: next.title, content: next.content } : it,
      ),
    );
  };

  // 삭제
  const handleDelete = async (postId: string) => {
    const target = items.find(it => it.postId === postId);
    if (!target) return;

    if (!currentUserId || currentUserId !== target.userId) {
      alert('작성자만 삭제할 수 있습니다.');
      return;
    }

    const { error } = await supabase
      .from('group_posts')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', currentUserId);

    if (error) {
      console.error('[GroupDailyContent] delete error', error);
      alert('삭제 권한이 없거나 오류가 발생했습니다.');
      return;
    }

    setItems(prev => prev.filter(it => it.postId !== postId));
    setDetailId(null);
  };

  // 로딩 스켈레톤
  const SkeletonCard = () => (
    <div className="relative flex h-[233px] flex-col rounded-sm bg-white text-left transition px-4 py-1">
      <div className="w-[290px] h-[160px] bg-gray-100 rounded-sm" />
      <div className="mt-2 h-[18px] w-[70%] bg-gray-100 rounded" />
      <div className="mt-1 h-[14px] w-[40%] bg-gray-100 rounded" />
      <div className="mt-1 h-[14px] w-[50%] bg-gray-100 rounded" />
    </div>
  );

  // ===== 상세 화면 =====
  const DetailView = ({ d }: { d: DailyWithPostId }) => {
    const [editMode, setEditMode] = useState(false);
    const allImagesRaw = useMemo(() => extractAllImageUrls(String(d.content ?? '')), [d.content]);
    const allImages = useMemo(
      () => allImagesRaw.map(u => resolveStorageUrl(u) ?? u).filter(Boolean) as string[],
      [allImagesRaw],
    );
    const contentWithoutImages = useMemo(
      () => stripAllImages(String(d.content ?? '')),
      [d.content],
    );
    const canEditDelete = !!currentUserId && currentUserId === d.userId;

    const liked = !!likedByMe[d.postId];
    const likeCount = likeCountMap[d.postId] ?? d.likedCount ?? 0;

    // 좋아요한 멤버(유저ID 기준) 상태
    type LikerEntry = { userId: string; avatarUrl: string | null };
    const [likers, setLikers] = useState<{ entries: LikerEntry[]; total: number }>({
      entries: [],
      total: 0,
    });

    // 공통 fetch 함수 (초기/토글 후 모두 사용)
    const fetchLikers = async () => {
      const { data: likeRows, error: likeErr } = await supabase
        .from('group_post_likes')
        .select('user_id')
        .eq('post_id', d.postId);

      if (likeErr || !likeRows) {
        setLikers({ entries: [], total: 0 });
        return;
      }

      const userIds = (likeRows as any[]).map(r => r.user_id as string);
      const total = userIds.length;

      if (userIds.length === 0) {
        setLikers({ entries: [], total: 0 });
        return;
      }

      const { data: profiles, error: profErr } = await supabase
        .from('user_profiles')
        .select('user_id, avatar_url')
        .in('user_id', userIds);

      const avatarMap = new Map<string, string | null>();
      if (!profErr && profiles) {
        for (const p of profiles as any[]) {
          avatarMap.set(p.user_id, p.avatar_url ?? null);
        }
      }
      const entries: LikerEntry[] = userIds.map(uid => ({
        userId: uid,
        avatarUrl: avatarMap.get(uid) ?? null,
      }));

      setLikers({ entries, total });
    };

    // 상세 진입 시 최초 로딩
    useEffect(() => {
      let ignore = false;
      (async () => {
        if (!ignore) await fetchLikers();
      })();
      return () => {
        ignore = true;
      };
    }, [d.postId]);

    // 버튼 핸들러: 낙관 반영 + 서버확정 후 항상 재조회
    const handleToggleLikeDetail = async () => {
      const me = currentUserId ?? '__me__';
      const myAvatar = user?.profileImageUrl ?? null;

      // 낙관적: 화면 즉시 반응 (아바타 목록도 반영)
      setLikers(prev => {
        const hasMe = prev.entries.some(e => e.userId === me);
        if (!liked) {
          if (hasMe) return prev;
          return {
            entries: [{ userId: me, avatarUrl: myAvatar }, ...prev.entries],
            total: prev.total + 1,
          };
        } else {
          if (!hasMe) return { ...prev, total: Math.max(0, prev.total - 1) };
          return {
            entries: prev.entries.filter(e => e.userId !== me),
            total: Math.max(0, prev.total - 1),
          };
        }
      });

      // 서버 토글
      await toggleLike(d.postId);

      // 서버 상태로 최종 동기화
      await fetchLikers();
    };

    const MAX_VISIBLE = 12;
    const visibleEntries = likers.entries.slice(0, MAX_VISIBLE);
    const overflow = Math.max(0, (likers.total ?? 0) - visibleEntries.length);

    return (
      <AnimatePresence mode="wait" initial={false}>
        {editMode ? (
          <motion.div
            key="edit"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <GroupDailyDetailEdit
              daily={d}
              onCancel={() => setEditMode(false)}
              onSave={next => {
                handleUpdateSave(next as DailyWithPostId);
                setEditMode(false);
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <article className="mx-auto bg-white shadow-md border border-[#A3A3A3] min-h-[500px]">
              {/* 헤더: 제목/메타 */}
              <header className="px-8 pt-6">
                <div className="flex">
                  <h1 className="text-xl font-bold text-gray-800 leading-snug mb-3">{d.title}</h1>
                </div>
                <div className="flex items-center text-[#8C8C8C] text-md gap-3">
                  <span>{d.date}</span>
                  <span>조회수 {d.viewCount ?? 0}</span>
                  <div className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="#6c6c6c"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-[15px] h-[15px]"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                      />
                    </svg>
                    <span className="leading-3">좋아요 {likeCount}</span>
                  </div>
                  <a href="/inquiry" className="text-sm text-end ml-auto text-[#8C8C8C]">
                    신고하기
                  </a>
                </div>
              </header>

              {/* 헤더-본문 사이 구분선 */}
              <div className="text-center">
                <div className="inline-block border-b-[1px] border-[#A3A3A3] w-[910px]" />
              </div>

              {/* 본문 */}
              <section className="px-8 py-8 text-gray-800 leading-relaxed min-h-[200px]">
                {allImages.length > 0 && (
                  <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {allImages.map((src, i) => (
                      <motion.img
                        key={`${src}-${i}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        src={src}
                        alt={`${d.title} 이미지 ${i + 1}`}
                        className="w-full h-auto rounded-sm object-cover"
                      />
                    ))}
                  </div>
                )}

                {typeof d.content === 'string' && d.content.trim().startsWith('<') ? (
                  <div
                    className="prose max-w-none whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: stripAllImages(String(d.content ?? '')) }}
                  />
                ) : (
                  <div className="whitespace-pre-wrap">{contentWithoutImages}</div>
                )}
              </section>

              {/* 좋아요 버튼 */}
              <motion.button
                whileTap={{ scale: 0.96 }}
                className="min-w-[84px] h-[32px] flex items-center gap-1 ml-auto mr-8 mb-2 text-[#0689E8] border border-[#0689E8] px-3 py-1 rounded-sm transition"
                onClick={handleToggleLikeDetail}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill={liked ? 'currentColor' : 'none'}
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-[15px] h-[15px]"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                  />
                </svg>
                <p className="leading-none">{liked ? '좋아요 취소' : '좋아요'}</p>
              </motion.button>

              <div>
                {/* 좋아요 버튼 아래 보더 라인 */}
                <div className="text-center">
                  <div className="inline-block border-b-[1px] border-[#A3A3A3] w-[910px]" />
                </div>

                {/* 보더 라인 아래: 좋아요한 멤버 섹션 */}
                <section className="px-8 pb-8 pt-4 mt-auto flex flex-col justify-end min-h-[120px]">
                  <span className="block text-lg text-[#3C3C3C] font-semibold mb-2">
                    좋아요한 멤버
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    {likers.total > 0 ? (
                      <>
                        {visibleEntries.map(e => (
                          <AvatarImg key={e.userId} src={e.avatarUrl} alt="좋아요한 멤버" />
                        ))}
                        {overflow > 0 && (
                          <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-[11px] text-gray-600">
                            +{overflow}
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-sm text-[#B3B3B3]">첫 좋아요를 눌러보세요</span>
                    )}
                  </div>
                </section>
              </div>
            </article>

            {/* 푸터 */}
            <footer className="py-6 flex text-left justify-start">
              <button onClick={closeDetail} className="text-[#8C8C8C] py-2 transition text-md">
                &lt; 목록으로
              </button>
              {canEditDelete ? (
                <div className="ml-auto flex py-2">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    className="text-md w-[50px] h-[32px] flex justify-center items-center text-center mr-4 text-[#0689E8] border border-[#0689E8] rounded-sm transition"
                    onClick={() => handleDelete(d.postId)}
                  >
                    삭제
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    className="text-md w-[50px] h-[32px] flex justify-center items-center text-center text-white bg-[#0689E8] border border-[#0689E8] rounded-sm transition"
                    onClick={() => setEditMode(true)}
                  >
                    수정
                  </motion.button>
                </div>
              ) : (
                <div className="ml-auto flex py-2" style={{ width: 50 + 8 + 50 }} />
              )}
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <div className="w-[975px] bg-white overflow-hidden">
      <AnimatePresence mode="wait">
        {isCreating ? (
          // 작성 뷰
          <motion.div
            key="daily-create"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <GroupDailyDetailEdit
              daily={emptyDaily}
              onCancel={() => setIsCreating(false)}
              onSave={handleCreateSave}
            />
          </motion.div>
        ) : detailId == null ? (
          // 리스트 뷰
          <motion.div
            key="daily-list"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {loading ? (
              <div className="grid grid-cols-3 auto-rows-fr gap-3 py-6">
                {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="p-6 text-center text-gray-500">등록된 글이 없습니다.</div>
            ) : (
              <>
                <div className="grid grid-cols-3 auto-rows-fr gap-3 py-6">
                  {pageItems.map(daily => {
                    const likeCount = likeCountMap[daily.postId] ?? daily.likedCount ?? 0;
                    const liked = !!likedByMe[daily.postId];
                    const thumb = resolveStorageUrl(daily.imageUrl) ?? daily.imageUrl;
                    return (
                      <button
                        key={daily.id}
                        type="button"
                        onClick={() => openDetail(daily.id)}
                        className="relative flex h-[233px] flex-col rounded-sm bg-white text-left transition px-4 py-1"
                      >
                        {/* 썸네일 */}
                        {thumb ? (
                          <img
                            src={thumb}
                            alt="썸네일"
                            className="w-[290px] h-[160px] object-cover rounded-sm"
                          />
                        ) : (
                          <img
                            src="/images/no_image.jpg"
                            alt="기본 이미지"
                            className="w-[290px] h-[160px] object-cover rounded-sm"
                          />
                        )}

                        <h3 className="mt-1 line-clamp-1 text-md font-bold text-[#000]">
                          {daily.title || '제목 없음'}
                        </h3>
                        <span className="text-sm text-gray-400">작성일자: {daily.date}</span>

                        <div className="flex w-full justify-between items-center">
                          {/* 작성자 프로필 + 닉네임 */}
                          {daily.writer && (
                            <div className="flex items-center justify-center gap-1 leading-none">
                              <AvatarImg
                                src={profileByPostId[daily.postId] as string | null}
                                alt={`${daily.writer} 프로필`}
                                className="w-[13px] h-[13px] rounded-full object-cover border border-gray-200"
                              />
                              <span className="text-sm text-[#666] flex items-center pt-[2px]">
                                {daily.writer}
                              </span>
                            </div>
                          )}

                          {/* 좋아요 (UI 그대로, 값만 연결) */}
                          <div className="flex items-center gap-1 text-sm text-[#8c8c8c] justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="#6c6c6c"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                              className="w-[13px] h-[13px]"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                              />
                            </svg>
                            <span className="leading-none">좋아요 {likeCount}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <GroupPagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </>
            )}
          </motion.div>
        ) : (
          // 상세 뷰
          <motion.div
            key="daily-detail"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {selectedDaily ? (
              <DetailView d={selectedDaily} />
            ) : (
              <div className="p-8 text-center">
                <p>해당 글을 찾을 수 없습니다.</p>
                <button
                  onClick={closeDetail}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  돌아가기
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
