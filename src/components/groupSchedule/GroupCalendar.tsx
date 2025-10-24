import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import type {
  DatesSetArg,
  EventContentArg,
  EventClickArg,
  EventMountArg,
} from '@fullcalendar/core';
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

  // FullCalendar 표시용 이벤트 변환 로직
  const events = schedules.map(schedule => ({
    id: schedule.schedule_id,
    title: schedule.schedule_title || '[모임 일정]',
    start: schedule.schedule_start_at,
    end: schedule.schedule_end_at ?? undefined,
    location: schedule.schedule_place_name || '',
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
    textColor: '#fff',
    extendedProps: {
      tooltip: `${schedule.schedule_title ?? ''}\n${dayjs(schedule.schedule_start_at).format('HH:mm')} - ${dayjs(
        schedule.schedule_end_at,
      ).format('HH:mm')}\n${schedule.schedule_place_name ?? ''}`,
    },
  }));

  // Tooltip 초기화 (클린업)
  useEffect(() => {
    return () => {
      document
        .querySelectorAll('.calendar-tooltip')
        .forEach(tooltipElement => tooltipElement.remove());
    };
  }, []);

  // 월 변경 시 라벨과 월 범위 동기화
  const handleDatesSet = (dateInfo: DatesSetArg) => {
    const monthLabel = dateInfo.view.title.replace(/^\d+년\s*/, '');
    setMonthLabel(monthLabel);

    // info.view.currentStart를 사용하여 현재 표시 중인 월의 정확한 범위 계산
    const currentMonth = dayjs(dateInfo.view.currentStart);
    const monthStartDate = currentMonth.startOf('month').toISOString();
    const monthEndDate = currentMonth.endOf('month').toISOString();
    setMonthRange({ start: monthStartDate, end: monthEndDate });
  };

  // 이벤트 마운트 시 툴팁 생성
  const handleEventDidMount = (mountInfo: EventMountArg) => {
    const tooltip = document.createElement('div');
    tooltip.innerText = mountInfo.event.extendedProps.tooltip;
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

    mountInfo.el.addEventListener('mouseenter', (mouseEvent: MouseEvent) => {
      tooltip.style.display = 'block';
      tooltip.style.left = mouseEvent.pageX + 10 + 'px';
      tooltip.style.top = mouseEvent.pageY + 10 + 'px';
    });

    mountInfo.el.addEventListener('mousemove', (mouseEvent: MouseEvent) => {
      tooltip.style.left = mouseEvent.pageX + 10 + 'px';
      tooltip.style.top = mouseEvent.pageY + 10 + 'px';
    });

    mountInfo.el.addEventListener('mouseleave', () => {
      tooltip.style.display = 'none';
    });
  };

  // 이벤트 클릭 처리
  const handleEventClick = (clickInfo: EventClickArg) => {
    setSelectedEventId(clickInfo.event.id);
    const targetElement = document.getElementById(`event-${clickInfo.event.id}`);
    if (targetElement && asideRef.current) {
      asideRef.current.scrollTo({
        top:
          targetElement.offsetTop -
          asideRef.current.clientHeight / 2 +
          targetElement.clientHeight / 2,
        behavior: 'smooth',
      });
    }
  };

  // 이벤트 컨텐츠 렌더링
  const renderEventContent = (eventArg: EventContentArg) => {
    const sameDayEvents = eventArg.view.calendar
      .getEvents()
      .filter(calendarEvent => dayjs(calendarEvent.start).isSame(eventArg.event.start, 'day'));
    const eventCount = sameDayEvents.length;
    const baseHeight = 60;
    const calculatedHeight = Math.max(16, baseHeight / eventCount);

    return (
      <div
        style={{
          height: `${calculatedHeight}px`,
          lineHeight: '16px',
          overflow: 'hidden',
          borderRadius: '4px',
          padding: '2px 4px',
          marginBottom: '2px',
        }}
      >
        {eventArg.event.title}
      </div>
    );
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
          eventDidMount={handleEventDidMount}
          eventClick={handleEventClick}
          eventDisplay="block"
          eventContent={renderEventContent}
        />
      </div>
    </section>
  );
}

export default GroupCalendar;
