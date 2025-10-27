import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useGroup } from '../../contexts/GroupContext';
import GroupListCard from '../common/GroupListCard';
import LoadingSpinner from '../common/LoadingSpinner';

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

  if (loading) return <LoadingSpinner />;

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
}
