import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { GroupWithCategory } from '../types/group';
import JoinGroupContentNon from './JoinGroupContentNon';
import type { ReviewItem } from './common/modal/CreateReview';
import CreateReview from './common/modal/CreateReview';

interface JoinGroupContentBoxProps {
  groups: GroupWithCategory[];
  loading: boolean;
}

export default function JoinGroupContentBox({ groups, loading }: JoinGroupContentBoxProps) {
  const today = new Date();
  const fmt = (d: string) => (d ? d.replace(/-/g, '.') : '');
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState<ReviewItem | null>(null);
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);

  const createEmptyReview = (): ReviewItem => ({
    id: '',
    title: '',
    category: '',
    rating: 1,
    content: '',
    tags: [],
  });

  const openCreateReviewModal = (group: GroupWithCategory) => {
    setCurrentGroupId(group.group_id);
    setCurrentReview(createEmptyReview());
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="w-[1024px] mx-auto space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="w-[1024px] h-[123px] border rounded-[5px] border-[#e5e7eb] p-[10px] relative flex animate-pulse"
          >
            <div className="w-[150px] h-[96px] rounded-[5px] bg-gray-200" />
            <div className="px-4 flex-1">
              <div className="h-4 w-2/3 bg-gray-200 rounded mt-2" />
              <div className="h-4 w-1/2 bg-gray-200 rounded mt-3" />
              <div className="h-3 w-1/3 bg-gray-200 rounded mt-4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (groups.length === 0) {
    return <JoinGroupContentNon />;
  }

  return (
    <>
      <div className="w-[1024px] mx-auto space-y-9">
        {groups.map(group => {
          const startDate = new Date(group.group_start_day);
          const endDate = new Date(group.group_end_day);
          const daysUntilOpen = Math.max(
            0,
            Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
          );
          const daysUntilEnd = Math.max(
            0,
            Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
          );

          const badge =
            daysUntilOpen > 0 ? (
              <div className="absolute rounded-[5px] bg-gray-300 px-[10px] py-[4px] text-sm text-white font-bold top-[-22px]">
                모임 오픈까지 {daysUntilOpen}일
              </div>
            ) : group.status === 'recruiting' ? (
              <div className="absolute rounded-[5px] bg-brand px-[10px] py-[4px] text-sm text-white font-bold top-[-22px]">
                모임 종료까지 {daysUntilEnd}일
              </div>
            ) : null;

          const category = group.categories_major?.category_major_name;

          return (
            <div
              key={group.group_id}
              className="relative flex border rounded-[5px] border-[#acacac] p-[13px] w-[1024px] h-[123px]"
            >
              {/* 클릭 시 상세 페이지 이동 */}
              <div
                onClick={() => navigate(`/groupcontent/${group.group_id}`)}
                className="flex-1 flex cursor-pointer select-none"
              >
                {badge}
                <div className="w-[150px] h-[96px] rounded-[5px] overflow-hidden border border-[#9c9c9c]">
                  <img
                    src={group.image_urls?.[0] || '/nullbg.jpg'}
                    alt="모임사진"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="px-4 flex flex-col justify-between">
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-bold">{group.group_title}</p>
                    <span className="px-[6px] py-[2px] bg-[#FF5252] text-sm font-bold text-white rounded-[5px]">
                      {category}
                    </span>
                  </div>
                  <div>
                    <p>{group.group_short_intro || '모임 소개가 없습니다.'}</p>
                  </div>
                  <div className="flex gap-12 text-sm text-[#6C6C6C]">
                    <div>
                      {fmt(group.group_start_day)} ~ {fmt(group.group_end_day)}
                    </div>
                    <div className="flex gap-1">
                      <img src="/humen.svg" alt="모임 참여자 아이콘" />
                      {group.member_count ?? 0}/{group.group_capacity ?? '∞'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 후기작성 버튼 (클릭 시 이벤트 전파 막고 모달 열기) */}
              {group.status === 'closed' && (
                <button
                  className="absolute right-12 top-[50%] translate-y-[-50%] px-[11px] py-[4px] border border-brand rounded-[5px] text-brand text-[15px] bg-white z-[999] hover:bg-brand hover:text-white transition duration-300 ease-in-out"
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentReview(createEmptyReview());
                    setCurrentGroupId(group.group_id);
                    setModalOpen(true);
                  }}
                >
                  후기작성
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* 후기 작성 모달 */}
      {modalOpen && currentReview && currentGroupId && (
        <CreateReview
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          review={currentReview}
          groupId={currentGroupId}
          onSuccess={({ review_id }) => {
            // 후기 등록 성공 후 추가 후속 처리 가능
            setModalOpen(false);
          }}
        />
      )}
    </>
  );
}
