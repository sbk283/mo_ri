// 모임관리 - 생성한 모임리스트 페이지 입니다

import GroupMenu from '../components/GroupMenu';
import GroupManagerLayout from '../components/layout/GroupManagerLayout';

function GroupManagerPage() {
  return (
    <GroupManagerLayout>
      <div>
        <div className="text-xl font-bold text-gray-400 mb-[21px]">
          모임관리 {'>'} 생성한 모임리스트
        </div>
      </div>
      <div className="flex gap-[12px] mb-[45px]">
        <div className=" border-r border-brand border-[3px]"></div>
        <div className="text-gray-400">
          <div className="text-lg font-semibold">
            직접 만든 모임의 현황과 진행 상황을 한눈에 확인할 수 있습니다.
          </div>
          <div className="text-md">생성한 모임들의 간략한 정보와 일정을 확인해보세요..</div>
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

export default GroupManagerPage;
