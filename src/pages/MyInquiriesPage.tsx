import MyPageLayout from '../components/layout/MyPageLayout';

// 1:1 문의 내역 페이지 입니다.
function MyInquiriesPage() {
  return (
    <MyPageLayout>
      {/* 상단 텍스트 부분 */}
      <div>
        <div className="text-xl font-bold text-gray-400 mb-[21px]">
          마이페이지 {'>'} 고객센터 {'>'} 1:1 문의 내역
        </div>
      </div>
      <div className="flex gap-[12px]">
        <div className=" border-r border-brand border-[3px]"></div>
        <div className="text-gray-400">
          <div className="text-lg font-semibold">내가 보낸 1:1 문의 내역을 확인할 수 있어요.</div>
          <div className="text-md">
            답변 상태를 확인하고, 필요한 경우 추가 문의도 이어서 진행해 보세요.
          </div>
        </div>
      </div>
    </MyPageLayout>
  );
}

export default MyInquiriesPage;
