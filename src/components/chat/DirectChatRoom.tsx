import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageInput from './MessageInput';
import { useDirectChat } from '../../contexts/DirectChatContext';
import { useAuth } from '../../contexts/AuthContext';

interface DirectChatRoomProps {
  chatId: string | null;
}

function DirectChatRoom({ chatId }: DirectChatRoomProps) {
  const { user } = useAuth();
  const { messages, fetchMessages, sendMessage } = useDirectChat();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const handleSend = async ({ chatId, content }: { chatId: string; content: string }) => {
    if (!chatId || !content.trim()) return false;
    await sendMessage(chatId, content);
    return true;
  };

  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (chatId) fetchMessages(chatId);
  }, [chatId, fetchMessages]);

  return (
    <main className="w-[700px] p-6 flex flex-col">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-[#ECEEF4]
                   border border-gray-300 border-b-0 rounded-tl-sm rounded-tr-sm"
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
                const isMe = msg.sender_id === user?.id;
                const initial = msg.nickname?.charAt(0)?.toUpperCase() ?? '?';
                return (
                  <motion.div
                    key={`${i}-${msg.message_id}`}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className={`flex w-full items-end ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isMe && (
                      <div className="flex-shrink-0 w-8 h-8 mr-2 rounded-full bg-gray-400 flex items-center justify-center text-white font-semibold">
                        {msg.avatar_url ? (
                          <img
                            src={msg.avatar_url}
                            alt={msg.nickname ?? 'user'}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <span>{initial}</span>
                        )}
                      </div>
                    )}
                    <div
                      className={`relative px-4 py-2 max-w-[70%] text-sm leading-relaxed whitespace-pre-line shadow
                        ${
                          isMe
                            ? 'bg-blue-500 text-white rounded-sm rounded-br-sm'
                            : 'bg-gray-300 text-gray-900 rounded-sm rounded-bl-sm'
                        }`}
                    >
                      {msg.content}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <MessageInput chatId={chatId ?? ''} onSend={handleSend} />
    </main>
  );
}

export default DirectChatRoom;
