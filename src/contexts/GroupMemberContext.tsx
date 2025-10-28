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

// 프로필 요약 타입 추가
export interface UserMiniProfile {
  user_id: string | null;
  nickname: string | null;
  avatar_url: string | null;
}

// GroupMember에 profile 필드 추가
export interface GroupMember {
  member_id: string;
  user_id: string;
  group_id: string;
  member_status: MemberStatus;
  member_role: MemberRole;
  member_joined_at: string;
  profile?: UserMiniProfile;
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

  kickMember: (groupId: string, targetUserId: string) => Promise<'success' | 'error' | 'denied'>;
}

const GroupMemberContext = createContext<GroupMemberContextType | null>(null);

interface GroupMemberProviderProps extends PropsWithChildren {
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

  // 멤버 목록 조회 (user_profiles 조인 추가)
  // 서버에서 approved 상태만 조회하도록 필터 추가
  const fetchMembers = useCallback(async (groupId: string) => {
    if (!groupId || groupId === 'undefined') {
      console.warn('fetchMembers 호출 중 groupId가 비어 있습니다:', groupId);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select(
          `
        member_id,
        user_id,
        group_id,
        member_status,
        member_role,
        member_joined_at,
        user_profiles ( user_id, nickname, avatar_url )
      `,
        )
        .eq('group_id', groupId)
        .eq('member_status', 'approved')
        .order('member_joined_at', { ascending: true });

      if (error) throw error;

      const mapped: GroupMember[] = (data ?? []).map(row => {
        const userProfileRaw = (row as Record<string, unknown>)['user_profiles'];
        const userProfile =
          Array.isArray(userProfileRaw) && userProfileRaw.length > 0
            ? (userProfileRaw[0] as Record<string, unknown>)
            : (userProfileRaw as Record<string, unknown> | null);

        return {
          member_id: row.member_id,
          user_id: row.user_id,
          group_id: row.group_id,
          member_status: row.member_status,
          member_role: row.member_role,
          member_joined_at: row.member_joined_at,
          profile: userProfile
            ? {
                user_id: (userProfile['user_id'] as string | null) ?? null,
                nickname: (userProfile['nickname'] as string | null) ?? null,
                avatar_url: (userProfile['avatar_url'] as string | null) ?? null,
              }
            : undefined,
        };
      });

      setMembers(mapped);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '멤버 조회 실패';
      console.error('멤버 조회 실패:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // 특정 그룹의 현재 멤버 수
  const fetchMemberCount = useCallback(async (groupId: string): Promise<number> => {
    if (!groupId || groupId === 'preview-temp-id') {
      console.warn('미리보기 모드: 멤버 조회를 건너뜀');
      return 0;
    }

    try {
      const { count, error } = await supabase
        .from('group_members')
        .select('member_id', { count: 'exact', head: true })
        .eq('group_id', groupId)
        .eq('member_status', 'approved');

      if (error) throw error;

      setMemberCounts(prev => {
        const next = { ...prev, [groupId]: count ?? 0 };
        return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
      });

      return count ?? 0;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '멤버 카운트 조회 실패';
      console.error('멤버 카운트 조회 실패:', errorMessage);
      return 0;
    }
  }, []);

  // 실시간 변경 구독
  useEffect(() => {
    const channel = supabase
      .channel('group_members_realtime')
      .on<group_members>(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'group_members' },
        (payload: RealtimePostgresChangesPayload<group_members>) => {
          let groupId: string | undefined;

          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            groupId = payload.new.group_id;
          } else if (payload.eventType === 'DELETE') {
            groupId = payload.old.group_id;
          }

          if (groupId) {
            fetchMemberCount(groupId);

            if (subscribedGroups.has(groupId)) {
              // 구독 중인 그룹이라면 멤버 목록도 새로고침
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

  const subscribeToGroup = useCallback((groupId: string) => {
    setSubscribedGroups(prev => new Set(prev).add(groupId));
  }, []);

  // 모임 참가
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

  // 모임 탈퇴
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

  // 모임 추방 (함수명이 생각이 안나서 kick임 용서하세요...)
  const kickMember = useCallback(
    async (groupId: string, targetUserId: string): Promise<'success' | 'error' | 'denied'> => {
      if (!user) return 'error';

      try {
        // 1. 대상이 호스트면 추방 금지
        const { data: target, error: fetchError } = await supabase
          .from('group_members')
          .select('member_role')
          .eq('group_id', groupId)
          .eq('user_id', targetUserId)
          .maybeSingle();

        if (fetchError) throw fetchError;
        if (target?.member_role === 'host') {
          console.warn('호스트는 추방 불가');
          return 'denied';
        }

        // 2. 대상 member_status='left'로 변경
        const { error: updateError } = await supabase
          .from('group_members')
          .update({ member_status: 'left' })
          .eq('group_id', groupId)
          .eq('user_id', targetUserId);

        if (updateError) throw updateError;

        // 3. 낙관적 UI 업데이트: 현재 Context 상태에서 즉시 제거
        setMembers(prev =>
          prev.filter(member => !(member.group_id === groupId && member.user_id === targetUserId)),
        );

        // 4. 카운트도 즉시 갱신
        setMemberCounts(prev => {
          const current = prev[groupId] ?? 0;
          return { ...prev, [groupId]: Math.max(0, current - 1) };
        });

        console.log(`${targetUserId} 추방 성공`);
        return 'success';
      } catch (err) {
        const message = err instanceof Error ? err.message : '추방 실패';
        console.error('추방 오류:', message);
        return 'error';
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
        kickMember,
      }}
    >
      {children}
    </GroupMemberContext.Provider>
  );
};

// 커스텀훅
export function useGroupMember() {
  const ctx = useContext(GroupMemberContext);
  if (!ctx) throw new Error('useGroupMember은 GroupMemberProvider 안에서만 사용해야 합니다.');
  return ctx;
}
