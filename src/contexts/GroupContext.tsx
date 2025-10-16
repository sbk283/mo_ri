import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import { supabase } from '../lib/supabase';
import type { GroupFormData, groups, groupsUpdate } from '../types/group';
import { useAuth } from './AuthContext';

interface GroupContextType {
  groups: groups[];
  currentGroup: groups | null;
  loading: boolean;
  error: string | null;
  fetchGroups: (slug?: string) => Promise<void>;
  fetchGroupById: (groupId: string) => Promise<void>;
  createGroup: (formData: GroupFormData) => Promise<void>;
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

  // 그룹 생성 (이미지 업로드 + image_urls 업데이트까지 포함)
  const createGroup = useCallback(
    async (formData: GroupFormData) => {
      if (!user) throw new Error('로그인 후 이용해주세요.');
      setLoading(true);
      try {
        // 그룹 정보 생성
        const { data: inserted, error: insertError } = await supabase
          .from('groups')
          .insert({
            group_title: formData.title,
            group_region: formData.regionFree ? null : formData.region,
            group_short_intro: formData.summary,
            group_content: formData.description,
            group_start_day: formData.startDate,
            group_end_day: formData.endDate,
            group_kind:
              formData.interestMajor === '운동/건강'
                ? 'sports'
                : formData.interestMajor === '스터디/학습'
                  ? 'study'
                  : formData.interestMajor === '취미/여가'
                    ? 'hobby'
                    : formData.interestMajor === '봉사/사회참여'
                      ? 'volunteer'
                      : 'etc',
            group_capacity: formData.memberCount,
            group_region_any: formData.regionFree,
            status: 'recruiting',
            created_by: user.id,
          })
          .select('group_id')
          .single();

        if (insertError) throw insertError;
        if (!inserted) throw new Error('그룹 생성 데이터가 반환되지 않았습니다.');

        const groupId = inserted.group_id;
        const uploadedUrls: string[] = [];

        // 스토리지 업로드: 폴더 이름 주의하자 유비야!!!!!!!!!!! (bucket: group-images)
        for (const file of formData.images) {
          const path = `groups/${groupId}/${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from('group-images')
            .upload(path, file, {
              upsert: false,
            });
          if (uploadError && uploadError.message !== 'The resource already exists')
            throw uploadError;

          const { data: publicUrlData } = supabase.storage.from('group-images').getPublicUrl(path);
          if (publicUrlData?.publicUrl) uploadedUrls.push(publicUrlData.publicUrl);
        }

        // image_urls 컬럼 업데이트
        const { error: updateError } = await supabase
          .from('groups')
          .update({ image_urls: uploadedUrls })
          .eq('group_id', groupId);
        if (updateError) throw updateError;

        console.log('그룹 생성 성공:', groupId, uploadedUrls);
        await fetchGroups();
      } catch (err: any) {
        console.error('그룹 생성 실패:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
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
