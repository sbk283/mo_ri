import CategoryMenuSidebar from '../components/CategoryMenuSidebar';
import GroupDetailLayout from '../components/layout/GroupDetailLayout';

function GroupDetailPage() {
  return (
    <div>
      <div className="mx-auto flex w-[1024px] gap-6 py-[56px] min-h-screen">
        <CategoryMenuSidebar />
        <GroupDetailLayout />
      </div>
    </div>
  );
}

export default GroupDetailPage;
