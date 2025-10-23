import { useNavigate } from 'react-router-dom';
import type { GroupWithCategory } from '../../types/group';

interface GroupCardProps {
  item: GroupWithCategory;
  as?: 'li' | 'div';
}

export function GroupCard({ item, as = 'li' }: GroupCardProps) {
  const Wrapper = as as keyof JSX.IntrinsicElements;
  const navigate = useNavigate();

  const calculateDday = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? `D-${diff}` : '마감';
  };

  // 카드 선택 후 이동
  const handleClick = () => {
    navigate(`/groupdetail/${item.group_id}`);
  };

  return (
    <>
      <Wrapper className="overflow-hidden relative cursor-pointer pt-5" onClick={handleClick}>
        <article className="h-[290px] w-[245px] rounded-sm border border-gray-300 bg-white overflow-hidden">
          {/* 말풍선 */}
          <div
            className={`absolute left-2 top-[1px] z-10 px-2
              rounded-tl-[15px] rounded-tr-[15px] rounded-br-[15px]
              text-white text-md font-semibold
              ${item.status === 'recruiting' ? 'bg-brand' : 'bg-brand-red'}`}
          >
            {item.status === 'recruiting' ? '모집중' : '모집예정'}
          </div>
          {/* 이미지 */}
          <img
            src={item.image_urls?.[0] ?? '/placeholder.jpg'}
            alt={`${item.group_title} 썸네일`}
            className="w-full object-cover h-[133px]"
          />
          {/*  텍스트 */}
          <div className="relative p-[15px] rounded-b-sm flex flex-col flex-1 bg-white">
            <header className="flex justify-between text-sm mb-2">
              <span className="text-[#D83737] font-semibold">
                {item.categories_major?.category_major_name}
              </span>
              <span className="text-[#767676]">{item.group_region}</span>
            </header>
            <h3 className="items-center gap-1 text-lg truncate mb-[7px] font-bold ">
              {item.group_title}
            </h3>
            <p className="text-[15px] text-gray-300 line-clamp-2 leading-[19px]">
              {item.group_short_intro}
            </p>
          </div>
          {/*  디데이 */}
          <div className="absolute font-semibold text-center left-3 bottom-3 bg-[#87898D] text-white rounded-sm px-2 text-sm">
            {calculateDday(item.group_end_day)}
          </div>
        </article>
      </Wrapper>
    </>
  );
}

export default GroupCard;
