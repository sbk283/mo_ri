import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
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
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
    }
  }, [user, navigate]);

  // 로그인 안된 상태면 페이지 안보이게
  if (!user) return null;

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [formData, setFormData] = useState({
    // 카테고리
    interestMajor: '',
    interestSub: '',

    // FK
    major_id: '',
    sub_id: '',

    // 일정
    startDate: '',
    endDate: '',
    groupType: '' as GroupFormData['groupType'],

    // 지역
    group_region: '',
    group_region_any: false,

    // 기본 정보
    title: '',
    summary: '',
    memberCount: 0,
    images: [] as File[],
    description: '',

    // 커리큘럼
    curriculum: [
      { title: '', detail: '' },
      { title: '', detail: '' },
    ],
    files: [] as File[][],

    // 모임장 정보
    leaderName: '',
    leaderLocation: '',
    leaderCareer: '',
  });

  const handleChange = useCallback(
    <Field extends keyof typeof formData>(field: Field, value: (typeof formData)[Field]) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    },
    [],
  );

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
      <motion.div layout className="bg-white rounded-lg shadow-card p-8">
        <h1 className="text-2xl font-bold mb-6 ml-8">모임 생성하기</h1>

        <div className="mb-6">
          <StepIndicator currentStep={step} />
        </div>

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
