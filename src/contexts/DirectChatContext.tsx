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
} from '../types/chat';

const DirectChatContext = createContext<DirectChatContextType | null>(null);

export const useDirectChat = () => {
  const ctx = useContext(DirectChatContext);
  if (!ctx) throw new Error('useDirectChat must be used within DirectChatProvider');
  return ctx;
};

/**
 * 내 참가자 행만 보장
 * (RLS 정책상 auth.uid() = user_id 인 행만 insert 가능)
 */
async function ensureMyParticipant(chatId: string, userId: string) {
  const { error } = await supabase
    .from('direct_participants')
    .upsert({ chat_id: chatId, user_id: userId });

  if (error) console.error('ensureMyParticipant error:', error.message);
}

/**
 * 양쪽 모두 참가자 등록 보장
 * (보내는 사람 / 받는 사람 둘 다 direct_participants에 존재해야
 * 상대방도 실시간 메시지를 수신할 수 있음)
 */
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
  const fetchChats = useCallback(
    async (groupId?: string) => {
      try {
        setLoading(true);

        let query = supabase.from('direct_chats').select(`
          *,
          groups!inner(group_title),
          host:user_profiles!direct_chats_host_id_fkey(nickname, avatar_url),
          member:user_profiles!direct_chats_member_id_fkey(nickname, avatar_url)
        `);

        if (groupId) query = query.eq('group_id', groupId);

        const { data, error } = await query;
        if (error) throw error;

        const mapped: DirectChatWithGroup[] = (data ?? []).map(
          (chat: DirectChatWithGroup & { host: any; member: any; groups: any }) => {
            const isHost = chat.host_id === user?.id;
            const partner = isHost ? chat.member : chat.host;

            return {
              ...chat,
              partnerNickname: partner?.nickname ?? '알 수 없음',
              partnerAvatar: partner?.avatar_url ?? null,
              groupTitle: chat.groups?.group_title ?? '모임',
            };
          },
        );

        setChats(mapped);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('fetchChats error:', msg);
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  // 메시지 불러오기
  const fetchMessages = useCallback(
    async (chatId: string) => {
      try {
        setLoading(true);
        if (user?.id) await ensureMyParticipant(chatId, user.id);

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

        const mapped: directMessages[] = (data ?? []).map((msg: any) => ({
          message_id: msg.message_id,
          chat_id: msg.chat_id,
          sender_id: msg.sender_id,
          content: msg.content,
          created_at: msg.created_at,
          updated_at: msg.updated_at,
          nickname: msg.user_profiles?.nickname ?? null,
          avatar_url: msg.user_profiles?.avatar_url ?? null,
        }));

        setMessages(mapped);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('fetchMessages error:', msg);
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [user?.id],
  );

  // 메시지 전송
  const sendMessage = useCallback(
    async (chatId: string, content: string): Promise<void> => {
      if (!user) return;

      // 내 참가자 행 보장
      await ensureMyParticipant(chatId, user.id);

      const insertData: directMessagesInsert = {
        chat_id: chatId,
        sender_id: user.id,
        content,
      };

      const { error } = await supabase.from('direct_messages').insert(insertData);
      if (error) console.error('sendMessage error:', error.message);
    },
    [user],
  );

  // 채팅방 찾기 or 생성
  const findOrCreateChat = useCallback(
    async (groupId: string, hostId: string, memberId: string): Promise<string> => {
      // 기존 방 확인
      const { data: existing, error: selErr } = await supabase
        .from('direct_chats')
        .select('chat_id')
        .eq('group_id', groupId)
        .or(
          `and(host_id.eq.${hostId},member_id.eq.${memberId}),and(host_id.eq.${memberId},member_id.eq.${hostId})`,
        )
        .maybeSingle();

      if (selErr) throw selErr;

      // 있으면 참가자 등록 보장 후 chat_id 반환
      if (existing?.chat_id) {
        // await ensureBothParticipants(existing.chat_id, hostId, memberId);
        if (user?.id) await ensureMyParticipant(existing.chat_id, user.id);
        return existing.chat_id;
      }

      // 없으면 새로 생성
      const newChat: directChatsInsert = {
        group_id: groupId,
        host_id: hostId,
        member_id: memberId,
        created_by: user?.id ?? null,
      };

      const { data, error } = await supabase
        .from('direct_chats')
        .insert(newChat)
        .select('chat_id')
        .single();

      if (error) throw error;

      // 양쪽 모두 참가자 등록
      //   await ensureBothParticipants(data.chat_id, hostId, memberId);
      if (user?.id) await ensureMyParticipant(data.chat_id, user.id);

      return data.chat_id;
    },
    [user],
  );

  // 실시간 메시지 구독
  useEffect(() => {
    if (!currentChat?.chat_id) return;

    const channel = supabase
      .channel(`direct_messages_${currentChat.chat_id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `chat_id=eq.${currentChat.chat_id}`,
        },
        async payload => {
          const newMsg = payload.new as directMessages;

          const { data: profile } = await supabase
            .from('user_profiles')
            .select('nickname, avatar_url')
            .eq('user_id', newMsg.sender_id)
            .maybeSingle();

          const enrichedMsg: directMessages = {
            ...newMsg,
            nickname: profile?.nickname ?? null,
            avatar_url: profile?.avatar_url ?? null,
          };

          setMessages(prev => [...prev, enrichedMsg]);
        },
      )
      .subscribe(status => {
        if (status === 'SUBSCRIBED') {
          console.log('📡 Subscribed to:', currentChat.chat_id);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentChat?.chat_id]);

  // Context
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
