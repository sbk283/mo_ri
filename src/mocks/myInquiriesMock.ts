// 문의내역 더미 데이터입니다..

export const mockInquiries = [
  {
    id: 1,
    name: '홍길동',
    email: 'hong.gildong@example.com',
    date: '2025.09.03',
    content: '모임 취소 할래요. 어떻게 해야 하나요?',
    contentDetail:
      '참여 중인 모임을 취소하고 싶습니다. 모임 페이지에서 나가기 버튼을 눌러도 반응이 없어요. 어떻게 취소할 수 있을까요?',
    maincategory: '모임 탐색 / 참여 ',
    subcategory: '모임 탐색 / 참여 ',
    status: '답변대기',
    replyDate: '-',
  },
  {
    id: 2,
    name: '김영희',
    email: 'kim.younghee@example.com',
    date: '2025.08.27',
    content: '비밀번호를 변경하고 싶어요.',
    contentDetail:
      '현재 비밀번호를 잊어버려서 새 비밀번호로 변경하려고 하는데, 이메일 인증 단계에서 오류가 발생합니다. 해결 방법이 있을까요?',
    maincategory: '모임 탐색 / 참여 ',
    subcategory: '모임 탐색 / 참여 ',
    status: '답변완료',
    replyDate: '2025.08.28',
    replyContent:
      '안녕하세요, 이메일 인증 오류 문제는 브라우저 캐시를 삭제하거나 다른 브라우저에서 시도하면 해결됩니다. 이후에도 문제가 발생하면 고객센터로 문의해주세요.',
  },
  {
    id: 3,
    name: '이철수',
    email: 'lee.cheolsu@example.com',
    date: '2025.08.21',
    content: '모임 생성이 안돼요.',
    contentDetail:
      '모임 개설 페이지에서 정보를 입력하고 등록 버튼을 눌렀는데, 계속 에러 메시지가 뜹니다. 확인 부탁드립니다.',
    maincategory: '모임 탐색 / 참여 ',
    subcategory: '모임 탐색 / 참여 ',
    status: '답변완료',
    replyDate: '2025.08.22',
    replyContent:
      '모임 생성 오류는 입력 필드 중 일부가 누락되었거나 형식이 맞지 않을 때 발생합니다. 모든 필드를 정확히 입력 후 다시 시도해주세요.',
  },
  {
    id: 4,
    name: '박지현',
    email: 'park.jihyun@example.com',
    date: '2025.08.15',
    content: '프로필 사진이 안 바뀌어요.',
    contentDetail:
      '새로 업로드한 프로필 사진이 저장 후에도 이전 이미지로 돌아갑니다. 용량이나 형식 문제일까요?',
    maincategory: '모임 탐색 / 참여 ',
    subcategory: '모임 탐색 / 참여 ',
    status: '답변대기',
    replyDate: '-',
  },
  {
    id: 5,
    name: '최민수',
    email: 'choi.minsu@example.com',
    date: '2025.08.02',
    content: '결제 영수증을 확인하고 싶어요.',
    contentDetail:
      '지난주 결제한 모임의 영수증을 확인하고 싶은데, 마이페이지에서 찾을 수 없습니다. 어디서 확인 가능한가요?',
    maincategory: '모임 탐색 / 참여 ',
    subcategory: '모임 탐색 / 참여 ',
    status: '답변완료',
    replyDate: '2025.08.03',
    replyContent:
      '결제 영수증은 마이페이지 → 결제 내역에서 PDF로 다운로드 가능합니다. 만약 표시되지 않는다면 새로고침 후 다시 확인해주세요.',
  },
];
