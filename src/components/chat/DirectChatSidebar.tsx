// 모임장 (호스트) 일 때 보여지는 사이드바

import { useState } from 'react';

type ChatItem = {
  chatId: string;
  chatName: string;
  lastMessage: string;
  unreadCount: number;
  avatarUrl: string | null;
};

interface ChatSidebarProps {
  chats: ChatItem[];
  onSelect: (chatId: string) => void;
}

function DirectChatSidebar({ chats, onSelect }: ChatSidebarProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <aside className="w-[324px] p-5">
      <h2 className="self-start font-semibold text-[28px] pt-1 pb-[14px] pl-1">채팅/문의</h2>

      <div className="divide-y divide-[#DADADA]">
        {chats.map(chat => (
          <div
            key={chat.chatId}
            onClick={() => {
              setActiveId(chat.chatId);
              onSelect(chat.chatId);
            }}
            className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-100 ${
              activeId === chat.chatId ? 'bg-gray-100' : ''
            }`}
          >
            {/* 아바타 */}
            <img
              src={chat.avatarUrl ?? '/images/default_avatar.svg'}
              alt={chat.chatName}
              className="w-12 h-12 rounded-full object-cover"
            />

            {/* 텍스트 */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-brand truncate">{chat.chatName}</p>
              <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
            </div>

            {/* 안읽은 메세지 뱃지 */}
            {chat.unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {chat.unreadCount}
              </span>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}

export default DirectChatSidebar;
