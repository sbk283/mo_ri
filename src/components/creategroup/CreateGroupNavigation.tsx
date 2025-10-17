// 이전 단계, 다음 단계 버튼
interface CreateGroupNavigationProps {
  step: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  onSubmit?: () => void;
  disableNext?: boolean;
}

function CreateGroupNavigation({
  step,
  totalSteps,
  onPrev,
  onNext,
  onSubmit,
  disableNext,
}: CreateGroupNavigationProps) {
  const isFirst = step === 1;
  const isLast = step === totalSteps;

  return (
    <div className="mt-8 flex justify-end gap-5">
      <button
        type="button"
        onClick={onPrev}
        disabled={isFirst}
        className="w-[204px] h-12 text-brand border-brand border font-semibold text-[20px] rounded-sm disabled:opacity-50"
      >
        이전 단계
      </button>
      <button
        type="button"
        onClick={isLast ? (onSubmit ?? onNext) : onNext}
        disabled={disableNext}
        aria-disabled={disableNext}
        className={`w-[204px] h-12 bg-brand font-semibold text-[20px] text-white rounded disabled:opacity-50 ${
          disableNext ? 'bg-gray-300 cursor-not-allowed' : 'bg-brand text-white hover:bg-brand-dark'
        }`}
      >
        {isLast ? '생성 신청' : '다음 단계'}
      </button>
    </div>
  );
}

export default CreateGroupNavigation;
