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
              <div className="pt-[60px]">
                <div>
                  <p>마비노기 던전 레이드 파티 모집</p>
                </div>
                <div className="flex gap-[10px]">
                  <span>취미/여가{'>'}게임/오락</span>
                  <div className="flex">
                    <img src="/humen.svg" alt="인원" />
                    2/10
                  </div>
                </div>
                <div className="flex">
                  <p>2025.10.25 ~ 2025.12.12</p>
                  <span>장기</span>
                </div>
                <p>지역무관</p>
              </div>
            </div>
            {/* 아래 */}
            <div className="bg-white shadow-card h-[544px] w-[330px]"></div>
          </div>
          {/* 오른쪽 */}
          <div>
            {/* 위 */}
            <div className="bg-white shadow-card h-[349px] w-[665px] mb-[11px]"></div>
            {/* 아래 */}
            <div className="flex gap-[11px]">
              {/* 왼 */}
              <div className="bg-white shadow-card h-[388px] w-[409px]"></div>
              {/* 오 */}
              <div className="bg-white shadow-card h-[388px] w-[245px]"></div>
            </div>
          </div>
        </div>
      </GroupDashboardLayout>
    </div>
  );
};

export default GroupDashBoardPage;
