import DashboardDetail from '../../components/dashboard/DashboardDetail';
import GroupDashboardLayout from '../../components/layout/GroupDashboardLayout';

function GroupContentPage() {
  return (
    <div>
      <GroupDashboardLayout>
        <div className="flex flex-col gap-3">
          <div className="bg-white shadow-card h-[145px] w-[1024px] rounded-sm p-[12px]">
            <DashboardDetail />
          </div>
          <div className="bg-white shadow-card h-[770px] rounded-sm"></div>
        </div>
      </GroupDashboardLayout>
    </div>
  );
}

export default GroupContentPage;
