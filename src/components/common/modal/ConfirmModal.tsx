import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

export type ConfirmModalProps = {
  open: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
  /** 바깥(배경) 클릭해도 닫히지 않게 하기 */
  preventBackdropClose?: boolean;
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
}: ConfirmModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // ESC로 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // 백드롭 클릭 시 닫기
  const handleBackdropClick = () => {
    if (!preventBackdropClose) onClose();
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
          <div className="absolute inset-0 bg-black/50" />

          {/* 카드 */}
          <motion.div
            ref={dialogRef}
            onClick={e => e.stopPropagation()}
            className="
              relative bg-white rounded-sm shadow-xl
              w-[430px] h-[280px]
              pt-[44px] pb-[70px] px-[20px]
              flex flex-col items-center gap-[33px]
            "
            initial={{ scale: 0.96, y: 8, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.98, y: 6, opacity: 0 }}
            transition={{ duration: 0.18, ease }}
          >
            {/* 제목 */}
            <h2
              id="confirm-title"
              className="text-center font-bold text-[28px] leading-[37px] text-[#0762E5]"
            >
              {title}
            </h2>

            {/* 본문 */}
            <p
              id="confirm-desc"
              className="text-center font-medium text-[17px] leading-[25px] text-black whitespace-pre-line"
            >
              {message}
            </p>

            {/* 버튼 영역 (디자인 고정) */}
            <div className="absolute bottom-[43px] left-0 right-0 flex items-center justify-center gap-6">
              <button
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
                type="button"
                className="
                  w-[78px] h-[40px] px-[13px] py-[7px]
                  inline-flex items-center justify-center
                  rounded-md bg-[#0762E5] text-white font-semibold
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
}
