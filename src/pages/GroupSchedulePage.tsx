// 미치겟다 진자로

import { useRef, useState } from 'react';
import dayjs from 'dayjs';
import GroupDashboardLayout from '../components/layout/GroupDashboardLayout';
import { IoLocationSharp } from 'react-icons/io5';
import { Modal, DatePicker, TimePicker, Input, Checkbox, Button } from 'antd';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import '../css/calendar.css';
import '../index.css';

function GroupSchedulePage() {
  const isLeader = true;

  // 캘린더 제어용 ref
  const calendarRef = useRef<FullCalendar | null>(null);
  const [monthLabel, setMonthLabel] = useState(''); // "9월" 표시

  const handlePrev = () => calendarRef.current?.getApi().prev();
  const handleNext = () => calendarRef.current?.getApi().next();

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

  return (
    <GroupDashboardLayout>
      <div className="bg-white shadow-card rounded-sm p-6 flex flex-col h-[770px]">
        {/* 상단 헤더: 좌측 제목 / 우측 월 내비 + 버튼 */}
        <div className="flex items-center justify-between">
          <h2 className="text-black text-[28px] font-semibold pb-8">일정관리</h2>

          <div className="flex items-center gap-48">
            {/* 월 네비게이션 (< n월 >) */}
            <div className="flex items-center gap-10 text-sky-600 text-2xl font-semibold">
              <button
                onClick={handlePrev}
                className="px-2 py-1 rounded hover:bg-gray-100 focus:outline-none"
                aria-label="이전 달"
              >
                <img src="/images/left_arrow.svg" alt="왼쪽화살표" />
              </button>
              <span className="text-lg font-semibold">{monthLabel || '월'}</span>
              <button
                onClick={handleNext}
                className="px-2 py-1 rounded hover:bg-gray-100 focus:outline-none"
                aria-label="다음 달"
              >
                <img src="/images/right_arrow.svg" alt="오른쪽 화살표" />
              </button>
            </div>

            {/* 일정등록 버튼 */}
            {isLeader && (
              <button
                onClick={() => setOpen(true)}
                className="px-4 py-2 bg-brand text-white rounded-md shadow hover:bg-brand-dark focus:outline-none"
              >
                일정등록
              </button>
            )}
          </div>
        </div>

        {/* 본문: 좌 리스트 / 우 캘린더 */}
        <div className="flex gap-6 flex-1">
          {/* 좌측 일정 리스트 */}
          <aside
            style={{
              width: '300px',
              paddingRight: '4px',
              overflowY: 'auto',
              height: '630px',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(66,148,207,0.5) transparent',
            }}
            className="w-[300px] pr-1 overflow-y-auto h-[670px] overflow-visible"
          >
            <h3 className="flex gap-1 justify-end mr-[18px] text-brand mb-3 text-3xl font-semibold">
              9월
              <span className="mt-[4.5px] text-black text-xl font-semibold">일정</span>
            </h3>

            {/* 타임라인 전체 */}
            <div className="space-y-6 relative pb-6 px-5">
              {events.map(s => (
                <div key={s.id} className="flex justify-between pb-[25px]">
                  <div className="flex flex-col relative">
                    <div>
                      <p className="text-brand font-bold">{dayjs(s.start).format('DD일')}</p>
                    </div>
                    <div className="absolute w-[1px] h-[119px] bg-gray-300 left-[50%] top-[28px]" />
                  </div>
                  <div className="border rounded-sm p-3 shadow-sm border-gray-300 w-[189px] h-[104px]">
                    <p className="text-xs text-gray-500">
                      {dayjs(s.start).format('HH:mm')} - {dayjs(s.end).format('HH:mm')}
                    </p>
                    <p className="font-medium text-gray-800">{s.title}</p>
                    <p className="flex items-center text-sm text-gray-500 mt-1">
                      <IoLocationSharp className="text-brand mr-1" />
                      {s.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* 오른쪽 캘린더 */}
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
                datesSet={info => {
                  const label = info.view.title.replace(/^\d+년\s*/, '');
                  setMonthLabel(label);
                }}
                dayCellContent={arg => ({ html: String(arg.date.getDate()) })}
                events={events}
              />
            </div>
          </section>
        </div>

        {/* 모달 */}
        <Modal
          title={<h3 className="text-lg font-bold text-brand">일정을 등록해 주세요.</h3>}
          open={open}
          onCancel={() => setOpen(false)}
          footer={null}
        >
          <div className="space-y-4">
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

            <Input
              placeholder="제목을 입력하세요."
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />

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
