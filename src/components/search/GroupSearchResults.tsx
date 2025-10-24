import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useGroup } from '../../contexts/GroupContext';
import GroupListCard from '../common/GroupListCard';

type Props = {
  searchTerm: string;
};

export default function GroupSearchResults({ searchTerm }: Props) {
  const { groups, loading } = useGroup();

  // 검색 필터링
  const displayedGroups = useMemo(() => {
    if (!searchTerm.trim()) return [];

    const term = searchTerm.toLowerCase();

    return groups
      .map(g => {
        const end = new Date(g.group_end_day);
        const status = new Date() > end ? 'finished' : g.status;
        return { ...g, status };
      })
      .filter(
        g =>
          g.group_title.toLowerCase().includes(term) ||
          g.categories_major?.category_major_name?.toLowerCase().includes(term) ||
          g.categories_sub?.category_sub_name?.toLowerCase().includes(term),
      );
  }, [groups, searchTerm]);

  if (loading)
    return <div className="flex justify-center items-center h-60 text-gray-500">로딩 중...</div>;

  if (displayedGroups.length === 0)
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col justify-center items-center h-60 bg-gray-50"
      >
        <motion.p
          className="text-lg font-semibold text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          검색 결과가 없습니다
        </motion.p>
      </motion.div>
    );

  return (
    <div className="space-y-4">
      {displayedGroups.map(g => (
        <GroupListCard
          key={g.group_id}
          group_id={g.group_id}
          group_title={g.group_title}
          group_short_intro={g.group_short_intro}
          category_major_name={g.categories_major?.category_major_name ?? '카테고리 없음'}
          category_sub_name={g.categories_sub?.category_sub_name ?? '세부 카테고리 없음'}
          status={g.status}
          group_region={g.group_region}
          image_urls={g.image_urls}
          member_count={g.member_count}
          group_capacity={g.group_capacity}
          group_start_day={g.group_start_day}
          group_end_day={g.group_end_day}
        />
      ))}
    </div>
  );
}
