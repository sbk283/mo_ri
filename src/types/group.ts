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
