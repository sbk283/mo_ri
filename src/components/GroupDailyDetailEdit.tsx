// src/components/common/GroupDailyDetailEdit.tsx
import { motion } from 'framer-motion';
import { useMemo, useRef, useState, useEffect } from 'react';
import DetailRichTextEditor from './DailyDetailRichTextEditor';
import ConfirmModal from './common/modal/ConfirmModal';
import type { Daily } from '../types/daily';

type Props = {
  daily: Daily;
  onCancel: () => void;
  onSave: (next: Daily) => void;
};

const TITLE_LIMIT = 50;

// 정규화 유틸 (공지와 동일)
const zws = /\u200B/g;
const nbsp = /\u00A0/g;
const brParas = /<p><br><\/p>/gi;
const trimBr = /^(<br\s*\/?>)+|(<br\s*\/?>)+$/gi;

const normTitle = (s?: string | null) => (s ?? '').replace(/\s+/g, ' ').trim();
const normContent = (raw?: string | null) =>
  (raw ?? '').replace(zws, '').replace(nbsp, ' ').replace(brParas, '').replace(trimBr, '').trim();

const hasMeaningfulContent = (raw?: string | null) => {
  const s = normContent(raw);
  if (!s) return false;
  if (/<img\b[^>]*src=['"][^'"]+['"][^>]*>/i.test(s)) return true;
  if (/!\[[^\]]*]\(([^)\s]+)(?:\s*"[^"]*")?\)/.test(s)) return true;
  const text = s.replace(/<[^>]*>/g, '').trim();
  return text.length > 0;
};

export default function GroupDailyDetailEdit({ daily, onCancel, onSave }: Props) {
  const [form, setForm] = useState<Daily>({ ...daily });
  const [isContentValid, setIsContentValid] = useState<boolean>(
    hasMeaningfulContent(daily.content),
  );

  const isCreate = (daily?.id ?? 0) === 0;
  const titleLength = form.title?.length ?? 0;
  const isTitleEmpty = normTitle(form.title).length === 0;
  const isTitleOver = titleLength > TITLE_LIMIT;

  // 초기 스냅샷
  const initial = useRef<{ title: string; content: string }>({ title: '', content: '' });
  useEffect(() => {
    initial.current = {
      title: normTitle(daily.title),
      content: normContent(daily.content),
    };
    setForm({ ...daily });
    setIsContentValid(hasMeaningfulContent(daily.content));
  }, [daily.id]);

  // 변경 플래그
  const changedTitle = useMemo(() => normTitle(form.title) !== initial.current.title, [form.title]);
  const changedContent = useMemo(
    () => normContent(form.content) !== initial.current.content,
    [form.content],
  );

  // 버튼 활성화
  const isFormValid = useMemo(() => {
    if (isCreate) {
      return !isTitleEmpty && !isTitleOver && isContentValid;
    }
    return (changedTitle || changedContent) && !isTitleEmpty && !isTitleOver && isContentValid;
  }, [isCreate, isTitleEmpty, isTitleOver, isContentValid, changedTitle, changedContent]);

  const update = <K extends keyof Daily>(key: K, value: Daily[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const [openCancelConfirm, setOpenCancelConfirm] = useState(false);
  const [openSaveConfirm, setOpenSaveConfirm] = useState(false);

  const handleRequestCancel = () => {
    if (changedTitle || changedContent) setOpenCancelConfirm(true);
    else onCancel();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setOpenSaveConfirm(true);
  };

  const handleConfirmSave = () => {
    setOpenSaveConfirm(false);
    const next = {
      ...form,
      title: normTitle(form.title),
      content: normContent(form.content),
    };
    onSave(next);
    initial.current = { title: next.title, content: next.content };
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
            key={`daily-content-${daily.id}`}
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
          onClick={handleRequestCancel}
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
          {isCreate ? '작성' : '저장'}
        </motion.button>
      </footer>

      <ConfirmModal
        open={openCancelConfirm}
        title={isCreate ? '작성 중입니다.' : '수정 사항이 있습니다.'}
        message={
          isCreate
            ? '작성 중인 내용이 저장되지 않습니다.\n정말 취소하시겠습니까?'
            : '변경 사항이 저장되지 않습니다.\n정말 취소하시겠습니까?'
        }
        confirmText="취소"
        cancelText={isCreate ? '계속작성' : '계속하기'}
        onConfirm={() => {
          setOpenCancelConfirm(false);
          onCancel();
        }}
        onClose={() => setOpenCancelConfirm(false)}
      />

      <ConfirmModal
        open={openSaveConfirm}
        title={isCreate ? '작성하시겠습니까?' : '저장하시겠습니까?'}
        message={
          isCreate
            ? '현재 내용을 게시물로 작성합니다.\n진행할까요?'
            : '현재 수정 내용을 저장합니다.\n계속 진행할까요?'
        }
        confirmText={isCreate ? '작성' : '저장'}
        cancelText="취소"
        onConfirm={handleConfirmSave}
        onClose={() => setOpenSaveConfirm(false)}
      />
    </motion.form>
  );
}
