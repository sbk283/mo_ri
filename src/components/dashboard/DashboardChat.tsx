import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useDirectChat } from '../../contexts/DirectChatContext';

interface ChatPreview {
  chat_id: string;
  lastMessage: string;
  lastMessageAt: string;
  partnerNickname: string;
  partnerAvatar: string | null;
  groupTitle?: string | null;
}

const DashboardChat = () => {
  const { user } = useAuth();
  const { chats, fetchChats } = useDirectChat();
  const [latestChat, setLatestChat] = useState<ChatPreview | null>(null);

  // 로그인 시 채팅 목록 불러오기
  useEffect(() => {
    if (!user) return;
    fetchChats();
  }, [user, fetchChats]);

  // 최신 메시지 1개 가져오기
  useEffect(() => {
    const loadLatestChat = async () => {
      if (!user || chats.length === 0) return;

      const { data: messages, error } = await supabase
        .from('direct_messages')
        .select('*')
        .in(
          'chat_id',
          chats.map(c => c.chat_id),
        )
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('메시지 조회 실패:', error);
        return;
      }

      if (!messages || messages.length === 0) return;

      const lastMsg = messages[0];
      const chat = chats.find(c => c.chat_id === lastMsg.chat_id);
      if (!chat) return;

      setLatestChat({
        chat_id: chat.chat_id,
        lastMessage: lastMsg.content,
        lastMessageAt: lastMsg.created_at,
        partnerNickname: chat.partnerNickname ?? '알 수 없음',
        partnerAvatar: chat.partnerAvatar ?? '/profile_bg.png',
        groupTitle: chat.groupTitle ?? '모임',
      });
    };

    loadLatestChat();
  }, [chats, user]);

  // UI 렌더링
  if (!latestChat) {
    return (
      <div className="p-5">
        <div className="flex justify-between mb-4">
          <p className="text-xl font-bold">채팅</p>
        </div>
        <div className="w-[378px] h-[303px] bg-[#ECEEF4] border border-[#A3A3A3] rounded-[5px] p-4 flex items-center justify-center text-gray-500 text-sm">
          최근 대화가 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="p-5">
      <div className="flex justify-between mb-4">
        <p className="text-xl font-bold">채팅</p>
      </div>

      <div className="relative w-[378px] h-[303px] bg-[#ECEEF4] border border-[#A3A3A3] rounded-[5px] p-4 overflow-hidden">
        {/* 상단 */}
        <div className="flex justify-between border-b pb-2">
          <div className="flex gap-5">
            <div className="w-[38px] h-[38px] rounded-full overflow-hidden">
              <img
                className="w-full h-full object-cover"
                src={latestChat.partnerAvatar ?? '/profile_bg.png'}
                alt="프로필사진"
              />
            </div>
            <div>
              <p className="font-bold truncate">{latestChat.groupTitle ?? '모임'}</p>
              <p className="text-brand text-sm font-bold truncate">{latestChat.partnerNickname}</p>
            </div>
          </div>
          <div>
            <span className="w-[12px] h-[12px] rounded-full bg-[#FF5252] inline-block"></span>
          </div>
        </div>

        {/* 본문 */}
        <div className="py-3 flex flex-col gap-2 h-[180px] overflow-hidden">
          <div className="flex justify-start gap-2">
            <div className="w-[23px] h-[23px] rounded-full overflow-hidden">
              <img
                className="w-full h-full object-cover"
                src={latestChat.partnerAvatar ?? '/profile_bg.png'}
                alt="프로필사진"
              />
            </div>
            <div className="p-3 max-w-[225px] bg-white shadow-card text-sm">
              <p className="line-clamp-3">{latestChat.lastMessage}</p>
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <Link
          to={`/chat/${latestChat.chat_id}`}
          className="absolute bottom-3 left-1/2 -translate-x-1/2"
        >
          <button className="w-[345px] h-[32px] bg-brand rounded-sm text-white font-bold text-sm">
            채팅 확인하기
          </button>
        </Link>
      </div>
    </div>
  );
};

export default DashboardChat;
