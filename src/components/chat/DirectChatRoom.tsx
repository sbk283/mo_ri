import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageInput from './MessageInput';

function DirectChatRoom() {
  const [messages, setMessages] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, text]);
  };

  /** 내부 스크롤 컨테이너만 맨 아래로 이동 (body에는 영향 X) */
  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  };

  /** 새 메시지 추가될 때마다 내부 스크롤만 이동 */
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /** iOS/Safari 폴백: 스크롤 체이닝 방지(내부 끝에서 body로 전파 차단) */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      const atTop = el.scrollTop <= 0;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
      const scrollingUp = e.deltaY < 0;
      const scrollingDown = e.deltaY > 0;
      if ((atTop && scrollingUp) || (atBottom && scrollingDown)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // 간단 폴백(체이닝 자체 차단)
    const onTouchMove = (e: TouchEvent) => {
      const atTop = el.scrollTop <= 0;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
      if (atTop || atBottom) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  return (
    <main className="w-full max-w-[800px] h-[832px] ml-4 p-5 bg-white shadow-md rounded-lg flex flex-col">
      {/* 채팅 기록 - 내부 스크롤만 동작 */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar [overscroll-behavior:contain]"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
            <img src="/images/chat_bubble.svg" alt="말풍선" className="w-8 h-8" />
            <p className="mt-2">대화내역이 없습니다.</p>
          </div>
        ) : (
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
                  <div className="relative bg-blue-500 text-white px-4 py-2 rounded-lg max-w-[70%] shadow">
                    {msg}
                    <span
                      className="absolute right-0 top-1/2 translate-x-full -translate-y-1/2 
                                 w-0 h-0 border-y-[6px] border-y-transparent 
                                 border-l-[8px] border-l-blue-500"
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* 리스트 하단 앵커(사용 안 해도 됨) */}
            <div aria-hidden />
          </motion.div>
        )}
      </div>

      {/* 입력창 - 하단 고정 */}
      <MessageInput onSend={handleSend} />
    </main>
  );
}

export default DirectChatRoom;
