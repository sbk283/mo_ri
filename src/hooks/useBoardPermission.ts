// src/hooks/useBoardPermission.ts
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Result = {
  isHost: boolean;
  allowHost: boolean;
  allowMember: boolean;
  canCreate: boolean;
  loaded: boolean;
};

export function useBoardPermission(groupId?: string, boardType: string = 'notice'): Result {
  const [state, setState] = useState<Result>({
    isHost: false,
    allowHost: false,
    allowMember: false,
    canCreate: false,
    loaded: false,
  });

  useEffect(() => {
    let off = false;

    async function run() {
      setState(s => ({ ...s, loaded: false }));

      const { data: u } = await supabase.auth.getUser();
      const userId = u?.user?.id;

      let isHost = false;
      if (groupId && userId) {
        try {
          const { data: ok } = await supabase.rpc('is_group_host', { p_group_id: groupId });
          if (ok === true || ok === 't' || ok === 1) isHost = true;
        } catch {}

        if (!isHost) {
          const { data } = await supabase
            .from('group_members')
            .select('role')
            .eq('group_id', groupId)
            .eq('user_id', userId)
            .maybeSingle();
          const role = String(data?.role ?? '').toLowerCase();
          isHost = role === 'host' || role === 'owner' || role === 'admin';
        }
      }

      let allowHost = false;
      let allowMember = false;
      {
        const { data } = await supabase
          .from('board_type')
          .select('allow_host, allow_member')
          .eq('board_type', boardType)
          .maybeSingle();

        allowHost = !!data?.allow_host;
        allowMember = !!data?.allow_member;
      }

      const canCreate = isHost ? allowHost : allowMember;

      if (!off) {
        setState({
          isHost,
          allowHost,
          allowMember,
          canCreate,
          loaded: true,
        });
      }
    }

    run();
    return () => {
      off = true;
    };
  }, [groupId, boardType]);

  return state;
}
