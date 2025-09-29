// 모임 생성 출력 페이지 (스텝원투쓰리 다모음)

import { AnimatePresence, motion } from 'framer-motion';
// 2025-09-24 업데이트: RichTextEditor 안정성을 위한 useCallback 추가
import { useState, useCallback } from 'react';
import StepIndicator from '../components/creategroup/StepIndicator';
import CreateGroupStepOne from '../components/creategroup/CreateGroupStepOne';
import CreateGroupStepTwo from '../components/creategroup/CreateGroupStepTwo';
import CreateGroupStepThree from '../components/creategroup/CreateGroupStepThree';
import type { GroupFormData } from '../types/group';

const variants = {
  enter: (direction: number) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.35 } },
  exit: (direction: number) => ({
    x: direction > 0 ? '-100%' : '100%',
    opacity: 0,
    transition: { duration: 0.35 },
  }),
};

function CreateGroupPage() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  const [formData, setFormData] = useState({
    interestMajor: '',
    interestSub: '',
    startDate: '',
    endDate: '',
    groupType: '' as GroupFormData['groupType'],
    region: '',
    regionFree: false,
    title: '',
    summary: '',
    memberCount: 0,
    images: [] as File[],
    description: '',
    // 이거 지우ㅁㄴ 안대!!
    curriculum: [
      { title: '', detail: '' },
      { title: '', detail: '' },
    ],
    files: [] as File[][],
    leaderName: '',
    leaderLocation: '',
    leaderCareer: '',
  });

  // 2025-01-24 업데이트: handleChange 함수 메모이제이션으로 RichTextEditor 리렌더링 방지
  const handleChange = useCallback(
    <Field extends keyof typeof formData>(field: Field, value: (typeof formData)[Field]) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    },
    [],
  );

  // 2025-01-24 업데이트: next, prev 함수 메모이제이션으로 안정성 향상
  const next = useCallback(() => {
    if (step < 3) {
      setDirection(1);
      setStep(s => s + 1);
    }
  }, [step]);

  const prev = useCallback(() => {
    if (step > 1) {
      setDirection(-1);
      setStep(s => s - 1);
    }
  }, [step]);

  return (
    <div className="mx-auto w-[1024px] pt-28 pb-20">
      {/* 카드(폼) 내부에 모든 것을 넣음 */}
      <motion.div layout className="bg-white rounded-lg shadow-card p-8">
        <h1 className="text-2xl font-bold mb-6">모임 생성하기</h1>

        {/* StepIndicator도 카드 내부로 이동 */}
        <div className="mb-6">
          <StepIndicator currentStep={step} />
        </div>

        {/* 애니메이션 컨테이너: overflow-hidden으로 슬라이드 시 보이는 영역만 유지 */}
        <motion.div layout className="overflow-hidden">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full"
              layout
            >
              {/* 각 Step에 onPrev/onNext를 내려줌 */}
              {step === 1 && (
                <CreateGroupStepOne
                  formData={formData}
                  onChange={handleChange}
                  onPrev={prev}
                  onNext={next}
                />
              )}
              {step === 2 && (
                <CreateGroupStepTwo
                  formData={formData}
                  onChange={handleChange}
                  onPrev={prev}
                  onNext={next}
                />
              )}
              {step === 3 && (
                <CreateGroupStepThree formData={formData} onPrev={prev} onNext={next} />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default CreateGroupPage;
