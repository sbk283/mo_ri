// 채팅 페이지

import DirectChatList from '../components/chat/DirectChatList';
import DirectChatRoom from '../components/chat/DirectChatRoom';
import GroupDashboardLayout from '../components/layout/GroupDashboardLayout';

function DirectChatPage() {
  return (
    <GroupDashboardLayout>
      <div className="bg-white shadow-card h-[770px] flex">
        {/* 채팅 리스트 영역 */}
        <DirectChatList />
        {/* 채팅방 영역 */}
        <DirectChatRoom />
      </div>
    </GroupDashboardLayout>
  );
}

export default DirectChatPage;
