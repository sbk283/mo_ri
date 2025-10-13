function DashboardDetail() {
  return (
    <div className="flex gap-3 w-full">
      <div className="w-[290px] h-[120px] rounded-[5px] overflow-hidden">
        <img className="w-full h-full object-cover" src="/bruce.jpg" alt="모임사진" />
      </div>
      <div className="flex flex-col  w-full">
        <div className="flex items-center justify-between">
          <div className="flex gap-3 items-center">
            <p className="text-xl font-bold">마비노기 던전 레이드 파티원 모집</p>
            <span className="bg-[#FBAB17] rounded-[5px] px-[6px] py-[2px] text-white font-bold text-sm">
              장기
            </span>
          </div>

          <p className="font-bold text-[#FF5252] pr-2">
            취미/여가 <span className="text-gray-600">{'>'} 게임/오락</span>
          </p>
        </div>
        <div className="text-sm text-[#8c8c8c] pt-1">모임 기간: 2025-05-21 ~ 2025-06-26</div>
        <div className="flex justify-between pt-12 pr-2">
          <div className="text-sm text-[#8c8c8c] ">지역무관</div>
          <div className="flex gap-2 text-sm text-[#8c8c8c]">
            <img src="/humen.svg" alt="인원" />
            9/10
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardDetail;
