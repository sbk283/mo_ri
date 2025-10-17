// src/components/DashboardDetail.tsx
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

type MyGroup = {
  group_id: string;
  group_title: string;
  group_region: string | null;
  group_start_day: string; // YYYY-MM-DD
  group_end_day: string; // YYYY-MM-DD
  group_capacity: number | null;
  image_urls: string[] | null;
};

function DashboardDetail() {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<MyGroup | null>(null);
  const [memberCount, setMemberCount] = useState<number>(0);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!id) return;

      // 그룹 1건
      const { data: picked } = await supabase
        .from('groups')
        .select(
          'group_id, group_title, group_region, group_start_day, group_end_day, group_capacity, image_urls',
        )
        .eq('group_id', id)
        .single();

      if (ignore) return;
      setGroup(picked ?? null);

      // 인원수
      if (picked) {
        const { count } = await supabase
          .from('group_members')
          .select('member_id', { count: 'exact', head: true })
          .eq('group_id', picked.group_id);
        if (!ignore) setMemberCount(count ?? 0);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [id]);

  const cover = group?.image_urls?.[0] ?? '/images/placeholder.jpg';
  const period = useMemo(() => {
    if (!group) return '장기';
    const s = new Date(group.group_start_day).getTime();
    const e = new Date(group.group_end_day).getTime();
    const days = Math.max(1, Math.ceil((e - s) / (1000 * 60 * 60 * 24)));
    if (days <= 1) return '원데이';
    if (days > 30) return '장기';
    return '단기';
  }, [group]);

  return (
    <div className="flex gap-3 w-full">
      <div className="w-[290px] h-[120px] rounded-[5px] overflow-hidden">
        <img className="w-full h-full object-cover" src={cover} alt="모임사진" />
      </div>

      <div className="flex flex-col  w-full">
        <div className="flex items-center justify-between">
          <div className="flex gap-3 items-center">
            <p className="text-xl font-bold">{group?.group_title ?? ''}</p>
            <span className="bg-[#FBAB17] rounded-[5px] px-[6px] py-[2px] text-white font-bold text-sm">
              {period}
            </span>
          </div>

          {/* 카테고리는 스키마상 연결이 없어 고정 표시 유지 */}
          <p className="font-bold text-[#FF5252] pr-2">
            취미/여가 <span className="text-gray-600">{'>'} 게임/오락</span>
          </p>
        </div>

        <div className="text-sm text-[#8c8c8c] pt-1">
          모임 기간: {group ? `${group.group_start_day} ~ ${group.group_end_day}` : ''}
        </div>

        <div className="flex justify-between pt-12 pr-2">
          <div className="text-sm text-[#8c8c8c] ">{group?.group_region ?? '지역무관'}</div>
          <div className="flex gap-2 text-sm text-[#8c8c8c]">
            <img src="/humen.svg" alt="인원" />
            {memberCount}/{group?.group_capacity ?? '-'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardDetail;
