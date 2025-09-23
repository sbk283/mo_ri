// 모임관리 - 생성한 모임리스트 페이지 입니다

import GroupManagerLayout from '../components/layout/GroupManagerLayout';

function GroupManagerPage() {
  return (
    <GroupManagerLayout>
      <header className="mb-10">
        <h1 className="text-xl font-bold">모임관리 {'>'} 생성한 모임 리스트</h1>
        <div className="mt-2 border-l-4 border-brand pl-3">
          <p className="text-m font-bold text-gray-800">
            직접 만든 모임의 현황과 진행 상황을 한눈에 확인할 수 있습니다.
          </p>
          <p className="text-sm text-gray-600">
            생성한 모임들의 간략한 정보와 일정을 확인해보세요.
          </p>
        </div>
      </header>
      <main>
        {/* 풀캘린더 */}
        <div></div>
        {/* 모임리스트 */}
        <div>
          {/* 카테고리 */}
          <div></div>
          {/* 목록 */}
          <div></div>
        </div>
      </main>
    </GroupManagerLayout>
  );
}

export default GroupManagerPage;
