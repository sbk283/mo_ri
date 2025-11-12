import { useEffect, useMemo } from "react";
import { useGroupMember } from "../../../contexts/GroupMemberContext";

interface MeetingCardProps {
  groupId: string;
  groupCapacity: number;
  title: string;
  status: string;
  dday: string;
  summary?: string;
  category: string;
  subCategory: string;
  participants?: string;
  duration: string;
  width?: string;
  height?: string;
}

function MeetingCard({
  groupId,
  groupCapacity,
  title,
  status,
  dday,
  summary,
  category,
  subCategory,
  participants,
  duration,
  width = "100%",
  height = "auto",
}: MeetingCardProps) {
  const { memberCounts, fetchMemberCount, subscribeToGroup } = useGroupMember();
  const currentCount =
    memberCounts[groupId] !== undefined ? memberCounts[groupId] : 0;

  useEffect(() => {
    if (!groupId) return;
    fetchMemberCount(groupId);
    subscribeToGroup(groupId);
  }, [groupId, fetchMemberCount, subscribeToGroup]);

  // 날짜 계산
  const [startDateStr, endDateStr] = duration.split(" ~ ");
  const now = new Date();
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const isFull = groupCapacity > 0 && currentCount >= groupCapacity;

  // 상태 계산 (GroupListCard와 동일)
  const computedStatus = useMemo(() => {
    if (now > end) return "finished";
    if (now >= start || isFull) return "closed";
    return "recruiting"; // 모집중
  }, [now, start, end, isFull]);

  const statusLabel = useMemo(
    () => ({
      recruiting: "모집중",
      closed: "모집마감",
      finished: "모임종료",
    }),
    [],
  );

  // D-Day 표시: 종료 후 숨김
  const displayDday = now > end ? "" : dday;

  return (
    <div
      className="border border-[#c6c6c6] rounded-sm shadow p-4 bg-white flex flex-col justify-between"
      style={{ width, height }}
    >
      <div>
        <div className="flex items-center justify-between px-1 gap-2 pb-3">
          {/* 상태 */}
          <span
            className={`flex px-2 py-1 rounded-full text-white text-[13px] font-semibold ${
              computedStatus === "recruiting"
                ? "bg-[#3B82F6]"
                : computedStatus === "closed"
                  ? "bg-[#E06251]"
                  : "bg-gray-300"
            }`}
          >
            {statusLabel[computedStatus]}
          </span>

          <h2 className="flex-1 mx-1 text-[17px] font-semibold text-black truncate">
            {title}
          </h2>

          {displayDday && (
            <span className="text-white text-sm font-semibold bg-gray-300 rounded py-[1px] px-2">
              {displayDday}
            </span>
          )}
        </div>

        <p className="px-2 text-[15px] text-gray-800 leading-snug line-clamp-2 break-keep">
          {summary || "간략 소개가 없습니다."}
        </p>
      </div>

      <div className="flex items-center justify-between px-2 mt-3">
        <div className="flex items-center gap-2 text-[15px]">
          <span className="text-[#D83737] font-semibold">
            {category} &gt; {subCategory}
          </span>
          <span className="flex items-center gap-1 text-gray-600">
            <img
              src="/images/group_member.svg"
              alt="참여 인원"
              className="w-[15px] h-[15px]"
            />
            {participants ?? `${currentCount}/${groupCapacity}`}
          </span>
        </div>
        <span className="text-gray-500 font-medium">{duration}</span>
      </div>
    </div>
  );
}

export default MeetingCard;
