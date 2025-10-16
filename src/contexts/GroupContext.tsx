import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { GroupInsertPayload, groups, groupsUpdate } from '../types/group';
import {
  createContext,
  useState,
  useCallback,
  useEffect,
  useContext,
  type PropsWithChildren,
} from 'react';

interface GroupContextType {
  groups: groups[];
  currentGroup: groups | null;
  loading: boolean;
  error: string | null;
  fetchGroups: (slug?: string) => Promise<void>;
  fetchGroupById: (groupId: string) => Promise<void>;
  createGroup: (newGroup: Omit<GroupInsertPayload, 'created_by'>) => Promise<void>;
  updateGroup: (groupId: string, updates: groupsUpdate) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
}

const GroupContext = createContext<GroupContextType | null>(null);

export const GroupProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<groups[]>([]);
  const [currentGroup, _setCurrentGroup] = useState<groups | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 그룹 목록 조회
  const fetchGroups = useCallback(async (slug?: string) => {
    try {
      setLoading(true);
      let query = supabase.from('groups').select('*');
      if (slug && slug !== 'all') query = query.eq('group_kind', slug);
      const { data, error } = await query;
      if (error) throw error;
      setGroups(data ?? []);
    } catch (err: any) {
      setError(err.message);
      console.error('fetchGroups error:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // 그룹 생성
  const createGroup = useCallback(
    async (newGroup: Omit<GroupInsertPayload, 'created_by'>) => {
      if (!user) throw new Error('로그인 후 이용해주세요.');
      setLoading(true);

      const payload: GroupInsertPayload = {
        group_title: newGroup.group_title,
        group_region: newGroup.group_region_any ? null : newGroup.group_region,
        group_short_intro: newGroup.group_short_intro ?? '',
        group_content: newGroup.group_content ?? '',
        group_start_day: newGroup.group_start_day,
        group_end_day: newGroup.group_end_day,
        group_kind: newGroup.group_kind,
        status: 'recruiting',
        group_capacity: newGroup.group_capacity ?? 0,
        group_region_any: newGroup.group_region_any ?? false,
        created_by: user.id,
      };

      const { error } = await supabase.from('groups').insert(payload);
      if (error) throw error;
      await fetchGroups();
    },
    [user, fetchGroups],
  );

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return (
    <GroupContext.Provider
      value={{
        groups,
        currentGroup,
        loading,
        error,
        fetchGroups,
        createGroup,
        fetchGroupById: async () => {},
        updateGroup: async () => {},
        deleteGroup: async () => {},
      }}
    >
      {children}
    </GroupContext.Provider>
  );
};

export function useGroup() {
  const ctx = useContext(GroupContext);
  if (!ctx) throw new Error('useGroup은 GroupProvider 안에서만 사용 가능합니다.');
  return ctx;
}
