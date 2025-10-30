import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
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

  // 오늘 날짜
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 모집중인 그룹만 필터링 (오늘이 시작일~종료일 사이)
  const recruitingGroups = groups.filter(group => {
    if (!group.group_start_day || !group.group_end_day) return false;

    const start = new Date(group.group_start_day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(group.group_end_day);
    end.setHours(0, 0, 0, 0);

    return start > today;
  });

  // 기간 필터링
  const filtered = useMemo(() => {
    return recruitingGroups.filter(g => {
      const start = new Date(g.group_start_day);
      const end = new Date(g.group_end_day);
      const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      let duration: Duration = 'long';
      if (diffDays === 1) duration = 'oneday';
      else if (diffDays <= 28) duration = 'short';

      return duration === active;
    });
  }, [active, recruitingGroups]);

  return (
    <section className="mx-auto w-[1024px]" aria-labelledby="ai-groups-heading">
      <div className="mx-auto">
        <header className="pt-[75px] pb-[32px]">
          <h2 id="popular-groups-heading" className="font-semibold text-lg">
            나의 속도에 맞춘 성장 여정!
          </h2>
          <div className=" flex justify-between items-center">
            <div className="flex items-center gap-4">
              <p className="font-semibold text-xxl">기간별 모임으로 시작해 보세요</p>
              <Link to="/grouplist" className="flex text-sm gap-1 pb-auto items-center">
                <img src="/public/images/plus.svg" alt="더보기" />
                <span className="text-md">더보기</span>
              </Link>
            </div>
            <div className="flex gap-2 ">
              {FILTERS.map(f => (
                <button
                  key={f.key}
                  className={`font-semibold text-md px-4 py-1 rounded-sm  ${
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

        {filtered.length > 0 ? (
          <ul className="grid gap-x-[12px] gap-y-[22px] mb-[64px] grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 place-items-stretch overflow-x-auto">
            {filtered.slice(0, 8).map(item => (
              <li key={item.group_id}>
                <div>
                  <GroupCard item={item} as="div" />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center justify-center pb-20 pt-20 gap-10 border border-gray-300 rounded-sm mb-[64px]">
            <img src="/groupnull.svg" alt="모임 없음" className="w-[200px]" />
            <div className="text-center">
              <b className="text-xl ">아직 조건에 맞는 모임이 생성되지 않았어요!</b>
              <p className="pt-2 text-lg">더보기를 눌러 다른 모임을 찾아보세요</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
