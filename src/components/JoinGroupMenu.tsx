import { AnimatePresence, motion } from 'motion/react';
import { useLayoutEffect, useRef, useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import JoinGroupContentBox from './JoinGroupContentBox';
import type { GroupWithCategory } from '../types/group';

type JoinedGroupRow = GroupWithCategory & {
  group_members?: {
    user_id: string | null;
    member_status: string;
    member_role: string;
  }[];
  member_count?: number;
};

function JoinGroupMenu() {
  const tabs = [{ label: '모집중' }, { label: '진행중' }, { label: '종료' }];
  const [selectedTab, setSelectedTab] = useState(tabs[0]);
  const [groups, setGroups] = useState<JoinedGroupRow[]>([]);
  const [loading, setLoading] = useState(true);

  const listRef = useRef<HTMLUListElement | null>(null);
  const tabRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [underline, setUnderline] = useState({ left: 0, width: 0 });

  const measure = () => {
    const idx = tabs.findIndex(t => t.label === selectedTab.label);
    const el = tabRefs.current[idx];
    const parent = listRef.current;
    if (!el || !parent) return;
    const er = el.getBoundingClientRect();
    const pr = parent.getBoundingClientRect();
    setUnderline({ left: er.left - pr.left, width: er.width });
  };

  useLayoutEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [selectedTab]);

  useEffect(() => {
    let ignore = false;

    async function fetchJoinedGroups() {
      setLoading(true);

      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      const userId = userRes?.user?.id;

      if (!userId || userErr) {
        setGroups([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('group_members')
        .select(
          `
          group_id,
          member_role,
          groups (
            *,
            created_by,
            categories_major(category_major_name),
            categories_sub(category_sub_name),
            group_members!left(user_id, member_status, member_role)
          )
        `,
        )
        .eq('user_id', userId)
        .eq('member_status', 'approved')
        .eq('member_role', 'member');

      if (ignore) return;

      if (error || !data) {
        setGroups([]);
      } else {
        const joinedGroupList = (data as any[])
          .map(row => {
            let group = row.groups;
            if (Array.isArray(group)) group = group[0];
            if (!group) return null;
            const approved =
              group.group_members?.filter((m: any) => m.member_status === 'approved') ?? [];
            return {
              ...group,
              member_count: approved.length,
            };
          })
          .filter(Boolean) as JoinedGroupRow[];
        setGroups(joinedGroupList);
      }
      setLoading(false);
    }

    fetchJoinedGroups();
    return () => {
      ignore = true;
    };
  }, []);

  const today = useMemo(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate());
  }, []);

  const filteredGroups = useMemo(() => {
    return groups.filter(group => {
      if (!group) return false;
      const createdAt = new Date(group.group_created_at);
      const startDate = new Date(group.group_start_day);
      const endDate = new Date(group.group_end_day);
      createdAt.setHours(0, 0, 0, 0);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      if (selectedTab.label === '모집중') {
        // 모집중: recruiting이고, 시작일은 오늘 이후, 생성일 이전
        return group.status === 'recruiting' && startDate > today;
      }
      if (selectedTab.label === '진행중') {
        return (
          (group.status === 'recruiting' || group.status === 'finished') &&
          startDate <= today &&
          endDate >= today
        );
      }
      if (selectedTab.label === '종료') {
        // 종료: closed(완전종료)거나 종료일이 오늘 이전
        return group.status === 'closed' || endDate < today;
      }
      return false;
    });
  }, [groups, selectedTab, today]);

  return (
    <div className="w-full min-h-[500px]">
      <nav className="h-[40px] border-b border-gray-300">
        <ul ref={listRef} className="relative flex pb-[5px]">
          {tabs.map((tab, i) => (
            <li
              key={tab.label}
              ref={el => (tabRefs.current[i] = el)}
              className="relative w-[130px] text-center pt-1 top-[-10px] cursor-pointer"
              onClick={() => setSelectedTab(tab)}
            >
              <p
                className={`text-xl font-bold transition-colors duration-200 ${
                  tab.label === selectedTab.label
                    ? 'text-[#0689E8]'
                    : 'text-[#3c3c3c] hover:text-[#0689E8]'
                }`}
              >
                {tab.label}
              </p>
            </li>
          ))}
          <motion.div
            className="absolute bottom-0 h-[4px] bg-[#0689E8] rounded"
            initial={false}
            animate={{ left: underline.left, width: underline.width }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </ul>
      </nav>
      <main className="flex justify-center items-center mt-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTab.label}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            <JoinGroupContentBox groups={filteredGroups} loading={loading} />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default JoinGroupMenu;
