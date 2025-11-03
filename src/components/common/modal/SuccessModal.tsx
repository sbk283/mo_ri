import { AnimatePresence, motion } from "framer-motion";

interface SuccessModalProps {
  isOpen: boolean;
  message?: string;
  onClose: () => void;
  type?: "success" | "error"; // 추가 (성공/실패 타입)
}

function SuccessModal({
  isOpen,
  message = "완료되었습니다!",
  onClose,
  type = "success",
}: SuccessModalProps) {
  const color = type === "success" ? "text-green-500" : "text-red-500";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black/40 z-[9999]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 성공일 때: 체크 / 실패일 때: X 애니메이션 */}
            {type === "success" ? (
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 52 52"
                className={`w-24 h-24 ${color}`}
              >
                <motion.circle
                  cx="26"
                  cy="26"
                  r="24"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4 }}
                />
                <motion.path
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  d="M14 27l7 7 16-16"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                />
              </motion.svg>
            ) : (
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 52 52"
                className={`w-24 h-24 ${color}`}
              >
                <motion.circle
                  cx="26"
                  cy="26"
                  r="24"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4 }}
                />
                <motion.path
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  d="M18 18l16 16M34 18l-16 16"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                />
              </motion.svg>
            )}

            <p
              className={`mt-4 text-lg font-semibold ${
                type === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {message}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SuccessModal;
