import FullCalendar from '@fullcalendar/react';
import { Link } from 'react-router-dom';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { DateSelectArg, EventClickArg } from '@fullcalendar/core/index.js';

const DashboardMiniCalendar = () => {
  const handleClick = (info: EventClickArg) => {
    console.log(info.event.title);
    alert(`제목: ${info.event.title} 입니다.`);
  };

  return (
    <div className="p-5">
      {/* 제목 */}
      <div className="flex justify-between mb-4">
        <p className="text-xl font-bold">일정</p>
        <Link to={'/groupschedule/:id'} className="flex gap-1 items-center text-[#8C8C8C] text-sm">
          <img src="/plus_gray.svg" alt="더보기" />
          더보기
        </Link>
      </div>
      {/* 다가오는일정 */}
      <div className="mb-9">
        <div className="mb-3">
          <p className="text-brand font-bold">다가오는 일정</p>
        </div>
        <div>
          <div className="flex gap-3 border border-gray-300 p-2 rounded-[5px] items-center mb-3">
            <p className="text-gray-600">9월 22일</p>
            <span className="bg-black w-[2px] h-[19px]"></span>
            <p className="text-[#FF5252] font-bold">[정기모임] 팀장 없음</p>
          </div>
          <div className="flex gap-3 border border-gray-300 p-2 rounded-[5px] items-center">
            <p className="text-gray-600">9월 22일</p>
            <span className="bg-black w-[2px] h-[19px]"></span>
            <p className="text-[#FF5252] font-bold">[정기모임] 팀장 없음</p>
          </div>
        </div>
      </div>
      {/* 전체일정 */}
      <div>
        <div className="mb-3">
          <p className="text-brand font-bold">전체 일정</p>
        </div>
        <div>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            //   events={events}
            eventClick={e => handleClick(e)}
            height={'auto'}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardMiniCalendar;
