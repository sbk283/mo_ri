// 로그인 및 타이틀 텍스트가 2줄 이상인 모달
// 애니메이션 좀 넣었어요

import { AnimatePresence, motion } from 'framer-motion';

interface ModalAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  actions?: ModalAction[];
}

function Modal({ isOpen, onClose, title, message, actions = [] }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-[653px] h-[309px] bg-white rounded-md shadow-lg p-8 flex flex-col justify-center items-center text-center"
            style={{ boxShadow: '5px 7px 5px 0 rgba(0,0,0,0.25)', opacity: 0.97 }}
            initial={{ scale: 0.8, opacity: 0, y: -30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.6, opacity: 0, y: -50 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {title && <h2 className="text-[#0762E5] text-2xl font-bold mb-4">{title}</h2>}
            {message && <p className="text-black text-lg font-semibold">{message}</p>}

            <div className="mt-6 flex gap-4">
              {actions.length > 0 ? (
                actions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={action.onClick}
                    className={`px-6 py-2 rounded font-semibold ${
                      action.variant === 'primary'
                        ? 'bg-[#0689E8] text-white'
                        : 'bg-gray-200 text-black'
                    }`}
                  >
                    {action.label}
                  </button>
                ))
              ) : (
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-[#0689E8] text-white font-semibold rounded"
                >
                  닫기
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Modal;
