import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import CreateGroupStepOne from '../components/createGroup/CreateGroupStepOne';
import CreateGroupStepThree from '../components/createGroup/CreateGroupStepThree';
import CreateGroupStepTwo from '../components/createGroup/CreateGroupStepTwo';
import StepIndicator from '../components/createGroup/StepIndicator';

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
    groupType: '',
    region: '',
    regionFree: false,
    title: '',
    memberCount: 0,
    images: [] as File[],
    description: '',
    curriculum: [''],
  });

  const handleChange = (field: string, value: any) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const next = () => {
    if (step < 3) {
      setDirection(1);
      setStep(s => s + 1);
    }
  };
  const prev = () => {
    if (step > 1) {
      setDirection(-1);
      setStep(s => s - 1);
    }
  };

  return (
    <div className="mx-auto w-[1024px] pt-28 pb-20">
      {/* 카드(폼) 내부에 모든 것을 넣음 */}
      <motion.div layout className="bg-white rounded-lg shadow p-8">
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
