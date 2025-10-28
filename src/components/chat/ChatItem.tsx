// ...과 드롭다운 컴포넌트 분리함.
// src/components/chat/ChatItem.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DEFAULT_AVATAR } from '../../utils/storage';

interface ChatItemProps {
  type: 'chat' | 'member';
  chatId: string;
  partnerNickname: string;
  partnerAvatar?: string | null;
  lastMessage?: string | null;
  unreadCount?: number;
  isActive?: boolean;
  isHost?: boolean;
  onClick: (chatId: string) => void;

  // 드롭다운 이벤트 핸들러 (상황에 따라 다름)
  onLeaveChat?: (chatId: string) => void; // 채팅 나가기
  onKickMember?: () => void; // 모임 추방하기
  onStartChat?: () => void; // 채팅 대화하기
}

export default function ChatItem({
  type,
  chatId,
  partnerNickname,
  partnerAvatar,
  lastMessage,
  unreadCount = 0,
  isActive = false,
  isHost = false,
  onClick,
  onLeaveChat,
  onKickMember,
  onStartChat,
}: ChatItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const avatar = partnerAvatar && partnerAvatar.trim() !== '' ? partnerAvatar : DEFAULT_AVATAR;

  return (
    <div
      onClick={() => onClick(chatId)}
      className={`relative flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-100 ${
        isActive ? 'bg-gray-100' : ''
      }`}
    >
      {/* 프로필 이미지 */}
      <div className="relative">
        <img
          src={avatar}
          alt={partnerNickname}
          className="w-12 h-12 rounded-full object-cover"
          onError={e => {
            const el = e.currentTarget as HTMLImageElement;
            if (!el.src.endsWith(DEFAULT_AVATAR)) el.src = DEFAULT_AVATAR;
          }}
        />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </div>

      {/* 닉네임 / 최근 메시지 */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-brand truncate">{partnerNickname}</p>
        <p className="text-sm text-gray-500 truncate">{lastMessage ?? '대화 시작하기'}</p>
      </div>

      {/* … 버튼 */}
      <div
        className="text-neutral-400 text-2xl font-semibold cursor-pointer select-none relative"
        onClick={e => {
          e.stopPropagation();
          setMenuOpen(prev => !prev);
        }}
      >
        …
      </div>

      {/* 드롭다운 메뉴 */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-16 right-4 bg-white border border-gray-200 rounded-md shadow-md z-10 overflow-hidden"
          >
            {type === 'chat' ? (
              <>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onLeaveChat?.(chatId);
                  }}
                  className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                >
                  채팅 나가기
                </button>
              </>
            ) : (
              <>
                {isHost && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onKickMember?.();
                    }}
                    className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 text-red-500"
                  >
                    모임 추방하기
                  </button>
                )}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onStartChat?.();
                  }}
                  className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                >
                  채팅 대화하기
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
