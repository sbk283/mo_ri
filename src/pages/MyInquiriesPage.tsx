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
      <div className="flex gap-[12px] mb-[56px]">
        <div className=" border-r border-brand border-[3px]"></div>
        <div className="text-gray-400">
          <div className="text-lg font-semibold">내가 보낸 1:1 문의 내역을 확인할 수 있어요.</div>
          <div className="text-md">
            답변 상태를 확인하고, 필요한 경우 추가 문의도 이어서 진행해 보세요.
          </div>
        </div>
      </div>
      {/* 하단 영역 부분  내용 없을때.*/}
      {/* <div className="mb-[77px]">
        <div className="text-brand font-semibold text-xxl mb-[38px]">1:1 문의 내역</div>
        <div className="w-[1024] border border-gray-300 rounded-[5px] py-[53px] text-center text-xl text-gray-200 font-medium">
          1:1 문의 내역이 없습니다.
        </div>
      </div> */}

      {/* 하단 영역 부분  내용 있을때.*/}
      <div className="mb-[77px]">
        <div className="text-brand font-semibold text-xxl mb-[38px]">1:1 문의 내역</div>
        <div className="w-[1024px] border border-gray-300 rounded-[5px] text-gray-200 font-medium">
          <div className="grid grid-cols-6 text-center pt-[14px] gap-[50px]">
            <div>문의 일자</div>
            <div>문의 내용</div>
            <div>문의 유형</div>
            <div>상태</div>
            <div>답변일자</div>
            <div>상세보기</div>
          </div>
          <div className="border-b border-black opacity-30 my-[10px] " />
          <div className="grid grid-cols-6 text-center pb-[14px] gap-[50px]">
            <div>2025.09.03</div>
            <div className="truncate">모임 취소 할래요. 어떻게 해요!</div>
            <div>모임 탐색 / 참여</div>
            <div>답변대기</div>
            <div>-</div>
            <div>상세보기</div>
          </div>
        </div>
      </div>

      {/*  1:1 문의내역 상세보기 누르기 전 */}
      {/* <div className="text-brand font-semibold text-xxl mb-[38px]">1:1 문의 내역 상세보기</div>
      <div className="w-[1024] border border-gray-300 rounded-[5px] py-[53px] text-center text-xl text-gray-200 font-medium">
        1:1 문의 내역 상세보기를 눌러 확인하세요.
      </div> */}

      {/* 1:1 문의 내역 상세보기 눌렀을 때 */}
      <div className="text-brand font-semibold text-xxl mb-[38px]">1:1 문의 내역 상세보기</div>
      <div className="w-[1024] border border-gray-300 rounded-[5px]  text-gray-200 font-medium">
        1:1 문의 내역 상세보기를 눌러 확인하세요.
      </div>
    </MyPageLayout>
  );
}

export default MyInquiriesPage;
