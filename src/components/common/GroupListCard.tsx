import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useCallback, memo } from "react";
import { useGroupMember } from "../../contexts/GroupMemberContext";
import LazyImage from "../common/LazyImage";

export type GroupListCardProps = {
  group_id: string;
  group_title: string;
  group_short_intro?: string | null;
  category_major_name: string;
  category_sub_name: string;
  group_region?: string | null;
  status: "recruiting" | "closed" | "finished";
  image_urls?: string[] | null;
  member_count?: number;
  group_capacity?: number | null;
  group_start_day: string;
  group_end_day: string;
};

function GroupListCard(props: GroupListCardProps) {
  const {
    group_id,
    group_title,
    group_short_intro,
    category_major_name,
    category_sub_name,
    status,
    group_region,
    image_urls,
    member_count,
    group_capacity,
    group_start_day,
    group_end_day,
  } = props;

  const navigate = useNavigate();

  const { memberCounts, fetchMemberCount, subscribeToGroup } = useGroupMember();
  const currentCount =
    memberCounts[group_id] !== undefined
      ? memberCounts[group_id]
      : (member_count ?? 0);

  useEffect(() => {
    if (!group_id) return;
    fetchMemberCount(group_id);
    subscribeToGroup(group_id);
  }, [group_id, fetchMemberCount, subscribeToGroup]);

  const safeImageSrc = image_urls?.[0] ?? "/nullbg.jpg";

  // 상태 라벨 매핑 메모화
  const statusLabel = useMemo(
    () => ({
      recruiting: "모집중",
      closed: "모집마감",
      finished: "모임종료",
    }),
    [],
  );

  // 모임 유형 계산
  const groupType = useMemo(() => {
    const start = new Date(group_start_day);
    const end = new Date(group_end_day);
    const diff = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diff === 0) return "원데이";
    if (diff <= 31) return "단기모임";
    return "장기모임";
  }, [group_start_day, group_end_day]);

  // 상태 계산
  const computedStatus = useMemo(() => {
    const now = new Date();
    const start = new Date(group_start_day);
    const end = new Date(group_end_day);
    const isFull =
      (group_capacity ?? 0) > 0 && currentCount >= (group_capacity ?? 0);

    if (now > end) return "finished";
    if (now >= start || isFull) return "closed";
    return "recruiting";
  }, [group_start_day, group_end_day, currentCount, group_capacity]);

  // 디데이 계산
  const dday = useMemo(() => {
    const now = new Date();
    const start = new Date(group_start_day);
    if (now < start) {
      return Math.ceil(
        (start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );
    }
    return null;
  }, [group_start_day]);

  const handleClick = useCallback(() => {
    navigate(`/groupdetail/${group_id}`);
  }, [navigate, group_id]);

  return (
    <motion.div
      layout
      onClick={handleClick}
      className="flex flex-col sm:flex-row w-full max-w-[1024px] border border-gray-300 rounded-md bg-white shadow-sm hover:shadow-md cursor-pointer transition-all overflow-hidden"
    >
      {/* 이미지 영역 */}
      <div className="relative w-full h-[200px] sm:w-[300px] sm:h-[175px] overflow-hidden flex-shrink-0">
        <LazyImage
          src={safeImageSrc}
          alt="모임 이미지"
          className="absolute inset-0 w-full h-full object-cover rounded-t-md sm:rounded-t-none sm:rounded-l-md"
        />
      </div>

      {/* 텍스트 영역 */}
      <div className="flex-1 p-4 flex flex-col justify-between sm:h-[175px] gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base">
            <span
              className={`flex px-2 h-[23px] text-[13px] font-bold text-white rounded-2xl items-center justify-center ${
                computedStatus === "recruiting"
                  ? "bg-brand"
                  : computedStatus === "closed"
                    ? "bg-brand-red"
                    : "bg-gray-300"
              }`}
            >
              {statusLabel[computedStatus]}
            </span>

            <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate max-w-[80%]">
              {group_title}
            </h3>

            {dday !== null && (
              <span className="bg-[#BEC0C4] text-[13px] px-2 py-[1px] rounded-sm text-white font-bold">
                D-{dday}
              </span>
            )}

            <span className="text-[13px] font-semibold text-white bg-brand-orange px-2 py-[1px] rounded-sm">
              {groupType}
            </span>
          </div>

          <p className="mt-2 text-sm sm:text-base text-gray-500 line-clamp-2">
            {group_short_intro ?? "소개글이 없습니다."}
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap sm:items-center sm:justify-between text-xs sm:text-sm text-gray-500 mt-3 gap-1 sm:gap-2">
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-gray-600">
            <p className="text-[#FF5252] font-semibold whitespace-nowrap">
              <span>{category_major_name}</span>
              <span className="text-gray-300 mx-1">{">"}</span>
              <span className="text-gray-400">{category_sub_name}</span>
            </p>

            {group_region && (
              <p className="text-gray-400 whitespace-nowrap">{group_region}</p>
            )}

            <div className="flex items-center gap-1 whitespace-nowrap">
              <img
                src="/images/group_member.svg"
                alt="그룹멤버"
                className="w-[13px] h-[13px]"
              />
              <span className="font-medium text-gray-500">
                {currentCount} / {group_capacity ?? 0}명
              </span>
            </div>
          </div>

          <span className="text-gray-500 text-[13px] break-keep truncate sm:whitespace-nowrap sm:text-right mt-1 sm:mt-0 max-w-full">
            {group_start_day} ~ {group_end_day}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default memo(GroupListCard);
