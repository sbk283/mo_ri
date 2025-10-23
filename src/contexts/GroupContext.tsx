import { createContext, useCallback, useContext, useState, type PropsWithChildren } from 'react';
import { supabase } from '../lib/supabase';
import type {
  GroupFormData,
  // groups,
  groupsUpdate,
  GroupWithCategory,
} from '../types/group';
import { useAuth } from './AuthContext';

// 그룹 관련 컨텍스트 타입 정의
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

// 컨텍스트 생성
const GroupContext = createContext<GroupContextType | null>(null);

export const GroupProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<GroupWithCategory[]>([]);
  const [currentGroup, _setCurrentGroup] = useState<GroupWithCategory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 그룹 목록 조회
  const fetchGroups = useCallback(async (slug?: string) => {
    try {
      setLoading(true);

      // categories_major/sub 조인 포함
      let query = supabase.from('groups').select(`
        *,
        categories_major (category_major_name, category_major_slug),
        categories_sub (category_sub_name, category_sub_slug)
      `);

      if (slug && slug !== 'all') {
        query = query.eq('categories_major.category_major_slug', slug);
      }

      const { data, error } = await query;
      if (error) throw error;

      // category_major_name / category_sub_name 매핑
      const mapped = (data ?? []).map(g => ({
        ...g,
        category_major_name: g.categories_major?.category_major_name ?? '카테고리 없음',
        category_sub_name: g.categories_sub?.category_sub_name ?? '',
      }));

      setGroups(mapped);
    } catch (err: any) {
      setError(err.message);
      console.error('fetchGroups error:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // 그룹 생성
  const createGroup = useCallback(
    async (formData: GroupFormData) => {
      if (!user) throw new Error('로그인 후 이용해주세요.');
      setLoading(true);

      try {
        // 1. 버킷 존재 확인 (없으면 자동 생성)
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
        if (bucketError) throw new Error(`스토리지 버킷 조회 실패: ${bucketError.message}`);

        const hasBucket = buckets.some(b => b.name === 'group-images');
        if (!hasBucket) {
          const { error: createBucketError } = await supabase.storage.createBucket('group-images', {
            public: true,
          });
          if (createBucketError)
            throw new Error(`스토리지 버킷 생성 실패: ${createBucketError.message}`);
          console.log('group-images 버킷 자동 생성 완료');
        }

        // 2. 파일명 안전하게 변환하는 유틸
        const sanitizeFileName = (name: string) =>
          encodeURIComponent(
            name
              .replace(/\s+/g, '_') // 공백 -> _
              .replace(/[^\w.-]/g, ''), // 한글, 특수문자 제거
          );

        // 3. 그룹 기본 데이터 생성
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
          .select('group_id')
          .single();

        if (insertError) throw insertError;
        const groupId = inserted.group_id;

        // 그룹 생성 직후, 생성자를 host로 멤버 등록
        const { error: hostInsertError } = await supabase.from('group_members').insert({
          group_id: groupId,
          user_id: user.id,
          member_role: 'host',
          member_status: 'approved',
        });

        if (hostInsertError) {
          console.error('그룹 멤버(host) 추가 실패:', hostInsertError.message);
          throw hostInsertError;
        }

        // 4. 커리큘럼 파일 업로드
        const uploadedCurriculum = await Promise.all(
          formData.curriculum.map(async (item, i) => {
            const fileUrls: string[] = [];

            if (item.files && item.files.length > 0) {
              for (const file of item.files) {
                const safeName = sanitizeFileName(`${i + 1}-${file.name}`);
                const path = `groups/${groupId}/curriculum/${safeName}`;

                const { error: uploadError } = await supabase.storage
                  .from('group-images')
                  .upload(path, file, { upsert: false });

                if (uploadError && uploadError.message !== 'The resource already exists')
                  throw uploadError;

                const { data: publicUrlData } = supabase.storage
                  .from('group-images')
                  .getPublicUrl(path);

                if (publicUrlData?.publicUrl) fileUrls.push(publicUrlData.publicUrl);
              }
            }

            return { title: item.title, detail: item.detail, files: fileUrls };
          }),
        );

        // 5. 대표 이미지 업로드
        const uploadedUrls: string[] = [];
        if (formData.images && formData.images.length > 0) {
          for (const file of formData.images) {
            const safeName = sanitizeFileName(file.name);
            const path = `groups/${groupId}/${safeName}`;

            const { error: uploadError } = await supabase.storage
              .from('group-images')
              .upload(path, file, { upsert: false });

            if (uploadError && uploadError.message !== 'The resource already exists')
              throw uploadError;

            const { data: publicUrlData } = supabase.storage
              .from('group-images')
              .getPublicUrl(path);

            if (publicUrlData?.publicUrl) uploadedUrls.push(publicUrlData.publicUrl);
          }
        }

        // 6. DB 업데이트 (image_urls + curriculum)
        const { error: updateError } = await supabase
          .from('groups')
          .update({
            image_urls: uploadedUrls.length > 0 ? uploadedUrls : null,
            curriculum:
              uploadedCurriculum && uploadedCurriculum.length > 0
                ? JSON.stringify(uploadedCurriculum)
                : null,
          })
          .eq('group_id', groupId);

        if (updateError) throw updateError;

        console.log('그룹 생성 성공:', groupId);
        await fetchGroups(); // 그룹 생성 후 목록 갱신
      } catch (err: any) {
        console.error('그룹 생성 실패:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [user, fetchGroups],
  );

  // 그룹 상세 조회
  const fetchGroupById = useCallback(async (groupId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('groups')
        .select(
          `
          *,
          categories_major (category_major_name, category_major_slug),
          categories_sub (category_sub_name, category_sub_slug)
        `,
        )
        .eq('group_id', groupId)
        .single();

      if (error) throw error;

      // 조인된 결과를 currentGroup에 저장
      _setCurrentGroup(data as GroupWithCategory);
      console.log('그룹 상세 데이터:', data);
    } catch (err: any) {
      setError(err.message);
      console.error('fetchGroupById error:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // 멤버 카운트 실시간 반영
  const updateMemberCount = useCallback((groupId: string, delta: number) => {
    setGroups(prev =>
      prev.map(group =>
        group.group_id === groupId
          ? { ...group, member_count: Math.max((group.member_count ?? 0) + delta, 0) }
          : group,
      ),
    );
  }, []);

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
        updateGroup: async () => {},
        deleteGroup: async () => {},
      }}
    >
      {children}
    </GroupContext.Provider>
  );
};

// 컨텍스트 훅
export function useGroup() {
  const ctx = useContext(GroupContext);
  if (!ctx) throw new Error('useGroup은 GroupProvider 안에서만 사용 가능합니다.');
  return ctx;
}
