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
      {/* 하단 내용 부분 */}
      <div className="mt-[56px] ">
        <div className=" text-brand text-xxl font-semibold mb-[38px]">1:1 문의 하기</div>
        <form className="w-[1024px] rounded-[5px] border border-gray-300 py-[90px] px-[87px]">
          <div>
            <label className=" text-gray-400 text-lg font-medium">이름</label>
            <input type="text" placeholder="이름을 입력해 주세요" />
          </div>
          <div>
            <label className=" text-gray-400 text-lg font-medium">답변 알림 이메일 주소</label>
            <input type="text" placeholder="답변 받을 이메일 주소를 입력해 주세요." />
          </div>
          <div>
            <label className=" text-gray-400 text-lg font-medium">문의 유형</label>
          </div>
          <div>
            <label className=" text-gray-400 text-lg font-medium">문의 내용</label>
            <textarea placeholder="선택하신 문의 유형에 맞는 문의사항을 자세히 적어주세요." />
          </div>
          <div>
            <label className=" text-gray-400 text-lg font-medium">첨부파일</label>
            <div>파일 등록</div>
            <div className="text-md font-medium text-gray-400">
              <p>· 사진 및 파일은 최대 2개 까지 등록가능합니다.</p>
              <p>· 10MB 이내의 모든 이미지 파일 업로드가 가능합니다.</p>
              <p>
                · 첨부파일 형식 및 내용이 1:1 문의내용과 맞지 않는 경우 (비방,음란 등) 관리자에 의해
                삭제 될 수 있습니다.
              </p>
            </div>
          </div>
          <div className="border borer-b-[1px]" />
          <label className=" text-gray-400 text-lg font-medium">안내사항</label>
          <div className="text-md font-medium text-gray-400">
            <p>· 로그인 후 등록한 문의는 고객센터 페이지 1:1 문의 내역에서 확인 할 수 있습니다.</p>
            <p>· 남겨주신 문의는 담당자가 확인 후 업무시간 내 순차적 답변 드리니 기다려주세요.</p>
          </div>
          <button>문의하기</button>
        </form>
      </div>
    </MyPageLayout>
  );
}

export default InquiryPage;
