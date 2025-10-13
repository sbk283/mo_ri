// 풀캘린더 (그룹 일정 달력 컴포넌트)
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import dayjs from 'dayjs';
import { useEffect } from 'react';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  location: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  extendedProps?: {
    tooltip: string;
  };
}

interface GroupCalendarProps {
  styledEvents: CalendarEvent[];
  calendarRef: React.RefObject<FullCalendar>;
  asideRef: React.RefObject<HTMLDivElement>;
  setMonthLabel: React.Dispatch<React.SetStateAction<string>>;
  setSelectedEventId: React.Dispatch<React.SetStateAction<string | null>>;
}

/**
 * 그룹 일정 달력 컴포넌트
 * - FullCalendar 기반 월별 캘린더
 * - 일정 hover → tooltip 표시
 * - 일정 클릭 → 왼쪽 리스트 스크롤 이동
 * - 같은 날짜 여러 일정 시 높이 자동 조절
 * - 일정이 많을 경우 (3개 이상) +n 더보기
 */

function GroupCalendar({
  styledEvents,
  calendarRef,
  asideRef,
  setMonthLabel,
  setSelectedEventId,
}: GroupCalendarProps) {
  useEffect(() => {
    return () => {
      document.querySelectorAll('.calendar-tooltip').forEach(el => el.remove());
    };
  }, []);

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
          showNonCurrentDates={true}
          height="100%"
          contentHeight="100%"
          expandRows={true}
          events={styledEvents}
          datesSet={info => {
            const label = info.view.title.replace(/^\d+년\s*/, '');
            setMonthLabel(label);
          }}
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
          // 일정이 많을 때 +N 더보기 기능 활성화
          dayMaxEventRows={3}
          moreLinkClick="popover"
          // 동일 날짜 일정 수에 따라 높이 자동 조절
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
                className="custom-event"
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
