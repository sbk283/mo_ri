import MyPageLayout from '../components/layout/MyPageLayout';

// 마이페이지 결제수단 페이지입니다.
function MyPagePaymentsPage() {
  return (
    <MyPageLayout>
      {/* 상단 텍스트 부분 */}
      <div>
        <div className="text-xl font-bold text-gray-400 mb-[21px]">
          마이페이지 {'>'} 결제 수단/관리
        </div>
      </div>
      <div className="flex gap-[12px]">
        <div className=" border-r border-brand border-[3px]"></div>
        <div className="text-gray-400">
          <div className="text-lg font-semibold">결제 수단을 등록하고 관리할 수 있어요.</div>
          <div className="text-md">
            자주 사용하는 카드나 계좌를 추가하고, 기본 결제 수단을 설정해 보세요.
          </div>
        </div>
      </div>
      {/* 하단 내용 부분(없을 때) */}
      <div className="mt-[68px]">
        <div>
          <div className="text-xl font-bold text-brand">기본 결제 수단</div>
          <div className="mt-[18px] border-[1px] border-gray-300 rounded-[5px] w-[1024px] py-[65px]">
            <div className="mx-auto text-lg  text-center">
              등록된 기본 결제 수단이 없습니다. 추가하기를 눌러 결제 수단을 먼저 등록해 주세요.
            </div>
          </div>
        </div>
        <div className="mt-[62px]">
          <div className="text-xl font-bold text-brand">기본 결제 수단 목록 조회</div>
          <div className="mt-[18px] border-[1px] border-gray-300 rounded-[5px] w-[1024px] py-[65px] text-center">
            <div className="mx-auto text-lg  text-center">
              등록된 기본 결제 수단이 없습니다. 추가하기를 눌러 결제 수단을 등록해 주세요.
            </div>
          </div>
        </div>
        <div className="mb-[232px] mt-[36px] flex justify-end">
          <button className="text-white text-xl font-medium bg-brand py-[8px] px-[28px] rounded-[5px]">
            결제 수단 추가하기
          </button>
        </div>
      </div>
    </MyPageLayout>
  );
}

export default MyPagePaymentsPage;
