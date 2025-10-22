// src/components/common/EditorErrorModal.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

type EditorErrorModalProps = {
  open: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  onClose: () => void;
};

export default function EditorErrorModal({
  open,
  title = '에러',
  message = '',
  confirmText = '확인',
  onClose,
}: EditorErrorModalProps) {
  // ESC 키로 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          aria-modal
          role="dialog"
          aria-labelledby="modal-title"
          className="fixed inset-0 z-[1000] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* 반투명 배경 */}
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />

          {/* 모달 본문 */}
          <motion.div
            className="relative z-[1001] w-[90%] max-w-[420px] rounded-lg bg-white shadow-xl border border-gray-200"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <div className="px-5 pt-5">
              <h2 id="modal-title" className="text-lg font-semibold text-gray-800">
                {title}
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-gray-600 whitespace-pre-line">
                {message}
              </p>
            </div>

            <div className="px-5 py-4 flex justify-end">
              <button
                onClick={onClose}
                className="min-w-[80px] h-[36px] inline-flex items-center justify-center rounded-md text-white bg-[#0689E8] border border-[#0689E8] px-4 text-sm"
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
