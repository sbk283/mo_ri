// 개별 커리큘럼 단계
export interface CurriculumItem {
  title: string;
  detail: string;
}

// 모임 생성 전체 폼 데이터
export interface GroupFormData {
  // 카테고리
  interestMajor: string; // 대분류
  interestSub: string; // 중분류

  // 일정
  startDate: string; // 시작일
  endDate: string; // 종료일
  groupType: 'oneday' | 'short' | 'long' | ''; // 모임 유형

  // 지역
  region: string; // 지역명
  regionFree: boolean; // 지역 무관

  // 모임 기본 정보
  title: string; // 모임 이름
  memberCount: number; // 모집 인원
  images: File[]; // 대표 + 서브 이미지
  description: string; // 모임 소개 (RichText)
  summary: string; // 간략 소개

  // 커리큘럼
  curriculum: CurriculumItem[]; // 단계별 커리큘럼
  files: File[][]; // 단계별 첨부 이미지

  // 모임장 정보 - 이거 추후 DB 테이블 네이밍대로 할거임!
  leaderName: string; // 모임장 이름
  leaderLocation: string; // 모임장 위치
  leaderCareer: string; // 모임장 경력
}

// Step1 Props
export interface StepOneProps {
  formData: GroupFormData;
  onChange: <Field extends keyof GroupFormData>(field: Field, value: GroupFormData[Field]) => void;
  onPrev?: () => void;
  onNext?: () => void;
}

// Step2 Props
export interface StepTwoProps {
  formData: GroupFormData;
  onChange: <Field extends keyof GroupFormData>(field: Field, value: GroupFormData[Field]) => void;
  onPrev?: () => void;
  onNext?: () => void;
}

// Step3 Props
export interface StepThreeProps {
  formData: GroupFormData;
  onPrev?: () => void;
  onNext?: () => void;
}
