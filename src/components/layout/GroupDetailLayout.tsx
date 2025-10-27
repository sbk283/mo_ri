import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import MeetingHeader from '../common/prevgroup/MeetingHeader';
import MeetingTabs from '../common/prevgroup/MeetingTabs';
import { useGroupMember } from '../../contexts/GroupMemberContext';
import type { GroupWithCategory } from '../../types/group';
import LoadingSpinner from '../common/LoadingSpinner';

// 모임 상세 페이지
function GroupDetailLayout() {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<GroupWithCategory | null>(null);
  const [leaderNickName, setLeaderNickName] = useState('');
  const [leaderCareer, setLeaderCareer] = useState('');
  const [curriculum, setCurriculum] = useState<
    { title: string; detail: string; files: string[] }[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Context에서 실시간 멤버 수 가져오기
  const { memberCounts, fetchMemberCount } = useGroupMember();
  const currentCount = id ? (memberCounts[id] ?? 0) : 0;

  // 그룹 + 모임장 정보 + 커리큘럼
  useEffect(() => {
    const fetchGroup = async () => {
      if (!id) return;
      setLoading(true);

      try {
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
        setGroup(data);

        // 멤버 수 가져오기
        await fetchMemberCount(id);

        // 커리큘럼 파싱
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

        // 모임장 정보
        if (data?.created_by) {
          // 이름
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('nickname')
            .eq('user_id', data.created_by)
            .single();

          if (profileData?.nickname) setLeaderNickName(profileData.nickname);

          // 경력 여러 개 가져오기
          const { data: careerData } = await supabase
            .from('user_careers')
            .select('company_name, start_date, end_date')
            .eq('profile_id', data.created_by)
            .order('start_date', { ascending: false });

          if (careerData && careerData.length > 0) {
            const summary = careerData
              .map(
                c =>
                  `${c.company_name} (${c.start_date ?? '시작일 미정'} ~ ${c.end_date ?? '종료일 미정'})`,
              )
              .join('\n'); // 줄바꿈으로 연결

            setLeaderCareer(summary);
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

    fetchGroup();
  }, [id, fetchMemberCount]);

  // 로딩 / 에러 처리
  if (loading)
    return (
      <div className="flex m-auto">
        <LoadingSpinner />
      </div>
    );
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
      {/* 상단 안내 */}
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
        title={group.group_title}
        status={
          group.status === 'recruiting'
            ? '모집중'
            : group.status === 'closed'
              ? '모집종료'
              : '모임종료'
        }
        groupId={group.group_id}
        category={group.categories_major?.category_major_name ?? '카테고리 없음'}
        subCategory={group.categories_sub?.category_sub_name ?? '세부 카테고리 없음'}
        summary={group.group_short_intro ?? ''}
        dday={calcDday(group.group_start_day)}
        duration={`${group.group_start_day} ~ ${group.group_end_day}`}
        participants={`${currentCount}/${group.group_capacity ?? 0}`}
        images={group.image_urls ?? []}
        isFavorite={false}
        mode="detail"
        onFavoriteToggle={() => console.log('찜')}
        onApply={() => console.log('신청')}
      />

      {/* 모임 탭 */}
      <MeetingTabs
        intro={group.group_content || ''}
        curriculum={curriculum}
        leader={{
          nickName: leaderNickName || '이름 정보 없음',
          location: group.group_region || '활동 지역 미입력',
          career: leaderCareer || '경력 정보 없음',
        }}
      />
    </div>
  );
}

export default GroupDetailLayout;
