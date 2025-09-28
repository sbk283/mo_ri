import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CurriculumItem {
  title: string;
  detail: string;
  files?: string[];
}

interface MeetingCurriculumProps {
  curriculum: CurriculumItem[];
}

function MeetingCurriculum({ curriculum }: MeetingCurriculumProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const toggleIndex = (idx: number) => setOpenIndex(openIndex === idx ? null : idx);

  return (
    <div>
      <h4 className="font-semibold mb-3">커리큘럼</h4>
      <div className="space-y-3">
        {curriculum.map((item, i) => {
          const isOpen = openIndex === i;
          const stepFiles = item.files ?? [];

          return (
            <motion.div
              key={i}
              initial={false}
              animate={{ borderColor: isOpen ? '#4294CF' : '#e5e7eb' }}
              transition={{ duration: 0.25 }}
              className="border rounded-md overflow-hidden"
            >
              {/* 헤더 */}
              <button
                onClick={() => toggleIndex(i)}
                className={`flex w-full h-auto justify-between items-center px-4 py-3 text-left ${
                  isOpen ? 'bg-brand/10' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-4">
                  {stepFiles[0] && (
                    <img
                      src={stepFiles[0]}
                      alt="thumb"
                      className="w-[101px] h-[70px] rounded object-cover"
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[20px] text-brand font-bold">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-[12px] text-gray-600">모임 소개</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-800">
                      {item.title || '제목 없음'}
                    </p>
                  </div>
                </div>

                <motion.img
                  src="/images/arrow_down.svg"
                  alt="토글"
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-4 h-4"
                />
              </button>

              {/* 본문 */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="px-4 pb-4 space-y-3 overflow-hidden pt-4"
                  >
                    {stepFiles.length > 0 && (
                      <div className="flex gap-2">
                        {stepFiles.slice(0, 3).map((file, idx) => (
                          <div
                            key={idx}
                            className="w-[120px] h-[120px] border border-[#D9D9D9] rounded overflow-hidden"
                          >
                            <img
                              src={file}
                              alt={`step-${i}-file-${idx}`}
                              className="w-[132px] h-[125px] object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-gray-900 text-md font-normal whitespace-pre-line">
                      {item.detail || '내용 없음'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default MeetingCurriculum;
