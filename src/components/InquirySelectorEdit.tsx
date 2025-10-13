// 1:1 문의하기 - 문의 유형 설정하기
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import inquiryOption from '../constants/inquiryOption';

type InquirySelectorEditProps = {
  major: string;
  sub: string;
  onChange: (field: 'inquiryMajor' | 'inquirySub', value: string) => void;
  className?: string;
};

function InquirySelectorEdit({ major, sub, onChange, className }: InquirySelectorEditProps) {
  const [majorOpen, setMajorOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);

  return (
    <section className="flex gap-10">
      <div className="flex gap-[8px]">
        {/* 대분류 */}
        <div className="relative w-[210px]">
          <button
            type="button"
            onClick={() => setMajorOpen(prev => !prev)}
            className={[
              'border border-gray-300 h-10 w-full text-md rounded-sm p-[12px] flex justify-between items-center',
              'focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand',
              major ? 'text-black' : 'text-[#A6A6A6] ',
            ].join(' ')}
          >
            {major || '문의 유형을 선택해 주세요.'}
            <motion.img
              src="/images/arrow_down_blue.svg"
              alt="아래화살표"
              className="w-4 h-2"
              animate={{ rotate: majorOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            />
          </button>

          <AnimatePresence>
            {majorOpen && (
              <motion.ul
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute left-0 w-full border border-brand bg-white rounded-sm shadow-card z-10"
              >
                {Object.keys(inquiryOption).map(m => (
                  <li
                    key={m}
                    onClick={() => {
                      onChange('inquiryMajor', m);
                      onChange('inquirySub', '');
                      setMajorOpen(false);
                    }}
                    className="px-3 py-2 hover:bg-brand hover:text-white cursor-pointer"
                  >
                    {m}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {/* 중분류 */}
        <div className="relative w-[210px]">
          <button
            type="button"
            onClick={() => setSubOpen(prev => !prev)}
            disabled={!major}
            className={[
              'border border-gray-300 h-10 w-full rounded-sm text-md p-[12px] flex justify-between items-center',
              'focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand',
              !major
                ? 'bg-gray-100 text-[#A6A6A6] cursor-not-allowed'
                : sub
                  ? 'text-black'
                  : 'text-[#A6A6A6]',
            ].join(' ')}
          >
            {sub || '상세 유형을 선택해 주세요.'}
            <motion.img
              src="/images/arrow_down_blue.svg"
              alt="아래화살표"
              className="w-4 h-2"
              animate={{ rotate: subOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            />
          </button>

          <AnimatePresence>
            {subOpen && major && (
              <motion.ul
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute left-0 w-full border border-brand bg-white rounded-sm shadow-card z-10"
              >
                {(inquiryOption[major] ?? []).map(s => (
                  <li
                    key={s}
                    onClick={() => {
                      onChange('inquirySub', s);
                      setSubOpen(false);
                    }}
                    className="px-3 py-2 hover:bg-brand hover:text-white cursor-pointer"
                  >
                    {s}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

export default InquirySelectorEdit;
