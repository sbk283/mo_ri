import { useEffect } from 'react';
import { Modal, DatePicker, TimePicker, Input, Checkbox, Button } from 'antd';
import { Dayjs } from 'dayjs';

export interface ScheduleForm {
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  title: string;
  location: string;
  noRegion: boolean;
}

interface ScheduleModalProps {
  open: boolean;
  form: ScheduleForm;
  setForm: React.Dispatch<React.SetStateAction<ScheduleForm>>;
  onCancel: () => void;
  onSubmit: () => void;
  titleText?: string;
  submitText?: string;
}

function ScheduleModal({
  open,
  form,
  setForm,
  onCancel,
  onSubmit,
  titleText = '일정을 등록해 주세요.',
  submitText = '확인',
}: ScheduleModalProps) {
  // 키보드 이벤트 등록 (Enter → 등록, ESC → 취소)
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if (e.key === 'Enter') {
        // Input이나 textarea에서 기본 submit 방지
        const target = e.target as HTMLElement;
        const tag = target.tagName.toLowerCase();
        if (tag !== 'input' && tag !== 'textarea') {
          e.preventDefault();
          onSubmit();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel, onSubmit]);

  return (
    <Modal
      open={open}
      footer={null}
      onCancel={onCancel}
      centered
      width={504}
      styles={{
        content: {
          borderRadius: '5px',
          boxShadow: '5px 7px 5px 0 rgba(0, 0, 0, 0.25)',
          background: '#FFF',
          height: '550px',
        },
      }}
      title={<h3 className="text-center text-[#0762E5] text-[25px] font-bold m-3">{titleText}</h3>}
    >
      <div className="flex flex-col gap-6 px-4">
        {/* 일정 */}
        <div className="flex flex-col gap-2">
          <label className="text-[15px] font-semibold text-gray-700">일정</label>
          <div className="grid grid-cols-2 gap-3">
            <DatePicker
              placeholder="시작 날짜 선택"
              className="w-full"
              value={form.startDate}
              onChange={v => setForm({ ...form, startDate: v })}
            />
            <DatePicker
              placeholder="종료 날짜 선택"
              className="w-full"
              value={form.endDate}
              onChange={v => setForm({ ...form, endDate: v })}
            />
          </div>
        </div>

        {/* 시간 */}
        <div className="flex flex-col gap-2">
          <label className="text-[15px] font-semibold text-gray-700">시간</label>
          <div className="grid grid-cols-2 gap-3">
            <TimePicker
              placeholder="시작 시간 선택"
              className="w-full"
              format="HH:mm"
              value={form.startTime}
              onChange={v => setForm({ ...form, startTime: v })}
            />
            <TimePicker
              placeholder="종료 시간 선택"
              className="w-full"
              format="HH:mm"
              value={form.endTime}
              onChange={v => setForm({ ...form, endTime: v })}
            />
          </div>
        </div>

        {/* 제목 */}
        <div className="flex flex-col gap-2">
          <label className="text-[15px] font-semibold text-gray-700">제목</label>
          <Input
            placeholder="제목을 입력하세요."
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            className="font-noto text-[15px] font-medium text-black"
          />
        </div>

        {/* 장소 */}
        <div className="flex flex-col gap-2">
          <label className="text-[15px] font-semibold text-gray-700">장소</label>
          <div className="flex items-center gap-2">
            <Input
              placeholder="지역을 입력해주세요."
              className="flex-1 text-black text-[15px] font-medium"
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
        </div>

        {/* 버튼 */}
        <div className="flex justify-center gap-4 pt-6">
          <Button
            onClick={onCancel}
            className="w-[120px] h-[44px] rounded-[5px] border border-brand text-brand text-[15px] font-semibold hover:!bg-[#E6F0FF]"
          >
            취소
          </Button>
          <Button
            type="primary"
            onClick={onSubmit}
            className="w-[120px] h-[44px] bg-brand hover:!bg-[#1a66df] text-white text-[15px] font-semibold rounded-[5px]"
          >
            {submitText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ScheduleModal;
