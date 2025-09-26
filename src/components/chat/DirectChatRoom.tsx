// 채팅방 영역
import { useEffect, useRef, useState } from 'react';
import MessageInput from './MessageInput';
import { motion, AnimatePresence } from 'framer-motion';

function DirectChatRoom() {
  const [messages, setMessages] = useState<string[]>([]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    setMessages([...messages, text]);
  };

  // 자동 스크롤용 ref,effect
  const listEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  return (
    <main className="flex-1 ml-4 p-5 bg-white shadow-md rounded-lg flex flex-col">
      {/* 채팅 기록 영역 */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
            <span className="text-2xl">
              <img src="/images/chat_bubble.svg" alt="말풍선" />
            </span>
            <p className="mt-2">대화내역이 없습니다.</p>
          </div>
        ) : (
          // 리스트 컨테이너 자체도 레이아웃 애니메이션
          <motion.div layout className="space-y-2">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={`${i}-${msg}`}
                  layout
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 28, mass: 0.7 }}
                  className="flex justify-end"
                >
                  {/* 말풍선 */}
                  <div className="relative bg-blue-500 text-white px-4 py-2 rounded-lg max-w-[70%] shadow">
                    {msg}
                    {/* 꼬리 */}
                    <span
                      className="absolute right-0 top-1/2 translate-x-full -translate-y-1/2 
                               w-0 h-0 border-y-[6px] border-y-transparent 
                               border-l-[8px] border-l-blue-500"
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* 리스트 끝 (스크롤용) */}
            <div ref={listEndRef} />
          </motion.div>
        )}
      </div>

      {/* 입력창 영역 */}
      <MessageInput onSend={handleSend} />
    </main>
  );
}

export default DirectChatRoom;
