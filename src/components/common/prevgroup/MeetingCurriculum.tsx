import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GroupFormData } from '../../../types/group';

interface MeetingCurriculumProps {
  formData: GroupFormData;
}

function MeetingCurriculum({ formData }: MeetingCurriculumProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleIndex = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div>
      <h4 className="font-semibold mb-3">커리큘럼</h4>
      <div className="space-y-3">
        {formData.curriculum.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <motion.div
              key={i}
              initial={false}
              animate={{
                borderColor: isOpen ? '#4294CF' : '#e5e7eb',
              }}
              transition={{ duration: 0.3 }}
              className="border rounded-md overflow-hidden"
            >
              {/* 헤더 */}
              <button
                onClick={() => toggleIndex(i)}
                className={`flex w-full justify-between items-center px-4 py-3 text-left ${
                  isOpen ? 'bg-brand/10' : 'bg-gray-50'
                }`}
              >
                <div>
                  <p className="text-sm text-gray-400">
                    {String(i + 1).padStart(2, '0')} 단계 소개
                  </p>
                  <p className="text-lg font-semibold text-gray-800">{item.title || '제목 없음'}</p>
                </div>
                <motion.img
                  src="/images/arrow_down.svg"
                  alt="화살표"
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-4 h-4"
                />
              </button>

              {/* 본문 */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                    className="px-4 pb-4 space-y-2"
                  >
                    {/* Step2에서 넘어온 파일 미리보기 */}
                    {formData.files && formData.files[i] && formData.files[i].length > 0 && (
                      <div className="flex gap-2">
                        {formData.files[i].map((file: File, idx: number) => (
                          <div
                            key={idx}
                            className="w-[80px] h-[80px] border rounded overflow-hidden"
                          >
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`step-${i}-file-${idx}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="text-gray-600 text-sm whitespace-pre-line">
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
