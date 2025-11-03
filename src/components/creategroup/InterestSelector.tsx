// 모임 생성 - StepOne 카테고리 설정
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

type InterestSelectorProps = {
  major: string;
  sub: string;
  onChange: (field: 'interestMajor' | 'interestSub' | 'major_id' | 'sub_id', value: string) => void;
};

function InterestSelector({ major, sub, onChange }: InterestSelectorProps) {
  const [majorOpen, setMajorOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);
  const [majorList, setMajorList] = useState<{ id: string; name: string }[]>([]);
  const [subList, setSubList] = useState<{ id: string; name: string }[]>([]);

  // categories_major 불러오기
  useEffect(() => {
    const fetchMajorCategories = async () => {
      const { data, error } = await supabase
        .from('categories_major')
        .select('major_id, category_major_name')
        .order('category_major_name', { ascending: true });

      if (!error && data) {
        setMajorList(data.map(m => ({ id: m.major_id, name: m.category_major_name })));
      }
    };
    fetchMajorCategories();
  }, []);

  // 대분류 선택 시 해당 중분류 불러오기
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!major) return;
      const selectedMajor = majorList.find(m => m.name === major);
      if (!selectedMajor) return;

      const { data, error } = await supabase
        .from('categories_sub')
        .select('sub_id, category_sub_name')
        .eq('major_id', selectedMajor.id)
        .order('category_sub_name', { ascending: true });

      if (!error && data) {
        setSubList(data.map(s => ({ id: s.sub_id, name: s.category_sub_name })));
      }
    };
    fetchSubCategories();
  }, [major, majorList]);

  return (
    <section className="flex gap-[58px]">
      <label className="flex items-center font-semibold mb-2 text-lg">카테고리</label>
      <div className="flex gap-4">
        {/* 대분류 */}
        <div className="relative w-[214px]">
          <button
            type="button"
            onClick={() => setMajorOpen(prev => !prev)}
            className={[
              'border border-gray-300 h-10 w-full rounded-sm px-3 py-2 flex justify-between items-center',
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
                {majorList.map(m => (
                  <li
                    key={m.id}
                    onClick={() => {
                      onChange('interestMajor', m.name);
                      onChange('major_id', m.id);
                      onChange('interestSub', '');
                      onChange('sub_id', '');
                      setMajorOpen(false);
                    }}
                    className="px-3 py-2 hover:bg-brand hover:text-white cursor-pointer"
                  >
                    {m.name}
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
              'border border-gray-300 h-10 w-full rounded-sm px-3 py-2 flex justify-between items-center',
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
                {subList.map(s => (
                  <li
                    key={s.id}
                    onClick={() => {
                      onChange('interestSub', s.name);
                      onChange('sub_id', s.id);
                      setSubOpen(false);
                    }}
                    className="px-3 py-2 hover:bg-brand hover:text-white cursor-pointer"
                  >
                    {s.name}
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
