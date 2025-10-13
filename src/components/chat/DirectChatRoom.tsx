import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageInput from './MessageInput';

interface DirectChatRoomProps {
  chatId: string | null;
}

interface ChatMessage {
  sender: 'me' | 'other';
  text: string;
  nickname?: string;
  avatarUrl?: string | null;
}

function DirectChatRoom({ chatId }: DirectChatRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const handleSend = async ({ chatId, content }: { chatId: string; content: string }) => {
    if (!content.trim()) return false;
    setMessages(prev => [
      ...prev,
      { sender: 'me', text: content },
      {
        sender: 'other',
        text: '상대방 응답: ' + content,
        nickname: 'guest123',
        avatarUrl: null,
      },
    ]);

    return true;
  };

  // 추후 DB 연결 하면 보강하겠삼..^^
  //   const handleSend = async (text: string) => {
  //   if (!text.trim() || !chatId) return;

  //   const newMessage = {
  //     chat_id: chatId,
  //     sender: 'me',
  //     text,
  //     created_at: new Date().toISOString(),
  //   };

  //   // 1. 로컬 UI에 먼저 반영 (optimistic update)
  //   setMessages(prev => [...prev, newMessage]);

  //   // 2. DB에 저장
  //   const { error } = await supabase.from('chat_messages').insert(newMessage);
  //   if (error) {
  //     console.error('메시지 전송 실패:', error);
  //     // 실패 시 롤백하거나 에러 표시 가능
  //   }
  // };

  /** 내부 스크롤 컨테이너만 맨 아래로 이동 */
  const scrollToBottom = () => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;
    scrollContainer.scrollTop = scrollContainer.scrollHeight;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 채팅방 변경 시 메시지 초기화 or 불러오기
  useEffect(() => {
    if (chatId) {
      // TODO: DB에서 chatId 메시지 불러오기
      setMessages([]);
    }
  }, [chatId]);

  // 추후 supabase 연동 시 쓸 로직인데, 수정해야하긴 함..
  // useEffect(() => {
  //   if (!chatId) return;

  //   // 1. 초기 메시지 불러오기
  //   const loadMessages = async () => {
  //     const { data } = await supabase
  //       .from('chat_messages')
  //       .select('*')
  //       .eq('chat_id', chatId)
  //       .order('created_at', { ascending: true });

  //     setMessages(data ?? []);
  //   };
  //   loadMessages();

  //   // 2. 실시간 구독
  //   const channel = supabase
  //     .channel('chat-room')
  //     .on(
  //       'postgres_changes',
  //       { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `chat_id=eq.${chatId}` },
  //       payload => {
  //         setMessages(prev => [...prev, payload.new as ChatMessage]);
  //       }
  //     )
  //     .subscribe();

  //   // cleanup
  //   return () => {
  //     supabase.removeChannel(channel);
  //   };
  // }, [chatId]);

  return (
    <main className="w-[700px] p-6 flex flex-col">
      {/* 채팅 기록 */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 custom-scrollbar overscroll-contain p-4 
                   border border-gray-300 border-b-0 bg-[#ECEEF4] rounded-tl-sm rounded-tr-sm"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
            <img src="/images/chat_bubble.svg" alt="말풍선" className="w-8 h-8" />
            <p className="mt-2">대화내역이 없습니다.</p>
          </div>
        ) : (
          <motion.div layout className="space-y-3">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => {
                const isMe = msg.sender === 'me';
                const initial = msg.nickname?.charAt(0)?.toUpperCase() ?? '?';

                return (
                  <motion.div
                    key={`${i}-${msg.text}`}
                    layout
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 28, mass: 0.7 }}
                    className={`flex w-full items-end ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    {/* 👤 상대방 프로필 (왼쪽에만 표시) */}
                    {!isMe && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white font-semibold mr-2">
                        {msg.avatarUrl ? (
                          <img
                            src={msg.avatarUrl}
                            alt={msg.nickname ?? 'user'}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <span>{initial}</span>
                        )}
                      </div>
                    )}

                    {/* 💬 카카오톡 스타일 말풍선 */}
                    <div
                      className={`relative px-4 py-2 max-w-[70%] break-words text-sm leading-relaxed whitespace-pre-line shadow 
        ${isMe ? 'bg-blue-500 text-white rounded-sm rounded-br-sm' : 'bg-gray-300 text-gray-900 rounded-sm rounded-bl-sm'}
        `}
                    >
                      {/* 꼬리 삼각형 (카톡 스타일) */}
                      <span
                        className={`absolute bottom-0 ${
                          isMe
                            ? 'right-[-5px] border-l-[8px] border-l-blue-500 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent'
                            : 'left-[-5px] border-r-[8px] border-r-gray-300 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent'
                        }`}
                      />
                      {msg.text}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* 입력창 */}
      <MessageInput chatId={chatId ?? ''} onSend={handleSend} />
    </main>
  );
}

export default DirectChatRoom;
