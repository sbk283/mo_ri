function CategorySection() {
  return (
    <div className="pt-[156px] pb-[77px] border-b border-[#DBDBDB]">
      <div className="mx-auto w-[1024px]">
        {/* flex로 가로 정렬, 가운데 정렬 */}
        <div className="flex justify-center gap-8">
          {/* 운동/건강 */}
          <div
            className="flex flex-col items-center justify-center w-[125px] h-[125px] 
                        bg-[#F9FBFF] border border-[#DBDBDB] rounded-sm
                        hover:shadow-card transition cursor-pointer"
          >
            <img src="/images/health.svg" alt="운동건강" className="w-10 h-10 mb-3" />
            <span className="text-sm font-medium text-brand">운동/건강</span>
          </div>

          {/* 스터디/학습 */}
          <div
            className="flex flex-col items-center justify-center w-[125px] h-[125px]  
                        bg-[#F9FBFF] border border-[#DBDBDB] rounded-sm 
                        hover:shadow-card transition cursor-pointer"
          >
            <img src="/images/study.svg" alt="스터디/학습" className="w-8 h-9 mb-3" />
            <span className="text-sm font-medium text-brand">스터디/학습</span>
          </div>

          {/* 취미/여가 */}
          <div
            className="flex flex-col items-center justify-center w-[125px] h-[125px]  
                        bg-[#F9FBFF] border border-[#DBDBDB] rounded-sm 
                        hover:shadow-card transition cursor-pointer"
          >
            <img src="/images/hobby.svg" alt="취미/여가" className="w-10 h-9 mb-3" />
            <span className="text-sm font-medium text-brand">취미/여가</span>
          </div>

          {/* 봉사/사회참여 */}
          <div
            className="flex flex-col items-center justify-center w-[125px] h-[125px]  
                        bg-[#F9FBFF] border border-[#DBDBDB] rounded-sm 
                        hover:shadow-card transition cursor-pointer"
          >
            <img src="/images/volunteer.svg" alt="봉사/사회참여" className="w-9 h-9 mb-3" />
            <span className="text-sm font-medium text-brand">봉사/사회참여</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategorySection;
