import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import interestOptions from '../../constants/interestOptions';

type Props = {
  major: string;
  sub: string;
  onChange: (field: 'interestMajor' | 'interestSub', value: string) => void;
};

function InterestSelector({ major, sub, onChange }: Props) {
  const [majorOpen, setMajorOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);

  return (
    <section className="flex gap-10">
      <label className="flex items-center font-semibold mb-2 text-lg">관심사 설정</label>
      <div className="flex gap-4">
        {/* 대분류 */}
        <div className="relative w-[214px]">
          <button
            type="button"
            onClick={() => setMajorOpen(prev => !prev)}
            className={[
              'border border-brand h-10 w-full rounded-sm px-3 py-2 pr-3 flex justify-between items-center',
              major ? 'text-black' : 'text-[#A6A6A6]',
            ].join(' ')}
          >
            {major || '대분류 선택'}
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
                className="absolute left-0 w-full border border-brand bg-white rounded-sm shadow-md z-10"
              >
                {Object.keys(interestOptions).map(m => (
                  <li
                    key={m}
                    onClick={() => {
                      onChange('interestMajor', m);
                      onChange('interestSub', '');
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
        <div className="relative w-[214px]">
          <button
            type="button"
            onClick={() => setSubOpen(prev => !prev)}
            disabled={!major}
            className={[
              'border border-brand h-10 w-full rounded-sm px-3 py-2 pr-3 flex justify-between items-center',
              !major
                ? 'bg-gray-100 text-[#A6A6A6] cursor-not-allowed'
                : sub
                  ? 'text-black'
                  : 'text-[#A6A6A6]',
            ].join(' ')}
          >
            {sub || '중분류 선택'}
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
                className="absolute left-0 w-full border border-brand bg-white rounded-sm shadow-md z-10"
              >
                {(interestOptions[major] ?? []).map(s => (
                  <li
                    key={s}
                    onClick={() => {
                      onChange('interestSub', s);
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

export default InterestSelector;
