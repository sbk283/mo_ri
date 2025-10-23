import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Plus from '../../../public/images/plus.svg';
import { useGroup } from '../../contexts/GroupContext';
import SwiperGroupCard from '../common/SwiperGroupCard';

export default function PopularGroupsSection() {
  const { groups, fetchGroups, loading } = useGroup();

  useEffect(() => {
    fetchGroups(); // 모든 그룹 가져오기
  }, [fetchGroups]);

  // 모집 마감 그룹 가져오지않기.
  // 오늘 날짜
  const today = new Date();

  // 마감되지 않은 그룹만 필터링
  const activeGroups = groups.filter(group => {
    const endDate = new Date(group.group_end_day);
    return endDate >= today; // 오늘 이후면 포함
  });

  return (
    <section
      className="bg-[#F9FBFF] border-t border-b border-solid border-[#DBDBDB] pb-[78px]"
      aria-labelledby="popular-groups-heading"
    >
      <div className="mx-auto w-[1024px]">
        <header className="pt-[76px] pb-[22px]">
          <h2 id="popular-groups-heading" className="font-semibold text-lg">
            Mo:ri 가 엄선한 인기모임!
          </h2>
          <div className="mr-4">
            <div className="flex items-center gap-4">
              <p className="font-semibold text-xxl">지금 바로 확인하세요!</p>
              <Link to="/grouplist" className="flex text-sm gap-1 pb-auto items-center">
                <img src={Plus} alt="" aria-hidden="true" />
                <span className="text-md">더보기</span>
              </Link>
            </div>
          </div>
        </header>

        <div className="">
          {loading ? (
            <p>로딩 중...</p>
          ) : groups.length === 0 ? (
            <p>표시할 그룹이 없습니다.</p>
          ) : (
            <SwiperGroupCard loop={false} spaceBetween={12} groups={activeGroups} />
          )}
        </div>
      </div>
    </section>
  );
}
