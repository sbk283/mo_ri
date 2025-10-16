// src/components/layout/GroupDetailLayout.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import MeetingHeader from '../common/prevgroup/MeetingHeader';
import MeetingTabs from '../common/prevgroup/MeetingTabs';

interface GroupData {
  group_id: string;
  group_title: string;
  group_region: string | null;
  group_short_intro: string | null;
  group_content: string | null;
  group_start_day: string;
  group_end_day: string;
  group_kind: 'study' | 'hobby' | 'sports' | 'volunteer' | 'etc';
  status: 'recruiting' | 'closed' | 'finished';
  group_capacity: number | null;
  group_region_any: boolean;
  created_by: string | null;
  group_created_at: string;
  group_updated_at: string;
}

function GroupDetailLayout() {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<GroupData | null>(null);
  const [loading, setLoading] = useState(true);

  // 데이터 불러오기
  useEffect(() => {
    const fetchGroup = async () => {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase.from('groups').select('*').eq('group_id', id).single();
      if (error) {
        console.error('그룹 불러오기 실패:', error);
      } else {
        setGroup(data);
      }
      setLoading(false);
    };
    fetchGroup();
  }, [id]);

  if (loading)
    return <div className="flex justify-center items-center h-80 text-gray-500">로딩 중...</div>;

  if (!group)
    return (
      <div className="flex justify-center items-center h-80 text-gray-500">
        해당 모임을 찾을 수 없습니다.
      </div>
    );

  // d-day 계산
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

      {/* MeetingHeader 연결 */}
      <MeetingHeader
        title={group.group_title}
        status={
          group.status === 'recruiting'
            ? '모집중'
            : group.status === 'closed'
              ? '모집종료'
              : '모임종료'
        }
        category={group.group_kind}
        subCategory={group.group_region ?? '지역 무관'}
        summary={group.group_short_intro ?? ''}
        dday={calcDday(group.group_end_day)}
        duration={`${group.group_start_day} ~ ${group.group_end_day}`}
        participants={`0/${group.group_capacity ?? 0}`}
        images={[
          `https://picsum.photos/seed/${group.group_id}/640/360`,
          `https://picsum.photos/seed/${group.group_id}-2/640/360`,
          `https://picsum.photos/seed/${group.group_id}-3/640/360`,
        ]}
        isFavorite={false}
        mode="detail"
        onFavoriteToggle={() => console.log('찜')}
        onApply={() => console.log('신청')}
      />

      {/* MeetingTabs 연결 */}
      <MeetingTabs
        intro={group.group_content ?? ''}
        curriculum={[
          { title: '1주차 OT', detail: '모임 오리엔테이션 및 자기소개', files: [] },
          { title: '2주차', detail: '팀 빌딩 및 기초 실습', files: [] },
          { title: '3주차', detail: '중간 프로젝트 진행', files: [] },
        ]}
        leader={{
          name: '홍길동',
          location: group.group_region ?? '미정',
          career: '해당 모임의 호스트 정보는 곧 연결됩니다.',
        }}
      />
    </div>
  );
}

export default GroupDetailLayout;
