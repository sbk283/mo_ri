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

/** 초기 콘텐츠 유효성 간이 체크 (이미지나 텍스트가 있으면 true) */
function isContentNonEmpty(raw?: string | null): boolean {
  if (!raw) return false;
  const s = String(raw);

  // 1) HTML img 태그
  if (/<img\b[^>]*src=['"][^'"]+['"][^>]*>/i.test(s)) return true;
  // 2) 마크다운 이미지
  if (/!\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/.test(s)) return true;

  // 3) 태그 제거 후 순수 텍스트 확인 (zero-width, NBSP 제거)
  const text = s
    .replace(/<[^>]*>/g, '')
    .replace(/[\u200B\u00A0]/g, '')
    .trim();
  return text.length > 0;
}

export default function GroupDailyDetailEdit({ daily, onCancel, onSave }: Props) {
  const [form, setForm] = useState<Daily>({ ...daily });

  // 에디터에서 올려주기 전에, 초기 콘텐츠로 미리 true/false 결정
  const [isContentValid, setIsContentValid] = useState<boolean>(isContentNonEmpty(daily.content));

  const titleLength = form.title?.length ?? 0;
  const isTitleEmpty = (form.title ?? '').trim().length === 0;
  const isTitleOver = titleLength > TITLE_LIMIT;

  // 변경 여부: 제목이나 본문 둘 중 하나만 달라도 true
  const isDirty = useMemo(() => {
    const titleChanged = (form.title ?? '') !== (daily.title ?? '');
    const contentChanged = (form.content ?? '') !== (daily.content ?? '');
    return titleChanged || contentChanged;
  }, [form.title, form.content, daily.title, daily.content]);

  // 저장 가능: (변경됨) AND (제목 유효) AND (내용 유효)
  const isFormValid = useMemo(
    () => isDirty && !isTitleEmpty && !isTitleOver && isContentValid,
    [isDirty, isTitleEmpty, isTitleOver, isContentValid],
  );

  const update = <K extends keyof Daily>(key: K, value: Daily[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    onSave({
      ...form,
      title: (form.title ?? '').trim(),
    });
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
            key={`daily-content-${daily.id}`} // 다른 글로 전환될 때만 리셋
            value={form.content ?? ''}
            onChange={v => update('content', v)}
            placeholder="내용을 입력해주세요."
            disabled={false}
            requireNotEmpty
            onValidityChange={setIsContentValid} // 에디터가 이후에도 계속 갱신
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
          whileTap={{ scale: isFormValid ? 0.96 : 1 }}
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
