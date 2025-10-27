import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useGroupFavorite() {
  const { user } = useAuth();

  // 찜 추가
  const addFavorite = useCallback(
    async (groupId: string) => {
      if (!user) return { error: '로그인이 필요합니다.' };
      if (!groupId || groupId === 'preview-temp-id') return;

      const { data, error } = await supabase
        .from('group_favorites')
        .upsert(
          { user_id: user.id, group_id: groupId, favorite: true },
          { onConflict: 'user_id,group_id' },
        )
        .select();

      if (error) {
        console.error('찜 추가 실패:', error);
        return { error: error.message };
      }
      return { data };
    },
    [user],
  );

  // 찜 해제
  const removeFavorite = useCallback(
    async (groupId: string) => {
      if (!user) return { error: '로그인이 필요합니다.' };
      if (!groupId || groupId === 'preview-temp-id') return;

      const { error } = await supabase
        .from('group_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('group_id', groupId);

      if (error) {
        // 실패 주석 남겨놈 필요없을 시 지움
        console.error('찜 해제 실패:', error);
        return { error: error.message };
      }
      return { data: 'ok' };
    },
    [user],
  );

  // 찜 여부 확인
  const checkFavorite = useCallback(
    async (groupId: string) => {
      if (!user) return false;
      if (!groupId || groupId === 'preview-temp-id') return;

      const { data, error } = await supabase
        .from('group_favorites')
        .select('favorite')
        .eq('user_id', user.id)
        .eq('group_id', groupId)
        .maybeSingle();

      if (error) {
        console.error('checkFavorite 실패:', error);
        return false;
      }

      return !!data;
    },
    [user],
  );

  return { addFavorite, removeFavorite, checkFavorite };
}
