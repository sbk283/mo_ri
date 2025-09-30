// 풀캘린더 사용함! 근데 UI 출력이 너무 어려워요.. 도와줭...............

import { useState } from 'react';
import GroupDashboardLayout from '../components/layout/GroupDashboardLayout';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';

import { Modal, DatePicker, TimePicker, Input, Checkbox, Button } from 'antd';
import { IoLocationSharp } from 'react-icons/io5';
import dayjs from 'dayjs';

function GroupSchedulePage() {
  // 권한 체크 (참여자면 false)
  const isLeader = true; // TODO: 유저 권한에 따라 변경

  // 모달 상태
  const [open, setOpen] = useState(false);

  // 일정 데이터 (FullCalendar용 events)
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

  // 모달 입력값 (간단히만 처리)
  const [form, setForm] = useState({
    startDate: null as any,
    endDate: null as any,
    startTime: null as any,
    endTime: null as any,
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

    const newEvent = {
      id: String(events.length + 1),
      title: form.title || '새 일정',
      start: start.toISOString(),
      end: end.toISOString(),
      location: form.noRegion ? '지역 무관' : form.location,
    };

    setEvents([...events, newEvent]);
    setOpen(false);
  };

  return (
    <GroupDashboardLayout>
      <div className="bg-white shadow-card h-[770px] p-6 rounded-sm flex flex-col">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            일정<span>관리</span>
          </h2>
          {isLeader && (
            <button
              onClick={() => setOpen(true)}
              className="px-4 py-2 bg-brand text-white rounded-md shadow hover:bg-brand-dark"
            >
              일정등록
            </button>
          )}
        </div>

        <div className="flex gap-6 flex-1">
          {/* 좌측 타임라인 */}
          <div className="flex flex-col">
            <span className="flex">09월 일정</span>
            <div className="w-[300px] border-r pr-4 space-y-4 overflow-y-auto custom-scrollbar">
              {events.map(s => (
                <div key={s.id} className="relative pl-6">
                  <span className="absolute left-0 top-0 h-full w-[2px] bg-gray-300"></span>

                  <p className="text-brand font-bold mb-1">{dayjs(s.start).format('DD일')}</p>
                  <div className="border rounded-md p-3 shadow-sm">
                    <p className="text-xs text-gray-500">
                      {dayjs(s.start).format('HH:mm')} - {dayjs(s.end).format('HH:mm')}
                    </p>
                    <p className="font-medium">{s.title}</p>
                    <p className="flex items-center text-sm text-gray-500 mt-1">
                      <IoLocationSharp className="text-brand mr-1" />
                      {s.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 우측 FullCalendar */}
          <div className="flex-1">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale="ko"
              events={events}
              height="100%"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,listWeek',
              }}
            />
          </div>
        </div>

        {/* 모달 */}
        <Modal
          title={<h3 className="text-lg font-bold text-brand">일정을 등록해 주세요.</h3>}
          open={open}
          onCancel={() => setOpen(false)}
          footer={null}
        >
          <div className="space-y-4">
            {/* 일정 */}
            <div className="grid grid-cols-2 gap-3">
              <DatePicker
                placeholder="시작 날짜 선택"
                className="w-full"
                onChange={v => setForm({ ...form, startDate: v })}
              />
              <DatePicker
                placeholder="종료 날짜 선택"
                className="w-full"
                onChange={v => setForm({ ...form, endDate: v })}
              />
            </div>

            {/* 시간 */}
            <div className="grid grid-cols-2 gap-3">
              <TimePicker
                placeholder="시작 시간 선택"
                className="w-full"
                format="HH:mm"
                onChange={v => setForm({ ...form, startTime: v })}
              />
              <TimePicker
                placeholder="종료 시간 선택"
                className="w-full"
                format="HH:mm"
                onChange={v => setForm({ ...form, endTime: v })}
              />
            </div>

            {/* 제목 */}
            <Input
              placeholder="제목을 입력하세요."
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />

            {/* 장소 */}
            <div className="flex gap-2 items-center">
              <Input
                placeholder="지역검색"
                className="flex-1"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                disabled={form.noRegion}
              />
              <Checkbox
                checked={form.noRegion}
                onChange={e => setForm({ ...form, noRegion: e.target.checked })}
              >
                지역 무관
              </Checkbox>
            </div>

            {/* 버튼 */}
            <div className="flex justify-end gap-2 pt-4">
              <Button onClick={() => setOpen(false)}>취소</Button>
              <Button type="primary" onClick={handleAddEvent}>
                확인
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </GroupDashboardLayout>
  );
}

export default GroupSchedulePage;
