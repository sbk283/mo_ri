import WeekCalendar from '../components/calendar/WeekCalendar';
import GroupMenu from '../components/GroupMenu';
import GroupManagerLayout from '../components/layout/GroupManagerLayout';

// 모임관리 - 참여한 모임리스트 페이지
function JoinedGroupsPage() {
  return (
    <GroupManagerLayout>
      <header className="mb-10">
        <h1 className="text-xl font-bold">모임관리 {'>'} 참여한 모임 리스트</h1>
        <div className="mt-2 border-l-4 border-brand pl-3">
          <p className="text-m font-bold text-gray-800">
            참여 중인 모임을 한눈에 관리하고 필요한 정보를 손쉽게 확인할 수 있습니다.
          </p>
          <p className="text-sm text-gray-600">
            모임 리스트, 후기, 찜한 모임 등 다양한 정보를 효율적으로 관리해보세요.
          </p>
        </div>
      </header>
      <main>
        {/* 풀캘린더 */}
        <div className="mb-[62px]">
          <WeekCalendar />
        </div>
        {/* 모임리스트 */}
        <div>
          <GroupMenu />
        </div>
      </main>
    </GroupManagerLayout>
  );
}

export default JoinedGroupsPage;
