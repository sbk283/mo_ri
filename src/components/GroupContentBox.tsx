import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import GroupContentNon from './GroupContentNon';

type GroupRow = {
  group_id: string;
  group_title: string;
  group_short_intro: string | null;
  group_start_day: string;
  group_end_day: string;
  group_capacity: number | null;
  group_region: string | null;
  image_urls: string[] | null;
  group_created_at: string;
  status: 'recruiting' | 'closed' | 'finished';
  categories_major?: { category_major_name: string } | null;
  categories_sub?: { category_sub_name: string } | null;
  member_count?: number;
};

export default function GroupContentBox() {
  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);

      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      const userId = userRes?.user?.id;
      if (userErr || !userId) {
        if (!ignore) setGroups([]);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('groups')
        .select(
          `
          group_id,
          group_title,
          group_short_intro,
          group_start_day,
          group_end_day,
          group_capacity,
          group_region,
          image_urls,
          status,
          group_created_at,
          categories_major ( category_major_name ),
          categories_sub ( category_sub_name ),
          group_members!left ( member_id )
        `,
        )
        .eq('created_by', userId)
        .order('group_created_at', { ascending: false });

      if (error || !data) {
        if (!ignore) setGroups([]);
        setLoading(false);
        return;
      }

      // 인원
      const formattedGroups: GroupRow[] = data.map((g: any) => ({
        ...g,
        member_count: Array.isArray(g.group_members) ? g.group_members.length : 0,
      }));

      if (!ignore) setGroups(formattedGroups);
      setLoading(false);
    })();
    return () => {
      ignore = true;
    };
  }, []);

  const today = useMemo(() => new Date(), []);

  const fmt = (d: string) => (d ? d.replaceAll('-', '.') : '');

  // 남은 오픈일
  const daysUntilOpen = (start: string) => {
    const startDate = new Date(start);
    const diff = startDate.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  // if (loading) {
  //   return (
  //     <div className="w-[1024px] mx-auto space-y-4">
  //       {Array.from({ length: 3 }).map((_, i) => (
  //         <div
  //           key={i}
  //           className="w-[1024px] h-[123px] border rounded-[5px] border-[#e5e7eb] p-[10px] relative flex animate-pulse"
  //         >
  //           <div className="w-[150px] h-[96px] rounded-[5px] bg-gray-200" />
  //           <div className="px-4 flex-1">
  //             <div className="h-4 w-2/3 bg-gray-200 rounded mt-2" />
  //             <div className="h-4 w-1/2 bg-gray-200 rounded mt-3" />
  //             <div className="h-3 w-1/3 bg-gray-200 rounded mt-4" />
  //           </div>
  //         </div>
  //       ))}
  //     </div>
  //   );
  // }

  if (groups.length === 0) {
    return <GroupContentNon />;
  }

  return (
    <div className="w-[1024px] mx-auto space-y-10">
      {groups.map(g => {
        const openCount = daysUntilOpen(g.group_start_day);
        const badge =
          openCount > 0
            ? {
                text: `모임 오픈까지 ${openCount}일`,
                color: 'bg-gray-300',
              }
            : g.status === 'recruiting'
              ? { text: '모임 종료까지${}일', color: 'bg-brand' }
              : g.status === 'closed'
                ? { text: '모집종료', color: 'bg-gray-300' }
                : { text: '모임종료', color: 'bg-gray-300' };

        const category =
          g.categories_sub?.category_sub_name || g.categories_major?.category_major_name;

        return (
          <Link
            key={g.group_id}
            to={`/groupcontent/${g.group_id}`}
            className="w-[1024px] h-[123px] border rounded-[5px] border-[#acacac] p-[10px] relative flex"
          >
            <div
              className={`absolute rounded-[5px] ${badge.color} px-[10px] py-[4px] text-sm text-white font-bold top-[-22px]`}
            >
              {badge.text}
            </div>

            <div className="w-[150px] h-[96px] rounded-[5px] overflow-hidden">
              <img className="w-full h-full object-cover" src={g.image_urls?.[0]} alt="모임사진" />
            </div>

            <div className="px-4 flex flex-col justify-between">
              <div className="flex items-center gap-3">
                <p className="text-lg font-bold">{g.group_title}</p>
                <span className="px-[6px] py-[2px] bg-[#D83737] font-bold text-white rounded-[5px]">
                  {category}
                </span>
              </div>
              <div>
                <p>{g.group_short_intro}</p>
              </div>
              <div className="flex gap-12 text-sm text-[#6C6C6C]">
                <div>
                  {fmt(g.group_start_day)} ~ {fmt(g.group_end_day)}
                </div>
                <div className="flex gap-1">
                  <img src="/humen.svg" alt="인원" />
                  {g.member_count}/{g.group_capacity}
                </div>
              </div>
            </div>

            {/* 우측 화살표 */}
            <div className="absolute right-12 top-[50%] translate-y-[-50%] cursor-pointer">
              <img src="/images/swiper_next.svg" alt="상세보기" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
