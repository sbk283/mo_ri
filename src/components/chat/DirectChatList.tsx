// 채팅 리스트 영역

function DirectChatList() {
  return (
    <aside className="w-72 bg-white shadow-md rounded-lg p-6 flex flex-col items-center">
      {/* 프로필 이미지 */}
      <img src="/ham.png" alt="프로필" className="w-32 h-32 rounded-full object-cover" />

      {/* 닉네임 + 크라운 */}
      <div className="mt-4 flex items-center gap-2">
        <h2 className="text-[20px] font-semibold text-brand whitespace-nowrap">춤추는 낙타</h2>
        <div className="flex w-[23px] h-[13px] px-[5px] py-[2px] rounded-[11px] bg-[#0689E8] items-center justify-center">
          <img src="/images/group_crown.svg" alt="모임장크라운" className="w-3 h-3" />
        </div>
      </div>

      {/* 구분선 */}
      <div className="w-full border-b border-gray-[#8c8c8c] my-4"></div>

      {/* 설명글 */}
      <p className="text-[#3C3C3C] text-[15px] font-medium">
        마비노기 던전 레이드 파티원 모집 관리자 입니다.
      </p>
      <p className="mt-4 text-[#8C8C8C] font-['Noto_Sans'] text-[12px] font-medium leading-normal">
        문의할 점이나 궁금하신 점을 채팅을 통해 대화할 수 있습니다. <br />
        비방이나 욕설 등 부적절한 메시지가 보이면 고객센터로 연락주세요.
      </p>
    </aside>
  );
}

export default DirectChatList;
