import GroupDashboardLayout from '../components/layout/GroupDashboardLayout';

const GroupDashBoardPage = () => {
  return (
    <div className="pt-[70px] bg-[#ECEEF4]">
      <GroupDashboardLayout>
        <div className="bg-white h-[748px] flex gap-[11px]">
          {/* 왼쪽 */}
          <div className="">
            {/* 위 */}
            <div className="bg-white shadow-card h-[193px] w-[330px] mb-[11px]"></div>
            {/* 아래 */}
            <div className="bg-white shadow-card h-[544px] w-[330px]"></div>
          </div>
          {/* 오른쪽 */}
          <div>
            {/* 위 */}
            <div></div>
            {/* 아래 */}
            <div>
              {/* 왼 */}
              <div></div>
              {/* 오 */}
              <div></div>
            </div>
          </div>
        </div>
      </GroupDashboardLayout>
    </div>
  );
};

export default GroupDashBoardPage;
