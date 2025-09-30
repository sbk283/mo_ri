// 메세지 입력 컴포넌트
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface MessageInputProps {
  chatId: string; // 현재 채팅방 ID
  onSend: (payload: { chat_id: string; content: string }) => Promise<boolean>;
  // 부모에서 실제 메시지 전송 함수를 내려줌
}

function MessageInput({ chatId, onSend }: MessageInputProps) {
  const [message, setMessage] = useState(''); // ✨ 입력 값 상태
  const [sending, setSending] = useState(false); // ✨ 전송중 여부
  const textareaRef = useRef<HTMLTextAreaElement>(null); // ✨ 높이 리셋용 ref

  // 메세지 전송 처리 함수
  const handleSubmit = async (e?: React.FormEvent) => {
    // 웹 브라우저 새로고침 방지
    if (e) e.preventDefault();

    // 메세지가 없거나 전송중인 상태라면
    if (!message.trim() || sending) {
      return;
    }

    // 전송중인 상태로 중복 전송 방지
    setSending(true);
    try {
      // 부모에서 내려준 onSend 실행
      const success = await onSend({
        chat_id: chatId, // 현재 채팅방 ID
        content: message.trim(), // 공백이 제거된 메세지 내용
      });

      // 메세지 전송 성공 시 처리
      if (success) {
        setMessage(''); // 메세지 내용 초기화
        // 텍스트 영역 높이를 자동으로 리셋
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      }
    } catch (error) {
      // 전송 실패시 ERROR
      console.log('메세지 전송 오류 :', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-gray-300 rounded-bl-sm rounded-br-sm p-4 flex items-center"
    >
      <textarea
        ref={textareaRef}
        placeholder="메시지를 입력해 주세요. (Shift+Enter 줄바꿈)"
        value={message}
        onChange={e => setMessage(e.target.value)}
        onKeyDown={e => {
          // ✨ Enter로 전송, Shift+Enter는 줄바꿈
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
        disabled={sending} // ✨ 전송 중 버튼 비활성화
        className="ml-2 px-6 border-t-gray-300 py-[9px] bg-brand text-white rounded-lg shadow hover:bg-brand disabled:opacity-50"
      >
        보내기
      </motion.button>
    </form>
  );
}

export default MessageInput;
