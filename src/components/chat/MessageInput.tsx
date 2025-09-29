// 메세지 입력 컴포넌트
import { useState } from 'react';
import { motion } from 'framer-motion';

interface MessageInputProps {
  onSend: (text: string) => void;
}

function MessageInput({ onSend }: MessageInputProps) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput('');
  };

  return (
    <div className="border border-gray-300 rounded-bl-sm rounded-br-sm p-4 flex items-center">
      <textarea
        placeholder="메시지를 입력해 주세요. (Shift+Enter 줄바꿈)"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        className="flex-1 px-2 py-2 border-none rounded-sm placeholder:text-gray-300 resize-none overflow-y-auto"
        rows={1}
      />
      <motion.button
        onClick={handleSend}
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: 1.02 }}
        className="ml-2 px-6 border-t-gray-300 py-[9px] bg-brand text-white rounded-lg shadow hover:bg-brand"
      >
        보내기
      </motion.button>
    </div>
  );
}

export default MessageInput;
