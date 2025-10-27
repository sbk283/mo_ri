// 참여한 모임들 이력 (생성모임, 참여모임 포함.)

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { fetchUserGroups } from '../../lib/fetchUserGroups';
import type { GroupWithCategory } from '../../types/group';
import LoadingSpinner from '../common/LoadingSpinner';

interface ParticipationHistoryProps {
  onCheckChange: (items: any[]) => void;
  ref: React.Ref<{ selectAll: () => void }>;
}

//전체 선택을 위한 forwardRef 사용
const ParticipationHistory = forwardRef<{ selectAll: () => void }, ParticipationHistoryProps>(
  ({ onCheckChange }, ref) => {
    const { user } = useAuth();
    const [groupItems, setGroupItems] = useState<(GroupWithCategory & { isChecked?: boolean })[]>(
      [],
    );
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (!user) return;

      const loadGroups = async () => {
        setLoading(true);
        try {
          const groups = await fetchUserGroups(user.id);
          // isChecked 필드 추가
          const groupsWithCheck = groups.map(g => ({ ...g, isChecked: false }));
          setGroupItems(groupsWithCheck);
        } catch (err) {
          console.error('참여 모임 불러오기 실패:', err);
        } finally {
          setLoading(false);
        }
      };

      loadGroups();
    }, [user]);

    // 체크박스 토글 함수
    const handleCheckboxToggle = (groupId: string) => {
      setGroupItems(prev =>
        prev.map(item =>
          item.group_id === groupId ? { ...item, isChecked: !item.isChecked } : item,
        ),
      );
    };

    //  전체 선택 함수
    const selectAll = () => {
      setGroupItems(prev => {
        const allChecked = prev.every(item => item.isChecked);
        return prev.map(item => ({ ...item, isChecked: !allChecked }));
      });
    };

    //변경될 때마다 부모에게 알려주기 (렌더 후)
    useEffect(() => {
      onCheckChange(groupItems.filter(item => item.isChecked));
    }, [groupItems, onCheckChange]);

    // 부모에서 ref.current.selectAll() 호출 가능하게 연결
    useImperativeHandle(ref, () => ({
      selectAll,
    }));
    if (loading) return <LoadingSpinner />;
    if (groupItems.length === 0) {
      return (
        <div className="text-center py-20 text-gray-400 font-bold">참여한 모임이 없습니다.</div>
      );
    }

    return (
      <div>
        {/* 메뉴 클릭시 변경되는 부분 추후 데이터베이스 연동 해야함 */}
        {groupItems.map(group => (
          <div
            key={group.group_id}
            className="flex border-[1px] border-gray-300 rounded-[5px] py-[23px] px-[26px] items-center mb-[10px]"
          >
            {/* 체크박스 영역 */}
            <button
              onClick={() => handleCheckboxToggle(group.group_id)}
              className={`flex items-center justify-center w-6 h-6 rounded transition-colors duration-200
                  ${group.isChecked ? 'bg-[#0689E8]' : 'bg-white border-[2px] border-brand'}`}
            >
              {group.isChecked && <span className="text-white text-sm">✔</span>}
            </button>

            {/* 이름 영역 */}
            <div className="ml-[24px]">
              <div className="font-bold text-xl text-gray-400">{group.group_title}</div>
              <div className="text-sm text-[#777777] font-bold">
                모임 기간 : {group.group_start_day}~{group.group_end_day}
              </div>
            </div>

            {/* 아이콘 영역 */}
            <div className="flex gap-[9px] ml-[30px] items-center">
              <div className="text-brand text-md font-semibold border border-brand py-[3px] px-[11px] rounded-[5px]">
                {group.categories_major?.category_major_name ?? '기타'}
              </div>
              <div
                className={`text-white text-md font-semibold py-[3px] px-[11px] rounded-[5px] ${
                  group.status === 'recruiting'
                    ? 'bg-brand-orange'
                    : group.status === 'closed'
                      ? 'bg-gray-200'
                      : 'bg-brand-red'
                }`}
              >
                {group.status === 'recruiting'
                  ? '모집 중'
                  : group.status === 'closed'
                    ? '모임 종료'
                    : '모집 마감'}
              </div>
              <div className="flex items-center justify-center">
                {group.created_by === user?.id && (
                  <div className=" bg-brand py-[8px] px-[8px] rounded-2xl">
                    <img src="/images/group_crown.svg" alt="생성자" className="w-4" />
                  </div>
                )}
              </div>
            </div>

            {/* 공백 */}
            <div className="flex-grow" />

            {/* 상세보기 영역 */}
            <Link
              to={`/groupdetail/${group.group_id}`}
              className="text-lg font-medium text-gray-200 hover:text-brand"
            >
              상세보기
            </Link>
          </div>
        ))}
      </div>
    );
  },
);

export default ParticipationHistory;
