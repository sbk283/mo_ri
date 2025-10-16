import { motion } from 'framer-motion';
import { useState } from 'react';
import NoticeDetailRichTextEditor from '../NoticeDetailRichTextEditor';
import type { Notice } from '../../types/notice';

type Props = {
  notice: Notice;
  onCancel: () => void;
  onSave: (next: Notice) => void;
};

export default function GroupContentDetailEdit({ notice, onCancel, onSave }: Props) {
  const [form, setForm] = useState<Notice>({ ...notice });

  const update = <K extends keyof Notice>(key: K, value: Notice[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      <article className="mx-auto bg-white rounded-md border border-[#A3A3A3]">
        <header className="px-8 pt-6">
          <div className="flex gap-3 items-center">
            <input
              aria-label="제목"
              value={form.title}
              onChange={e => update('title', e.target.value)}
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-lg font-semibold"
              placeholder="제목을 입력해주세요."
            />
          </div>
        </header>

        <section className="px-8 py-4">
          <label className="block text-sm text-gray-600 mb-2">내용</label>
          <div className="editor-wrapper">
            <NoticeDetailRichTextEditor
              key={`notice-content-${form.id}`}
              value={form.content ?? ''}
              onChange={v => update('content', v)}
              placeholder="내용을 입력해주세요."
              disabled={false}
            />
          </div>
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
          className="text-md w-[64px] h-[36px] flex justify-center items-center text-center text-white bg-[#0689E8] border border-[#0689E8] rounded-sm"
        >
          저장
        </motion.button>
      </footer>
    </motion.form>
  );
}
