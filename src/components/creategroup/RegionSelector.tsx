import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import regionOptions from '../../constants/regionOptions';

type RegionSelectionProps = {
  sido: string;
  sigungu: string;
  regionFree: boolean;
  onChange: (field: 'sido' | 'sigungu' | 'regionFree', value: string | boolean) => void;
};

function RegionSelection({ sido, sigungu, regionFree, onChange }: RegionSelectionProps) {
  const [localSido, setLocalSido] = useState(sido);
  const [localSigungu, setLocalSigungu] = useState(sigungu);
  const [sidoOpen, setSidoOpen] = useState(false);
  const [sigunguOpen, setSigunguOpen] = useState(false);

  useEffect(() => setLocalSido(sido), [sido]);
  useEffect(() => setLocalSigungu(sigungu), [sigungu]);

  const handleSelectSido = (selected: string) => {
    setLocalSido(selected); // UI 즉시 반영
    setLocalSigungu(''); // 시/군/구 초기화
    onChange('sido', selected); // 부모 업데이트
    onChange('sigungu', ''); // 부모 업데이트
    setSidoOpen(false);
    setSigunguOpen(true);
  };

  const handleSelectSigungu = (selected: string) => {
    setLocalSigungu(selected);
    onChange('sigungu', selected);
    setSigunguOpen(false);
  };

  // 드롭다운 토글
  const toggleSido = () => {
    setSidoOpen(prev => !prev);
    setSigunguOpen(false);
  };
  const toggleSigungu = () => {
    setSigunguOpen(prev => !prev);
    setSidoOpen(false);
  };

  return (
    <section className="flex gap-[58px] items-start relative z-40">
      <label className="font-semibold text-lg mt-2">지역 선택</label>

      <div className="flex gap-4 items-center">
        {/* 시/도 선택 */}
        <div className="relative w-[214px]">
          <button
            type="button"
            disabled={regionFree}
            onClick={toggleSido}
            className={[
              'border border-gray-300 h-10 w-full rounded-sm px-3 py-2 flex justify-between items-center',
              regionFree
                ? 'bg-gray-100 text-[#A6A6A6] cursor-not-allowed'
                : localSido
                  ? 'text-black'
                  : 'text-[#A6A6A6]',
            ].join(' ')}
          >
            {localSido || '시/도 선택'}
            <motion.img
              src="/images/arrow_down_blue.svg"
              alt="arrow"
              className="w-4 h-2"
              animate={{ rotate: sidoOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            />
          </button>

          <AnimatePresence>
            {sidoOpen && !regionFree && (
              <motion.ul
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute left-0 w-full border border-brand bg-white rounded-sm shadow-md z-50 max-h-[400px] overflow-y-auto"
              >
                {regionOptions.map(r => (
                  <li
                    key={r.sido}
                    onClick={() => handleSelectSido(r.sido)}
                    className="px-3 py-2 hover:bg-brand hover:text-white cursor-pointer select-none"
                  >
                    {r.sido}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {/* 시/군/구 선택 */}
        <div className="relative w-[214px]">
          <button
            type="button"
            onClick={toggleSigungu}
            disabled={!localSido || regionFree}
            className={[
              'border border-gray-300 h-10 w-full rounded-sm px-3 py-2 flex justify-between items-center',
              !localSido || regionFree
                ? 'bg-gray-100 text-[#A6A6A6] cursor-not-allowed'
                : localSigungu
                  ? 'text-black'
                  : 'text-[#A6A6A6]',
            ].join(' ')}
          >
            {localSigungu || '시/군/구 선택'}
            <motion.img
              src="/images/arrow_down_blue.svg"
              alt="arrow"
              className="w-4 h-2"
              animate={{ rotate: sigunguOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            />
          </button>

          <AnimatePresence>
            {sigunguOpen && localSido && !regionFree && (
              <motion.ul
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute left-0 w-full border border-brand bg-white rounded-sm shadow-md z-50 max-h-[400px] overflow-y-auto"
              >
                {(regionOptions.find(r => r.sido === localSido)?.sigungu ?? []).map(s => (
                  <li
                    key={s}
                    onClick={() => handleSelectSigungu(s)}
                    className="px-3 py-2 hover:bg-brand hover:text-white cursor-pointer select-none"
                  >
                    {s}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {/* 지역 무관 체크 */}
        <label
          className={[
            'flex items-center gap-2 cursor-pointer text-md',
            regionFree ? 'text-black font-semibold' : 'text-[#A6A6A6] font-semibold',
          ].join(' ')}
        >
          <input
            type="checkbox"
            checked={regionFree}
            onChange={e => onChange('regionFree', e.target.checked)}
            className="bg-gray-100"
          />
          지역 무관
        </label>
      </div>
    </section>
  );
}

export default RegionSelection;
