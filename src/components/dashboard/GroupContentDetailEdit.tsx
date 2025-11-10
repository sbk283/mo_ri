import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { Notice } from "../../types/notice";
import NoticeDetailRichTextEditor from "../NoticeDetailRichTextEditor";
import ConfirmModal from "../common/modal/ConfirmModal";

type Props = {
  notice: Notice;
  onCancel: () => void;
  onSave: (next: Notice) => void;
};

const TITLE_LIMIT = 50;

// GroupContentPage랑 맞춰서 관리할 쿼리 키들
const DETAIL_KEYS = ["post", "view", "mode", "edit", "create"] as const;

// 공통 정규화 유틸
const zws = /\u200B/g;
const nbsp = /\u00A0/g;
const brParas = /<p><br><\/p>/gi;
const trimBr = /^(<br\s*\/?>)+|(<br\s*\/?>)+$/gi;

// 제목 정규화
const normTitle = (s?: string | null) => (s ?? "").replace(/\s+/g, " ").trim();

// 내용 비교/텍스트 추출용 정규화
const normalizeTextForCompare = (raw?: string | null) =>
  (raw ?? "")
    .replace(zws, "")
    .replace(nbsp, " ")
    .replace(brParas, "")
    .replace(trimBr, "")
    // 모든 태그 제거
    .replace(/<[^>]*>/g, " ")
    // 공백 압축
    .replace(/\s+/g, " ")
    .trim();

// dirty 비교에 쓸 content 정규화
const normContent = (raw?: string | null) => normalizeTextForCompare(raw);

// “내용이 존재하는가?” 판별
const hasMeaningfulContent = (raw?: string | null) => {
  const base = raw ?? "";

  // 이미지(HTML)
  if (/<img\b[^>]*src=['"][^'"]+['"][^>]*>/i.test(base)) return true;
  // 마크다운 이미지
  if (/!\[[^\]]*]\(([^)\s]+)(?:\s*"[^"]*")?\)/.test(base)) return true;

  // 텍스트 기준으로 판단
  const text = normalizeTextForCompare(base);
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

  const navigate = useNavigate();
  const location = useLocation();

  const isCreate = (notice?.id ?? 0) === 0;
  const titleLength = form.title?.length ?? 0;
  const isTitleEmpty = normTitle(form.title).length === 0;
  const isTitleOver = titleLength > TITLE_LIMIT;

  // 초기 스냅샷 (정규화해서 저장)
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

  // 현재 폼 값 기준으로 dirty 다시 계산
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
      // 새 글: 유효성만 만족
      return !isTitleEmpty && !isTitleOver && isContentValid;
    }
    // 수정: 실제 변경(dirty) + 유효성
    return dirty && !isTitleEmpty && !isTitleOver && isContentValid;
  }, [isCreate, dirty, isTitleEmpty, isTitleOver, isContentValid]);

  // 모달 제어
  const [openCancelConfirm, setOpenCancelConfirm] = useState(false);
  const [openSaveConfirm, setOpenSaveConfirm] = useState(false);

  // 리스트로 이동
  const navigateToList = () => {
    const sp = new URLSearchParams(location.search);
    DETAIL_KEYS.forEach((k) => sp.delete(k));
    const qs = sp.toString();
    navigate(
      {
        pathname: location.pathname,
        search: qs ? `?${qs}` : "",
      },
      { replace: true },
    );
  };

  // 상세로 이동 (postId 있으면 그걸 우선 사용)
  const navigateToDetail = () => {
    const postId = (notice as any).postId ?? notice.id;
    if (!postId) {
      navigateToList();
      return;
    }

    const sp = new URLSearchParams(location.search);
    DETAIL_KEYS.forEach((k) => sp.delete(k));
    sp.set("post", String(postId));
    sp.set("view", "detail");

    const qs = sp.toString();
    navigate(
      {
        pathname: location.pathname,
        search: qs ? `?${qs}` : "",
      },
      { replace: true },
    );
  };

  // 취소 버튼 클릭 시
  const handleRequestCancel = () => {
    if (isCreate) {
      // 새 작성: 아무것도 안 썼으면 바로 리스트로
      const hasAny =
        normTitle(form.title).length > 0 ||
        hasMeaningfulContent(form.content ?? "");
      if (!hasAny) {
        navigateToList();
        onCancel();
        return;
      }
      // 뭔가 써있으면 모달
      setOpenCancelConfirm(true);
      return;
    }

    // 수정: 변경 안 했으면 바로 상세로
    if (!dirty) {
      navigateToDetail();
      onCancel();
      return;
    }

    // 변경 했으면 모달
    setOpenCancelConfirm(true);
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
      content: form.content ?? "",
    };
    onSave(next);
    initial.current = {
      title: normTitle(next.title),
      content: normContent(next.content),
    };
    setDirty(false);
  };

  // 취소 모달에서 "확인" 눌렀을 때
  const handleConfirmCancel = () => {
    setOpenCancelConfirm(false);

    if (isCreate) {
      navigateToList();
    } else {
      navigateToDetail();
    }

    onCancel();
  };

  return (
    <>
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

      <ConfirmModal
        open={openCancelConfirm}
        title="취소하시겠습니까?"
        message={
          isCreate
            ? "작성 중인 내용이 저장되지 않습니다.\n정말 취소하시겠습니까?"
            : "변경 사항이 저장되지 않습니다.\n정말 취소하시겠습니까?"
        }
        confirmText="확인"
        cancelText="취소"
        onConfirm={handleConfirmCancel}
        onClose={() => setOpenCancelConfirm(false)}
      />

      <ConfirmModal
        open={openSaveConfirm}
        title="등록하시겠습니까?"
        message={
          isCreate
            ? "현재 내용을 게시물로 작성합니다.\n등록하시겠습니까?"
            : "현재 수정 내용을 저장합니다.\n등록하시겠습니까?"
        }
        confirmText="등록"
        cancelText="취소"
        onConfirm={handleConfirmSave}
        onClose={() => setOpenSaveConfirm(false)}
      />
    </>
  );
}
