// 마이페이지 카테고리 컴포넌트
function MyPageSidebar() {
  return (
    <div className=" text-xl text-gray-700 border border-brand w-[207px] h-[100%] rounded-[5px]">
      <h3 className="font-semibold mb-3 flex items-center gap-[7px] text-brand p-[17px] border-b-[1px] border-brand">
        <span className="text-brand">{''}</span> 마이페이지
      </h3>
      <ul className="space-y-[16px] ml-[23px]">
        <li>마이페이지</li>
        <li>결제수단/관리</li>
        <li className="text-blue-500 font-medium">고객센터</li>
        <ul className="ml-4 space-y-1 list-disc text-gray-600">
          <li>FAQ</li>
          <li>1:1 문의 하기</li>
          <li>1:1 문의 내역</li>
        </ul>
        <li>설정</li>
      </ul>
    </div>
  );
}

export default MyPageSidebar;
