// 찜리스트 페이지
import { useCallback, useEffect, useState } from 'react';
import GroupCard from '../components/common/GroupCard';
import GroupManagerLayout from '../components/layout/GroupManagerLayout';
import { supabase } from '../lib/supabase';
import type { groups } from '../types/group';
import LoadingSpinner from '../components/common/LoadingSpinner';

type GroupRow = groups & { favorite?: boolean };

function GroupWishListPage() {
  const [groupsList, setGroupsList] = useState<GroupRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // g현재 로그인한 유저
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  const fetchFavoriteGroups = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    const { data: favData, error: favError } = await supabase
      .from('group_favorites')
      .select('group_id')
      .eq('user_id', userId)
      .eq('favorite', true);

    if (favError) {
      console.error(favError);
      setGroupsList([]);
      setLoading(false);
      return;
    }

    const favoriteIds = favData?.map(fav => fav.group_id) || [];

    if (favoriteIds.length === 0) {
      setGroupsList([]);
      setLoading(false);
      return;
    }

    //찜한 그룹들만 groups 테이블에서 가져오기
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .select(
        `
    *,
    categories_major:categories_major!inner(category_major_name)
  `,
      )
      .in('group_id', favoriteIds);

    if (groupError) {
      console.error(groupError);
      setGroupsList([]);
    } else {
      // favorite 필드 추가
      const mapped = (groupData || []).map(g => ({
        ...g,
        favorite: true,
      }));
      setGroupsList(mapped);
    }

    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (userId) fetchFavoriteGroups();
  }, [userId, fetchFavoriteGroups]);

  const toggleFavorite = async (groupId: string, next: boolean) => {
    if (!userId) return;
    if (!next) {
      // 찜 해제 시 목록에서 즉시 제거
      setGroupsList(prev => prev.filter(g => g.group_id !== groupId));
    } else {
      // 찜 추가 시 상태 업데이트
      setGroupsList(prev => prev.map(g => (g.group_id === groupId ? { ...g, favorite: next } : g)));
    }

    // 서버 업데이트
    const { error } = await supabase
      .from('group_favorites')
      .upsert(
        { user_id: userId, group_id: groupId, favorite: next },
        { onConflict: 'user_id,group_id' },
      );

    if (error) {
      console.error(error);
      // 에러 시 다시 불러오기
      await fetchFavoriteGroups();
      return;
    }
  };

  return (
    <GroupManagerLayout>
      {' '}
      {/* 상단 텍스트 부분 */}
      <div>
        <div className="text-xl font-bold text-gray-400 mb-[21px]">모임관리 {'>'} 찜리스트</div>
      </div>
      <div className="flex gap-[12px]">
        <div className=" border-r border-brand border-[3px]"></div>
        <div className="text-gray-400">
          <div className="text-lg font-semibold">관심 있는 모임을 한곳에서 모아볼 수 있습니다.</div>
          <div className="text-md">
            찜한 모임의 일정과 정보를 확인하며 원하는 모임에 쉽게 참여해보세요.
          </div>
        </div>
      </div>
      {/* 찜리스트 부분 */}
      <div className="mt-[40px]">
        {loading ? (
          <div className="text-center text-gray-400 text-lg py-20 mb-20">
            <LoadingSpinner />
          </div>
        ) : groupsList.length === 0 ? (
          <div className="text-center text-gray-400 text-lg py-20 mb-20">
            <div>찜한 모임이 없습니다. 새로운 모임에 참여해 즐거운 활동을 시작해보세요!</div>
            <a href="/grouplist" className="text-[#0689E8] text-md mt-[19px] inline-block">
              모임 참여하러 가기 {`>`}
            </a>
          </div>
        ) : (
          <ul
            className="grid gap-[12px] mb-[80px]
              grid-cols-2 sm:grid-cols-3 lg:grid-cols-4
              place-items-stretch overflow-x-auto pb-2 w-[1024px]"
          >
            {groupsList.map(item => (
              <GroupCard
                key={item.group_id}
                item={item}
                onToggleFavorite={toggleFavorite}
                showFavoriteButton={true}
              />
            ))}
          </ul>
        )}
      </div>
    </GroupManagerLayout>
  );
}
export default GroupWishListPage;
