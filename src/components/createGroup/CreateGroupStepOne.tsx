// 모임 생성 - 01_ 기본 모임 설정
import BasicInfoInputs from './BasicInfoInputs';
import CreateGroupNavigation from './CreateGroupNavigation';
import DateRangeSelector from './DateRangeSelector';
import ImageUploader from './ImageUploader';
import InterestSelector from './InterestSelector';
import RegionSelector from './RegionSelector';

type Props = {
  formData: {
    interestMajor: string;
    interestSub: string;
    startDate: string;
    endDate: string;
    groupType: string;
    region: string;
    regionFree: boolean;
    title: string;
    memberCount: number;
    images: File[];
  };
  onChange: (field: keyof Props['formData'], value: any) => void;
  onPrev?: () => void;
  onNext?: () => void;
};

function CreateGroupStepOne({ formData, onChange, onPrev, onNext }: Props) {
  // 필수 입력값 체크
  const isValid =
    formData.interestMajor &&
    formData.interestSub &&
    formData.startDate &&
    formData.endDate &&
    formData.groupType &&
    (formData.region || formData.regionFree) &&
    formData.title.trim().length > 0 &&
    formData.memberCount > 0 &&
    formData.images.length > 0;

  return (
    <div className="p-8 bg-white rounded shadow space-y-6">
      <h2 className="text-2xl font-bold mb-2">기본 모임 설정</h2>
      <hr className="mb-6 pb-[51px] border-brand" />

      <InterestSelector
        major={formData.interestMajor}
        sub={formData.interestSub}
        onChange={(field, value) => onChange(field, value)}
      />

      <DateRangeSelector
        startDate={formData.startDate}
        endDate={formData.endDate}
        groupType={formData.groupType}
        onChange={(field, value) => onChange(field, value)}
      />

      <RegionSelector
        region={formData.region}
        regionFree={formData.regionFree}
        onChange={(field, value) => onChange(field, value)}
      />

      <ImageUploader images={formData.images ?? []} onChange={next => onChange('images', next)} />

      <BasicInfoInputs
        title={formData.title}
        memberCount={formData.memberCount}
        onChange={(field, value) => onChange(field, value)}
      />

      {/* 네비게이션 */}
      <CreateGroupNavigation
        step={1}
        totalSteps={3}
        onPrev={onPrev!}
        onNext={onNext!}
        // disableNext={!isValid}
      />
    </div>
  );
}

export default CreateGroupStepOne;
