// 미치겟다 진자로

import FullCalendar from '@fullcalendar/react';
import dayjs, { Dayjs } from 'dayjs';
import { useRef, useState } from 'react';
import GroupCalendar from '../components/groupSchedule/GroupCalendar';
import GroupScheduleHeader from '../components/groupSchedule/GroupScheduleHeader';
import GroupScheduleList from '../components/groupSchedule/GroupScheduleList';
import ScheduleModal from '../components/groupSchedule/ScheduleModal';
import GroupDashboardLayout from '../components/layout/GroupDashboardLayout';
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
  const isLeader = true;

  // 캘린더 제어용 ref
  const calendarRef = useRef<FullCalendar | null>(null);
  const [monthLabel, setMonthLabel] = useState(''); // 월 표시

  const asideRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState([
    {
      id: '1',
      title: '[정기모임] 일일청소다람쥐돌이',
      start: '2025-09-05T20:00:00',
      end: '2025-09-05T22:00:00',
      location: '대구 중구 무슨피시방',
    },
    {
      id: '2',
      title: '[정기모임] 일일청소다람쥐돌이',
      start: '2025-09-08T20:00:00',
      end: '2025-09-08T22:00:00',
      location: '대구 중구 무슨피시방',
    },
    {
      id: '3',
      title: '[정기모임] 일일청소다람쥐돌이',
      start: '2025-09-12T20:00:00',
      end: '2025-09-12T22:00:00',
      location: '대구 중구 무슨피시방',
    },
    {
      id: '4',
      title: '[정기모임] 일일청소다람쥐돌이',
      start: '2025-09-20T20:00:00',
      end: '2025-09-20T22:00:00',
      location: '야외',
    },
  ]);

  // 클릭된 일정 하이라이트용 상태
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // FullCalendar로 전달할 일정 데이터
  const styledEvents = events.map(ev => ({
    ...ev,
    backgroundColor: '#3B82F6', // 브랜드 색상
    borderColor: '#3B82F6',
    textColor: '#fff',
    extendedProps: {
      tooltip: `${ev.title}\n${dayjs(ev.start).format('HH:mm')} - ${dayjs(ev.end).format('HH:mm')}\n${ev.location}`,
    },
  }));

  const handlePrev = () => calendarRef.current?.getApi().prev();
  const handleNext = () => calendarRef.current?.getApi().next();

  const [form, setForm] = useState<ScheduleForm>({
    startDate: null,
    endDate: null,
    startTime: null,
    endTime: null,
    title: '',
    location: '',
    noRegion: false,
  });

  const handleAddEvent = () => {
    if (!form.startDate || !form.startTime) return;
    const start = dayjs(form.startDate).hour(form.startTime.hour()).minute(form.startTime.minute());
    const end =
      form.endDate && form.endTime
        ? dayjs(form.endDate).hour(form.endTime.hour()).minute(form.endTime.minute())
        : start.add(2, 'hour');

    setEvents(prev => [
      ...prev,
      {
        id: String(prev.length + 1),
        title: form.title || '새 일정',
        start: start.toISOString(),
        end: end.toISOString(),
        location: form.noRegion ? '지역 무관' : form.location,
      },
    ]);
    setOpen(false);
  };

  // 일정 수정
  const handleUpdateEvent = (updatedEvent: ScheduleForm & { id: string }) => {
    setEvents(prev =>
      prev.map(e =>
        e.id === updatedEvent.id
          ? {
              ...e,
              title: updatedEvent.title,
              start: dayjs(updatedEvent.startDate)
                .hour(updatedEvent.startTime?.hour() || 0)
                .minute(updatedEvent.startTime?.minute() || 0)
                .toISOString(),
              end: dayjs(updatedEvent.endDate)
                .hour(updatedEvent.endTime?.hour() || 0)
                .minute(updatedEvent.endTime?.minute() || 0)
                .toISOString(),
              location: updatedEvent.noRegion ? '지역 무관' : updatedEvent.location,
            }
          : e,
      ),
    );
  };

  return (
    <GroupDashboardLayout>
      <div className="bg-white shadow-card rounded-sm p-6 flex flex-col h-[770px]">
        {/* 상단 헤더: 좌측 제목 / 우측 월 내비 + 버튼 */}
        <GroupScheduleHeader
          monthLabel={monthLabel}
          handlePrev={handlePrev}
          handleNext={handleNext}
          isLeader={isLeader}
          onOpenModal={() => setOpen(true)}
        />

        {/* 본문: 좌 리스트 / 우 캘린더 */}
        <div className="flex gap-6 flex-1">
          {/* 좌측 일정 리스트 */}
          <GroupScheduleList
            monthLabel={monthLabel}
            events={events}
            selectedEventId={selectedEventId}
            asideRef={asideRef}
            onUpdateEvent={handleUpdateEvent}
          />

          {/* 오른쪽 캘린더 */}
          <section className="flex-1 flex justify-end items-stretch">
            <div className="w-full h-full flex justify-end">
              <GroupCalendar
                styledEvents={styledEvents}
                calendarRef={calendarRef}
                asideRef={asideRef}
                setMonthLabel={setMonthLabel}
                setSelectedEventId={setSelectedEventId}
              />
            </div>
          </section>
        </div>

        {/* 모달 */}
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
