import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type PropsWithChildren,
} from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type {
  DirectChatContextType,
  DirectChatWithGroup,
  directMessages,
  directMessagesInsert,
  directChatsInsert,
  UserProfileMinimal,
} from '../types/chat';

const DirectChatContext = createContext<DirectChatContextType | null>(null);

export const useDirectChat = () => {
  const ctx = useContext(DirectChatContext);
  if (!ctx) throw new Error('useDirectChat must be used within DirectChatProvider');
  return ctx;
};

// 참가자 보장 (본인)
async function ensureMyParticipant(chatId: string, userId: string) {
  if (!userId) return;
  const { error } = await supabase
    .from('direct_participants')
    .upsert({ chat_id: chatId, user_id: userId });
  if (error) console.error('ensureMyParticipant error:', error.message);
}

// 양쪽 참가자 보장
async function ensureBothParticipants(chatId: string, hostId: string, memberId: string) {
  const { error } = await supabase.from('direct_participants').upsert([
    { chat_id: chatId, user_id: hostId },
    { chat_id: chatId, user_id: memberId },
  ]);
  if (error) console.error('ensureBothParticipants error:', error.message);
}

export function DirectChatProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();

  const [chats, setChats] = useState<DirectChatWithGroup[]>([]);
  const [messages, setMessages] = useState<directMessages[]>([]);
  const [currentChat, setCurrentChat] = useState<Partial<DirectChatWithGroup> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 채팅방 목록 불러오기
  const fetchChats = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('direct_chats')
        .select(
          `
    *,
    groups!inner(group_title),
    host:user_profiles!direct_chats_host_id_fkey(nickname, avatar_url),
    member:user_profiles!direct_chats_member_id_fkey(nickname, avatar_url),
    direct_participants!inner(user_id, left_at)
  `,
        )
        .eq('direct_participants.user_id', user.id)
        .is('direct_participants.left_at', null);
      if (error) throw error;
      const activeChats = (data ?? []).filter(chatObj => {
        const participants = chatObj.direct_participants as {
          user_id: string;
          left_at: string | null;
        }[];
        const myParticipant = participants.find(participant => participant.user_id === user.id);
        return myParticipant && myParticipant.left_at === null;
      });

      // 명확한 매핑
      const mappedChats: DirectChatWithGroup[] = activeChats.map(chatObj => {
        const isHost = chatObj.host_id === user.id;
        const partnerProfile = isHost ? chatObj.member : chatObj.host;

        return {
          ...chatObj,
          partnerNickname: partnerProfile?.nickname ?? '알 수 없음',
          partnerAvatar: partnerProfile?.avatar_url ?? null,
          groupTitle: chatObj.groups?.group_title ?? '모임',
        };
      });

      setChats(mappedChats);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('fetchChats error:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // 메시지 불러오기
  const fetchMessages = useCallback(
    async (chatId: string): Promise<void> => {
      if (!user?.id) return;

      try {
        setLoading(true);

        // 현재 사용자가 이 채팅방에 남아 있는지 확인
        const { data: participantData } = await supabase
          .from('direct_participants')
          .select('left_at')
          .eq('chat_id', chatId)
          .eq('user_id', user.id)
          .maybeSingle();

        // 만약 나간 상태(left_at 존재)면 메시지 초기화
        if (participantData?.left_at) {
          console.log('이미 채팅방에서 나간 사용자입니다. 메시지를 비웁니다.');
          setMessages([]);
          return;
        }

        // 참가자 유지 상태이면 메시지 불러오기
        await ensureMyParticipant(chatId, user.id);

        const { data, error } = await supabase
          .from('direct_messages')
          .select(
            `
          message_id,
          chat_id,
          sender_id,
          content,
          created_at,
          updated_at,
          user_profiles:sender_id(nickname, avatar_url)
        `,
          )
          .eq('chat_id', chatId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        const formattedMessages: directMessages[] = (data ?? []).map(messageObj => {
          const userProfile = Array.isArray(messageObj.user_profiles)
            ? (messageObj.user_profiles[0] as UserProfileMinimal)
            : (messageObj.user_profiles as UserProfileMinimal | null);

          return {
            message_id: messageObj.message_id,
            chat_id: messageObj.chat_id,
            sender_id: messageObj.sender_id,
            content: messageObj.content,
            created_at: messageObj.created_at,
            updated_at: messageObj.updated_at,
            nickname: userProfile?.nickname ?? null,
            avatar_url: userProfile?.avatar_url ?? null,
          };
        });

        setMessages(formattedMessages);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('fetchMessages error:', message);
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [user?.id],
  );

  // 메시지 전송
  const sendMessage = useCallback(
    async (chatId: string, content: string): Promise<void> => {
      if (!user?.id) return;
      await ensureMyParticipant(chatId, user.id);

      const insertData: directMessagesInsert = {
        chat_id: chatId,
        sender_id: user.id,
        content,
      };

      const { error } = await supabase.from('direct_messages').insert(insertData);
      if (error) console.error('sendMessage error:', error.message);
    },
    [user?.id],
  );

  // 채팅방 찾기, 생성
  const findOrCreateChat = useCallback(
    async (groupId: string, hostId: string, memberId: string): Promise<string> => {
      // 기존 채팅방 조회
      const { data: existing, error: selErr } = await supabase
        .from('direct_chats')
        .select(
          `
    chat_id,
    direct_participants(user_id, left_at)
  `,
        )
        .eq('group_id', groupId)
        .or(
          `and(host_id.eq.${hostId},member_id.eq.${memberId}),and(host_id.eq.${memberId},member_id.eq.${hostId})`,
        )
        .maybeSingle();

      if (selErr) throw selErr;
      // 관계 안전 처리
      const participants = Array.isArray(existing?.direct_participants)
        ? existing.direct_participants
        : [];

      const bothLeft = participants.length === 2 && participants.every(p => p.left_at !== null);

      // 방이 있고, 둘 다 나가지 않았다면 재활용
      if (existing?.chat_id && !bothLeft) {
        console.log('reuse chat', existing.chat_id);

        // 참가자 누락되면 추가 보장
        if (user?.id === hostId) {
          await ensureBothParticipants(existing.chat_id, hostId, memberId);
        } else if (user?.id) {
          await ensureMyParticipant(existing.chat_id, user.id);
        }
        return existing.chat_id;
      }

      // 새 방 생성
      console.log('create new chat');
      const newChat: directChatsInsert = {
        group_id: groupId,
        host_id: hostId,
        member_id: memberId,
        created_by: user?.id ?? null,
      };

      const { data: inserted, error: insErr } = await supabase
        .from('direct_chats')
        .insert(newChat)
        .select('chat_id')
        .single();

      if (insErr) {
        console.error('chat insert error', insErr.message);
        throw insErr;
      }

      // 새 참가자 등록 보장
      if (user?.id === hostId) {
        await ensureBothParticipants(inserted.chat_id, hostId, memberId);
      } else if (user?.id) {
        await ensureMyParticipant(inserted.chat_id, user.id);
      }

      console.log('new chat created', inserted.chat_id);
      return inserted.chat_id;
    },
    [user],
  );

  // 실시간 메세지 구독
  useEffect(() => {
    const chatId = currentChat?.chat_id;
    if (!chatId) return;

    const channelName = `direct_chat_${chatId}`;
    const realtimeChannel = supabase
      .channel(channelName)

      // 새 메시지 수신(기존 INSERT 구독 로직 유지)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `chat_id=eq.${chatId}`,
        },
        async payload => {
          const newMessage = payload.new as directMessages;

          const { data: profile } = await supabase
            .from('user_profiles')
            .select('nickname, avatar_url')
            .eq('user_id', newMessage.sender_id)
            .maybeSingle();

          const enriched: directMessages = {
            ...newMessage,
            nickname: profile?.nickname ?? null,
            avatar_url: profile?.avatar_url ?? null,
          };

          setMessages(prev => [...prev, enriched]);
        },
      )

      // 방 자체가 삭제된 경우(두 사람 모두 나가면 RPC가 방/메시지/참여자 삭제)
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'direct_chats',
          filter: `chat_id=eq.${chatId}`,
        },
        () => {
          setMessages([]);
          setCurrentChat(null);
          fetchChats(); // 목록 갱신
        },
      )

      // 메시지가 대량 삭제될 때는 DELETE 이벤트가 N번 올 수 있으므로 보통은 무시한다.
      // .on(
      //   'postgres_changes',
      //   { event: 'DELETE', schema: 'public', table: 'direct_messages', filter: `chat_id=eq.${chatId}` },
      //   () => { /* 필요하면 여기서 setMessages([]) */ }
      // )

      .subscribe();

    return () => {
      supabase.removeChannel(realtimeChannel);
    };
  }, [currentChat?.chat_id, fetchChats]);

  // 컨텍스트
  const value: DirectChatContextType = {
    chats,
    messages,
    currentChat,
    setCurrentChat,
    loading,
    error,
    fetchChats,
    fetchMessages,
    sendMessage,
    findOrCreateChat,
  };

  return <DirectChatContext.Provider value={value}>{children}</DirectChatContext.Provider>;
}
