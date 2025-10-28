import GroupDashboardSidebar from '../GroupDashboardSidebar';

interface LayoutProps {
  children?: React.ReactNode;
}

function GroupDashboardLayout({ children }: LayoutProps) {
  return (
    <div className="pt-[120px] relative bg-[#F9FCFF]">
      <div className="mx-auto w-[1024px] relative flex">
        <main className="flex-1">{children}</main>

        <div className="absolute -left-[241px] top-0 w-[203px]">
          <GroupDashboardSidebar />
        </div>
      </div>

      {/* 높이 보정 */}
      <div className="w-full h-0 pb-14" />
    </div>
  );
}

export default GroupDashboardLayout;
