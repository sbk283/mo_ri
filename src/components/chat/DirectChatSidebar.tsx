import { useState } from 'react';
import { useDirectChat } from '../../contexts/DirectChatContext';

interface ChatSidebarProps {
  onSelect: (chatId: string) => void;
}

function DirectChatSidebar({ onSelect }: ChatSidebarProps) {
  const { chats, currentChat, setCurrentChat } = useDirectChat();
  const [search, setSearch] = useState('');

  // 호스트용 닉네임 검색 (user_profiles.nickname 기준)
  const filteredChats = chats.filter(chat =>
    chat.partnerNickname?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <aside className="w-[324px] p-5">
      <h2 className="self-start font-semibold text-[28px] pt-1 pb-[14px] pl-1">채팅/문의</h2>

      {/* 검색창 */}
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="닉네임으로 검색"
        className="w-full mb-4 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-brand focus:outline-none placeholder:text-gray-300"
      />

      <div className="divide-y divide-[#DADADA]">
        {filteredChats.map(chat => (
          <div
            key={chat.chat_id}
            onClick={() => {
              setCurrentChat(chat);
              onSelect(chat.chat_id);
            }}
            className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-100 ${
              currentChat?.chat_id === chat.chat_id ? 'bg-gray-100' : ''
            }`}
          >
            <img
              src={chat.partnerAvatar ?? '/images/default_avatar.svg'}
              alt={chat.partnerNickname ?? '유저'}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-brand truncate">{chat.partnerNickname}</p>
              <p className="text-sm text-gray-500 truncate">
                {chat.lastMessage ?? '대화 시작하기'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default DirectChatSidebar;
