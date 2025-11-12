import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import dayjs, { Dayjs } from "dayjs";
import FullCalendar from "@fullcalendar/react";
import GroupCalendar from "../components/groupSchedule/GroupCalendar";
import GroupScheduleHeader from "../components/groupSchedule/GroupScheduleHeader";
import GroupScheduleList from "../components/groupSchedule/GroupScheduleList";
import ScheduleModal from "../components/groupSchedule/ScheduleModal";
import GroupDashboardLayout from "../components/layout/GroupDashboardLayout";
import { useSchedule } from "../contexts/ScheduleContext";
import { useGroupMember } from "../contexts/GroupMemberContext";
import "../css/calendar.css";
import "../index.css";
import { useAuth } from "../contexts/AuthContext";

interface ScheduleForm {
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  title: string;
  location: string;
  noRegion: boolean;
}

function GroupSchedulePage() {
  const navigate = useNavigate();
  const { id: groupId } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const {
    schedules,
    fetchSchedules,
    addSchedule,
    updateSchedule,
    deleteSchedule,
  } = useSchedule();
  const { members, fetchMembers } = useGroupMember();

  const [isLeader, setIsLeader] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [monthLabel, setMonthLabel] = useState("");
  const [monthRange, setMonthRange] = useState<{
    start: string;
    end: string;
  } | null>(null);

  const [open, setOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const calendarRef = useRef<FullCalendar | null>(null);
  const asideRef = useRef<HTMLDivElement | null>(null);

  const [form, setForm] = useState<ScheduleForm>({
    startDate: null,
    endDate: null,
    startTime: null,
    endTime: null,
    title: "",
    location: "",
    noRegion: false,
  });

  // 로그인 여부 확인 (비로그인 접근 차단)
  useEffect(() => {
    if (authLoading) return;
    if (!user) navigate("/login");
  }, [user, authLoading, navigate]);

  // 그룹 멤버 목록 조회
  useEffect(() => {
    if (!groupId) return;
    fetchMembers(groupId);
  }, [groupId, fetchMembers]);

  // 로그인한 사용자가 멤버인지 / 호스트인지
  useEffect(() => {
    if (!groupId || !user?.id) {
      setIsLeader(false);
      setIsMember(false);
      return;
    }

    const myMembership = members.find(
      (m) => m.group_id === groupId && m.user_id === user.id,
    );

    if (!myMembership) {
      setIsMember(false);
      setIsLeader(false);
      return;
    }

    setIsMember(true);
    setIsLeader(myMembership.member_role === "host");
  }, [members, groupId, user?.id]);

  // 월 범위 변경 시 일정 조회
  useEffect(() => {
    if (groupId && monthRange) {
      fetchSchedules(groupId, monthRange.start, monthRange.end);
    }
  }, [groupId, monthRange, fetchSchedules]);

  // 캘린더 이동
  const handlePrev = () => calendarRef.current?.getApi().prev();
  const handleNext = () => calendarRef.current?.getApi().next();

  // 모달 열기: 모임장만 ㄱㄴ
  const handleOpenModal = () => {
    if (!isLeader) return;
    setOpen(true);
  };

  // 일정 등록: 모임장만 ㄱㄴ
  const handleAddEvent = async () => {
    if (!isLeader) return;
    if (!groupId || !user?.id) return;
    if (!form.title.trim()) return;
    if (!form.startDate || !form.startTime) return;

    const start = dayjs(form.startDate)
      .hour(form.startTime.hour())
      .minute(form.startTime.minute());

    const computedEnd =
      form.endDate && form.endTime
        ? dayjs(form.endDate)
            .hour(form.endTime.hour())
            .minute(form.endTime.minute())
        : start.add(2, "hour");

    const end = computedEnd.isBefore(start) ? start : computedEnd;

    await addSchedule({
      group_id: groupId,
      user_id: user.id,
      schedule_title: form.title.trim(),
      schedule_place_name: form.noRegion ? "지역 무관" : form.location,
      schedule_start_at: start.toISOString(),
      schedule_end_at: end.toISOString(),
    });

    setOpen(false);
    setForm({
      startDate: null,
      endDate: null,
      startTime: null,
      endTime: null,
      title: "",
      location: "",
      noRegion: false,
    });
  };

  // 일정 수정: 모임장만 ㄱㄴ
  const handleUpdateEvent = async (updated: ScheduleForm & { id: string }) => {
    if (!isLeader) return;
    if (!updated.title.trim()) return;
    if (!updated.startDate || !updated.startTime) return;

    const start = dayjs(updated.startDate)
      .hour(updated.startTime.hour())
      .minute(updated.startTime.minute());

    const computedEnd =
      updated.endDate && updated.endTime
        ? dayjs(updated.endDate)
            .hour(updated.endTime.hour())
            .minute(updated.endTime.minute())
        : start.add(2, "hour");

    const end = computedEnd.isBefore(start) ? start : computedEnd;

    await updateSchedule(updated.id, {
      schedule_title: updated.title.trim(),
      schedule_place_name: updated.noRegion ? "지역 무관" : updated.location,
      schedule_start_at: start.toISOString(),
      schedule_end_at: end.toISOString(),
    });
  };

  // 일정 삭제: 모임장만 ㄱㄴ
  const handleDeleteEvent = async (id: string) => {
    if (!isLeader) return;
    await deleteSchedule(id);
  };

  return (
    <GroupDashboardLayout>
      {!user ? (
        // 멤버가 아닌 경우 접근 xxxx
        <div className="flex justify-center items-center h-[600px] text-lg font-medium">
          로그인 후 이용 가능합니다.
        </div>
      ) : !isMember ? (
        // 멤버가 아닌 경우 접근 xxxx
        <div className="flex justify-center items-center h-[600px] text-lg font-medium">
          이 모임의 멤버만 접근할 수 있습니다.
        </div>
      ) : (
        <div className="bg-white shadow-card rounded-sm p-6 flex flex-col h-[770px]">
          <GroupScheduleHeader
            monthLabel={monthLabel}
            handlePrev={handlePrev}
            handleNext={handleNext}
            isLeader={isLeader}
            onOpenModal={handleOpenModal}
          />

          <div className="flex gap-6 flex-1">
            <GroupScheduleList
              monthLabel={monthLabel}
              events={schedules}
              selectedEventId={selectedEventId}
              asideRef={asideRef}
              onUpdateEvent={handleUpdateEvent}
              onDeleteEvent={handleDeleteEvent}
              isHost={isLeader}
            />

            <section className="flex-1 flex justify-end items-stretch">
              <div className="w-full h-full flex justify-end">
                <GroupCalendar
                  setMonthRange={setMonthRange}
                  calendarRef={calendarRef}
                  asideRef={asideRef}
                  setMonthLabel={setMonthLabel}
                  setSelectedEventId={setSelectedEventId}
                />
              </div>
            </section>
          </div>

          <ScheduleModal
            open={open}
            form={form}
            setForm={setForm}
            onCancel={() => setOpen(false)}
            onSubmit={handleAddEvent}
          />
        </div>
      )}
    </GroupDashboardLayout>
  );
}

export default GroupSchedulePage;
