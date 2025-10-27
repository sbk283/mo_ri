import { createContext, useCallback, useContext, useState, type PropsWithChildren } from 'react';
import { slugToCategoryMap } from '../constants/categorySlugs';
import { supabase } from '../lib/supabase';
import type { GroupFormData, groupsUpdate, GroupWithCategory } from '../types/group';
import { useAuth } from './AuthContext';

interface GroupContextType {
  groups: GroupWithCategory[];
  currentGroup: GroupWithCategory | null;
  loading: boolean;
  error: string | null;
  updateMemberCount: (groupId: string, delta: number) => void;
  fetchGroups: (slug?: string) => Promise<void>;
  fetchGroupById: (groupId: string) => Promise<void>;
  createGroup: (formData: GroupFormData) => Promise<void>;
  updateGroup: (groupId: string, updates: groupsUpdate) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
}

const GroupContext = createContext<GroupContextType | null>(null);

export const GroupProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<GroupWithCategory[]>([]);
  const [currentGroup, _setCurrentGroup] = useState<GroupWithCategory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ 그룹 목록 조회
  const fetchGroups = useCallback(async (slug?: string) => {
    try {
      setLoading(true);
      let query = supabase.from('groups').select(`
        *,
        categories_major:categories_major!inner (category_major_name, category_major_slug),
        categories_sub:categories_sub!inner (category_sub_name, category_sub_slug)
      `);

      if (slug && slug !== 'all') {
        const korName = slugToCategoryMap[slug];
        if (korName) {
          if (['운동/건강', '스터디/학습', '취미/여가', '봉사/사회참여'].includes(korName)) {
            query = query.eq('categories_major.category_major_name', korName);
          } else {
            query = query.eq('categories_sub.category_sub_name', korName);
          }
        }
      }

      const { data, error } = await query.order('group_created_at', { ascending: false });
      if (error) throw error;

      const mapped = (data ?? []).map(g => ({
        ...g,
        category_major_name: g.categories_major?.category_major_name ?? '카테고리 없음',
        category_sub_name: g.categories_sub?.category_sub_name ?? '',
      }));

      setGroups(mapped);
    } catch (err: unknown) {
      // ✅ 수정: any → unknown
      if (err instanceof Error) {
        setError(err.message);
        console.error('fetchGroups error:', err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ 그룹 생성
  const createGroup = useCallback(
    async (formData: GroupFormData) => {
      if (!user) throw new Error('로그인 후 이용해주세요.');
      setLoading(true);

      try {
        // 1️⃣ 버킷 확인
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
        if (bucketError) throw new Error(`스토리지 버킷 조회 실패: ${bucketError.message}`);
        const hasBucket = buckets.some(b => b.name === 'group-images');
        if (!hasBucket) {
          const { error: createBucketError } = await supabase.storage.createBucket('group-images', {
            public: true,
          });
          if (createBucketError)
            throw new Error(`스토리지 버킷 생성 실패: ${createBucketError.message}`);
        }

        // 2️⃣ 파일명 정리 유틸
        const sanitizeFileName = (name: string) =>
          encodeURIComponent(name.replace(/\s+/g, '_').replace(/[^\w.-]/g, ''));

        // 3️⃣ 그룹 기본 데이터 삽입
        const { data: inserted, error: insertError } = await supabase
          .from('groups')
          .insert({
            group_title: formData.title,
            group_region: formData.group_region_any ? null : formData.group_region,
            group_region_any: formData.group_region_any,
            group_short_intro: formData.summary,
            group_content: formData.description,
            group_start_day: formData.startDate,
            group_end_day: formData.endDate,
            major_id: formData.major_id,
            sub_id: formData.sub_id,
            group_capacity: formData.memberCount,
            status: 'recruiting',
            created_by: user.id,
          })
          .select('group_id');

        if (insertError) throw insertError;
        const groupId: string = inserted?.[0]?.group_id ?? ''; // ✅ 수정: 타입 명시 + 안전 기본값
        if (!groupId) throw new Error('❌ group_id를 가져오지 못했습니다.');
        console.log('✅ 그룹 생성 완료:', groupId);

        // 4️⃣ host 등록
        const { error: hostError } = await supabase.from('group_members').insert({
          group_id: groupId,
          user_id: user.id,
          member_role: 'host',
          member_status: 'approved',
        });
        if (hostError) throw hostError;

        // 5️⃣ 커리큘럼 업로드
        const uploadedCurriculum = await Promise.all(
          formData.curriculum.map(
            async (item, i): Promise<{ title: string; detail: string; files: string[] }> => {
              const fileUrls: string[] = [];
              if (item.files?.length) {
                for (const file of item.files) {
                  // ✅ 수정: file 타입 보장
                  if (!(file instanceof File)) {
                    console.warn('⚠️ file이 File 객체가 아닙니다:', file);
                    continue;
                  }
                  const safeName = sanitizeFileName(`${i + 1}-${file.name}`);
                  const path = `groups/${groupId}/curriculum/${safeName}`;
                  const { error: uploadError } = await supabase.storage
                    .from('group-images')
                    .upload(path, file, { upsert: false });
                  if (uploadError && uploadError.message !== 'The resource already exists')
                    throw uploadError;
                  const { data: publicUrl } = supabase.storage
                    .from('group-images')
                    .getPublicUrl(path);
                  if (publicUrl?.publicUrl) fileUrls.push(publicUrl.publicUrl);
                }
              }
              return { title: item.title, detail: item.detail, files: fileUrls };
            },
          ),
        );

        // 6️⃣ 대표 이미지 업로드
        const uploadedUrls: string[] = [];
        if (formData.images?.length) {
          for (const file of formData.images) {
            // ✅ 수정: file 타입 보장
            if (!(file instanceof File)) {
              console.warn('⚠️ 대표 이미지 file이 File 객체가 아닙니다:', file);
              continue;
            }
            const safeName = sanitizeFileName(file.name);
            const path = `groups/${groupId}/${safeName}`;
            const { error: uploadError } = await supabase.storage
              .from('group-images')
              .upload(path, file, { upsert: false });
            if (uploadError && uploadError.message !== 'The resource already exists')
              throw uploadError;
            const { data: publicUrl } = supabase.storage.from('group-images').getPublicUrl(path);
            if (publicUrl?.publicUrl) uploadedUrls.push(publicUrl.publicUrl);
          }
        }

        // ✅ 디버깅 로그
        console.log('🧩 uploadedCurriculum:', uploadedCurriculum);
        console.log('🧩 uploadedUrls:', uploadedUrls);

        // 7️⃣ DB 업데이트
        const { error: updateError } = await supabase
          .from('groups')
          .update({
            image_urls: uploadedUrls ?? [],
            curriculum: uploadedCurriculum ?? [],
          })
          .eq('group_id', groupId);

        if (updateError) throw updateError;
        console.log('✅ 이미지 + 커리큘럼 DB 반영 완료');

        await fetchGroups();
      } catch (err: unknown) {
        // ✅ 수정: any → unknown
        if (err instanceof Error) {
          console.error('❌ 그룹 생성 실패:', err.message);
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    },
    [user, fetchGroups],
  );

  // ✅ 그룹 상세 조회
  const fetchGroupById = useCallback(async (groupId: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('groups')
        .select(
          `
          *,
          categories_major:major_id (category_major_name, category_major_slug),
          categories_sub:sub_id (category_sub_name, category_sub_slug)
        `,
        )
        .eq('group_id', groupId)
        .single();

      if (error) throw error;
      _setCurrentGroup(data as GroupWithCategory);
      console.log('✅ 그룹 상세 조회:', data);
    } catch (err: unknown) {
      // ✅ 수정: any → unknown
      if (err instanceof Error) {
        setError(err.message);
        console.error('fetchGroupById error:', err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ 멤버 카운트 반영
  const updateMemberCount = useCallback((groupId: string, delta: number) => {
    setGroups(prev =>
      prev.map(g =>
        g.group_id === groupId
          ? { ...g, member_count: Math.max((g.member_count ?? 0) + delta, 0) }
          : g,
      ),
    );
  }, []);

  // ✅ 그룹 수정
  const updateGroup = useCallback(async (groupId: string, updates: Partial<groupsUpdate>) => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.from('groups').update(updates).eq('group_id', groupId);
      if (error) throw error;
      setGroups(prev => prev.map(g => (g.group_id === groupId ? { ...g, ...updates } : g)));
      console.log('✅ 그룹 업데이트 성공:', groupId);
    } catch (err: unknown) {
      // ✅ 수정: any → unknown
      if (err instanceof Error) {
        console.error('updateGroup error:', err.message);
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ 그룹 삭제
  const deleteGroup = useCallback(
    async (groupId: string) => {
      try {
        if (!user) throw new Error('로그인 후 이용해주세요.');
        setLoading(true);
        setError(null);

        const { data: group, error: fetchError } = await supabase
          .from('groups')
          .select('created_by')
          .eq('group_id', groupId)
          .single();
        if (fetchError) throw fetchError;
        if (group?.created_by !== user.id)
          throw new Error('본인이 만든 모임만 삭제할 수 있습니다.');

        const { error: memberDel } = await supabase
          .from('group_members')
          .delete()
          .eq('group_id', groupId);
        if (memberDel) throw memberDel;

        const { error: groupDel } = await supabase.from('groups').delete().eq('group_id', groupId);
        if (groupDel) throw groupDel;

        setGroups(prev => prev.filter(g => g.group_id !== groupId));
        console.log(`✅ 그룹(${groupId}) 삭제 완료`);
      } catch (err: unknown) {
        // ✅ 수정: any → unknown
        if (err instanceof Error) {
          console.error('deleteGroup error:', err.message);
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  return (
    <GroupContext.Provider
      value={{
        groups,
        currentGroup,
        loading,
        error,
        fetchGroups,
        createGroup,
        fetchGroupById,
        updateMemberCount,
        updateGroup,
        deleteGroup,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
};

// ✅ 훅
export function useGroup() {
  const ctx = useContext(GroupContext);
  if (!ctx) throw new Error('useGroup은 GroupProvider 안에서만 사용 가능합니다.');
  return ctx;
}
