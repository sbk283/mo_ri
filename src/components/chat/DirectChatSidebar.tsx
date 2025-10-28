import { useMemo, useState } from 'react';
import { useDirectChat } from '../../contexts/DirectChatContext';

interface ChatSidebarProps {
  onSelect: (chatId: string) => void;
  groupId?: string;
}

function DirectChatSidebar({ onSelect, groupId }: ChatSidebarProps) {
  const { chats, currentChat, setCurrentChat } = useDirectChat();
  const [search, setSearch] = useState('');

  // 기본 아바타 경로 상수
  // - 여러 곳에서 동일 경로를 사용할 때 하드코딩을 피하기 위해 상수로 분리
  const DEFAULT_AVATAR = '/profile_bg.png';

  // 아바타 경로를 결정하는 헬퍼
  // - 유효한 프로필 이미지가 있으면 그대로 사용, 없으면 기본 아바타로 대체
  const getAvatarSrc = (partnerAvatar?: string | null) => {
    return partnerAvatar && partnerAvatar.trim() !== '' ? partnerAvatar : DEFAULT_AVATAR;
  };

  // 이미지 로드 실패 시 기본 이미지로 대체하는 핸들러
  // - 이미 기본 이미지인 경우에는 다시 설정하지 않아 무한 루프를 방지
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const el = e.currentTarget;
    if (!el.src.endsWith(DEFAULT_AVATAR)) {
      el.src = DEFAULT_AVATAR;
    }
  };

  // 표시할 목록: 그룹 필터 → 검색어 필터 순으로 적용
  // - 검색어는 소문자로 변환해 부분 일치 검사
  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    const byGroup = groupId ? chats.filter(c => c.group_id === groupId) : chats;
    if (!term) return byGroup;
    return byGroup.filter(chat => (chat.partnerNickname ?? '').toLowerCase().includes(term));
  }, [chats, groupId, search]);

  return (
    <aside className="w-[324px] p-5">
      <h2 className="self-start font-semibold text-[28px] pt-1 pb-[14px] pl-1">채팅/문의</h2>

      {/* 닉네임 검색 입력 */}
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="닉네임으로 검색"
        className="w-full mb-4 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-brand focus:outline-none placeholder:text-gray-300"
      />

      <div className="divide-y divide-[#DADADA]">
        {visible.map(chat => (
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
              src={getAvatarSrc(chat.partnerAvatar)}
              alt={chat.partnerNickname ?? '유저'}
              className="w-12 h-12 rounded-full object-cover"
              loading="lazy"
              onError={handleImageError}
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
