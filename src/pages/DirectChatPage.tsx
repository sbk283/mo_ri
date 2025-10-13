// 채팅 페이지

import { useState } from 'react';
import DirectChatList from '../components/chat/DirectChatList';
import DirectChatRoom from '../components/chat/DirectChatRoom';
import GroupDashboardLayout from '../components/layout/GroupDashboardLayout';
import DirectChatSidebar from '../components/chat/DirectChatSidebar';
import { useAuth } from '../contexts/AuthContext';

function DirectChatPage() {
  // 선택된 채팅방 ID
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  // 로그인 정보
  // const { user } = useAuth();
  // const isHost = user?.role === 'Host';
  const isHost = true;

  // 더미 채팅 데이터 (나중에 Supabase에서 불러올것임!)
  const mockChats = [
    {
      chatId: '1',
      chatName: '프론트엔드 스터디',
      lastMessage: '오늘 회의 언제하나요?',
      lastMessageAt: '2025-10-13T12:30:00Z',
      unreadCount: 2,
      avatarUrl: '/ham.png',
    },
    {
      chatId: '2',
      chatName: '백엔드 팀 회의',
      lastMessage: '서버 수정 완료했습니다.',
      lastMessageAt: '2025-10-13T09:10:00Z',
      unreadCount: 0,
      avatarUrl: '/ham.png',
    },
  ];

  // 채팅방 선택 시
  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  return (
    <GroupDashboardLayout>
      <div className="bg-white shadow-card h-[770px] flex rounded-sm">
        {/* 채팅방 영역 */}
        {isHost ? (
          <>
            <DirectChatSidebar chats={mockChats} onSelect={handleSelectChat} />
            <DirectChatRoom chatId={selectedChatId} />
          </>
        ) : (
          <>
            <DirectChatList />
            <DirectChatRoom chatId={selectedChatId} />
          </>
        )}
      </div>
    </GroupDashboardLayout>
  );
}

export default DirectChatPage;
