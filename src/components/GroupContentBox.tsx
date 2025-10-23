import { Link } from 'react-router-dom';
import type { GroupWithCategory } from '../types/group';
import GroupContentNon from './GroupContentNon';

interface GroupContentBoxProps {
  groups: GroupWithCategory[];
  loading: boolean;
}

export default function GroupContentBox({ groups, loading }: GroupContentBoxProps) {
  const fmt = (d: string) => (d ? d.replace(/-/g, '.') : '');

  if (loading) {
    return (
      <div className="w-[1024px] mx-auto space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="w-[1024px] h-[123px] border rounded-[5px] border-[#e5e7eb] p-[10px] relative flex animate-pulse"
          >
            <div className="w-[150px] h-[96px] rounded-[5px] bg-gray-200" />
            <div className="px-4 flex-1">
              <div className="h-4 w-2/3 bg-gray-200 rounded mt-2" />
              <div className="h-4 w-1/2 bg-gray-200 rounded mt-3" />
              <div className="h-3 w-1/3 bg-gray-200 rounded mt-4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (groups.length === 0) {
    return <GroupContentNon />;
  }

  return (
    <div className="w-[1024px] mx-auto space-y-9">
      {groups.map(group => {
        const startDate = new Date(group.group_start_day);
        const endDate = new Date(group.group_end_day);
        const today = new Date();
        const daysUntilOpen = Math.ceil(
          (startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        );
        const daysUntilEnd = Math.max(
          0,
          Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
        );

        const badge =
          daysUntilOpen > 0 ? (
            <div className="absolute rounded-[5px] bg-gray-300 px-[10px] py-[4px] text-sm text-white font-bold top-[-22px]">
              모임 오픈까지 {daysUntilOpen}일
            </div>
          ) : group.status === 'recruiting' ? (
            <div className="absolute rounded-[5px] bg-brand px-[10px] py-[4px] text-sm text-white font-bold top-[-22px]">
              모임 종료까지 {daysUntilEnd}일
            </div>
          ) : null;

        const category =
          // group.categories_sub?.category_sub_name ||
          group.categories_major?.category_major_name;

        return (
          <Link
            key={group.group_id}
            to={`/groupcontent/${group.group_id}`}
            className="w-[1024px] h-[123px] border rounded-[5px] border-[#acacac] p-[13px] relative flex"
          >
            {badge}

            <div className="w-[150px] h-[96px] rounded-[5px] overflow-hidden">
              <img
                src={group.image_urls?.[0] || '/default-img.jpg'}
                alt="모임사진"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="px-4 flex flex-col justify-between">
              <div className="flex items-center gap-3">
                <p className="text-lg font-bold">{group.group_title}</p>
                <span className="px-[6px] py-[2px] bg-[#FF5252] font-bold text-white rounded-[5px] text-sm">
                  {category}
                </span>
              </div>
              <div>
                <p>{group.group_short_intro || '모임 소개가 없습니다.'}</p>
              </div>
              <div className="flex gap-12 text-sm text-[#6C6C6C]">
                <div>
                  {fmt(group.group_start_day)} ~ {fmt(group.group_end_day)}
                </div>
                <div className="flex gap-1">
                  <img src="/humen.svg" alt="모임 참여자 아이콘" />
                  {group.member_count}/{group.group_capacity ?? '∞'}
                </div>
              </div>
            </div>

            <div className="absolute right-12 top-[50%] translate-y-[-50%] cursor-pointer">
              <img src="/images/swiper_next.svg" alt="상세보기" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
