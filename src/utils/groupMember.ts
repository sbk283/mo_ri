// 멤버 정렬, NEW 배지 판단, 프로필 이미지/닉네임 파생 값을 전부 여기임!!!!!!!!
import type { GroupMember } from '../contexts/GroupMemberContext';

export function sortMembersHostFirst(members: GroupMember[]): GroupMember[] {
  return [...members].sort((a, b) =>
    a.member_role === 'host' ? -1 : b.member_role === 'host' ? 1 : 0,
  );
}

export function isNewMember(memberJoinedAt: string, withinDays: number = 3): boolean {
  const joinedAt = new Date(memberJoinedAt);
  const now = new Date();
  const diffMs = now.getTime() - joinedAt.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays <= withinDays;
}

export function getDisplayName(member: GroupMember): string {
  const nickname = member.profile?.nickname;
  if (!nickname || nickname.trim() === '' || nickname === 'null') {
    return '이름없음';
  }
  return nickname;
}

export function getProfileImage(member: GroupMember): string {
  const avatar = member.profile?.avatar_url;
  if (!avatar || avatar === 'null' || avatar.trim() === '') {
    return '/profile_bg';
  }
  return avatar;
}

/**
 * 채팅 가능 규칙:
 * - 본인에게는 불가
 * - 멤버는 Host에게만 채팅 가능
 * - Host는 멤버에게만 채팅 가능
 */
export function canStartChat(
  isHostMe: boolean,
  myUserId: string | undefined,
  targetRole: 'host' | 'member',
  targetUserId: string,
): boolean {
  if (!myUserId) return false;
  if (myUserId === targetUserId) return false;
  if (!isHostMe && targetRole === 'host') return true;
  if (isHostMe && targetRole === 'member') return true;
  return false;
}
