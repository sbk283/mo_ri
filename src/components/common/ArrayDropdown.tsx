// 정렬 드롭다운 공용 컴포넌트 입니다.  (최신순, 수용인원, 가격낮은 순 등...)

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SortDropdownProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

function SortDropdown({ options, value, onChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="border border-[#D9D9D9] rounded px-3 py-1 text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand flex items-center gap-1"
      >
        {value}
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <img src="/images/arrow_down.svg" alt="정렬" />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-28 bg-white border border-gray-200 rounded shadow-md z-10"
          >
            {options.map(option => (
              <li key={option}>
                <button
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                    value === option ? 'text-brand font-semibold' : 'text-gray-700'
                  }`}
                >
                  {option}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SortDropdown;
