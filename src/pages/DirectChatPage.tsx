// 채팅 페이지

import DirectChatList from "../components/chat/DirectChatList";
import DirectChatRoom from "../components/chat/DirectChatRoom";

function DirectChatPage() {
  return (
    <div className="flex pt-24 pb-7 justify-center bg-gray-100">
      <div className="flex h-[calc(100vh-120px)] w-full max-w-[1024px]">
        {/* --- 채팅 리스트 영역 --- */}
        <DirectChatList />

        {/* --- 채팅방 영역 --- */}
        <DirectChatRoom />
      </div>
    </div>
  );
}

export default DirectChatPage;
