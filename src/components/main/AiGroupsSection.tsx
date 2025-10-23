import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Plus from '../../../public/images/plus.svg';
import { useGroup } from '../../contexts/GroupContext';
import GroupCard from '../common/GroupCard';

type Duration = 'oneday' | 'short' | 'long';

const FILTERS: { key: Duration; label: string }[] = [
  { key: 'oneday', label: '원데이 모임' },
  { key: 'short', label: '단기 모임' },
  { key: 'long', label: '장기 모임' },
];

export default function AiGroupsSection() {
  const { groups, fetchGroups } = useGroup();
  const [active, setActive] = useState<Duration>('oneday');

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const filtered = useMemo(() => {
    return groups.filter(g => {
      if (!g.group_start_day || !g.group_end_day) return false;

      const start = new Date(g.group_start_day);
      const end = new Date(g.group_end_day);
      const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      let duration: Duration = 'long';
      if (diffDays === 1) duration = 'oneday';
      else if (diffDays <= 28) duration = 'short';

      return duration === active;
    });
  }, [active, groups]);

  return (
    <section className="mx-auto w-[1024px]" aria-labelledby="ai-groups-heading">
      <div className="mx-auto">
        <header className="pt-[75px] pb-[32px]">
          <h2 id="popular-groups-heading" className="font-semibold text-lg">
            AI 가 선별한
          </h2>
          <div className="mr-4 flex justify-between">
            <div className="flex items-center gap-4">
              <p className="font-semibold text-xxl">나만의 취향 맞춤 모임!</p>
              <Link to="/grouplist" className="flex text-sm gap-1 pb-auto items-center">
                <img src={Plus} alt="" aria-hidden="true" />
                <span className="text-md">더보기</span>
              </Link>
            </div>
            <div className="flex gap-2 pt-4">
              {FILTERS.map(f => (
                <button
                  key={f.key}
                  className={`font-semibold text-md px-4 py-1 rounded-md  ${
                    active === f.key ? 'bg-brand text-white' : 'border border-brand text-brand'
                  }`}
                  onClick={() => setActive(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        <ul
          className="
            grid gap-x-[12px] gap-y-[22px] mb-[64px]
            grid-cols-2 sm:grid-cols-3 lg:grid-cols-4
            place-items-stretch overflow-x-auto  
          
          "
        >
          {filtered.length ? (
            filtered.slice(0, 8).map(item => <GroupCard key={item.group_id} item={item} />)
          ) : (
            <li className="text-sm text-gray-500 py-8 col-span-full">조건에 맞는 모임이 없어요.</li>
          )}
        </ul>
      </div>
    </section>
  );
}
