import { useNavigate } from 'react-router-dom';
import { categorySlugMap } from '../../constants/categorySlugs';

function CategorySection() {
  const navigate = useNavigate();

  const categories = [
    { label: '운동/건강', icon: '/images/health.svg', iconClass: 'w-10 h-10' },
    { label: '스터디/학습', icon: '/images/study.svg', iconClass: 'w-8 h-9' },
    { label: '취미/여가', icon: '/images/hobby.svg', iconClass: 'w-10 h-9' },
    { label: '봉사/사회참여', icon: '/images/volunteer.svg', iconClass: 'w-9 h-9' },
  ];
  const handleClick = (label: string) => {
    const slug = categorySlugMap[label];
    if (slug) navigate(`/grouplist/${slug}`);
  };

  return (
    <div className="pt-[156px] pb-[77px] border-b border-[#DBDBDB]">
      <div className="mx-auto w-[1024px]">
        <div className="flex justify-center gap-[83px]">
          {categories.map(({ label, icon, iconClass }) => (
            <div
              key={label}
              onClick={() => handleClick(label)}
              className="flex flex-col items-center justify-center w-[125px] h-[125px]
                         bg-[#F9FBFF] border border-[#DBDBDB] rounded-sm
                         hover:shadow-card transition cursor-pointer"
            >
              <img src={icon} alt={label} className={`${iconClass} mb-3`} />
              <span className="text-sm font-medium text-brand">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CategorySection;
