import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { GroupWithCategory } from "../types/group";
import JoinGroupContentNon from "./JoinGroupContentNon";
import type { ReviewItem } from "./common/modal/CreateReview";
import CreateReview from "./common/modal/CreateReview";
import { supabase } from "../lib/supabase";

interface JoinGroupContentBoxProps {
  groups: GroupWithCategory[];
  loading: boolean;
}

export default function JoinGroupContentBox({
  groups,
  loading,
}: JoinGroupContentBoxProps) {
  const today = new Date();
  const fmt = (d: string) => (d ? d.replace(/-/g, ".") : "");
  const navigate = useNavigate();

  const [currentUserId, setCurrentUserId] = useState<string | null>(null); // 직접 로그인 유저 관리
  const [modalOpen, setModalOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState<ReviewItem | null>(null);
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewedGroupMap, setReviewedGroupMap] = useState<
    Record<string, string>
  >({});

  const createEmptyReview = (): ReviewItem => ({
    id: "",
    title: "",
    category: "",
    rating: 1,
    content: "",
    tags: [],
  });

  // 로그인 유저 아이디 직접 불러오기
  useEffect(() => {
    async function fetchUser() {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        setCurrentUserId(null);
      } else {
        setCurrentUserId(data.user.id);
      }
    }
    fetchUser();
  }, []);

  // 로그인 유저 변경 시마다 후기 데이터 가져오기
  useEffect(() => {
    async function fetchReviewed() {
      if (!currentUserId) {
        setReviewedGroupMap({});
        return;
      }
      const { data, error } = await supabase
        .from("group_reviews")
        .select("group_id, review_id")
        .eq("author_id", currentUserId);

      if (error || !data) {
        console.error("Failed to fetch reviewed groups:", error);
        setReviewedGroupMap({});
        return;
      }
      const map: Record<string, string> = {};
      data.forEach((item) => {
        if (item.group_id && item.review_id) {
          map[item.group_id] = item.review_id;
        }
      });
      setReviewedGroupMap(map);
    }
    fetchReviewed();
  }, [currentUserId]);

  const openCreateReviewModal = (group: GroupWithCategory) => {
    if (reviewedGroupMap[String(group.group_id)] || isSubmitting) return;
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
            className="w-[1024px] h-[123px] border rounded-[5px] border-[#f5f5f7] p-[10px] relative flex animate-pulse"
          >
            <div className="w-[150px] h-[96px] rounded-[5px] bg-gray-100" />
            <div className="px-4 flex-1">
              <div className="h-4 w-2/3 bg-gray-100 rounded mt-2" />
              <div className="h-4 w-1/2 bg-gray-100 rounded mt-3" />
              <div className="h-3 w-1/3 bg-gray-100 rounded mt-4" />
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
        {groups.map((group) => {
          const hasReview =
            reviewedGroupMap[String(group.group_id)] !== undefined;

          const startDate = new Date(group.group_start_day);
          const endDate = new Date(group.group_end_day);
          const daysUntilOpen = Math.max(
            0,
            Math.ceil(
              (startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
            ),
          );
          const daysUntilEnd = Math.max(
            0,
            Math.ceil(
              (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
            ),
          );

          const badge =
            daysUntilOpen > 0 ? (
              <div className="absolute rounded-[5px] bg-gray-300 px-[10px] py-[4px] text-sm text-white font-bold top-[-22px]">
                모임 오픈까지 {daysUntilOpen}일
              </div>
            ) : group.status === "recruiting" ? (
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
              <div
                onClick={() => navigate(`/groupcontent/${group.group_id}`)}
                className="flex-1 flex cursor-pointer select-none"
              >
                {badge}
                <div className="w-[150px] h-[96px] rounded-[5px] overflow-hidden border border-[#9c9c9c]">
                  <img
                    src={group.image_urls?.[0] || "/nullbg.jpg"}
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
                    <p>{group.group_short_intro || "모임 소개가 없습니다."}</p>
                  </div>
                  <div className="flex gap-12 text-sm text-[#6C6C6C]">
                    <div>
                      {fmt(group.group_start_day)} ~ {fmt(group.group_end_day)}
                    </div>
                    <div className="flex gap-1">
                      <img src="/humen.svg" alt="모임 참여자 아이콘" />
                      {group.member_count ?? 0}/{group.group_capacity ?? "∞"}
                    </div>
                  </div>
                </div>
              </div>

              {group.status === "closed" ? (
                <button
                  disabled={hasReview || isSubmitting}
                  className={
                    `absolute right-12 top-[50%] translate-y-[-50%] px-[11px] py-[4px] rounded-[5px] text-[15px] z-[5] border transition duration-300 ease-in-out ` +
                    (hasReview
                      ? "bg-gray-100 border-[#6c6c6c] text-[#6c6c6c] cursor-not-allowed"
                      : "border-brand text-brand bg-white hover:bg-brand hover:text-white cursor-pointer")
                  }
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!hasReview && !isSubmitting)
                      openCreateReviewModal(group);
                  }}
                >
                  {hasReview
                    ? "작성 완료"
                    : isSubmitting
                      ? "등록 중..."
                      : "후기작성"}
                </button>
              ) : (
                <div className="absolute right-12 top-[50%] translate-y-[-50%] cursor-pointer">
                  <img src="/images/swiper_next.svg" alt="상세보기" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {modalOpen && currentReview && currentGroupId && (
        <CreateReview
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setIsSubmitting(false);
          }}
          groupId={currentGroupId}
          onSuccess={() => {
            setModalOpen(false);
            setIsSubmitting(false);
            setReviewedGroupMap((prev) => ({
              ...prev,
              [currentGroupId!]: "registered",
            }));
          }}
        />
      )}
    </>
  );
}
