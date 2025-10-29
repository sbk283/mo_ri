import { useEffect, useMemo, useState } from 'react';
import { useDirectChat } from '../../contexts/DirectChatContext';
import Modal from '../common/modal/Modal';
import SuccessModal from '../common/modal/SuccessModal';
import ChatItem from './ChatItem';
import { supabase } from '../../lib/supabase';

interface ChatSidebarProps {
  onSelect: (chatId: string) => void;
  groupId?: string;
}

function DirectChatSidebar({ onSelect, groupId }: ChatSidebarProps) {
  const { chats, currentChat, setCurrentChat, fetchChats, findOrCreateChat } = useDirectChat();
  const [search, setSearch] = useState('');

  // 모달 상태 관리
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [targetChatId, setTargetChatId] = useState<string | null>(null);

  // 🆕 검색 결과(그룹 내 승인된 멤버 목록)
  const [memberResults, setMemberResults] = useState<any[]>([]);

  // 표시할 채팅 목록 필터
  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    const byGroup = groupId ? chats.filter(c => c.group_id === groupId) : chats;
    if (!term) return byGroup;
    return byGroup.filter(chat => (chat.partnerNickname ?? '').toLowerCase().includes(term));
  }, [chats, groupId, search]);

  // 채팅 나가기 버튼 클릭 → 모달 오픈
  const handleLeaveChat = (chatId: string) => {
    setTargetChatId(chatId);
    setLeaveModalOpen(true);
  };

  // 실제 나가기 처리
  const confirmLeaveChat = async () => {
    if (!targetChatId) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.id) return;

    // 현재 유저 나가기 처리
    await supabase
      .from('direct_participants')
      .update({ left_at: new Date().toISOString() })
      .eq('chat_id', targetChatId)
      .eq('user_id', user.id);

    // 남은 사람 있는지 확인
    const { data: remaining } = await supabase
      .from('direct_participants')
      .select('user_id')
      .eq('chat_id', targetChatId)
      .is('left_at', null);

    // 아무도 안 남았으면 전체 삭제
    if (!remaining || remaining.length === 0) {
      console.log('모든 참가자가 나감 → 방 삭제');
      await supabase.from('direct_messages').delete().eq('chat_id', targetChatId);
      await supabase.from('direct_participants').delete().eq('chat_id', targetChatId);
      await supabase.from('direct_chats').delete().eq('chat_id', targetChatId);
    }

    console.log(`${user.id} 사용자 채팅방 ${targetChatId} 나가기 완료`);

    setLeaveModalOpen(false);
    setSuccessModalOpen(true);
    fetchChats?.();
  };

  // 성공 모달 자동 닫기 (1800ms)
  useEffect(() => {
    if (successModalOpen) {
      const timer = setTimeout(() => setSuccessModalOpen(false), 1800);
      return () => clearTimeout(timer);
    }
  }, [successModalOpen]);

  // 🆕 그룹 내 승인 멤버 닉네임 검색
  useEffect(() => {
    const fetchGroupMembers = async () => {
      if (!groupId || !search.trim()) {
        setMemberResults([]);
        return;
      }

      const { data, error } = await supabase
        .from('group_members')
        .select(
          `
          user_profiles(nickname, avatar_url, user_id)
        `,
        )
        .eq('group_id', groupId)
        .eq('member_status', 'approved')
        .ilike('user_profiles.nickname', `%${search}%`);

      if (error) {
        console.error('멤버 검색 오류:', error.message);
        return;
      }

      const extracted = (data ?? []).map(item => item.user_profiles).filter(Boolean);

      setMemberResults(extracted);
    };

    const delay = setTimeout(() => fetchGroupMembers(), 300); // 검색 입력 지연
    return () => clearTimeout(delay);
  }, [search, groupId]);

  return (
    <aside className="w-[324px] p-5">
      <h2 className="self-start font-semibold text-[28px] pt-1 pb-[14px] pl-1">채팅/문의</h2>

      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="닉네임으로 검색"
        className="w-full mb-4 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-brand focus:outline-none placeholder:text-gray-300"
      />

      {/* 🆕 검색 결과가 있을 때 표시 */}
      {search && memberResults.length > 0 && (
        <ul className="mb-4 border border-gray-200 rounded">
          {memberResults.map(member => (
            <li
              key={member.user_id}
              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={async () => {
                // 클릭 시 해당 멤버와 1:1 채팅 시작
                if (!groupId || !member.user_id) return;
                const {
                  data: { user },
                } = await supabase.auth.getUser();
                if (!user?.id) return;

                // 🆕 호스트 or 멤버 관계 판단 후 채팅방 생성
                const chatId = await findOrCreateChat(
                  groupId,
                  user.id, // 현재 사용자(호스트 or 멤버)
                  member.user_id, // 클릭된 멤버
                );
                await fetchChats();
                setSearch('');
                setMemberResults([]);
                onSelect(chatId);
              }}
            >
              <img
                src={member.avatar_url || '/profile_bg.png'}
                alt="프로필"
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-sm">{member.nickname}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="divide-y divide-[#DADADA]">
        {visible.map(chat => (
          <ChatItem
            key={chat.chat_id}
            type="chat"
            chatId={chat.chat_id}
            partnerNickname={chat.partnerNickname ?? '유저'}
            partnerAvatar={chat.partnerAvatar}
            lastMessage={chat.lastMessage}
            isActive={currentChat?.chat_id === chat.chat_id}
            onClick={id => {
              setCurrentChat(chat);
              onSelect(id);
            }}
            onLeaveChat={handleLeaveChat}
          />
        ))}
      </div>

      {/* 채팅 나가기 확인 모달 */}
      <Modal
        isOpen={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        title="채팅방을 나가시겠습니까?"
        message="나가면 이 채팅방의 대화 내용이 사라집니다."
        actions={[
          { label: '취소', onClick: () => setLeaveModalOpen(false), variant: 'secondary' },
          { label: '나가기', onClick: confirmLeaveChat, variant: 'primary' },
        ]}
      />

      {/* 완료 모달 */}
      <SuccessModal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        message="채팅방에서 나갔습니다."
      />
    </aside>
  );
}

export default DirectChatSidebar;
