import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export type ConfirmModalProps = {
  open: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
  preventBackdropClose?: boolean;
  portalTarget?: Element | null;
};

export default function ConfirmModal({
  open,
  title = '찜을 해제하시겠습니까?',
  message = '해제 후에도 언제든 다시 찜할 수 있습니다.\n정말 해제 하시겠습니까?',
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onClose,
  preventBackdropClose = false,
  portalTarget,
}: ConfirmModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // ESC 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // 배경 클릭 닫기
  const handleBackdropClick = () => {
    if (!preventBackdropClose) onClose();
  };

  // 스크롤 락
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (!open) return;

    const { body, documentElement } = document;
    const prevOverflow = body.style.overflow;
    const prevPosition = body.style.position;
    const prevTop = body.style.top;
    const prevWidth = body.style.width;
    const prevLeft = body.style.left;
    const prevRight = body.style.right;
    const prevScrollBehavior = documentElement.style.scrollBehavior;

    const scrollY = window.scrollY || window.pageYOffset || 0;

    documentElement.style.scrollBehavior = 'auto';
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';

    return () => {
      body.style.overflow = prevOverflow;
      body.style.position = prevPosition;
      body.style.top = prevTop;
      body.style.left = prevLeft;
      body.style.right = prevRight;
      body.style.width = prevWidth;

      const y = Math.abs(parseInt(prevTop || `-${scrollY}`, 10)) || scrollY;
      window.scrollTo(0, y);

      documentElement.style.scrollBehavior = prevScrollBehavior;
    };
  }, [open]);

  const ease = [0.22, 0.61, 0.36, 1] as const;
  const portalEl =
    portalTarget ??
    (typeof document !== 'undefined' ? document.body : (null as unknown as Element));

  const modalNode = (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[1001] flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          aria-describedby="confirm-desc"
          onClick={handleBackdropClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* 오버레이 */}
          <div className="absolute inset-0 bg-black/50 z-[1000]" />

          {/* 카드 */}
          <motion.div
            ref={dialogRef}
            onClick={e => e.stopPropagation()}
            className="
              relative bg-white rounded-sm shadow-xl
              w-[430px] h-[280px]
              pt-[44px] pb-[70px] px-[20px]
              flex flex-col items-center gap-[33px]
              z-[1001]
            "
            initial={{ scale: 0.96, y: 8, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.98, y: 6, opacity: 0 }}
            transition={{ duration: 0.18, ease }}
          >
            <h2
              id="confirm-title"
              className="text-center font-bold text-xxl leading-[37px] text-[#0762E5]"
            >
              {title}
            </h2>

            <p
              id="confirm-desc"
              className="text-center font-medium text-lg leading-[25px] text-black whitespace-pre-line"
            >
              {message}
            </p>

            <div className="absolute bottom-[43px] left-0 right-0 flex items-center justify-center gap-6">
              <button
                type="button"
                className="
                  w-[78px] h-[40px] px-[13px] py-[7px]
                  inline-flex items-center justify-center
                  rounded-sm border border-[#0762E5]
                  text-[#0762E5] font-semibold
                  hover:bg-[#0762E5]/5 active:scale-[0.98] transition
                "
                onClick={onClose}
              >
                {cancelText}
              </button>

              <button
                type="button"
                className="
                  w-[78px] h-[40px] px-[13px] py-[7px]
                  inline-flex items-center justify-center
                  rounded-sm bg-[#0762E5] text-white font-semibold
                  shadow-sm hover:brightness-105 active:scale-[0.98] transition
                "
                onClick={onConfirm}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!mounted || !portalEl) return null;
  return createPortal(modalNode, portalEl);
}
