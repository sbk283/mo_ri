import MyPageSidebar from '../MyPageSidebar';
// 마이페이지 레이아웃 컴포넌트임다..

interface LayoutProps {
  children: React.ReactNode;
}

function MyPageLayout({ children }: LayoutProps) {
  return (
    <div className="mt-[120px] relative">
      <div className="mx-auto w-[1024px] relative flex">
        <main className="flex-1">{children}</main>

        <div className="absolute -left-[241px] top-0 w-[203px]">
          <MyPageSidebar />
        </div>
      </div>

      {/* 높이 보정 */}
      <div className="w-full h-0 pb-[500px]" />
    </div>
  );
}

export default MyPageLayout;
