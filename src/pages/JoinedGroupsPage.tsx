import GroupMenu from '../components/GroupMenu';
import GroupManagerLayout from '../components/layout/GroupManagerLayout';

// 모임관리 - 참여한 모임리스트 페이지
function JoinedGroupsPage() {
  return (
    <GroupManagerLayout>
      <div>
        <div className="text-xl font-bold text-gray-400 mb-[21px]">
          모임관리 {'>'} 참여한 모임 리스트
        </div>
      </div>
      <div className="flex gap-[12px] mb-[45px]">
        <div className=" border-r border-brand border-[3px]"></div>
        <div className="text-gray-400">
          <div className="text-lg font-semibold">
            참여 중인 모임을 한눈에 관리하고 필요한 정보를 손쉽게 확인할 수 있습니다.
          </div>
          <div className="text-md">
            모임 리스트, 후기, 찜한 모임 등 다양한 정보를 효율적으로 관리해보세요.
          </div>
        </div>
      </div>
      <main>
        {/* 풀캘린더 */}
        {/* <div className="mb-[62px]">
          <WeekCalendar />
        </div> */}
        {/* 모임리스트 */}
        <div>
          <GroupMenu />
        </div>
      </main>
    </GroupManagerLayout>
  );
}

export default JoinedGroupsPage;
