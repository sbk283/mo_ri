// 개별 커리큘럼 단계
export interface CurriculumItem {
  title: string;
  detail: string;
}

// 모임 생성 전체 폼 데이터
export interface GroupFormData {
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
  description: string;
  summary: string;
  curriculum: CurriculumItem[];
}

// Step1 p프랍스
export interface StepOneProps {
  formData: GroupFormData;
  onChange: <Field extends keyof GroupFormData>(field: Field, value: GroupFormData[Field]) => void;
  onPrev?: () => void;
  onNext?: () => void;
}

// Step2 프랍스
export interface StepTwoProps {
  formData: GroupFormData;
  onChange: <Field extends keyof GroupFormData>(field: Field, value: GroupFormData[Field]) => void;
  onPrev?: () => void;
  onNext?: () => void;
}

// Step3 프랍스
export interface StepThreeProps {
  formData: GroupFormData;
  onPrev?: () => void;
  onNext?: () => void;
}
