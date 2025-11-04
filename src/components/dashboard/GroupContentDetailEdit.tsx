// src/components/notice/GroupContentDetailEdit.tsx
import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Notice } from '../../types/notice';
import NoticeDetailRichTextEditor from '../NoticeDetailRichTextEditor';
import ConfirmModal from '../common/modal/ConfirmModal';

type Props = {
  notice: Notice;
  onCancel: () => void;
  onSave: (next: Notice) => void;
};

const TITLE_LIMIT = 50;

// 정규화 유틸
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

export default function GroupContentDetailEdit({ notice, onCancel, onSave }: Props) {
  const [form, setForm] = useState<Notice>({ ...notice });
  const [isContentValid, setIsContentValid] = useState<boolean>(
    hasMeaningfulContent(notice.content),
  );

  const isCreate = (notice?.id ?? 0) === 0;
  const titleLength = form.title?.length ?? 0;
  const isTitleEmpty = normTitle(form.title).length === 0;
  const isTitleOver = titleLength > TITLE_LIMIT;

  // 초기 스냅샷(정규화 후 저장)
  const initial = useRef<{ title: string; content: string }>({ title: '', content: '' });
  useEffect(() => {
    initial.current = {
      title: normTitle(notice.title),
      content: normContent(notice.content),
    };
    setForm({ ...notice });
    setIsContentValid(hasMeaningfulContent(notice.content));
  }, [notice.id]);

  // 변경 플래그: 제목/내용 각각 비교
  const changedTitle = useMemo(() => normTitle(form.title) !== initial.current.title, [form.title]);
  const changedContent = useMemo(
    () => normContent(form.content) !== initial.current.content,
    [form.content],
  );

  // 버튼 활성화 조건
  const isFormValid = useMemo(() => {
    if (isCreate) {
      // 새 글: 유효성 충족하면 활성화
      return !isTitleEmpty && !isTitleOver && isContentValid;
    }
    // 수정: 제목 또는 내용 중 하나라도 변경 + 유효성
    return (changedTitle || changedContent) && !isTitleEmpty && !isTitleOver && isContentValid;
  }, [isCreate, isTitleEmpty, isTitleOver, isContentValid, changedTitle, changedContent]);

  const update = <K extends keyof Notice>(key: K, value: Notice[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  // 모달 제어
  const [openCancelConfirm, setOpenCancelConfirm] = useState(false);
  const [openSaveConfirm, setOpenSaveConfirm] = useState(false);

  const handleRequestCancel = () => {
    // 작성/수정 모두 변경 사항 있으면 확인
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
    // 스냅샷 갱신
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
      <article className="mx-auto bg-white border border-[#A3A3A3]">
        <header className="px-8 pt-6">
          <div className="flex gap-3 items-center">
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

        <section className="px-8 py-4">
          <NoticeDetailRichTextEditor
            key={`notice-content-${form.id}`}
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
          {isCreate ? '등록' : '등록'}
        </motion.button>
      </footer>

      <ConfirmModal
        open={openCancelConfirm}
        title={isCreate ? '취소하시겠습니까?' : '취소하시겠습니까?'}
        message={
          isCreate
            ? '작성 중인 내용이 저장되지 않습니다.\n정말 취소하시겠습니까?'
            : '변경 사항이 저장되지 않습니다.\n정말 취소하시겠습니까?'
        }
        confirmText="확인"
        cancelText={isCreate ? '취소' : '취소'}
        onConfirm={() => {
          setOpenCancelConfirm(false);
          onCancel();
        }}
        onClose={() => setOpenCancelConfirm(false)}
      />

      <ConfirmModal
        open={openSaveConfirm}
        title={isCreate ? '등록하시겠습니까?' : '등록하시겠습니까?'}
        message={
          isCreate
            ? '현재 내용을 게시물로 작성합니다.\n등록하시겠습니까?'
            : '현재 수정 내용을 저장합니다.\n등록하시겠습니까?'
        }
        confirmText={isCreate ? '등록' : '등록'}
        cancelText="취소"
        onConfirm={handleConfirmSave}
        onClose={() => setOpenSaveConfirm(false)}
      />
    </motion.form>
  );
}
