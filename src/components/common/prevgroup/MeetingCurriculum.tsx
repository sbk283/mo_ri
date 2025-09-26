// src/components/common/prevgroup/MeetingCurriculum.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GroupFormData } from '../../../types/group';

interface MeetingCurriculumProps {
  formData: GroupFormData;
}

function MeetingCurriculum({ formData }: MeetingCurriculumProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const toggleIndex = (idx: number) => setOpenIndex(openIndex === idx ? null : idx);

  return (
    <div>
      <h4 className="font-semibold mb-3">커리큘럼</h4>
      <div className="space-y-3">
        {formData.curriculum.map((item, i) => {
          const isOpen = openIndex === i;
          const stepFiles = formData.files?.[i] ?? []; // Step2에서 넘어온 파일만 사용

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
                <div className="flex items-start gap-3">
                  {/* (선택) 대표 썸네일 */}
                  {stepFiles[0] && (
                    <img
                      src={URL.createObjectURL(stepFiles[0])}
                      alt="thumb"
                      className="w-[46px] h-[46px] rounded object-cover"
                    />
                  )}
                  <div>
                    <p className="text-sm text-gray-400">
                      {String(i + 1).padStart(2, '0')} 모임 소개
                    </p>
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
                    className="px-4 pb-4 space-y-3 overflow-hidden"
                  >
                    {/* 썸네일 리스트 (최대 3장) */}
                    {stepFiles.length > 0 && (
                      <div className="flex gap-2">
                        {stepFiles.slice(0, 3).map((file, idx) => (
                          <div
                            key={idx}
                            className="w-[120px] h-[120px] border rounded overflow-hidden"
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
