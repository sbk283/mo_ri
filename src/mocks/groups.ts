// // 더미 데이터 (실제로는 서버에서 가져오게 될 부분이라 추후 수정)
// export type Group = {
//   id: number;
//   title: string;
//   status: '모집중' | '모집예정' | '모집종료';
//   category: string; // 메인 카테고리
//   subCategory: string; // 서브 카테고리
//   desc: string;
//   dday: string;
//   thumbnail: string;
//   images?: string[]; // 스와이퍼용 이미지 배열
//   memberCount: number;
//   memberLimit: number;
//   duration: string; // 날짜, 예: 2025.05.12 ~ 2025.05.12
//   createdAt: string; // 생성일 (최신순 정렬 기준)
// };

// export const dummyGroups: Group[] = [
//   {
//     id: 1,
//     title: '강한 남자들의 모임 [강남모]',
//     status: '모집중',
//     category: '취미/여가',
//     subCategory: '게임/오락',
//     desc: '준비된 트레이너와 함께하는 근력 강화 프로그램. 꾸준히 참여할 수 있는 모임입니다.',
//     dday: 'D-5',
//     thumbnail: 'https://picsum.photos/seed/list1-main/640/420',
//     images: [
//       'https://picsum.photos/seed/list1-main/640/420',
//       'https://picsum.photos/seed/list1-b/640/420',
//       'https://picsum.photos/seed/list1-c/640/420',
//       'https://picsum.photos/seed/list1-d/640/420',
//     ],
//     memberCount: 2,
//     memberLimit: 10,
//     duration: '2025.05.12 ~ 2025.05.12',
//     createdAt: '2025-05-01',
//   },
//   {
//     id: 2,
//     title: 'AI 스터디',
//     status: '모집중',
//     category: '스터디/학습',
//     subCategory: 'IT',
//     desc: '최신 AI 논문을 읽고 토론하는 모임입니다.',
//     dday: 'D-10',
//     thumbnail: 'https://picsum.photos/seed/list2-main/640/420',
//     images: [
//       'https://picsum.photos/seed/list2-main/640/420',
//       'https://picsum.photos/seed/list2-b/640/420',
//       'https://picsum.photos/seed/list2-c/640/420',
//     ],
//     memberCount: 5,
//     memberLimit: 20,
//     duration: '2025.06.01 ~ 2025.08.31',
//     createdAt: '2025-05-05',
//   },
//   {
//     id: 3,
//     title: '힐링 요가 클래스',
//     status: '모집중',
//     category: '운동/건강',
//     subCategory: '힐링/건강관리',
//     desc: '주말 아침 요가로 몸과 마음을 정화해 보세요.',
//     dday: 'D-3',
//     thumbnail: 'https://picsum.photos/seed/list3-main/640/420',
//     images: [
//       'https://picsum.photos/seed/list3-main/640/420',
//       'https://picsum.photos/seed/list3-b/640/420',
//       'https://picsum.photos/seed/list3-c/640/420',
//       'https://picsum.photos/seed/list3-d/640/420',
//     ],
//     memberCount: 8,
//     memberLimit: 15,
//     duration: '2025.05.10 ~ 2025.06.10',
//     createdAt: '2025-04-28',
//   },
//   {
//     id: 4,
//     title: '동네 축구 모임',
//     status: '모집예정',
//     category: '운동/건강',
//     subCategory: '구기활동',
//     desc: '매주 일요일 아침에 모여 즐기는 친선 축구 경기!',
//     dday: 'D-15',
//     thumbnail: 'https://picsum.photos/seed/list4-main/640/420',
//     images: [
//       'https://picsum.photos/seed/list4-main/640/420',
//       'https://picsum.photos/seed/list4-b/640/420',
//       'https://picsum.photos/seed/list4-c/640/420',
//     ],
//     memberCount: 12,
//     memberLimit: 22,
//     duration: '2025.06.01 ~ 2025.09.01',
//     createdAt: '2025-05-03',
//   },
//   {
//     id: 5,
//     title: '쿠킹 클래스 - 이탈리안 요리',
//     status: '모집중',
//     category: '취미/여가',
//     subCategory: '요리/제과·제빵',
//     desc: '파스타부터 디저트까지 함께 만들어 먹는 즐거움!',
//     dday: 'D-2',
//     thumbnail: 'https://picsum.photos/seed/list5-main/640/420',
//     images: [
//       'https://picsum.photos/seed/list5-main/640/420',
//       'https://picsum.photos/seed/list5-b/640/420',
//       'https://picsum.photos/seed/list5-c/640/420',
//       'https://picsum.photos/seed/list5-d/640/420',
//     ],
//     memberCount: 4,
//     memberLimit: 8,
//     duration: '2025.05.15 ~ 2025.05.15',
//     createdAt: '2025-05-07',
//   },
//   {
//     id: 6,
//     title: '자원봉사 캠페인 - 플로깅',
//     status: '모집중',
//     category: '봉사/사회참여',
//     subCategory: '캠페인',
//     desc: '러닝과 쓰레기 줍기를 동시에! 지구를 지키는 작은 실천.',
//     dday: 'D-20',
//     thumbnail: 'https://picsum.photos/seed/list6-main/640/420',
//     images: [
//       'https://picsum.photos/seed/list6-main/640/420',
//       'https://picsum.photos/seed/list6-b/640/420',
//       'https://picsum.photos/seed/list6-c/640/420',
//     ],
//     memberCount: 20,
//     memberLimit: 50,
//     duration: '2025.05.20 ~ 2025.05.20',
//     createdAt: '2025-04-30',
//   },
//   {
//     id: 7,
//     title: '재즈 공연 함께 보기',
//     status: '모집종료',
//     category: '취미/여가',
//     subCategory: '음악/공연/문화',
//     desc: '지난달 성황리에 마친 재즈 공연 관람 모임입니다.',
//     dday: '종료',
//     thumbnail: 'https://picsum.photos/seed/list7-main/640/420',
//     images: [
//       'https://picsum.photos/seed/list7-main/640/420',
//       'https://picsum.photos/seed/list7-b/640/420',
//       'https://picsum.photos/seed/list7-c/640/420',
//     ],
//     memberCount: 30,
//     memberLimit: 30,
//     duration: '2025.03.01 ~ 2025.04.01',
//     createdAt: '2025-04-01',
//   },
// ];
