// src/hooks/useDailyLikes.ts
import { useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ensureSubscribed } from '../lib/contentUtils';
import { likeToggle, loadLikeCounts, loadMyLikes } from '../lib/dailyPosts';

type LikeState = {
  likeCountMap: Record<string, number>;
  likedByMe: Record<string, boolean>;
  prime: (postIds: string[], userId: string | null) => Promise<void>;
  // NOTE: avatarUrl은 더 이상 사용하지 않지만, 기존 호출부 호환을 위해 인자만 남겨둠.
  toggleLike: (
    postId: string,
    currentUserId: string | null,
    avatarUrl?: string | null, // unused
  ) => Promise<void>;
  setupRealtime: (groupId: string, postIds: string[]) => void;
  teardownRealtime: () => void;
};

export function useDailyLikes(): LikeState {
  const [likeCountMap, setLikeCountMap] = useState<Record<string, number>>({});
  const [likedByMe, setLikedByMe] = useState<Record<string, boolean>>({});

  const likesChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const postSendersRef = useRef<
    Record<string, { ch: ReturnType<typeof supabase.channel>; ready: Promise<any> }>
  >({});

  // 로컬 낙관적 업데이트 직후 수신되는 RT 이벤트를 무시하기 위한 "신선도" 마커
  const localActionRef = useRef<Record<string, number>>({});
  const LOCAL_MS = 900; // 0.9초 안의 이벤트는 자기 자신이 방금 보낸 것으로 간주

  const markLocal = (id: string) => {
    localActionRef.current[id] = Date.now();
  };
  const isFresh = (id: string) => Date.now() - (localActionRef.current[id] ?? 0) < LOCAL_MS;

  const teardownRealtime = () => {
    try {
      if (likesChannelRef.current) supabase.removeChannel(likesChannelRef.current);
      likesChannelRef.current = null;
    } catch {
      // noop
    }
  };

  const getPostSender = (id: string) => {
    if (!postSendersRef.current[id]) {
      const ch = supabase.channel(`daily_post_${id}`, { config: { broadcast: { self: false } } });
      postSendersRef.current[id] = { ch, ready: ensureSubscribed(ch) };
    }
    return postSendersRef.current[id];
  };

  const setupRealtime = (groupId: string, postIds: string[]) => {
    teardownRealtime();
    if (!groupId || postIds.length === 0) return;

    const ch = supabase.channel(`daily_group_${groupId}`, {
      config: { broadcast: { self: true } },
    });

    const adjust = (delta: number, postId: string) => {
      setLikeCountMap(p => ({ ...p, [postId]: Math.max(0, (p[postId] ?? 0) + delta) }));
    };

    ch.on('broadcast', { event: 'like:add' }, m => {
      const { postId } = (m?.payload ?? {}) as { postId?: string };
      if (!postId || !postIds.includes(postId) || isFresh(postId)) return;
      adjust(1, postId);
    });

    ch.on('broadcast', { event: 'like:remove' }, m => {
      const { postId } = (m?.payload ?? {}) as { postId?: string };
      if (!postId || !postIds.includes(postId) || isFresh(postId)) return;
      adjust(-1, postId);
    });

    likesChannelRef.current = ch;
    ensureSubscribed(ch).catch(() => {});
  };

  const prime = async (postIds: string[], userId: string | null) => {
    const [counts, mine] = await Promise.all([
      loadLikeCounts(postIds),
      loadMyLikes(postIds, userId),
    ]);
    setLikeCountMap(counts);
    setLikedByMe(mine);
  };

  const toggleLike = async (
    postId: string,
    currentUserId: string | null,
    _avatarUrl?: string | null, // 인자는 무시한다. (깜빡임 원인 제거)
  ) => {
    if (!currentUserId) {
      alert('로그인 후 이용해 주세요.');
      return;
    }

    const wasLiked = !!likedByMe[postId];
    const nextLiked = !wasLiked;

    // 낙관적 업데이트
    markLocal(postId);
    setLikedByMe(p => ({ ...p, [postId]: nextLiked }));
    setLikeCountMap(p => ({
      ...p,
      [postId]: Math.max(0, (p[postId] ?? 0) + (nextLiked ? 1 : -1)),
    }));

    // 서버 토글
    const { error } = await likeToggle(postId, currentUserId, nextLiked);
    if (error) {
      // 롤백
      setLikedByMe(p => ({ ...p, [postId]: wasLiked }));
      setLikeCountMap(p => ({
        ...p,
        [postId]: Math.max(0, (p[postId] ?? 0) + (wasLiked ? 1 : -1)),
      }));
      console.error('[like] toggle error', error);
      return;
    }

    // 실시간 방송: avatarUrl 제거 → 아바타는 항상 DB 조인 결과만 사용
    const evt = `like:${nextLiked ? 'add' : 'remove'}`;

    if (likesChannelRef.current) {
      await ensureSubscribed(likesChannelRef.current);
      likesChannelRef.current.send({
        type: 'broadcast',
        event: evt,
        payload: { postId, userId: currentUserId },
      });
    }

    const { ch, ready } = getPostSender(postId);
    await ready;
    ch.send({
      type: 'broadcast',
      event: evt,
      payload: { postId, userId: currentUserId },
    });
  };

  return { likeCountMap, likedByMe, prime, toggleLike, setupRealtime, teardownRealtime };
}
