import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageInput from './MessageInput';

interface ChatMessage {
  sender: 'me' | 'other';
  text: string;
}

function DirectChatRoom() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    // 테스트용: 내 메시지 보내면 상대방 메시지도 하나 따라오게끔해봄 일단 추후 DB연결 후 삭제하든 수정하든 할게욥..
    setMessages(prev => [
      ...prev,
      { sender: 'me', text },
      { sender: 'other', text: '상대방 응답: ' + text },
    ]);
  };

  /** 내부 스크롤 컨테이너만 맨 아래로 이동 */
  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
                return (
                  <motion.div
                    key={`${i}-${msg.text}`}
                    layout
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 28, mass: 0.7 }}
                    className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`px-4 py-2 rounded-full max-w-[70%] break-words shadow-sm text-sm leading-relaxed ${
                        isMe
                          ? 'bg-blue-500 text-white rounded-br-none'
                          : 'bg-gray-200 text-gray-900 rounded-bl-none'
                      }`}
                    >
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
      <MessageInput onSend={handleSend} />
    </main>
  );
}

export default DirectChatRoom;
