import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useLayoutEffect, useRef } from 'react';

export type ConfirmModalProps = {
  open: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
  /** 바깥(배경) 클릭해도 닫히지 않게 */
  preventBackdropClose?: boolean;
};

export default function RemoveModal({
  open,
  title = '리뷰를 삭제하시겠습니까?',
  message = '삭제하면 다시 작성할 수 없으니\n신중하게 선택해 주세요.',
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onClose,
  preventBackdropClose = false,
}: ConfirmModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const confirmingRef = useRef(false); // 중복 실행 방지

  // 바디 스크롤 잠금 + 포커스 복귀 지점 저장
  useLayoutEffect(() => {
    if (!open) return;
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
      // 포커스 복귀
      previouslyFocusedRef.current?.focus?.();
    };
  }, [open]);

  // 최초 포커스(취소 버튼) & 간단 포커스 트랩
  useEffect(() => {
    if (!open) return;
    // 첫 포커스
    setTimeout(() => {
      cancelBtnRef.current?.focus();
    }, 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      // ESC 닫기
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // Tab 포커스 순환(포커스 트랩)
      if (e.key === 'Tab') {
        const root = dialogRef.current;
        if (!root) return;
        const focusables = root.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (e.shiftKey) {
          if (active === first || !root.contains(active)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (active === last) {
            e.preventDefault();
            first.focus();
          }
        }
        return;
      }

      // Enter 확인: 입력 컴포넌트/조합 중/조합키 포함이면 무시
      if (e.key === 'Enter') {
        const target = e.target as HTMLElement | null;
        const tag = (target?.tagName || '').toLowerCase();
        const isFormInput =
          tag === 'input' ||
          tag === 'textarea' ||
          tag === 'select' ||
          (target as HTMLElement)?.isContentEditable === true;

        // 한글/일본어 입력 중 조합키 방지
        // @ts-ignore: 일부 브라우저에서 존재
        if ((e as any).isComposing) return;

        // 수정키(Shift/Ctrl/Alt/Meta) 동반 시 무시
        if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return;

        // 입력창 안에서는 Enter 기본 동작 우선 (줄바꿈 등)
        if (isFormInput) return;

        e.preventDefault();
        safeConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, onConfirm]);

  // 바깥 클릭 시 닫기
  const handleBackdropClick = () => {
    if (!preventBackdropClose) onClose();
  };

  // 중복 실행 방지 래퍼
  const safeConfirm = () => {
    if (confirmingRef.current) return;
    confirmingRef.current = true;
    try {
      onConfirm();
    } finally {
      // confirm 흐름에서 외부 상태로 닫히는 게 일반적이지만,
      // 혹시 모를 경우를 대비해 짧게 풀어줌
      setTimeout(() => {
        confirmingRef.current = false;
      }, 300);
    }
  };

  // 애니메이션 프리셋
  const ease = [0.22, 0.61, 0.36, 1] as const;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[1000] flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          aria-describedby="confirm-desc"
          onClick={handleBackdropClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* 배경 */}
          <div className="absolute inset-0 bg-black/50 z-[1000]" />

          {/* 카드 */}
          <motion.div
            ref={dialogRef}
            onClick={e => e.stopPropagation()}
            className="
              relative bg-white rounded-sm shadow-xl
              w-[430px] h-[280px]
              pt-[44px] pb-[70px] px-[20px]
              flex flex-col items-center gap-[33px] z-[1001]
            "
            initial={{ scale: 0.96, y: 8, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.98, y: 6, opacity: 0 }}
            transition={{ duration: 0.18, ease }}
          >
            {/* 제목 */}
            <h2
              id="confirm-title"
              className="text-center font-bold text-xxl leading-[37px] text-[#0762E5]"
            >
              {title}
            </h2>

            {/* 본문 */}
            <p
              id="confirm-desc"
              className="text-center font-medium text-lg leading-[25px] text-black whitespace-pre-line"
            >
              {message}
            </p>

            {/* 버튼 영역 (디자인 고정) */}
            <div className="absolute bottom-[43px] left-0 right-0 flex items-center justify-center gap-6">
              <button
                ref={cancelBtnRef}
                type="button"
                className="
                  w-[78px] h-[40px] px-[13px] py-[7px]
                  inline-flex items-center justify-center
                  rounded-md border border-[#0762E5]
                  text-[#0762E5] font-semibold
                  hover:bg-[#0762E5]/5 active:scale-[0.98] transition
                "
                onClick={onClose}
              >
                {cancelText}
              </button>

              <button
                ref={confirmBtnRef}
                type="button"
                className="
                  w-[78px] h-[40px] px-[13px] py-[7px]
                  inline-flex items-center justify-center
                  rounded-sm bg-[#0762E5] text-white font-semibold
                  shadow-sm hover:brightness-105 active:scale-[0.98] transition
                "
                onClick={safeConfirm}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
