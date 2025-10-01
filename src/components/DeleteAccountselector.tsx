import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import deletedOption from '../constants/deletedOption';

type DeleteAccountSelectorProps = {
  reasons: string;
  onChange: (reason: string) => void;
};

function DeleteAccountSelector({ reasons, onChange }: DeleteAccountSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <section className="flex gap-10 w-full">
      <div className="relative w-full">
        {/* 버튼 */}
        <button
          type="button"
          onClick={() => setOpen(prev => !prev)}
          className={[
            'border border-gray-300 h-10 w-full text-md rounded-sm px-[12px] flex justify-between items-center',
            'focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand',
            reasons ? 'text-black' : 'text-[#A6A6A6]',
          ].join(' ')}
        >
          {reasons || '탈퇴 사유를 선택해 주세요.'}
          <motion.img
            src="/images/arrow_down_blue.svg"
            alt="아래화살표"
            className="w-4 h-2"
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          />
        </button>

        {/* 드롭다운 리스트 */}
        <AnimatePresence>
          {open && (
            <motion.ul
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 w-full border border-brand bg-white rounded-sm shadow-card z-10"
            >
              {deletedOption.map(option => (
                <li
                  key={option}
                  onClick={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                  className="px-3 py-2 hover:bg-brand hover:text-white cursor-pointer"
                >
                  {option}
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

export default DeleteAccountSelector;
