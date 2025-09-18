import MyPageLayout from '../components/layout/MyPageLayout';

function MyPageFAQPage() {
  return (
    <MyPageLayout>
      {/* 상단 텍스트 부분 */}
      <div>
        <div className="text-xl font-bold text-gray-400 mb-[21px]">
          마이페이지 {'>'} 고객센터 {'>'} FAQ
        </div>
      </div>
      <div className="flex gap-[12px]">
        <div className=" border-r border-brand border-[3px]"></div>
        <div className="text-gray-400">
          <div className="text-lg font-semibold">
            서비스 이용 중 자주 궁금해 하시는 내용을 모아두었습니다.
          </div>
          <div className="text-md">빠르게 확인하고 문제를 해결해 보세요.</div>
        </div>
      </div>
    </MyPageLayout>
  );
}

export default MyPageFAQPage;
