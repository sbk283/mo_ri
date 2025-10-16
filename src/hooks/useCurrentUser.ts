// 임시파일입니다.
// src/hooks/useCurrentUser.ts
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export type CurrentUser = {
  nickname: string;
  profileImageUrl: string | null;
};

export function useCurrentUser(): CurrentUser | undefined {
  const [me, setMe] = useState<CurrentUser>();

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        setMe(undefined);
        return;
      }

      const user = data.user;
      const md = (user.user_metadata as any) || {};

      const nickname =
        md.nickname || md.full_name || (user.email ? String(user.email).split('@')[0] : '익명');

      const profileImageUrl = md.avatar_url || null;

      if (mounted) {
        setMe({ nickname, profileImageUrl });
      }
    }

    loadUser();

    // 세션 상태 변경에도 자동 갱신
    const { data: subscription } = supabase.auth.onAuthStateChange(() => loadUser());

    return () => {
      mounted = false;
      subscription?.subscription?.unsubscribe?.();
    };
  }, []);

  return me;
}
