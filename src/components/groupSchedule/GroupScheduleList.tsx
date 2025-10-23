import { useState } from 'react';
import dayjs from 'dayjs';
import { IoLocationSharp } from 'react-icons/io5';
import type { group_schedule } from '../../types/group';
import type { ScheduleForm } from './ScheduleModal';
import ScheduleModal from './ScheduleModal';
import RemoveModal from '../common/modal/RemoveModal';

interface GroupScheduleListProps {
  monthLabel: string;
  events: group_schedule[];
  selectedEventId: string | null;
  asideRef: React.RefObject<HTMLDivElement>;
  onUpdateEvent: (updatedEvent: ScheduleForm & { id: string }) => void;
  onDeleteEvent: (id: string) => void;
}

function GroupScheduleList({
  monthLabel,
  events,
  selectedEventId,
  onDeleteEvent,
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
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // 수정 클릭 시
  const handleEditClick = (event: group_schedule) => {
    setEditingId(event.schedule_id);
    setEditForm({
      title: event.schedule_title ?? '',
      startDate: dayjs(event.schedule_start_at),
      endDate: dayjs(event.schedule_end_at),
      startTime: dayjs(event.schedule_start_at),
      endTime: dayjs(event.schedule_end_at),
      location: event.schedule_place_name ?? '',
      noRegion: event.schedule_place_name === '지역 무관',
    });
    setEditOpen(true);
  };

  const handleEditSave = () => {
    if (!editingId) return;
    onUpdateEvent({ ...editForm, id: editingId });
    setEditOpen(false);
  };

  // 삭제 버튼 클릭
  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  // 실제 삭제 확정
  const handleDeleteConfirm = () => {
    if (deleteId) onDeleteEvent(deleteId);
    setDeleteOpen(false);
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
      className="w-[300px] pr-1 overflow-y-auto h-[670px]"
    >
      <h3 className="flex gap-1 justify-end mr-[18px] text-brand mb-3 text-3xl font-semibold">
        {monthLabel || dayjs().format('M월')}
        <span className="mt-[4.5px] text-black text-xl font-semibold">일정</span>
      </h3>

      <div className="space-y-6 relative pb-6 px-5">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-gray-400">
            <img
              src="/images/empty_calendar.svg"
              alt="일정 없음"
              className="w-10 h-10 mb-2 opacity-70"
            />
            <p className="text-sm">일정이 없습니다.</p>
          </div>
        ) : (
          events.map(s => {
            const isSelected = selectedEventId === s.schedule_id;
            return (
              <div
                key={s.schedule_id}
                id={`event-${s.schedule_id}`}
                className="flex justify-between pb-[25px] transition-all duration-200"
              >
                {/* 날짜 */}
                <div className="flex flex-col relative">
                  <p
                    className={`font-bold transition-colors ${
                      isSelected ? 'text-brand' : 'text-gray-200'
                    }`}
                  >
                    {dayjs(s.schedule_start_at).format('DD일')}
                  </p>
                  <div className="absolute w-[1px] h-[119px] bg-gray-300 left-[50%] top-[28px]" />
                </div>

                {/* 일정 카드 */}
                <div
                  className={`rounded-sm p-2 shadow-sm w-[189px] h-auto flex flex-col justify-between border transition-all duration-200 ${
                    isSelected ? 'border-brand/50 ring-1 ring-brand/50' : 'border-gray-300'
                  }`}
                >
                  <div>
                    <div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-brand font-semibold">
                          {dayjs(s.schedule_start_at).format('MM-DD')} ~{' '}
                          {dayjs(s.schedule_end_at).format('MM-DD')}
                        </p>
                        <button
                          onClick={() => handleEditClick(s)}
                          className="font-medium hover:opacity-80"
                        >
                          <img src="/images/revise.svg" alt="수정하기" className="w-3 h-3" />
                        </button>
                      </div>

                      <p className="text-xs text-gray-500">
                        {dayjs(s.schedule_start_at).format('HH:mm')} -{' '}
                        {dayjs(s.schedule_end_at).format('HH:mm')}
                      </p>
                    </div>

                    <p className="font-medium text-gray-800 mt-1">
                      {s.schedule_title ?? '[제목 없음]'}
                    </p>

                    <p className="flex items-center text-sm text-gray-500 mt-1">
                      <IoLocationSharp className="text-brand mr-1" />
                      {s.schedule_place_name ?? '장소 미정'}
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => handleDeleteClick(s.schedule_id)}
                      className="text-xs text-[#FF5252]"
                    >
                      일정삭제
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <ScheduleModal
        open={editOpen}
        form={editForm}
        setForm={setEditForm}
        onCancel={() => setEditOpen(false)}
        onSubmit={handleEditSave}
        titleText="일정을 수정해 주세요."
        submitText="저장"
      />

      <RemoveModal
        open={deleteOpen}
        title="일정을 삭제하시겠습니까?"
        message="삭제한 일정은 복구할 수 없습니다."
        confirmText="삭제"
        cancelText="취소"
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteOpen(false)}
      />
    </aside>
  );
}

export default GroupScheduleList;
