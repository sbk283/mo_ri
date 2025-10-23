import { AnimatePresence, motion } from 'motion/react';
import { useLayoutEffect, useRef, useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import JoinGroupContentBox from './JoinGroupContentBox';

// 이 타입은 'group_members' 테이블 기준
type JoinedGroupRow = {
  group_id: string;
  groups: {
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
    group_members?: { user_id: string | null; member_status: string }[];
    member_count?: number;
  };
};

function JoinGroupMenu() {
  const tabs = [{ label: '모집중' }, { label: '진행중' }, { label: '종료' }];
  const [selectedTab, setSelectedTab] = useState(tabs[0]);
  const [groups, setGroups] = useState<JoinedGroupRow['groups'][]>([]);
  const [loading, setLoading] = useState(true);

  // underline UI(생략)
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

      // '내가 참가한' 모임만
      const { data, error } = await supabase
        .from('group_members')
        .select(
          `
          group_id,
          groups (
            *,
            categories_major(category_major_name),
            categories_sub(category_sub_name),
            group_members!left(user_id, member_status)
          )
        `,
        )
        .eq('user_id', userId)
        .eq('member_status', 'approved');

      if (ignore) return;

      if (error || !data) {
        setGroups([]);
      } else {
        // group_members 테이블에서 groups객체를 뽑아냄
        const joinedGroupList = (data as JoinedGroupRow[])
          .map(row => {
            const group = row.groups;
            // 멤버 카운트
            const approved =
              group?.group_members?.filter(m => m.member_status === 'approved') ?? [];
            return group ? { ...group, member_count: approved.length } : null;
          })
          .filter(Boolean) as JoinedGroupRow['groups'][];
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
      const createdAt = new Date(group.group_created_at);
      const startDate = new Date(group.group_start_day);
      const endDate = new Date(group.group_end_day);
      createdAt.setHours(0, 0, 0, 0);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      if (selectedTab.label === '모집중') {
        return group.status === 'recruiting' && createdAt <= today && startDate > today;
      }
      if (selectedTab.label === '진행중') {
        return group.status === 'recruiting' && startDate <= today && endDate >= today;
      }
      if (selectedTab.label === '종료') {
        return group.status === 'finished' || endDate < today;
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
