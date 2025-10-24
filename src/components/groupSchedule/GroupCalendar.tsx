import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import { useSchedule } from '../../contexts/ScheduleContext';

interface GroupCalendarProps {
  calendarRef: React.RefObject<FullCalendar>;
  asideRef: React.RefObject<HTMLDivElement>;
  setMonthLabel: React.Dispatch<React.SetStateAction<string>>;
  setSelectedEventId: React.Dispatch<React.SetStateAction<string | null>>;
  setMonthRange: React.Dispatch<React.SetStateAction<{ start: string; end: string } | null>>;
}

/**
 * 그룹 일정 달력 컴포넌트
 * - FullCalendar 기반 월별 캘린더
 * - 일정 hover → tooltip 표시
 * - 일정 클릭 → 왼쪽 리스트로 스크롤 이동
 * - 월 변경 시 Supabase에서 fetchSchedules() 호출
 */

function GroupCalendar({
  calendarRef,
  asideRef,
  setMonthLabel,
  setSelectedEventId,
  setMonthRange,
}: GroupCalendarProps) {
  const { schedules } = useSchedule();
  // const prevMonthRef = useRef<string | null>(null);

  // FullCalendar 표시용 이벤트 변환 로직
  const events = schedules.map(s => ({
    id: s.schedule_id,
    title: s.schedule_title || '[모임 일정]',
    start: s.schedule_start_at,
    end: s.schedule_end_at ?? undefined,
    location: s.schedule_place_name || '',
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
    textColor: '#fff',
    extendedProps: {
      tooltip: `${s.schedule_title ?? ''}\n${dayjs(s.schedule_start_at).format('HH:mm')} - ${dayjs(
        s.schedule_end_at,
      ).format('HH:mm')}\n${s.schedule_place_name ?? ''}`,
    },
  }));

  // Tooltip 초기화 (클린업)
  useEffect(() => {
    return () => {
      document.querySelectorAll('.calendar-tooltip').forEach(el => el.remove());
    };
  }, []);

  // 월 변경 시 라벨과 월 범위 동기화
  const handleDatesSet = (info: any) => {
    const label = info.view.title.replace(/^\d+년\s*/, '');
    setMonthLabel(label);

    const start = dayjs(info.startStr).startOf('month').toISOString();
    const end = dayjs(info.startStr).endOf('month').toISOString();
    setMonthRange({ start, end });
  };

  return (
    <section className="flex-1 flex justify-end items-stretch">
      <div className="w-full h-full flex justify-end">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={false}
          locale="ko"
          fixedWeekCount={false}
          showNonCurrentDates
          height="100%"
          contentHeight="100%"
          expandRows={false}
          dayMaxEventRows={3}
          moreLinkClick="popover"
          events={events}
          datesSet={handleDatesSet}
          eventDidMount={info => {
            const tooltip = document.createElement('div');
            tooltip.innerText = info.event.extendedProps.tooltip;
            tooltip.classList.add('calendar-tooltip');
            tooltip.style.position = 'absolute';
            tooltip.style.background = 'rgba(0,0,0,0.75)';
            tooltip.style.color = '#fff';
            tooltip.style.fontSize = '12px';
            tooltip.style.padding = '6px 8px';
            tooltip.style.borderRadius = '6px';
            tooltip.style.whiteSpace = 'pre-line';
            tooltip.style.zIndex = '9999';
            tooltip.style.pointerEvents = 'none';
            tooltip.style.display = 'none';
            document.body.appendChild(tooltip);

            info.el.addEventListener('mouseenter', e => {
              tooltip.style.display = 'block';
              tooltip.style.left = e.pageX + 10 + 'px';
              tooltip.style.top = e.pageY + 10 + 'px';
            });
            info.el.addEventListener('mousemove', e => {
              tooltip.style.left = e.pageX + 10 + 'px';
              tooltip.style.top = e.pageY + 10 + 'px';
            });
            info.el.addEventListener('mouseleave', () => {
              tooltip.style.display = 'none';
            });
          }}
          eventClick={info => {
            setSelectedEventId(info.event.id);
            const target = document.getElementById(`event-${info.event.id}`);
            if (target && asideRef.current) {
              asideRef.current.scrollTo({
                top: target.offsetTop - asideRef.current.clientHeight / 2 + target.clientHeight / 2,
                behavior: 'smooth',
              });
            }
          }}
          eventDisplay="block"
          eventContent={arg => {
            const sameDayEvents = arg.view.calendar
              .getEvents()
              .filter(e => dayjs(e.start).isSame(arg.event.start, 'day'));
            const count = sameDayEvents.length;
            const baseHeight = 60;
            const height = Math.max(16, baseHeight / count);
            return (
              <div
                style={{
                  height: `${height}px`,
                  lineHeight: '16px',
                  overflow: 'hidden',
                  borderRadius: '4px',
                  padding: '2px 4px',
                  marginBottom: '2px',
                }}
              >
                {arg.event.title}
              </div>
            );
          }}
        />
      </div>
    </section>
  );
}

export default GroupCalendar;
