import GroupManagerSidebar from '../GroupManagerSidebar';

interface LayoutProps {
  children?: React.ReactNode;
}

function GroupManagerLayout({ children }: LayoutProps) {
  return (
    <div className="flex gap-[38px] mt-[120px]">
      {/* 왼쪽 사이드바 */}
      <div className="ml-[203px]">
        <GroupManagerSidebar />
      </div>

      {/* 메인 컨텐츠 */}
      <main className="w-[1024px]">
        <div className="w-[1024px]">{children}</div>
      </main>
    </div>
  );
}

export default GroupManagerLayout;
