// 메세지 입력 컴포넌트
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface MessageInputProps {
  chatId: string; // 현재 채팅방 ID
  onSend: (payload: { chatId: string; content: string }) => Promise<boolean>;
  // 부모에서 실제 메시지 전송 함수를 내려줌
}

function MessageInput({ chatId, onSend }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 메세지 전송 처리 함수
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!message.trim() || sending) return;

    setSending(true);
    try {
      const formattedMessage = message.replace(/\n+$/, '');

      const success = await onSend({
        chatId,
        content: formattedMessage,
      });

      if (success) {
        setMessage('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('메세지 전송 오류:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-[#e9e9e9] rounded-bl-sm rounded-br-sm p-4 flex items-center"
    >
      <textarea
        ref={textareaRef}
        placeholder="메시지를 입력해 주세요."
        value={message}
        onChange={e => {
          setMessage(e.target.value);
          const el = textareaRef.current;
          if (el) {
            el.style.height = 'auto';
            el.style.height = `${el.scrollHeight}px`;
          }
        }}
        onKeyDown={e => {
          // Enter로 전송, Shift+Enter는 줄바꿈
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        className="flex-1 px-2 py-2 border-none rounded-sm placeholder:text-gray-300 resize-none overflow-y-auto"
        rows={1}
      />

      <motion.button
        type="submit"
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: 1.02 }}
        disabled={sending}
        className="ml-2 px-6 py-[9px] bg-brand text-white rounded-lg shadow hover:bg-brand disabled:opacity-50"
      >
        보내기
      </motion.button>
    </form>
  );
}

export default MessageInput;
