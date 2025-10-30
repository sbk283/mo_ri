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

  // FK(선택)
  major_id?: string | null;
  sub_id?: string | null;

  // 조인 결과
  categories_major?: { category_major_name: string } | null;
  categories_sub?: { category_sub_name: string } | null;
};

function DashboardDetail() {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<MyGroup | null>(null);
  const [memberCount, setMemberCount] = useState<number>(0);

  useEffect(() => {
    let ignore = false;

    (async () => {
      if (!id) return;

      const { data: raw, error } = await supabase
        .from('groups')
        .select(
          `
          group_id,
          group_title,
          group_region,
          group_start_day,
          group_end_day,
          group_capacity,
          image_urls,
          major_id,
          sub_id,
          categories_major:categories_major ( category_major_name ),
          categories_sub:categories_sub ( category_sub_name )
        `,
        )
        .eq('group_id', id)
        .single();

      if (ignore) return;

      if (error) {
        console.error('[DashboardDetail] group load error', error);
        setGroup(null);
        return;
      }

      // ----- Normalize: 조인 결과가 배열/객체 어떤 형태여도 1건으로 수렴 -----
      const picked: any = raw ?? {};

      const majorRel = Array.isArray(picked?.categories_major)
        ? (picked.categories_major[0] ?? null)
        : (picked?.categories_major ?? null);

      const subRel = Array.isArray(picked?.categories_sub)
        ? (picked.categories_sub[0] ?? null)
        : (picked?.categories_sub ?? null);

      const normalized: MyGroup = {
        group_id: picked.group_id,
        group_title: picked.group_title,
        group_region: picked.group_region,
        group_start_day: picked.group_start_day,
        group_end_day: picked.group_end_day,
        group_capacity: picked.group_capacity,
        image_urls: picked.image_urls ?? null,
        major_id: picked.major_id ?? null,
        sub_id: picked.sub_id ?? null,
        categories_major: majorRel
          ? { category_major_name: String(majorRel.category_major_name ?? '') }
          : null,
        categories_sub: subRel
          ? { category_sub_name: String(subRel.category_sub_name ?? '') }
          : null,
      };

      setGroup(normalized);

      // 인원수
      const { count } = await supabase
        .from('group_members')
        .select('member_id', { count: 'exact', head: true })
        .eq('group_id', normalized.group_id);

      if (!ignore) setMemberCount(count ?? 0);
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

  // 카테고리 명 (조인 값 우선, 없으면 안전한 기본값)
  const majorName = group?.categories_major?.category_major_name ?? '카테고리';
  const subName = group?.categories_sub?.category_sub_name ?? '전체';

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

          {/* 카테고리: 조인 값으로 표시 (디자인 유지) */}
          <p className="font-bold text-[#FF5252] pr-2">
            {majorName}{' '}
            <span className="text-gray-600">
              {'>'} {subName}
            </span>
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
