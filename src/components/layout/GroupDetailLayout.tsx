// 모임 상세보기 레이아웃

import { useParams } from 'react-router-dom';
import { dummyGroups } from '../../mocks/groups';
import MeetingHeader from '../common/prevgroup/MeetingHeader';
import MeetingTabs from '../common/prevgroup/MeetingTabs';

function GroupDetailLayout() {
  const { id } = useParams<{ id: string }>();

  // 유효성 체크
  const groupId = Number(id);
  if (!id || Number.isNaN(groupId)) {
    return (
      <div className="flex justify-center items-center h-80 text-gray-500">
        잘못된 주소입니다. (id 없음/숫자 아님)
      </div>
    );
  }

  const group = dummyGroups.find(g => g.id === groupId);
  if (!group) {
    return (
      <div className="flex justify-center items-center h-80 text-gray-500">
        해당 모임을 찾을 수 없습니다.
      </div>
    );
  }

  // 이미지 3장 이상 없으면 썸네일 + 가짜 이미지 목데이터 채워버림
  const imagesForHeader =
    group.images && group.images.length > 1
      ? group.images
      : [
          group.thumbnail,
          `https://picsum.photos/seed/${group.id}-2/640/360`,
          `https://picsum.photos/seed/${group.id}-3/640/360`,
        ];

  return (
    <div className="mx-auto w-[1024px] py-10 space-y-8">
      {/* 헤더 */}
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
        title={group.title}
        status={group.status}
        category={group.category}
        subCategory={group.subCategory}
        summary={group.desc}
        dday={group.dday}
        duration={group.duration}
        participants={`${group.memberCount}/${group.memberLimit}`}
        images={imagesForHeader}
        isFavorite={false}
        mode="detail"
        onFavoriteToggle={() => console.log('찜')}
        onApply={() => console.log('신청')}
      />

      {/* 목데이터 탭 (소개 / 커리큘럼 / 모임장) - 추후 수정할것임! */}
      <MeetingTabs
        intro={group.desc}
        curriculum={[
          {
            title: '첫 주: 오리엔테이션 및 아이스브레이킹',
            detail: '서로 친해지고 기본 규칙을 공유합니다.',
            files: ['https://picsum.photos/seed/c1/200/150'],
          },
          {
            title: '둘째 주: 심화 학습 및 실습',
            detail: '실제 예제를 통해 심화된 학습을 진행합니다.',
            files: ['https://picsum.photos/seed/c2/200/150'],
          },
          {
            title: '셋째 주: 프로젝트 진행',
            detail: '팀별 프로젝트를 구성하여 진행합니다.',
            files: ['https://picsum.photos/seed/c3/200/150'],
          },
          {
            title: '넷째 주: 발표 및 피드백',
            detail: '완성된 프로젝트를 발표하고 피드백을 공유합니다.',
            files: ['https://picsum.photos/seed/c4/200/150'],
          },
        ]}
        leader={{
          name: '홍길동',
          location: '서울',
          career: '10년 경력의 전문가이며, 다수의 프로젝트를 진행했습니다.',
        }}
      />
    </div>
  );
}

export default GroupDetailLayout;
