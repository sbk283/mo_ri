import {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  type PropsWithChildren,
} from 'react';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { careers } from '../types/careerType';
import type { group_members } from '../types/group';

// 타입 정의
export type MemberStatus = 'applied' | 'approved' | 'rejected' | 'left';
export type MemberRole = 'host' | 'member';

export interface GroupMember {
  member_id: string;
  user_id: string;
  group_id: string;
  member_status: MemberStatus;
  member_role: MemberRole;
  member_joined_at: string;
}

interface GroupMemberContextType {
  members: GroupMember[];
  loading: boolean;
  error: string | null;

  fetchMembers: (groupId: string) => Promise<void>;
  fetchMemberCount: (groupId: string) => Promise<number>;

  joinGroup: (groupId: string) => Promise<'success' | 'already' | 'error'>;
  leaveGroup: (groupId: string) => Promise<'success' | 'error'>;
  fetchUserCareers: (userId: string) => Promise<careers[]>;

  memberCounts: Record<string, number>;
  subscribeToGroup: (groupId: string) => void;
}

const GroupMemberContext = createContext<GroupMemberContextType | null>(null);

interface GroupMemberProviderProps extends PropsWithChildren {
  // 그룹 멤버 수 변화 시 실행될 외부 콜백 (GroupContext가 넘겨줄 예정)
  onMemberCountChange?: (groupId: string, delta: number) => void;
}

export const GroupMemberProvider: React.FC<GroupMemberProviderProps> = ({
  children,
  onMemberCountChange,
}) => {
  const { user } = useAuth();
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});

  // 실시간으로 구독 중인 그룹 ID 목록 추적
  const [subscribedGroups, setSubscribedGroups] = useState<Set<string>>(new Set());

  // 유저 커리어 조회
  const fetchUserCareers = useCallback(async (userId: string): Promise<careers[]> => {
    try {
      const { data, error } = await supabase
        .from('user_careers')
        .select('*')
        .eq('profile_id', userId)
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류';
      console.error('유저 커리어 조회 실패:', errorMessage);
      return [];
    }
  }, []);

  // 멤버 목록 조회
  const fetchMembers = useCallback(async (groupId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId)
        .order('member_joined_at', { ascending: true });

      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '멤버 조회 실패';
      console.error('멤버 조회 실패:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // 특정 그룹의 현재 멤버 수 (DB에서 실시간 조회)
  const fetchMemberCount = useCallback(async (groupId: string): Promise<number> => {
    try {
      const { count, error } = await supabase
        .from('group_members')
        .select('member_id', { count: 'exact', head: true })
        .eq('group_id', groupId)
        .eq('member_status', 'approved');

      if (error) throw error;

      // Context 상태 업데이트
      setMemberCounts(prev => ({
        ...prev,
        [groupId]: count ?? 0,
      }));

      return count ?? 0;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '멤버 카운트 조회 실패';
      console.error('멤버 카운트 조회 실패:', errorMessage);
      return 0;
    }
  }, []);

  // Realtime 구독 설정 (group_members 테이블 변경사항 감지)
  useEffect(() => {
    const channel = supabase
      .channel('group_members_realtime')
      .on<group_members>(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'group_members' },
        (payload: RealtimePostgresChangesPayload<group_members>) => {
          console.log('Realtime 변경 감지:', payload);

          let groupId: string | undefined;

          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            groupId = payload.new.group_id;
          } else if (payload.eventType === 'DELETE') {
            groupId = payload.old.group_id;
          }

          if (groupId) {
            fetchMemberCount(groupId);

            if (subscribedGroups.has(groupId)) {
              fetchMembers(groupId);
            }

            // 그룹 멤버 수 변화를 외부(GroupContext)에 전달
            if (payload.eventType === 'INSERT') {
              onMemberCountChange?.(groupId, +1);
            } else if (payload.eventType === 'DELETE') {
              onMemberCountChange?.(groupId, -1);
            }
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [subscribedGroups, fetchMemberCount, fetchMembers, onMemberCountChange]);

  // 특정 그룹을 구독 목록에 추가
  const subscribeToGroup = useCallback((groupId: string) => {
    setSubscribedGroups(prev => new Set(prev).add(groupId));
  }, []);

  // 모임 참가 (자동 승인)
  const joinGroup = useCallback(
    async (groupId: string): Promise<'success' | 'already' | 'error'> => {
      if (!user) return 'error';
      setLoading(true);
      setError(null);

      try {
        const { data: existing } = await supabase
          .from('group_members')
          .select('member_status, member_role')
          .eq('group_id', groupId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (existing) {
          console.log('이미 가입한 멤버입니다:', existing.member_role);
          return 'already';
        }

        const { error: insertError } = await supabase
          .from('group_members')
          .insert({
            group_id: groupId,
            user_id: user.id,
            member_role: 'member',
            member_status: 'approved',
          })
          .select('member_role, member_status')
          .single();

        if (insertError) throw insertError;

        console.log('모임 참가 성공 - Realtime이 카운트 업데이트 처리');

        return 'success';
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '모임 참가 실패';
        console.error('참가 실패:', errorMessage);
        setError(errorMessage);
        return 'error';
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  // 탈퇴 (본인 탈퇴)
  const leaveGroup = useCallback(
    async (groupId: string): Promise<'success' | 'error'> => {
      if (!user) return 'error';
      setLoading(true);

      try {
        const { error } = await supabase
          .from('group_members')
          .update({ member_status: 'left' })
          .eq('group_id', groupId)
          .eq('user_id', user.id);

        if (error) throw error;
        console.log('모임 탈퇴 완료 - Realtime이 카운트 업데이트 처리');

        return 'success';
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '모임 탈퇴 실패';
        console.error('탈퇴 실패:', errorMessage);
        setError(errorMessage);
        return 'error';
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  return (
    <GroupMemberContext.Provider
      value={{
        members,
        loading,
        error,
        fetchUserCareers,
        fetchMembers,
        fetchMemberCount,
        joinGroup,
        leaveGroup,
        memberCounts,
        subscribeToGroup,
      }}
    >
      {children}
    </GroupMemberContext.Provider>
  );
};

// 커스텀 훅
export function useGroupMember() {
  const ctx = useContext(GroupMemberContext);
  if (!ctx) throw new Error('useGroupMember은 GroupMemberProvider 안에서만 사용해야 합니다.');
  return ctx;
}
