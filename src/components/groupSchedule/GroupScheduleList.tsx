// 그룹 일정 리스트 컴포넌트
import { useState } from 'react';
import dayjs from 'dayjs';
import { IoLocationSharp } from 'react-icons/io5';
import type { ScheduleForm } from './ScheduleModal';
import ScheduleModal from './ScheduleModal';

interface GroupScheduleListProps {
  monthLabel: string;
  events: EventItem[];
  selectedEventId: string | null;
  asideRef: React.RefObject<HTMLDivElement>;
  onUpdateEvent: (updatedEvent: ScheduleForm & { id: string }) => void;
}

// 일정 데이터 타입 (재사용함..)
interface EventItem {
  id: string;
  title: string;
  start: string;
  end: string;
  location: string;
}

/**
 * 그룹 일정 리스트 컴포넌트
 * - 좌측 aside 영역 (월 표시 + 일정 타임라인)
 * - 클릭된 일정 하이라이트
 * - 세로 라인 + 날짜 + 카드 구성
 */

function GroupScheduleList({
  monthLabel,
  events,
  selectedEventId,
  onUpdateEvent,
  asideRef,
}: GroupScheduleListProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ScheduleForm>({
    startDate: null,
    endDate: null,
    startTime: null,
    endTime: null,
    title: '',
    location: '',
    noRegion: false,
  });

  // 수정 버튼 클릭 시
  const handleEditClick = (event: EventItem) => {
    setEditingId(event.id);
    setEditForm({
      title: event.title,
      startDate: dayjs(event.start),
      endDate: dayjs(event.end),
      startTime: dayjs(event.start),
      endTime: dayjs(event.end),
      location: event.location,
      noRegion: event.location === '지역 무관',
    });
    setEditOpen(true);
  };

  // 수정 완료 시
  const handleEditSave = () => {
    if (!editingId) return;
    onUpdateEvent({ ...editForm, id: editingId });
    setEditOpen(false);
  };

  return (
    <aside
      ref={asideRef}
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
      {/* 월 일정 제목 */}
      <h3 className="flex gap-1 justify-end mr-[18px] text-brand mb-3 text-3xl font-semibold">
        {monthLabel || dayjs().format('M월')}
        <span className="mt-[4.5px] text-black text-xl font-semibold">일정</span>
      </h3>

      {/* 일정 타임라인 전체 */}
      <div className="space-y-6 relative pb-6 px-5">
        {events.length === 0 ? (
          // 일정이 없을 때
          <div className="flex flex-col items-center justify-center h-[200px] text-gray-400">
            <img
              src="/images/empty_calendar.svg"
              alt="일정 없음"
              className="w-10 h-10 mb-2 opacity-70"
            />
            <p className="text-sm">일정이 없습니다.</p>
          </div>
        ) : (
          // 일정이 있을 때
          events.map(s => (
            <div
              key={s.id}
              id={`event-${s.id}`}
              className={`flex justify-between pb-[25px] transition-all duration-200 ${
                selectedEventId === s.id ? 'bg-[#E6F4FF] rounded-md shadow-inner scale-[1.02]' : ''
              }`}
            >
              {/* 날짜 + 세로선 */}
              <div className="flex flex-col relative">
                <div>
                  <p className="text-brand font-bold">{dayjs(s.start).format('DD일')}</p>
                </div>
                <div className="absolute w-[1px] h-[119px] bg-gray-300 left-[50%] top-[28px]" />
              </div>

              {/* 일정 카드 */}
              <div className="border rounded-sm p-2 shadow-sm border-gray-300 w-[189px] h-[104px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      {dayjs(s.start).format('HH:mm')} - {dayjs(s.end).format('HH:mm')}
                    </p>
                    <button
                      onClick={() => handleEditClick(s)}
                      className="text-[12px] text-brand font-medium hover:opacity-80 transition"
                      aria-label="일정 수정"
                    >
                      <img src="/images/revise.svg" alt="수정하기" className="w-3 h-3" />
                    </button>
                  </div>

                  {/* 제목 */}
                  <p className="font-medium text-gray-800 mt-1">{s.title}</p>

                  {/* 위치 */}
                  <p className="flex items-center text-sm text-gray-500 mt-1">
                    <IoLocationSharp className="text-brand mr-1" />
                    {s.location}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 일정 수정 모달 (재사용) */}
      <ScheduleModal
        open={editOpen}
        form={editForm}
        setForm={setEditForm}
        onCancel={() => setEditOpen(false)}
        onSubmit={handleEditSave}
        titleText="일정을 수정해 주세요."
        submitText="저장"
      />
    </aside>
  );
}

export default GroupScheduleList;
