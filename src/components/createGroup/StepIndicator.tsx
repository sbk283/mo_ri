const steps = [
  { id: 1, label: '기본 모임 설정' },
  { id: 2, label: '상세 커리큘럼 작성' },
  { id: 3, label: '미리보기 / 확정' },
];

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex justify-center gap-10 mb-8">
      {steps.map(step => (
        <div
          key={step.id}
          className={`flex items-center gap-2 font-bold text-[20px] ${
            currentStep === step.id ? 'text-brand' : 'text-brand-light'
          }`}
        >
          {step.id !== 1 && <div className="w-[72px] h-px flex-shrink-0 bg-brand" />}
          <span
            className={`flex items-center justify-center w-[62px] h-[39px] rounded-sm ${
              currentStep === step.id
                ? 'bg-brand text-white'
                : 'border-brand-light border-[1px] text-brand-light'
            }`}
          >
            {String(step.id).padStart(2, '0')}_
          </span>
          <span>{step.label}</span>
        </div>
      ))}
    </div>
  );
}

export default StepIndicator;
