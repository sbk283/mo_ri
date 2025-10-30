const steps = [
  { id: 1, label: '기본 모임 설정' },
  { id: 2, label: '상세 커리큘럼 작성' },
  { id: 3, label: '미리보기 / 확정' },
];

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex justify-center items-center gap-2 mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center gap-2">
          {/* 왼쪽 선 */}
          {index > 0 && <div className="w-[72px] mr-3 ml-3 h-px bg-brand" />}

          {/* 번호 + 라벨 */}
          <div
            className={`flex items-center gap-2 font-bold text-[20px] ${
              currentStep === step.id ? 'text-brand' : 'text-brand'
            }`}
          >
            <span
              className={`flex items-center justify-center w-[62px] h-[39px] rounded-sm ${
                currentStep === step.id
                  ? 'bg-brand text-white'
                  : 'border-brand border text-brand'
              }`}
            >
              {String(step.id).padStart(2, '0')}_
            </span>
            <span>{step.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StepIndicator;
