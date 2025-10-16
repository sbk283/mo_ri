import DashboardChat from '../components/dashboard/DashboardChat';
import DashboardMember from '../components/dashboard/DashboardMember';
import DashboardMiniCalendar from '../components/dashboard/DashboardMiniCalendar';
import { DashboardNotice } from '../components/dashboard/DashboardNotice';
import GroupDashboardLayout from '../components/layout/GroupDashboardLayout';

const GroupDashBoardPage = () => {
  return (
    <div className="pt-[70px] bg-[#ECEEF4]">
      <GroupDashboardLayout>
        <div className="h-[748px] flex gap-[11px]">
          {/* 왼쪽 */}
          <div className="">
            {/* 위 */}
            <div className="bg-white shadow-card h-[193px] w-[330px] mb-[11px] relative">
              <div className="w-[285px] h-[135px] absolute top-[-80px] left-[50%] translate-x-[-50%] overflow-hidden rounded-[5px]">
                <img className="w-full h-full object-cover" src="/bruce.jpg" alt="모임사진" />
              </div>
              <div className="pt-[65px] pl-[25px] flex-col">
                <div className="mb-2">
                  <p className="text-lg font-bold truncates">마비노기 던전 레이드 파티 모집</p>
                </div>
                <div className="flex gap-[10px]">
                  <p className="text-md text-[#FF5252] font-bold">
                    취미/여가
                    <span className="text-gray-600"> {'>'} 게임/오락</span>
                  </p>
                  <div className="flex text-sm text-gray-600 items-center gap-1 mb-2">
                    <img className=" h-[12px] w-[12px]" src="/humen.svg" alt="인원" />
                    <p>2/10</p>
                  </div>
                </div>
                <div className="flex gap-2 items-center mb-2">
                  <p className="text-sm text-[#878787]">
                    모임기간 : <span className="font-bold">2025.10.25 ~ 2025.12.12</span>
                  </p>
                  <span className=" bg-[#FBAB17] rounded-[5px] text-white font-bold px-[7px] py-[2px] text-sm">
                    장기
                  </span>
                </div>
                <p className="text-[#878787] text-sm">지역무관</p>
              </div>
            </div>
            {/* 아래 */}
            <div className="bg-white shadow-card h-[544px] w-[330px] overflow-hidden">
              <DashboardMiniCalendar />
            </div>
          </div>
          {/* 오른쪽 */}
          <div>
            {/* 위 */}
            <div className="bg-white shadow-card h-[349px] w-[680px] mb-[11px]">
              <DashboardNotice />
            </div>
            {/* 아래 */}
            <div className="flex gap-[11px]">
              {/* 왼 */}
              <div className="bg-white shadow-card h-[388px] w-[419px]">
                <DashboardChat />
              </div>
              {/* 오 */}
              <div className="bg-white shadow-card h-[388px] w-[250px] relative">
                <DashboardMember />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <p className="text-sm text-gray-300 cursor-pointer pt-8">모임나가기</p>
        </div>
      </GroupDashboardLayout>
    </div>
  );
};

export default GroupDashBoardPage;
