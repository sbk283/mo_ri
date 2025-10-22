// src/components/common/GroupDailyDetailEdit.tsx
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import DetailRichTextEditor from './DailyDetailRichTextEditor';
import type { Daily } from '../types/daily';

type Props = {
  daily: Daily;
  onCancel: () => void;
  onSave: (next: Daily) => void;
};

const TITLE_LIMIT = 50;

export default function GroupDailyDetailEdit({ daily, onCancel, onSave }: Props) {
  const [form, setForm] = useState<Daily>({ ...daily });
  const [isContentValid, setIsContentValid] = useState(false);

  const titleLength = form.title?.length ?? 0;
  const isTitleEmpty = (form.title ?? '').trim().length === 0;
  const isTitleOver = titleLength > TITLE_LIMIT;

  const isFormValid = useMemo(
    () => !isTitleEmpty && !isTitleOver && isContentValid,
    [isTitleEmpty, isTitleOver, isContentValid],
  );

  const update = <K extends keyof Daily>(key: K, value: Daily[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    onSave(form);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      layout
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="w-full"
    >
      <article className="mx-auto bg-white shadow-md border border-[#A3A3A3]">
        <header className="px-8 pt-6">
          <div className="flex gap-3">
            <input
              aria-label="제목"
              value={form.title ?? ''}
              onChange={e => update('title', e.target.value)}
              className={`flex-1 border rounded px-3 py-2 text-lg font-semibold ${
                isTitleOver ? 'border-red-400' : 'border-gray-300'
              }`}
              placeholder="제목을 입력해주세요."
              maxLength={TITLE_LIMIT}
            />
            <span className={`text-sm ${isTitleOver ? 'text-red-500' : 'text-gray-400'}`}>
              {titleLength}/{TITLE_LIMIT}
            </span>
          </div>
        </header>

        <section className="px-8 py-6">
          <DetailRichTextEditor
            key={`daily-content-${form.id}`}
            value={form.content ?? ''}
            onChange={v => update('content', v)}
            placeholder="내용을 입력해주세요."
            disabled={false}
            requireNotEmpty
            onValidityChange={setIsContentValid}
          />
        </section>
      </article>

      <footer className="py-6 flex justify-end gap-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={onCancel}
          className="text-md w-[64px] h-[36px] flex justify-center items-center text-center text-[#0689E8] border border-[#0689E8] rounded-sm"
        >
          취소
        </motion.button>

        <motion.button
          type="submit"
          whileTap={{ scale: 0.96 }}
          disabled={!isFormValid}
          className={`text-md w-[64px] h-[36px] flex justify-center items-center text-center rounded-sm border transition
            ${
              isFormValid
                ? 'text-white bg-[#0689E8] border-[#0689E8] hover:opacity-90'
                : 'bg-gray-300 text-white border-gray-300 cursor-not-allowed'
            }`}
        >
          저장
        </motion.button>
      </footer>
    </motion.form>
  );
}
