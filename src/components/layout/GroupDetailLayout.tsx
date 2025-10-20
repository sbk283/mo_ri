import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import MeetingTabs from '../common/prevgroup/MeetingTabs';
import type { GroupWithCategory } from '../../types/group';
import MeetingHeader from '../common/prevgroup/MeetingHeader';

// 모임 상세 페이지
function GroupDetailLayout() {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<GroupWithCategory | null>(null);
  const [leaderName, setLeaderName] = useState('');
  const [leaderCareer, setLeaderCareer] = useState('');
  const [curriculum, setCurriculum] = useState<
    { title: string; detail: string; files: string[] }[]
  >([]);
  const [loading, setLoading] = useState(true);

  // 그룹 + 멤버 count + 리더 정보 조회 함수
  const fetchGroup = async () => {
    if (!id) return;
    setLoading(true);

    try {
      // 그룹 + 카테고리 조회
      const { data, error } = await supabase
        .from('groups')
        .select(
          `
          *,
          categories_major (category_major_name),
          categories_sub (category_sub_name)
        `,
        )
        .eq('group_id', id)
        .single();

      if (error) throw error;

      // 승인된 멤버 수(count) 조회
      const { count, error: countError } = await supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', id)
        .eq('member_status', 'approved');

      if (countError) console.warn('멤버 수 조회 실패:', countError.message);

      setGroup({ ...data, member_count: count ?? 0 });

      if (data?.curriculum) {
        try {
          const parsed = Array.isArray(data.curriculum)
            ? data.curriculum
            : JSON.parse(data.curriculum as string);

          const formatted = parsed.map((item: any) => ({
            title: item.title ?? '',
            detail: item.detail ?? '',
            files: Array.isArray(item.files)
              ? item.files.map((f: string) =>
                  f.startsWith('http')
                    ? f
                    : supabase.storage.from('group-images').getPublicUrl(f).data?.publicUrl || '',
                )
              : [],
          }));

          setCurriculum(formatted);
        } catch (err) {
          console.warn('커리큘럼 파싱 실패:', err);
          setCurriculum([]);
        }
      }

      if (data?.created_by) {
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('name')
          .eq('user_id', data.created_by)
          .single();

        if (profileData?.name) setLeaderName(profileData.name);

        const { data: careerData, error: careerError } = await supabase
          .from('user_careers')
          .select('company_name, start_date, end_date')
          .eq('profile_id', data.created_by)
          .order('start_date', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (careerError) {
          console.warn('커리어 조회 실패:', careerError.message);
        }

        if (careerData) {
          const { company_name, start_date, end_date } = careerData;
          setLeaderCareer(`${company_name} (${start_date} ~ ${end_date})`);
        } else {
          setLeaderCareer('등록된 커리어 없음');
        }
      }
    } catch (err) {
      console.error('그룹 불러오기 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroup();

    const handleRefresh = (e: any) => {
      if (e.detail === id) fetchGroup(); // 참가한 그룹만 갱신
    };

    window.addEventListener('refresh-group-members', handleRefresh);
    return () => window.removeEventListener('refresh-group-members', handleRefresh);
  }, [id]);

  // 로딩/에러 처리
  if (loading)
    return <div className="flex justify-center items-center h-80 text-gray-500">로딩 중...</div>;
  if (!group)
    return (
      <div className="flex justify-center items-center h-80 text-gray-500">
        해당 모임을 찾을 수 없습니다.
      </div>
    );

  // D-day 계산
  const calcDday = (end: string) => {
    const today = new Date();
    const endDate = new Date(end);
    const diff = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? `D-${diff}` : diff === 0 ? 'D-DAY' : `종료됨`;
  };

  return (
    <div className="mx-auto w-[1024px] py-10 space-y-8">
      <header className="mb-10">
        <h1 className="text-xl font-bold">모임리스트 &gt; 상세보기</h1>
        <div className="mt-2 border-l-4 border-brand pl-3">
          <p className="text-m font-bold text-gray-800">
            모임의 주요 정보와 상세 내용을 한곳에서 확인할 수 있습니다.
          </p>
          <p className="text-sm text-gray-600">
            참여 전에 일정, 위치, 활동 소개 등 다양한 정보를 꼼꼼하게 살펴보세요.
          </p>
        </div>
      </header>

      {/* 상단 헤더 */}
      <MeetingHeader
        group_id={group.group_id}
        title={group.group_title}
        status={
          group.status === 'recruiting'
            ? '모집중'
            : group.status === 'closed'
              ? '모집종료'
              : '모임종료'
        }
        category={group.categories_major?.category_major_name ?? '카테고리 없음'}
        subCategory={group.categories_sub?.category_sub_name ?? '세부 카테고리 없음'}
        summary={group.group_short_intro ?? ''}
        dday={calcDday(group.group_end_day)}
        duration={`${group.group_start_day} ~ ${group.group_end_day}`}
        participants={`${group.member_count ?? 0}/${group.group_capacity ?? 0}`}
        isFavorite={false}
        mode="detail"
        onFavoriteToggle={() => console.log('찜')}
        onApply={() => console.log('신청')}
      />

      {/* 상세 탭 */}
      <MeetingTabs
        intro={group.group_content ?? ''}
        curriculum={curriculum}
        leader={{
          name: leaderName || '이름 정보 없음',
          location: group.group_region ?? '미정',
          career: leaderCareer || '커리어 정보 없음',
        }}
      />
    </div>
  );
}

export default GroupDetailLayout;
