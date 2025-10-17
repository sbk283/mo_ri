import { useState, useEffect } from 'react';
import type { GroupFormData } from '../../types/group';
import { combineRegion, parseRegion } from '../../utils/region';
import BasicInfoInputs from './BasicInfoInputs';
import CreateGroupNavigation from './CreateGroupNavigation';
import DateRangeSelector from './DateRangeSelector';
import ImageUploader from './ImageUploader';
import InterestSelector from './InterestSelector';
import RegionSelection from './RegionSelector';

type Props = {
  formData: GroupFormData;
  onChange: <Field extends keyof GroupFormData>(field: Field, value: GroupFormData[Field]) => void;
  onPrev?: () => void;
  onNext?: () => void;
};

function CreateGroupStepOne({ formData, onChange, onPrev, onNext }: Props) {
  const [regionState, setRegionState] = useState(() => parseRegion(formData.group_region));

  const { sido, sigungu } = parseRegion(formData.group_region);

  useEffect(() => {
    setRegionState(parseRegion(formData.group_region));
  }, [formData.group_region]);

  // 지역 유효성
  const hasValidRegion = formData.group_region_any || (sido && sigungu);

  // 유효성 검증
  const isValid =
    formData.interestMajor &&
    formData.interestSub &&
    formData.startDate &&
    formData.endDate &&
    formData.groupType &&
    hasValidRegion && // 여기서 사용 가능
    formData.title.trim().length > 0 &&
    formData.memberCount > 0 &&
    formData.images.length > 0;

  // 지역 변경 핸들러
  const handleRegionChange = (
    field: 'sido' | 'sigungu' | 'regionFree',
    value: string | boolean,
  ) => {
    if (field === 'regionFree') {
      onChange('group_region_any', value as boolean);
      if (value) onChange('group_region', '');
      return;
    }

    setRegionState(prev => {
      const next = { ...prev, [field]: value };
      const regionString = combineRegion(next.sido, next.sigungu);
      onChange('group_region', regionString);
      console.log('지역 변경됨:', regionString);
      return next;
    });
  };

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

      <RegionSelection
        sido={regionState.sido}
        sigungu={regionState.sigungu}
        regionFree={formData.group_region_any}
        onChange={handleRegionChange}
      />

      <BasicInfoInputs
        title={formData.title}
        memberCount={formData.memberCount}
        onChange={(field, value) => onChange(field, value)}
      />

      <ImageUploader images={formData.images ?? []} onChange={next => onChange('images', next)} />

      <CreateGroupNavigation
        step={1}
        totalSteps={3}
        onPrev={onPrev!}
        onNext={onNext!}
        disableNext={!isValid}
      />
    </div>
  );
}

export default CreateGroupStepOne;
