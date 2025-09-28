// 좌측 그룹/모임장 (모임장이 받는 사이드바? 아머라해야대노.. 모임장에게 보여지는 좌측 사이드바.)
import React, { useState } from 'react';

type ChatItem = {
  groupId: string;
  groupName: string;
  lastMessage: string;
  unread: number;
  avatar: string;
};

interface ChatSidebarProps {
  chats: ChatItem[];
  onSelect: (groupId: string) => void;
}

function DirectChatSidebar({ chats, onSelect }: ChatSidebarProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <aside className="w-72 bg-white shadow-md rounded-lg overflow-hidden">
      <h2 className="px-4 py-3 font-bold text-lg border-b">채팅/문의</h2>

      <div className="divide-y">
        {chats.map(chat => (
          <div
            key={chat.groupId}
            onClick={() => {
              setActiveId(chat.groupId);
              onSelect(chat.groupId);
            }}
            className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 ${
              activeId === chat.groupId ? 'bg-gray-100' : ''
            }`}
          >
            {/* 아바타 */}
            <img
              src={chat.avatar}
              alt={chat.groupName}
              className="w-12 h-12 rounded-full object-cover"
            />

            {/* 텍스트 */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-brand truncate">{chat.groupName}</p>
              <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
            </div>

            {/* 안읽은 메세지 뱃지 */}
            {chat.unread > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {chat.unread}
              </span>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}

export default DirectChatSidebar;
