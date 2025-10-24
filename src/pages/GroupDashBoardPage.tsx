// src/pages/GroupDashBoardPage.tsx
import DashboardChat from '../components/dashboard/DashboardChat';
import DashboardMember from '../components/dashboard/DashboardMember';
import DashboardMiniCalendar from '../components/dashboard/DashboardMiniCalendar';
import { DashboardNotice } from '../components/dashboard/DashboardNotice';
import GroupDashboardLayout from '../components/layout/GroupDashboardLayout';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useParams } from 'react-router-dom';

type MyGroup = {
  group_id: string;
  group_title: string;
  group_region: string | null;
  group_start_day: string; // YYYY-MM-DD
  group_end_day: string; // YYYY-MM-DD
  group_capacity: number | null;
  image_urls: string[] | null;
  group_created_at: string;
};

const GroupDashBoardPage = () => {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<MyGroup | null>(null);
  const [memberCount, setMemberCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const fmt = (d?: string | null) => (d ? d.replaceAll('-', '.') : '');

  const periodLabel = useMemo(() => {
    if (!group) return '';
    const start = new Date(group.group_start_day).getTime();
    const end = new Date(group.group_end_day).getTime();
    const diffDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    if (diffDays <= 1) return '원데이';
    if (diffDays > 30) return '장기';
    return '단기';
  }, [group]);

  useEffect(() => {
    let ignore = false;

    (async () => {
      setLoading(true);

      // URL :id 가 있으면 해당 group_id로 조회
      if (id) {
        const { data: rows, error } = await supabase
          .from('groups')
          .select(
            'group_id, group_title, group_region, group_start_day, group_end_day, group_capacity, image_urls, group_created_at',
          )
          .eq('group_id', id)
          .limit(1);

        if (!ignore) {
          if (error || !rows?.length) {
            setGroup(null);
            setMemberCount(0);
            setLoading(false);
            return;
          }
          const picked = rows[0] as MyGroup;
          setGroup(picked);

          const { count } = await supabase
            .from('group_members')
            .select('member_id', { count: 'exact', head: true })
            .eq('group_id', picked.group_id);

          setMemberCount(count ?? 0);
          setLoading(false);
        }
        return;
      }

      // :id 없으면 내가 만든 최신 1개
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      const userId = userRes?.user?.id;
      if (userErr || !userId) {
        if (!ignore) setLoading(false);
        return;
      }

      const { data: groups, error: gErr } = await supabase
        .from('groups')
        .select(
          'group_id, group_title, group_region, group_start_day, group_end_day, group_capacity, image_urls, group_created_at',
        )
        .eq('created_by', userId)
        .order('group_created_at', { ascending: false })
        .limit(1);

      if (!ignore) {
        if (gErr || !groups || groups.length === 0) {
          setGroup(null);
          setMemberCount(0);
          setLoading(false);
          return;
        }
        const picked = groups[0] as MyGroup;
        setGroup(picked);

        const { count } = await supabase
          .from('group_members')
          .select('member_id', { count: 'exact', head: true })
          .eq('group_id', picked.group_id);

        setMemberCount(count ?? 0);
        setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [id]);

  return (
    <div className="pt-[70px] bg-[#ECEEF4]">
      <GroupDashboardLayout>
        <div className="h-[748px] flex gap-[11px]">
          {/* 왼쪽 */}
          <div className="">
            {/* 위: 카드 */}
            <div className="bg-white shadow-card h-[193px] w-[330px] mb-[11px] relative">
              <div className="w-[285px] h-[135px] absolute top-[-80px] left-[50%] translate-x-[-50%] overflow-hidden rounded-[5px]">
                {loading ? (
                  <div className="w-full h-full bg-gray-200 animate-pulse" />
                ) : (
                  <img
                    className="w-full h-full object-cover"
                    src={group?.image_urls?.[0] ?? '/images/placeholder.jpg'}
                    alt="모임사진"
                  />
                )}
              </div>

              <div className="pt-[65px] pl-[25px] flex-col">
                <div className="mb-2">
                  <p className="text-lg font-bold truncates">
                    {loading ? '불러오는 중…' : (group?.group_title ?? '내가 만든 모임이 없습니다')}
                  </p>
                </div>

                <div className="flex gap-[10px] items-center">
                  <p className="text-md text-[#FF5252] font-bold">
                    {loading ? ' ' : '카테고리'}
                    <span className="text-gray-600"> {loading ? ' ' : '>'} 미지정</span>
                  </p>

                  <div className="flex text-sm text-gray-600 items-center gap-1 mb-2">
                    <img className="h-[12px] w-[12px]" src="/humen.svg" alt="인원" />
                    <p>{loading ? '...' : `${memberCount}/${group?.group_capacity ?? '-'}`}</p>
                  </div>
                </div>

                <div className="flex gap-2 items-center mb-2">
                  <p className="text-sm text-[#878787]">
                    모임기간 :{' '}
                    <span className="font-bold">
                      {loading
                        ? '...'
                        : `${fmt(group?.group_start_day)} ~ ${fmt(group?.group_end_day)}`}
                    </span>
                  </p>
                  {!loading && group && (
                    <span className="bg-[#FBAB17] rounded-[5px] text-white font-bold px-[7px] py-[2px] text-sm">
                      {periodLabel}
                    </span>
                  )}
                </div>

                <p className="text-[#878787] text-sm">
                  {loading ? '...' : (group?.group_region ?? '지역무관')}
                </p>
              </div>
            </div>

            <div className="bg-white shadow-card h-[544px] w-[330px] overflow-hidden">
              <DashboardMiniCalendar />
            </div>
          </div>

          {/* 오른쪽 */}
          <div>
            <div className="bg-white shadow-card h-[349px] w-[680px] mb-[11px]">
              <DashboardNotice />
            </div>
            <div className="flex gap-[11px]">
              <div className="bg-white shadow-card h-[388px] w-[419px]">
                <DashboardChat />
              </div>
              <div className="bg-white shadow-card h-[388px] w-[250px] relative">
                <DashboardMember />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <p className="text-sm text-gray-300 cursor-pointer pt-18">모임나가기</p>
        </div>
      </GroupDashboardLayout>
    </div>
  );
};

export default GroupDashBoardPage;
