// GroupSchedulePage.tsx
import { useMemo, useState, useRef, useEffect } from 'react';
import GroupDashboardLayout from '../components/layout/GroupDashboardLayout';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';

import { Modal, DatePicker, TimePicker, Input, Checkbox, Button } from 'antd';
import { IoLocationSharp } from 'react-icons/io5';
import dayjs, { Dayjs } from 'dayjs';

type EventItem = {
  id: string;
  title: string;
  start: string; // ISO
  end: string; // ISO
  location?: string;
};

function GroupSchedulePage() {
  // 권한 체크 (참여자면 false)
  const isLeader = true; // TODO: 유저 권한에 따라 변경

  // 모달 상태
  const [open, setOpen] = useState(false);

  // ---- 모킹 데이터 대량 생성 ----
  const initialEvents: EventItem[] = useMemo(() => {
    const baseDates = [5, 8, 12, 20, 22, 24, 26, 28]; // 9월 여러 날짜
    const arr: EventItem[] = [];
    let id = 1;

    // 날짜마다 2~4개씩 넣어서 스크롤 테스트
    baseDates.forEach(d => {
      const count = 3; // 고정 3개(원하면 Math.floor(Math.random()*3)+2)
      for (let i = 0; i < count; i++) {
        const start = dayjs(`2025-09-${String(d).padStart(2, '0')}T20:00:00`);
        const end = start.add(2, 'hour');
        arr.push({
          id: String(id++),
          title: `[정기모임] 일정있수다람쥐돌이 #${i + 1}`,
          start: start.toISOString(),
          end: end.toISOString(),
          location: i % 2 === 0 ? '대구 중구 무슨피시방' : '야외',
        });
      }
    });

    // 주중 일정도 조금 추가
    for (let i = 1; i <= 10; i++) {
      const start = dayjs(`2025-09-${String(9 + i).padStart(2, '0')}T19:30:00`);
      const end = start.add(90, 'minute');
      arr.push({
        id: String(arr.length + 1),
        title: `[번개모임] 평일 저녁 러닝 ${i}`,
        start: start.toISOString(),
        end: end.toISOString(),
        location: '대구 수성구 범어공원',
      });
    }

    return arr.sort((a, b) => +new Date(a.start) - +new Date(b.start));
  }, []);

  // 일정 데이터 (FullCalendar용 events)
  const [events, setEvents] = useState<EventItem[]>(initialEvents);

  // 모달 입력값 (간단히만 처리)
  const [form, setForm] = useState<{
    startDate: Dayjs | null;
    endDate: Dayjs | null;
    startTime: Dayjs | null;
    endTime: Dayjs | null;
    title: string;
    location: string;
    noRegion: boolean;
  }>({
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

    const start = dayjs(form.startDate)
      .hour(form.startTime.hour())
      .minute(form.startTime.minute())
      .second(0);

    const end =
      form.endDate && form.endTime
        ? dayjs(form.endDate).hour(form.endTime.hour()).minute(form.endTime.minute()).second(0)
        : start.add(2, 'hour');

    const newEvent: EventItem = {
      id: String(events.length + 1),
      title: form.title || '새 일정',
      start: start.toISOString(),
      end: end.toISOString(),
      location: form.noRegion ? '지역 무관' : form.location || '미정',
    };

    setEvents(prev => [...prev, newEvent].sort((a, b) => +new Date(a.start) - +new Date(b.start)));
    setOpen(false);
    // 폼 리셋
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

  // 좌측 리스트: 한 div(단일 스크롤 영역) 안에 전부 렌더
  // 날짜 라벨과 카드가 같은 컨테이너 안에서 이어지도록
  const leftScrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    // 일정 추가 시 스크롤 아래로 (원하면 제거)
    const el = leftScrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [events.length]);

  return (
    <GroupDashboardLayout>
      <div className="bg-white shadow-card h-[770px] p-6 flex flex-col">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">일정관리</h2>
          {isLeader && (
            <button
              onClick={() => setOpen(true)}
              className="px-4 py-2 bg-brand text-white rounded-md shadow hover:bg-brand-dark"
            >
              일정등록
            </button>
          )}
        </div>

        <div className="flex gap-6 flex-1 min-h-0">
          {/* 좌측 타임라인 - 한 div 스크롤 */}
          <div className="w-[320px] flex flex-col">
            <div className="flex items-center px-1 pb-2 text-lg font-semibold text-brand">
              09월 <p className="font-semibold text-md"> 일정</p>
            </div>

            {/* 단일 스크롤 컨테이너 */}
            <div
              ref={leftScrollRef}
              className="flex-1 overflow-y-auto custom-scrollbar pr-2 pl-1 py-1 space-y-4 rounded-md bg-[#F8FAFD]"
            >
              {events.map(s => {
                const d = dayjs(s.start);
                return (
                  <div key={s.id} className="flex items-start gap-3">
                    {/* 날짜 라벨 (세로축 정렬용) */}
                    <div className="w-[48px] shrink-0 text-right leading-5 pt-1">
                      <div className="text-[11px] text-gray-400">{d.format('dd')}</div>
                      <div className="text-brand font-bold">{d.format('DD일')}</div>
                    </div>

                    {/* 카드 */}
                    <div className="flex-1">
                      <div className="border rounded-lg bg-white p-3 shadow-sm hover:shadow transition">
                        <p className="text-xs text-gray-500">
                          {dayjs(s.start).format('HH:mm')} - {dayjs(s.end).format('HH:mm')}
                        </p>
                        <p className="font-medium mt-0.5">{s.title}</p>
                        {s.location && (
                          <p className="flex items-center text-sm text-gray-500 mt-1">
                            <IoLocationSharp className="text-brand mr-1" />
                            {s.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 우측 FullCalendar */}
          <div className="flex-1 min-w-0">
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
              dayMaxEventRows={2}
              eventTimeFormat={{ hour: '2-digit', minute: '2-digit', meridiem: false }}
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
                onChange={v => setForm(f => ({ ...f, startDate: v }))}
              />
              <DatePicker
                placeholder="종료 날짜 선택"
                className="w-full"
                onChange={v => setForm(f => ({ ...f, endDate: v }))}
              />
            </div>

            {/* 시간 */}
            <div className="grid grid-cols-2 gap-3">
              <TimePicker
                placeholder="시작 시간 선택"
                className="w-full"
                format="HH:mm"
                minuteStep={5}
                onChange={v => setForm(f => ({ ...f, startTime: v }))}
              />
              <TimePicker
                placeholder="종료 시간 선택"
                className="w-full"
                format="HH:mm"
                minuteStep={5}
                onChange={v => setForm(f => ({ ...f, endTime: v }))}
              />
            </div>

            {/* 제목 */}
            <Input
              placeholder="제목을 입력하세요."
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />

            {/* 장소 */}
            <div className="flex gap-2 items-center">
              <Input
                placeholder="지역검색"
                className="flex-1"
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                disabled={form.noRegion}
              />
              <Checkbox
                checked={form.noRegion}
                onChange={e => setForm(f => ({ ...f, noRegion: e.target.checked }))}
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
