export type CategoryType = '운동/건강' | '스터디/학습' | '취미/여가' | '봉사/사회참여';

export type userCareersType = {
  id: number;
  title: string;
  category: CategoryType;
  period: {
    start: string;
    end: string;
  };
  isChecked: boolean;
  status: '진행중' | '종료';
  detailLink: string;
  created_by: boolean;
};

export const userCareers: userCareersType[] = [
  {
    id: 1,
    title: '단기 속성 피그마 스터디 하기',
    category: '스터디/학습',
    period: {
      start: '2025.02.12',
      end: '2025.02.20',
    },
    isChecked: false,
    status: '종료',
    detailLink: '/groupdetail/5',
    created_by: true,
  },
  {
    id: 2,
    title: '한강 러닝크루 기초부터 차근차근!',
    category: '운동/건강',
    period: {
      start: '2025.10.01',
      end: '2025.11.30',
    },
    isChecked: false,
    status: '진행중',
    detailLink: '/groupdetail/5',
    created_by: false,
  },
  {
    id: 3,
    title: '주말 그림 그리기 취미 클래스',
    category: '취미/여가',
    period: {
      start: '2025.09.01',
      end: '2025.12.31',
    },
    isChecked: false,
    status: '진행중',
    detailLink: '/groupdetail/6',
    created_by: false,
  },
  {
    id: 4,
    title: '지역 봉사단 환경정화 활동',
    category: '봉사/사회참여',
    period: {
      start: '2025.03.15',
      end: '2025.06.15',
    },
    isChecked: false,
    status: '종료',
    detailLink: '/groupdetail/7',
    created_by: false,
  },
  {
    id: 5,
    title: '매주 수요일 영어회화 스터디',
    category: '스터디/학습',
    period: {
      start: '2025.04.01',
      end: '2025.09.30',
    },
    isChecked: false,
    status: '진행중',
    detailLink: '/groupdetail/8',
    created_by: false,
  },
  {
    id: 6,
    title: '아침 요가로 활기찬 하루 시작하기',
    category: '운동/건강',
    period: {
      start: '2025.05.10',
      end: '2025.08.10',
    },
    isChecked: false,
    status: '종료',
    detailLink: '/groupdetail/9',
    created_by: false,
  },
  {
    id: 7,
    title: '주말 가족 영화관 나들이',
    category: '취미/여가',
    period: {
      start: '2025.07.01',
      end: '2025.07.31',
    },
    isChecked: false,
    status: '종료',
    detailLink: '/groupdetail/10',
    created_by: false,
  },
  {
    id: 8,
    title: '노인복지센터 주 1회 봉사활동',
    category: '봉사/사회참여',
    period: {
      start: '2025.01.01',
      end: '2025.12.31',
    },
    isChecked: false,
    status: '진행중',
    detailLink: '/groupdetail/11',
    created_by: false,
  },
];
