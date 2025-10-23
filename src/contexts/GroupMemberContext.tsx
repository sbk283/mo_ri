import { createContext, useCallback, useContext, useState, type PropsWithChildren } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { careers } from '../types/careerType';

// 타입 정의
export type MemberStatus = 'applied' | 'approved' | 'rejected' | 'left'; // 신청|승인|거절|탈퇴
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

  /**
   * @returns {Promise<'success' | 'already' | 'error'>}
   * - 'success' : 참가 성공
   * - 'already' : 이미 가입한 경우
   * - 'error' : 오류 발생
   */
  joinGroup: (groupId: string) => Promise<'success' | 'already' | 'error'>;
  leaveGroup: (groupId: string) => Promise<'success' | 'error'>;
  fetchUserCareers: (userId: string) => Promise<careers[]>;

  memberCounts: Record<string, number>; // 그룹별 멤버 수 관리
}

// Context 생성
const GroupMemberContext = createContext<GroupMemberContextType | null>(null);

export const GroupMemberProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { user } = useAuth();
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ 여러 그룹의 멤버 수를 각각 저장
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});

  //유저 커리어 조회
  const fetchUserCareers = useCallback(async (userId: string): Promise<careers[]> => {
    try {
      const { data, error } = await supabase
        .from('user_careers')
        .select('*')
        .eq('profile_id', userId)
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err: any) {
      console.error('유저 커리어 조회 실패:', err.message);
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
    } catch (err: any) {
      console.error('멤버 조회 실패:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // 특정 그룹의 현재 멤버 수 (그룹별 저장)
  const fetchMemberCount = useCallback(async (groupId: string): Promise<number> => {
    try {
      const { count, error } = await supabase
        .from('group_members')
        .select('member_id', { count: 'exact', head: true })
        .eq('group_id', groupId)
        .eq('member_status', 'approved');

      if (error) throw error;

      setMemberCounts(prev => ({
        ...prev,
        [groupId]: count ?? 0,
      }));

      return count ?? 0;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('멤버 카운트 조회 실패:', error.message);
      return 0;
    }
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

        setMembers(prev => [
          ...prev,
          {
            member_id: crypto.randomUUID(),
            user_id: user.id,
            group_id: groupId,
            member_role: 'member',
            member_status: 'approved',
            member_joined_at: new Date().toISOString(),
          },
        ]);

        // 그룹 카운트 증가
        setMemberCounts(prev => ({
          ...prev,
          [groupId]: (prev[groupId] ?? 0) + 1,
        }));

        await fetchMemberCount(groupId);

        return 'success';
      } catch (err: any) {
        console.error('참가 실패:', err.message);
        setError(err.message);
        return 'error';
      } finally {
        setLoading(false);
      }
    },
    [user, fetchMemberCount],
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
        console.log('모임 탈퇴 완료');

        // 카운트 감소
        setMemberCounts(prev => ({
          ...prev,
          [groupId]: Math.max((prev[groupId] ?? 1) - 1, 0),
        }));

        await fetchMembers(groupId);
        await fetchMemberCount(groupId);

        return 'success';
      } catch (err: any) {
        console.error('탈퇴 실패:', err.message);
        setError(err.message);
        return 'error';
      } finally {
        setLoading(false);
      }
    },
    [user, fetchMembers, fetchMemberCount],
  );

  // Provider
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
        memberCounts, // 그룹별 멤버 수 (객체)
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
