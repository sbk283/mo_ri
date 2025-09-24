import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

function WeekCalendar() {
  return (
    <div>
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridWeek"
        locale="ko"
        height={'185px'}
        // events={} 나중에 연동시에 넣을것.
        dayHeaderContent={args => (
          <span>{args.date.toLocaleDateString('ko-KR', { weekday: 'long' })}</span>
        )}
        dayCellContent={args => (
          <div className="pr-[110px] pt-1 font-bold text-lg">
            {args.date.getDate().toString().padStart(2, '0')}
          </div>
        )}
        headerToolbar={false}
        eventDisplay="block"
        timeZone="Asia/Seoul"
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
      />
    </div>
  );
}

export default WeekCalendar;
