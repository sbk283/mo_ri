import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import GroupDashboardLayout from '../components/layout/GroupDashboardLayout';
import DirectChatSidebar from '../components/chat/DirectChatSidebar';
import DirectChatList from '../components/chat/DirectChatList';
import DirectChatRoom from '../components/chat/DirectChatRoom';
import { useAuth } from '../contexts/AuthContext';
import { useDirectChat } from '../contexts/DirectChatContext';
import { supabase } from '../lib/supabase';

// UUID 유효성 검사 함수
function isUuid(v?: string | null): v is string {
  if (!v) return false;
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(v);
}

// 참가자 행 직접 보장 (RLS-safe)
async function ensureMyParticipant(chatId: string, userId: string) {
  const { error } = await supabase
    .from('direct_participants')
    .upsert({ chat_id: chatId, user_id: userId });
  if (error) console.error('ensureMyParticipant error:', error.message);
}

function DirectChatPage() {
  const { user } = useAuth();
  const { chats, fetchChats, findOrCreateChat, setCurrentChat } = useDirectChat();
  const { groupId: groupIdParam, targetUserId: targetUserIdParam } = useParams<{
    groupId?: string;
    targetUserId?: string;
  }>();
  const [searchParams] = useSearchParams();

  // URL 파라미터 정리
  const targetFromQuery = searchParams.get('target') || undefined;
  const groupId = groupIdParam && groupIdParam !== 'undefined' ? groupIdParam : undefined;
  const targetUserId =
    (targetUserIdParam && targetUserIdParam !== 'undefined'
      ? targetUserIdParam
      : targetFromQuery) || undefined;

  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);

  // 로그인 사용자 역할 (host / member)
  useEffect(() => {
    const storedRole = localStorage.getItem('user_role');
    if (storedRole === 'host') setIsHost(true);
    else if (storedRole === 'member') setIsHost(false);
    else {
      const fallbackRole = (user as any)?.role ?? 'member';
      setIsHost(fallbackRole === 'host');
    }
  }, [user]);

  // 메인 채팅 목록
  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // 특정 채팅방 (groupId + targetUserId)
  useEffect(() => {
    if (!user || !groupId || !targetUserId) return;
    if (!isUuid(groupId) || !isUuid(user.id) || !isUuid(targetUserId)) return;

    const hostId = isHost ? user.id : targetUserId;
    const memberId = isHost ? targetUserId : user.id;

    (async () => {
      try {
        // 채팅방 찾기 or 생성
        const chatId = await findOrCreateChat(groupId, hostId, memberId);
        if (!chatId) return;

        await ensureMyParticipant(chatId, user.id);

        setCurrentChat({
          chat_id: chatId,
          group_id: groupId,
          host_id: hostId,
          member_id: memberId,
        });
        setSelectedChatId(chatId);

        console.log('참가자 등록 완료 & 구독 준비됨:', chatId);
      } catch (err) {
        console.error('채팅방 초기화 실패:', err);
      }
    })();
  }, [user, groupId, targetUserId, findOrCreateChat, setCurrentChat, isHost]);

  // 사이드바 클릭 → 채팅 전환
  const handleSelectChat = (chatId: string) => {
    const chat = chats.find(c => c.chat_id === chatId) ?? null;
    setSelectedChatId(chatId);
    setCurrentChat(chat);
  };

  // UI
  return (
    <GroupDashboardLayout>
      <div className="bg-white shadow-card h-[770px] flex rounded-sm">
        {/* /chat → 전체 목록, /chat/:groupId/:targetUserId → 특정방 */}
        {isHost ? (
          <>
            <DirectChatSidebar onSelect={handleSelectChat} />
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
