// 2025-10-30 중복 초기화 방지용 useRef 추가
import { useEffect, useRef, useState } from 'react';
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
  // 2025-10-30 동일 파라미터 조합에 대한 중복 초기화 방지 키 저장
  const initializedKeyRef = useRef<string | null>(null);

  // 로그인된 사용자가 해당 group의 호스트인지 DB에서 판별
  useEffect(() => {
    if (!user || !groupId) {
      setIsHost(false);
      return;
    }

    const checkRole = async (): Promise<void> => {
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

    // 2025-10-30 동일 파라미터 조합으로 중복 초기화 방지
    const key = `${groupId}:${targetUserId}:${isHost}`;
    if (initializedKeyRef.current === key) return;

    // 2025-10-30 알림 패널에서 넘어올 때 second param이 chatId인 경우 처리
    // 알림 클릭 경로: /chat/:groupId/:chatId → 기존 effect가 targetUserId로 해석하므로 우선 chatId 매칭을 시도한다
    const existingByChatId = chats.find(c => c.chat_id === targetUserId) ?? null;
    // 2025-10-30 알림 진입: URL의 두 번째 파라미터를 chatId로 인식해 현재 채팅 설정
    if (existingByChatId) {
      setCurrentChat(existingByChatId);
      setSelectedChatId(existingByChatId.chat_id);
      // 2025-10-30 동일 파라미터 재실행 방지 키 기록
      initializedKeyRef.current = key;
      return;
    }

    const initRoom = async (): Promise<void> => {
      // 수정: targetUserId가 자기 자신일 경우 방 생성 금지
      if (user.id === targetUserId) {
        console.warn('❌ 자기 자신과의 채팅은 생성할 수 없습니다.');
        // 2025-10-30 동일 파라미터 조합에 대한 중복 실행 방지 (self-chat 분기)
        initializedKeyRef.current = key;
        return;
      }

      // 수정: groupId와 targetUserId 유효성 체크 (undefined 방지)
      if (!groupId || !targetUserId) {
        console.warn('❌ groupId 또는 targetUserId가 없습니다. 채팅방 생성 중단');
        // 2025-10-30 동일 파라미터 조합에 대한 중복 실행 방지 (invalid params 분기)
        initializedKeyRef.current = key;
        return;
      }

      const hostId: string = isHost ? user.id : targetUserId;
      const memberId: string = isHost ? targetUserId : user.id;

      const chatId: string = await findOrCreateChat(groupId, hostId, memberId);

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

      // 2025-10-30 동일 파라미터 조합에 대한 중복 실행 방지
      initializedKeyRef.current = key;
    };

    void initRoom();
    // 2025-10-30 무한 루프 방지를 위해 chats 의존성 제거 (fetchChats 결과로 재호출되는 문제)
  }, [user?.id, groupId, targetUserId, isHost, findOrCreateChat, setCurrentChat]);

  const handleSelectChat = (chatId: string): void => {
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
