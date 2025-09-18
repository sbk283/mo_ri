import MyPageLayout from '../components/layout/MyPageLayout';

// 1:1 문의하기 페이지입니다.
function InquiryPage() {
  return (
    <MyPageLayout>
      {/* 상단 텍스트 부분 */}
      <div>
        <div className="text-xl font-bold text-gray-400 mb-[21px]">
          마이페이지 {'>'} 고객센터 {'>'} 1:1 문의 하기
        </div>
      </div>
      <div className="flex gap-[12px]">
        <div className=" border-r border-brand border-[3px]"></div>
        <div className="text-gray-400">
          <div className="text-lg font-semibold">
            서비스 이용 중 궁금한 점이나 불편사항을 직접 문의하실 수 있는 공간입니다.
          </div>
          <div className="text-md">
            남겨주신 문의는 담당자가 확인 후 신속하게 답변 드리겠습니다.
          </div>
        </div>
      </div>
    </MyPageLayout>
  );
}

export default InquiryPage;
