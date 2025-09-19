import CategoryMenuSidebar from '../components/CategoryMenuSidebar';
import GroupListLayout from '../components/layout/GroupListLayout';

function GroupListPage(): JSX.Element {
  return (
    <div className="mx-auto flex w-[1024px] gap-6 py-[56px] min-h-screen">
      {/* 카테고리 메뉴 컴포넌트 */}
      <CategoryMenuSidebar />

      {/* 메인 레이아웃 */}
      <GroupListLayout />
    </div>
  );
}

export default GroupListPage;
