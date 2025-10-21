import { createContext, useCallback, useContext, useState, type PropsWithChildren } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { careers } from '../types/careerType';

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

  /**
   * @returns {Promise<'success' | 'already' | 'error'>}
   * - 'success' : 참가 성공
   * - 'already' : 이미 가입한 경우
   * - 'error' : 오류 발생
   */
  joinGroup: (groupId: string) => Promise<'success' | 'already' | 'error'>;
  leaveGroup: (groupId: string) => Promise<'success' | 'error'>;
  fetchUserCareer: (userId: string) => Promise<careers | null>;
}

// Context 생성
const GroupMemberContext = createContext<GroupMemberContextType | null>(null);

export const GroupMemberProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { user } = useAuth();
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  //유저 커리어 조회
  const fetchUserCareer = useCallback(async (userId: string): Promise<careers | null> => {
    try {
      const { data, error } = await supabase
        .from('user_careers')
        .select('*')
        .eq('profile_id', userId)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (error) throw error;
      return data || null;
    } catch (err: any) {
      console.error('유저 커리어 조회 실패:', err.message);
      return null;
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

  // 모임 참가 (자동 승인)
  const joinGroup = useCallback(
    async (groupId: string): Promise<'success' | 'already' | 'error'> => {
      if (!user) return 'error';
      setLoading(true);
      setError(null);

      try {
        // 중복 가입 확인
        const { data: existing } = await supabase
          .from('group_members')
          .select('member_status')
          .eq('group_id', groupId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (existing) {
          console.log('이미 가입한 모임입니다.');
          return 'already';
        }

        // 자동 승인 insert
        const { error: insertError } = await supabase.from('group_members').insert({
          group_id: groupId,
          user_id: user.id,
          member_role: 'member',
          member_status: 'approved',
        });

        if (insertError) throw insertError;

        console.log('모임 참가 완료 (자동 승인)');
        await fetchMembers(groupId);
        return 'success';
      } catch (err: any) {
        console.error('참가 실패:', err.message);
        setError(err.message);
        return 'error';
      } finally {
        setLoading(false);
      }
    },
    [user, fetchMembers],
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
        await fetchMembers(groupId);
        return 'success';
      } catch (err: any) {
        console.error('탈퇴 실패:', err.message);
        setError(err.message);
        return 'error';
      } finally {
        setLoading(false);
      }
    },
    [user, fetchMembers],
  );

  // Provider
  return (
    <GroupMemberContext.Provider
      value={{
        members,
        loading,
        error,
        fetchUserCareer,
        fetchMembers,
        joinGroup,
        leaveGroup,
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
