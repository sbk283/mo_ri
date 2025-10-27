// components/common/LoadingSpinner.tsx
import { motion } from 'framer-motion';

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-100">
      <motion.div
        className="w-10 h-10 border-4 border-t-brand border-gray-100 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
      />
      <p className="mt-4 text-sm text-gray-200">불러오는 중...</p>
    </div>
  );
}

export default LoadingSpinner;
