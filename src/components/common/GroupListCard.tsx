import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useGroupMember } from "../../contexts/GroupMemberContext";

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

function GroupListCard({
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
}: GroupListCardProps) {
  const navigate = useNavigate();

  // Context 연결 (멤버 수 실시간 반영)
  const { memberCounts, fetchMemberCount, subscribeToGroup } = useGroupMember();
  const currentCount =
    memberCounts[group_id] !== undefined
      ? memberCounts[group_id]
      : (member_count ?? 0);

  // 최신 멤버 카운트 구독
  useEffect(() => {
    if (!group_id) return;
    fetchMemberCount(group_id);
    subscribeToGroup(group_id);
  }, [group_id, fetchMemberCount, subscribeToGroup]);

  // 대표 이미지 지정 (없을 경우 기본 이미지)
  const mainImage =
    image_urls && image_urls.length > 0 ? image_urls[0] : "/nullbg.jpg";

  const statusLabel = {
    recruiting: "모집중",
    closed: "모집마감",
    finished: "모임종료",
  } as const;

  // 모임 기간으로 유형 계산
  const calcGroupType = () => {
    const start = new Date(group_start_day);
    const end = new Date(group_end_day);
    const diffDays = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays === 0) return "원데이";
    if (diffDays <= 31) return "단기모임";
    return "장기모임";
  };

  const groupType = calcGroupType();

  // 날짜 기반 상태 계산
  const now = new Date();
  const start = new Date(group_start_day);
  const end = new Date(group_end_day);
  let dday: number | null = null;
  if (now < start) {
    dday = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  let computedStatus: "recruiting" | "closed" | "finished" = status;
  const isFull =
    (group_capacity ?? 0) > 0 && currentCount >= (group_capacity ?? 0);

  if (now > end) computedStatus = "finished";
  else if (now >= start || isFull) computedStatus = "closed";
  else computedStatus = "recruiting";

  return (
    <motion.div
      layout
      onClick={() => navigate(`/groupdetail/${group_id}`)}
      // 반응형: 모바일에서는 세로형, sm 이상에서는 가로형 카드
      className="flex flex-col sm:flex-row w-full max-w-[1024px] border border-gray-300 rounded-md bg-white shadow-sm hover:shadow-md cursor-pointer transition-all overflow-hidden"
    >
      {/* 이미지 영역 */}
      <div
        className="
          relative w-full h-[200px] sm:w-[300px] sm:h-[175px] 
          overflow-hidden flex-shrink-0
        "
      >
        <img
          src={mainImage}
          alt="모임 이미지"
          className="
            absolute inset-0 w-full h-full object-cover 
            rounded-t-md sm:rounded-t-none sm:rounded-l-md
          "
        />
      </div>

      {/* 텍스트 영역 */}
      <div
        className="
          flex-1 p-4 flex flex-col justify-between 
          sm:h-[175px] gap-2
        "
      >
        {/* 상단: 상태/제목/유형 */}
        <div>
          <div
            className="
              flex flex-wrap items-center gap-2 
              text-sm sm:text-base
            "
          >
            {/* 모집 상태 배지 */}
            <span
              className={`flex px-2 h-[23px] text-[13px] font-bold text-white rounded-2xl items-center justify-center
                ${
                  computedStatus === "recruiting"
                    ? "bg-brand"
                    : computedStatus === "closed"
                      ? "bg-brand-red"
                      : "bg-gray-300"
                }`}
            >
              {statusLabel[computedStatus]}
            </span>

            {/* 제목 */}
            <h3
              className="
                text-base sm:text-lg font-semibold text-gray-800 truncate max-w-[80%]
              "
            >
              {group_title}
            </h3>

            {/* D-day (시작 전일 때만) */}
            {dday !== null && (
              <span
                className="
                  bg-[#BEC0C4] text-[13px] sm:text-[13px] px-2 py-[1px] 
                  rounded-sm text-white font-bold
                "
              >
                D-{dday}
              </span>
            )}

            {/* 모임 유형 배지 */}
            <span
              className="
                text-[13px] sm:text-[13px] font-semibold text-white 
                bg-brand-orange px-2 py-[1px] rounded-sm
              "
            >
              {groupType}
            </span>
          </div>

          {/* 한 줄 소개 */}
          <p
            className="
              mt-2 text-sm sm:text-base text-gray-500 line-clamp-2
            "
          >
            {group_short_intro ?? "소개글이 없습니다."}
          </p>
        </div>

        {/* 하단: 카테고리 / 지역 / 인원 / 일정 */}
        <div
          className="
            flex flex-wrap sm:flex-nowrap sm:items-center sm:justify-between 
            text-xs sm:text-sm text-gray-500 mt-3 gap-1 sm:gap-2
          "
        >
          {/* 왼쪽 정보 (카테고리, 지역, 인원) */}
          <div
            className="
              flex flex-wrap items-center gap-3 sm:gap-6 
              text-gray-600
            "
          >
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

          {/* 오른쪽 일정 - 반응형으로 카드 내부 유지 */}
          <span
            className="
              text-gray-500 text-[13px] sm:text-[13px] 
              break-keep truncate
              sm:whitespace-nowrap sm:text-right mt-1 sm:mt-0
              max-w-full
            "
          >
            {group_start_day} ~ {group_end_day}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default GroupListCard;
