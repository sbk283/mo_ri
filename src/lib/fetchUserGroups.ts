// src/lib/fetchUserGroups.ts
import type { GroupWithCategory } from '../types/group';
import { supabase } from './supabase';

export async function fetchUserGroups(userId: string): Promise<GroupWithCategory[]> {
  // 내가 생성한 모임
  const { data: createdGroups, error: createdError } = await supabase
    .from('groups')
    .select(
      `
      *,
      categories_major (
        category_major_name,
        category_major_slug
      ),
      categories_sub (
        category_sub_name,
        category_sub_slug
      )
    `,
    )
    .eq('created_by', userId);

  if (createdError) throw createdError;

  // 내가 참여 중인 모임
  const { data: joinedGroups, error: joinedError } = await supabase
    .from('group_members')
    .select(
      `
      groups (
        *,
        categories_major (
          category_major_name,
          category_major_slug
        ),
        categories_sub (
          category_sub_name,
          category_sub_slug
        )
      )
    `,
    )
    .eq('user_id', userId)
    .eq('member_status', 'approved');

  if (joinedError) throw joinedError;

  // group_members → groups만 추출
  const joinedGroupList = joinedGroups?.map((item: any) => item.groups as GroupWithCategory) ?? [];

  //  중복 제거
  const allGroups = [...(createdGroups ?? []), ...joinedGroupList];
  const uniqueGroups = Array.from(new Map(allGroups.map(g => [g.group_id, g])).values());

  return uniqueGroups;
}
