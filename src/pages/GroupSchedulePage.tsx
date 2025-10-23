import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';
import FullCalendar from '@fullcalendar/react';
import GroupCalendar from '../components/groupSchedule/GroupCalendar';
import GroupScheduleHeader from '../components/groupSchedule/GroupScheduleHeader';
import GroupScheduleList from '../components/groupSchedule/GroupScheduleList';
import ScheduleModal from '../components/groupSchedule/ScheduleModal';
import GroupDashboardLayout from '../components/layout/GroupDashboardLayout';
import { useSchedule } from '../contexts/ScheduleContext';
import { useGroupMember } from '../contexts/GroupMemberContext';
import '../css/calendar.css';
import '../index.css';

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
  const { id: groupId } = useParams<{ id: string }>();
  const { schedules, fetchSchedules, addSchedule, updateSchedule, deleteSchedule, clearSchedules } =
    useSchedule();
  const { members, fetchMembers } = useGroupMember();

  const [isLeader, setIsLeader] = useState(false);
  const [monthLabel, setMonthLabel] = useState('');
  const [monthRange, setMonthRange] = useState<{ start: string; end: string } | null>(null);

  const [open, setOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const calendarRef = useRef<FullCalendar | null>(null);
  const asideRef = useRef<HTMLDivElement | null>(null);

  const [form, setForm] = useState<ScheduleForm>({
    startDate: null,
    endDate: null,
    startTime: null,
    endTime: null,
    title: '',
    location: '',
    noRegion: false,
  });

  // 현재 유저가 host인지 아닌지?
  useEffect(() => {
    if (!groupId) return;
    fetchMembers(groupId);
  }, [groupId, fetchMembers]);

  useEffect(() => {
    const host = members.find(m => m.group_id === groupId && m.member_role === 'host');
    setIsLeader(!!host);
  }, [members, groupId]);

  // 월 변경 시 일정 불러오기
  useEffect(() => {
    if (groupId && monthRange) {
      clearSchedules();
      fetchSchedules(groupId, monthRange.start, monthRange.end);
    }
  }, [groupId, monthRange, fetchSchedules, clearSchedules]);

  // 캘린더 이동
  const handlePrev = () => calendarRef.current?.getApi().prev();
  const handleNext = () => calendarRef.current?.getApi().next();

  // 일정 등록
  const handleAddEvent = async () => {
    if (!groupId || !form.startDate || !form.startTime) return;

    const start = dayjs(form.startDate).hour(form.startTime.hour()).minute(form.startTime.minute());
    const end =
      form.endDate && form.endTime
        ? dayjs(form.endDate).hour(form.endTime.hour()).minute(form.endTime.minute())
        : start.add(2, 'hour');

    await addSchedule({
      group_id: groupId,
      user_id: null,
      schedule_title: form.title || '새 일정',
      schedule_place_name: form.noRegion ? '지역 무관' : form.location,
      schedule_start_at: start.toISOString(),
      schedule_end_at: end.toISOString(),
    });

    setOpen(false);
    setForm({
      startDate: null,
      endDate: null,
      startTime: null,
      endTime: null,
      title: '',
      location: '',
      noRegion: false,
    });
  };

  // 일정 수정
  const handleUpdateEvent = async (updated: ScheduleForm & { id: string }) => {
    await updateSchedule(updated.id, {
      schedule_title: updated.title,
      schedule_place_name: updated.noRegion ? '지역 무관' : updated.location,
      schedule_start_at: dayjs(updated.startDate)
        .hour(updated.startTime?.hour() || 0)
        .minute(updated.startTime?.minute() || 0)
        .toISOString(),
      schedule_end_at: dayjs(updated.endDate)
        .hour(updated.endTime?.hour() || 0)
        .minute(updated.endTime?.minute() || 0)
        .toISOString(),
    });
  };

  // 일정 삭제
  const handleDeleteEvent = async (id: string) => {
    await deleteSchedule(id);
  };

  const styledEvents = schedules.map(s => ({
    id: s.schedule_id,
    title: s.schedule_title || '[모임 일정]',
    start: s.schedule_start_at,
    end: s.schedule_end_at,
    location: s.schedule_place_name,
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
    textColor: '#fff',
    extendedProps: {
      tooltip: `${s.schedule_title ?? ''}\n${dayjs(s.schedule_start_at).format('HH:mm')} - ${dayjs(
        s.schedule_end_at,
      ).format('HH:mm')}\n${s.schedule_place_name ?? ''}`,
    },
  }));

  return (
    <GroupDashboardLayout>
      <div className="bg-white shadow-card rounded-sm p-6 flex flex-col h-[770px]">
        <GroupScheduleHeader
          monthLabel={monthLabel}
          handlePrev={handlePrev}
          handleNext={handleNext}
          isLeader={isLeader}
          onOpenModal={() => setOpen(true)}
        />

        <div className="flex gap-6 flex-1">
          <GroupScheduleList
            monthLabel={monthLabel}
            events={schedules}
            selectedEventId={selectedEventId}
            asideRef={asideRef}
            onUpdateEvent={handleUpdateEvent}
            onDeleteEvent={handleDeleteEvent}
          />

          <section className="flex-1 flex justify-end items-stretch">
            <div className="w-full h-full flex justify-end">
              <GroupCalendar
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
    </GroupDashboardLayout>
  );
}

export default GroupSchedulePage;
