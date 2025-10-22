// src/components/GroupContentBox.tsx
// import { useEffect, useMemo, useState } from 'react';
// import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

// type GroupRow = {
//   group_id: string;
//   group_title: string;
//   group_short_intro: string | null;
//   group_start_day: string;
//   group_end_day: string;
//   group_capacity: number | null;
//   group_region: string | null;
//   image_urls: string[] | null;
//   group_created_at: string;
// };

export default function GroupContentBox() {
  // const [groups, setGroups] = useState<GroupRow[]>([]);
  // const [memberCountMap, setMemberCountMap] = useState<Record<string, number>>({});
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   let ignore = false;
  //   (async () => {
  //     setLoading(true);

  //     const { data: userRes, error: userErr } = await supabase.auth.getUser();
  //     const userId = userRes?.user?.id;
  //     if (userErr || !userId) {
  //       if (!ignore) setGroups([]);
  //       setLoading(false);
  //       return;
  //     }

  //     const { data, error } = await supabase
  //       .from('groups')
  //       .select(
  //         'group_id, group_title, group_short_intro, group_start_day, group_end_day, group_capacity, group_region, image_urls, group_created_at',
  //       )
  //       .eq('created_by', userId)
  //       .order('group_created_at', { ascending: false });

  //     if (error || !data) {
  //       if (!ignore) setGroups([]);
  //       setLoading(false);
  //       return;
  //     }

  //     if (!ignore) setGroups(data);

  //     if (data.length) {
  //       const ids = data.map(d => d.group_id);
  //       const { data: members } = await supabase.from('group_members').select('group_id');

  //       if (!ignore) {
  //         const map: Record<string, number> = {};
  //         for (const m of members ?? []) {
  //           if (ids.includes(m.group_id)) {
  //             map[m.group_id] = (map[m.group_id] ?? 0) + 1;
  //           }
  //         }
  //         setMemberCountMap(map);
  //         setLoading(false);
  //       }
  //     } else {
  //       if (!ignore) setMemberCountMap({});
  //       setLoading(false);
  //     }
  //   })();
  //   return () => {
  //     ignore = true;
  //   };
  // }, []);

  // const today = useMemo(() => new Date(), []);
  // const fmt = (d: string) => (d ? d.replaceAll('-', '.') : '');

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

  // if (groups.length === 0) {
  //   return (
  //     <div className="w-[1024px] mx-auto h-[160px] flex items-center justify-center text-gray-500 border rounded-[5px]">
  //       등록된 모임이 없습니다.
  //     </div>
  //   );
  // }

  return (
    <Link
      to={'/groupcontent/:id'}
      className="w-[1024px] h-[123px] border rounded-[5px] border-[#acacac] p-[10px] relative flex"
    >
      {/* 3항연산자로 바꾸기 모집예정, 모집중으로 */}
      <div className="absolute rounded-[5px] bg-gray-300 px-[10px] py-[4px] text-sm text-white font-bold top-[-22px]">
        모임 오픈까지 nn일
      </div>
      {/* <div className="absolute rounded-[5px] bg-brand px-[10px] py-[4px] text-sm text-white font-bold top-[-22px]">
        모임 오픈까지 nn일
      </div> */}
      <div className="w-[150px] h-[96px] rounded-[5px] overflow-hidden">
        <img className="w-full h-full  object-cover" src="/bruce.jpg" alt="모임사진" />
      </div>
      <div className="px-4 flex flex-col justify-between">
        <div className="flex items-center gap-3">
          <p className="text-lg font-bold">[모여라] 가라! 포켓몬스터 함께 잡아요. 친구들 모집</p>
          <span className="px-[6px] py-[2px] bg-[#D83737] font-bold text-white rounded-[5px]">
            취미/여가
          </span>
        </div>
        <div>
          <p>모임 설명을 적는 공간입니다.</p>
        </div>
        <div className="flex gap-12 text-sm text-[#6C6C6C]">
          <div className="">2025.02.15 ~ 2025.05.12</div>
          <div className="flex gap-1">
            <img src="/humen.svg" alt="" />
            2/10
          </div>
        </div>
      </div>
      <div className="absolute right-12 top-[50%] translate-y-[-50%] cursor-pointer">
        {/* 3항 연산자 모임자랑 참여자 먼저 3항연산한 후 모집종료 유무 화살표화 후기작성 */}
        <div>
          <img src="/images/swiper_next.svg" alt="상세보기" />
        </div>
        {/* 후기작성 유무로 3항연산자 후기작성과 후기작성완료 */}
        {/* <button className="text-brand border border-brand rounded-[5px] px-[10px] py-[4px]">
          후기작성
        </button> */}
        {/* <button className="text-[#6C6C6C] border border-[#6C6C6C] rounded-[5px] px-[10px] py-[4px]">
          후기작성완료
        </button> */}
      </div>
    </Link>
  );
}
