// src/lib/dailyPosts.ts
import { supabase } from '../lib/supabase';

export type RawDailyRow = {
  post_id: string;
  group_id: string;
  user_id: string;
  post_title: string | null;
  post_body_md: string | null;
  post_created_at: string | null;
  view_count: number | null;
  user_profiles?: { nickname: string | null; avatar_url: string | null } | null;
};

export async function fetchDailyList(groupId: string) {
  return supabase
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
}

export async function createDaily(groupId: string, title: string, content: string) {
  const { data: u } = await supabase.auth.getUser();
  const uid = u?.user?.id;
  if (!uid) throw new Error('unauthorized');

  return supabase
    .from('group_posts')
    .insert({
      user_id: uid,
      group_id: groupId,
      board_type: 'daily',
      post_title: title,
      post_body_md: content,
    })
    .select('post_id, group_id, user_id, post_created_at')
    .single();
}

export async function updateDaily(postId: string, userId: string, title: string, content: string) {
  return supabase
    .from('group_posts')
    .update({ post_title: title, post_body_md: content })
    .eq('post_id', postId)
    .eq('user_id', userId);
}

export async function deleteDaily(postId: string, userId: string) {
  return supabase.from('group_posts').delete().eq('post_id', postId).eq('user_id', userId);
}

export async function bumpDailyView(postId: string) {
  const { data: u } = await supabase.auth.getUser();
  const uid = u?.user?.id;
  if (!uid) return;

  await supabase
    .from('group_daily_reads')
    .upsert(
      { post_id: postId, user_id: uid },
      { onConflict: 'post_id,user_id', ignoreDuplicates: true },
    );
}

export async function loadLikeCounts(postIds: string[]) {
  const { data } = await supabase.from('group_post_likes').select('post_id').in('post_id', postIds);
  const map: Record<string, number> = {};
  for (const row of data ?? []) {
    const pid = (row as any).post_id as string;
    map[pid] = (map[pid] ?? 0) + 1;
  }
  return map;
}

export async function loadMyLikes(postIds: string[], userId: string | null) {
  if (!userId) return {};
  const { data } = await supabase
    .from('group_post_likes')
    .select('post_id')
    .eq('user_id', userId)
    .in('post_id', postIds);
  return Object.fromEntries((data ?? []).map(r => [(r as any).post_id as string, true]));
}

export async function likeToggle(postId: string, userId: string, nextLiked: boolean) {
  if (nextLiked) {
    return supabase.from('group_post_likes').insert({ post_id: postId, user_id: userId });
  } else {
    return supabase.from('group_post_likes').delete().eq('post_id', postId).eq('user_id', userId);
  }
}
