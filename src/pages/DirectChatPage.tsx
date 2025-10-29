import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import GroupDashboardLayout from '../components/layout/GroupDashboardLayout';
import DirectChatSidebar from '../components/chat/DirectChatSidebar';
import DirectChatList from '../components/chat/DirectChatList';
import DirectChatRoom from '../components/chat/DirectChatRoom';
import { useAuth } from '../contexts/AuthContext';
import { useDirectChat } from '../contexts/DirectChatContext';
import { supabase } from '../lib/supabase';

function DirectChatPage() {
  const { user } = useAuth();

  // /chat            -> groupId, targetUserId 둘 다 없음
  // /chat/:groupId   -> groupId만 있음
  // /chat/:groupId/:targetUserId -> 둘 다 있음
  const { groupId, targetUserId } = useParams<{ groupId?: string; targetUserId?: string }>();

  const { chats, fetchChats, setCurrentChat, findOrCreateChat } = useDirectChat();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState<boolean | null>(null);

  // 로그인된 사용자가 해당 group의 호스트인지 DB에서 판별
  useEffect(() => {
    if (!user || !groupId) {
      setIsHost(false);
      return;
    }

    const checkRole = async () => {
      const { data, error } = await supabase
        .from('group_members')
        .select('member_role')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('멤버 역할 확인 실패:', error);
        setIsHost(false);
        return;
      }

      setIsHost(data?.member_role === 'host');
    };

    checkRole();
  }, [user, groupId]);

  // 채팅 목록 불러오기
  useEffect(() => {
    if (user) fetchChats();
  }, [user, fetchChats]);

  // URL에 targetUserId가 주어졌을 때 방을 찾거나 생성
  useEffect(() => {
    if (!user?.id) return;
    if (!groupId || !targetUserId) return;
    if (isHost === null) return;

    const initRoom = async () => {
      const hostId = isHost ? user.id : targetUserId;
      const memberId = isHost ? targetUserId : user.id;

      const chatId = await findOrCreateChat(groupId, hostId, memberId);

      // DirectChatList가 호스트 프로필을 그릴 수 있도록 최소 필드 세팅
      setCurrentChat({
        chat_id: chatId,
        group_id: groupId,
        host_id: hostId,
        member_id: memberId,
      });

      setSelectedChatId(chatId);

      // 디버깅용
      console.log('[init-chat]', { groupId, hostId, memberId, chatId });
    };

    void initRoom();
  }, [user?.id, groupId, targetUserId, isHost, findOrCreateChat, setCurrentChat]);

  const handleSelectChat = (chatId: string) => {
    const chat = chats.find(c => c.chat_id === chatId) ?? null;
    setSelectedChatId(chatId);
    setCurrentChat(chat);
  };

  // 아직 호스트 여부 확인 전이면 로딩 표시
  if (isHost === null) {
    return (
      <GroupDashboardLayout>
        <div className="flex items-center justify-center h-[770px] bg-white rounded-sm shadow-card">
          <p className="text-gray-400">로딩 중...</p>
        </div>
      </GroupDashboardLayout>
    );
  }

  return (
    <GroupDashboardLayout>
      <div className="bg-white shadow-card h-[770px] flex rounded-sm">
        {isHost ? (
          <>
            <DirectChatSidebar onSelect={handleSelectChat} groupId={groupId} />
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
