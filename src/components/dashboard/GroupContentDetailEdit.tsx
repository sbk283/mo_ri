// src/components/notice/GroupContentDetailEdit.tsx
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Notice } from "../../types/notice";
import NoticeDetailRichTextEditor from "../NoticeDetailRichTextEditor";
import ConfirmModal from "../common/modal/ConfirmModal";

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

const normTitle = (s?: string | null) => (s ?? "").replace(/\s+/g, " ").trim();
const normContent = (raw?: string | null) =>
  (raw ?? "")
    .replace(zws, "")
    .replace(nbsp, " ")
    .replace(brParas, "")
    .replace(trimBr, "")
    .trim();

const hasMeaningfulContent = (raw?: string | null) => {
  const s = normContent(raw);
  if (!s) return false;
  // img 태그
  if (/<img\b[^>]*src=['"][^'"]+['"][^>]*>/i.test(s)) return true;
  // 마크다운 이미지
  if (/!\[[^\]]*]\(([^)\s]+)(?:\s*"[^"]*")?\)/.test(s)) return true;
  // 태그 제거 후 텍스트
  const text = s.replace(/<[^>]*>/g, "").trim();
  return text.length > 0;
};

export default function GroupContentDetailEdit({
  notice,
  onCancel,
  onSave,
}: Props) {
  const [form, setForm] = useState<Notice>({ ...notice });
  const [isContentValid, setIsContentValid] = useState<boolean>(
    hasMeaningfulContent(notice.content),
  );

  const isCreate = (notice?.id ?? 0) === 0;
  const titleLength = form.title?.length ?? 0;
  const isTitleEmpty = normTitle(form.title).length === 0;
  const isTitleOver = titleLength > TITLE_LIMIT;

  // 초기 스냅샷 (원본, 정규화해서 저장)
  const initial = useRef<{ title: string; content: string }>({
    title: "",
    content: "",
  });

  // 실제 변경 여부
  const [dirty, setDirty] = useState(false);

  // notice가 바뀔 때마다 초기값/폼/유효성/dirty 초기화
  useEffect(() => {
    initial.current = {
      title: normTitle(notice.title),
      content: normContent(notice.content),
    };
    setForm({ ...notice });
    setIsContentValid(hasMeaningfulContent(notice.content));
    setDirty(false);
  }, [notice.id, notice.title, notice.content]);

  // 현재 폼 값 기준으로 dirty 다시 계산 (비교는 정규화된 문자열로)
  const recomputeDirty = (
    nextTitle?: string | null,
    nextContent?: string | null,
  ) => {
    const base = initial.current;
    const currentTitle = normTitle(nextTitle ?? form.title);
    const currentContent = normContent(nextContent ?? form.content);
    const baseTitle = base.title;
    const baseContent = base.content;

    const nextDirty =
      currentTitle !== baseTitle || currentContent !== baseContent;
    setDirty(nextDirty);
  };

  const update = <K extends keyof Notice>(key: K, value: Notice[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // 제목 변경
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    update("title", value as any);
    recomputeDirty(value, undefined);
  };

  // 내용 변경
  const handleContentChange = (value: string) => {
    update("content", value as any);
    recomputeDirty(undefined, value);
  };

  // 버튼 활성화 조건
  const isFormValid = useMemo(() => {
    if (isCreate) {
      // 새 글: 유효성만 만족하면 활성
      return !isTitleEmpty && !isTitleOver && isContentValid;
    }
    // 수정: 실제 변경(dirty)이 있어야 함 + 유효성
    return dirty && !isTitleEmpty && !isTitleOver && isContentValid;
  }, [isCreate, dirty, isTitleEmpty, isTitleOver, isContentValid]);

  // 모달 제어
  const [openCancelConfirm, setOpenCancelConfirm] = useState(false);
  const [openSaveConfirm, setOpenSaveConfirm] = useState(false);

  const handleRequestCancel = () => {
    if (isCreate) {
      // 새 작성: 아무것도 안 썼으면 바로 닫고, 뭔가 있으면 물어봄
      const hasAny =
        normTitle(form.title).length > 0 ||
        hasMeaningfulContent(form.content ?? "");
      if (hasAny) setOpenCancelConfirm(true);
      else onCancel();
      return;
    }

    // 수정: dirty일 때만 모달, 아니면 바로 닫기
    if (dirty) setOpenCancelConfirm(true);
    else onCancel();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setOpenSaveConfirm(true);
  };

  const handleConfirmSave = () => {
    setOpenSaveConfirm(false);
    const next: Notice = {
      ...form,
      title: normTitle(form.title),
      // HTML 줄바꿈, 태그 보존
      content: form.content ?? "",
    };
    onSave(next);
    // 비교용 스냅샷은 계속 정규화된 값으로 유지
    initial.current = {
      title: normTitle(next.title),
      content: normContent(next.content),
    };
    setDirty(false);
  };

  return (
    <>
      {/* 폼/에디터 영역 */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="w-full"
      >
        <article className="mx-auto bg-white border border-[#A3A3A3]">
          <header className="px-8 pt-6">
            <div className="relative flex items-center">
              <input
                aria-label="제목"
                value={form.title ?? ""}
                onChange={handleTitleChange}
                placeholder="제목을 입력해주세요."
                maxLength={TITLE_LIMIT}
                className={`w-full border rounded px-3 py-2 text-lg font-semibold pr-16
        ${
          isTitleOver
            ? "border-red-400 focus:border-red-400"
            : "border-gray-300 focus:border-brand"
        }`}
              />
              <span
                className={`absolute right-4 text-sm select-none pointer-events-none ${
                  isTitleOver ? "text-red-500" : "text-gray-400"
                }`}
              >
                {titleLength}/{TITLE_LIMIT}
              </span>
            </div>
          </header>

          <section className="px-8 py-4">
            <NoticeDetailRichTextEditor
              key={`notice-content-${notice.id}`}
              value={form.content ?? ""}
              onChange={handleContentChange}
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
            className="text-md w-[64px] h-[36px] flex justify-center items-center text-center text-brand border border-brand rounded-sm"
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
                  ? "text-white bg-brand border-brand hover:opacity-90"
                  : "bg-gray-300 text-white border-gray-300 cursor-not-allowed"
              }`}
          >
            {isCreate ? "등록" : "등록"}
          </motion.button>
        </footer>
      </motion.form>

      {/* 모달은 폼 밖으로 분리해서 레이아웃 변화 차단 */}
      <ConfirmModal
        open={openCancelConfirm}
        title={isCreate ? "취소하시겠습니까?" : "취소하시겠습니까?"}
        message={
          isCreate
            ? "작성 중인 내용이 저장되지 않습니다.\n정말 취소하시겠습니까?"
            : "변경 사항이 저장되지 않습니다.\n정말 취소하시겠습니까?"
        }
        confirmText="확인"
        cancelText={isCreate ? "취소" : "취소"}
        onConfirm={() => {
          setOpenCancelConfirm(false);
          onCancel();
        }}
        onClose={() => setOpenCancelConfirm(false)}
      />

      <ConfirmModal
        open={openSaveConfirm}
        title={isCreate ? "등록하시겠습니까?" : "등록하시겠습니까?"}
        message={
          isCreate
            ? "현재 내용을 게시물로 작성합니다.\n등록하시겠습니까?"
            : "현재 수정 내용을 저장합니다.\n등록하시겠습니까?"
        }
        confirmText={isCreate ? "등록" : "등록"}
        cancelText="취소"
        onConfirm={handleConfirmSave}
        onClose={() => setOpenSaveConfirm(false)}
      />
    </>
  );
}
