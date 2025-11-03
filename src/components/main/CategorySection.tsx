import { useNavigate } from "react-router-dom";
import { categorySlugMap } from "../../constants/categorySlugs";

function CategorySection() {
  const navigate = useNavigate();

  // 카테고리 목록 (아이콘 + 라벨)
  const categories = [
    { label: "운동/건강", icon: "/images/health.svg", iconClass: "w-10 h-10" },
    { label: "스터디/학습", icon: "/images/study.svg", iconClass: "w-8 h-9" },
    { label: "취미/여가", icon: "/images/hobby.svg", iconClass: "w-10 h-9" },
    {
      label: "봉사/사회참여",
      icon: "/images/volunteer.svg",
      iconClass: "w-9 h-9",
    },
  ];

  // 클릭 시 카테고리별 페이지 이동
  const handleClick = (label: string) => {
    const slug = categorySlugMap[label];
    if (slug) navigate(`/grouplist/${slug}`);
  };

  return (
    // 전체 섹션 (상하 여백 반응형 조정)
    <div className="pt-[100px] md:pt-[156px] pb-[50px] md:pb-[77px]">
      {/* 컨테이너: 화면 크기에 따라 너비 유동적으로 변경 */}
      <div className="mx-auto w-[90%] md:w-[1024px]">
        {/* 아이콘 정렬 영역 */}
        <div
          className="
            flex flex-wrap md:flex-nowrap justify-center 
            gap-[30px] md:gap-[83px]
          "
        >
          {categories.map(({ label, icon, iconClass }) => (
            <div
              key={label}
              onClick={() => handleClick(label)}
              className="
                flex flex-col items-center justify-center 
                w-[42%] sm:w-[150px] md:w-[125px] 
                h-[110px] md:h-[125px]
                bg-[#F9FBFF] border border-[#DBDBDB] rounded-sm
                hover:shadow-card transition cursor-pointer
              "
            >
              <img src={icon} alt={label} className={`${iconClass} mb-3`} />
              <span className="text-sm md:text-base font-medium text-brand text-center">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CategorySection;
