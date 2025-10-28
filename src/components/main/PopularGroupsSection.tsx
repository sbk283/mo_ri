import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Plus from '../../../public/images/plus.svg';
import { supabase } from '../../lib/supabase';
import type { groups } from '../../types/group';
import SwiperGroupCard from '../common/SwiperGroupCard';

export default function PopularGroupsSection() {
  const [groups, setGroups] = useState<groups[]>([]);
  const [loading, setLoading] = useState(true);

  // const { groups, fetchGroups, loading } = useGroup();

  useEffect(() => {
    const fetchPopularGroups = async () => {
      setLoading(true);

      try {
        // 오늘 날짜 기준 0시
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        //  모집 중인 그룹 전체 불러오기
        const { data: groupsData, error: groupsError } = await supabase
          .from('groups')
          // 카테고리 불러오려면 join 해야함 밑에 방식 필수 ;;
          .select(
            `
            *,
            categories_major (
              category_major_name
            ),
            categories_sub (
              category_sub_name
            )
          `,
          )
          .eq('status', 'recruiting');

        if (groupsError) throw groupsError;

        // 모집중인 그룹만 필터링 (오늘 이후 시작인 그룹)
        const recruitingGroups = groupsData.filter(g => {
          if (!g.group_start_day || !g.group_end_day) return false;

          const start = new Date(g.group_start_day);
          start.setHours(0, 0, 0, 0);
          const end = new Date(g.group_end_day);
          end.setHours(0, 0, 0, 0);
          // 오늘 이후 시작 → 모집중
          return start > today;
        });

        // 찜 목록 가져오기 (favorite = true 인 것만)
        const { data: favData, error: favError } = await supabase
          .from('group_favorites')
          .select('group_id')
          .eq('favorite', true);

        if (favError) throw favError;

        //  group_id별 찜 수 계산
        const favCountMap = favData.reduce(
          (acc, cur) => {
            acc[cur.group_id] = (acc[cur.group_id] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        );

        //  그룹 데이터에 favorite_count 추가
        const merged = recruitingGroups.map(g => ({
          ...g,
          favorite_count: favCountMap[g.group_id] || 0,
        }));

        // 찜 개수 기준으로 정렬 후 상위 10개만
        const sorted = merged.sort((a, b) => b.favorite_count - a.favorite_count).slice(0, 10);

        setGroups(sorted);
      } catch (err) {
        console.error('🔥 인기 모임 불러오기 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularGroups();
  }, []);

  return (
    <section
      className="bg-[#F9FBFF] border-t border-b border-solid border-[#DBDBDB] pb-[78px]"
      aria-labelledby="popular-groups-heading"
    >
      <div className="mx-auto w-[1024px]">
        <header className="pt-[76px] pb-[22px]">
          <h2 id="popular-groups-heading" className="font-semibold text-lg">
            Mo:ri 가 엄선한 인기모임!
          </h2>
          <div className="mr-4">
            <div className="flex items-center gap-4">
              <p className="font-semibold text-xxl">지금 바로 확인하세요!</p>
              <Link to="/grouplist" className="flex text-sm gap-1 pb-auto items-center">
                <img src={Plus} alt="" aria-hidden="true" />
                <span className="text-md">더보기</span>
              </Link>
            </div>
          </div>
        </header>

        <div className="">
          {loading ? (
            <p>로딩 중...</p>
          ) : groups.length === 0 ? (
            <p>표시할 그룹이 없습니다.</p>
          ) : (
            <SwiperGroupCard loop={false} spaceBetween={12} groups={groups} />
          )}
        </div>
      </div>
    </section>
  );
}
