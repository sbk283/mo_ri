import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
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

// 참가자 보장 (본인만 처리 - RLS 정책 준수)
async function ensureMyParticipant(chatId: string, userId: string) {
  if (!userId) return;

  try {
    const { data: existing } = await supabase
      .from('direct_participants')
      .select('left_at')
      .eq('chat_id', chatId)
      .eq('user_id', userId)
      .maybeSingle();

    // 🧠 left_at이 null일 때만 유지보수용 upsert 실행
    if (!existing) {
      const { error } = await supabase
        .from('direct_participants')
        .insert({ chat_id: chatId, user_id: userId });
      if (error) console.error('ensureMyParticipant insert error:', error.message);
    }
    // ❌ 기존 레코드가 있고 left_at이 있다면 재참여하지 않음
  } catch (err) {
    console.error('ensureMyParticipant failed:', err);
  }
}

export function DirectChatProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();

  const [chats, setChats] = useState<DirectChatWithGroup[]>([]);
  const [messages, setMessages] = useState<directMessages[]>([]);
  const [currentChat, setCurrentChat] = useState<Partial<DirectChatWithGroup> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  // 🆕 fetchChats를 useRef로 안정화 (의존성 배열 문제 해결)
  const fetchChatsRef = useRef<() => Promise<void>>();

  // 채팅방 목록 불러오기 (400 에러 수정 + last message 분리)
  const fetchChats = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // 1️⃣ 내가 참여중인 채팅방만 조회 (left_at이 null인 것만)
      const { data, error } = await supabase
        .from('direct_chats')
        .select(
          `
          chat_id,
          group_id,
          host_id,
          member_id,
          created_at,
          groups!inner(group_title),
          host:user_profiles!direct_chats_host_id_fkey(nickname, avatar_url),
          member:user_profiles!direct_chats_member_id_fkey(nickname, avatar_url),
          direct_participants!inner(user_id, left_at)
        `,
        )
        .eq('direct_participants.user_id', user.id)
        .is('direct_participants.left_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 2️⃣ 채팅방이 없을 경우
      if (!data || data.length === 0) {
        setChats([]);
        return;
      }

      // 3️⃣ 각 채팅방의 최근 메시지 조회
      const chatIds = data.map(c => c.chat_id);
      const lastMap = new Map<string, { content: string; created_at: string }>();

      if (chatIds.length > 0) {
        const { data: lastMsgs, error: msgErr } = await supabase
          .from('direct_messages')
          .select('chat_id, content, created_at')
          .in('chat_id', chatIds)
          .order('created_at', { ascending: false });

        if (msgErr) console.error('last message fetch error:', msgErr.message);

        for (const msg of lastMsgs ?? []) {
          if (!lastMap.has(msg.chat_id)) {
            lastMap.set(msg.chat_id, { content: msg.content, created_at: msg.created_at });
          }
        }
      }

      // 4️⃣ 매핑
      const mappedChats: DirectChatWithGroup[] = data.map(chatObj => {
        const isHost = chatObj.host_id === user.id;
        const partnerProfile = isHost ? chatObj.member : chatObj.host;
        const last = lastMap.get(chatObj.chat_id);

        return {
          ...chatObj,
          partnerNickname: partnerProfile?.nickname ?? '알 수 없음',
          partnerAvatar: partnerProfile?.avatar_url ?? null,
          groupTitle: chatObj.groups?.group_title ?? '모임',
          lastMessage: last?.content ?? '',
          lastMessageAt: last?.created_at ?? null,
        };
      });

      setChats(mappedChats);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('fetchChats error:', message);
      setError(message);
      setChats([]); // 안전 초기화
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // useRef에 최신 fetchChats 저장
  useEffect(() => {
    fetchChatsRef.current = fetchChats;
  }, [fetchChats]);

  // 메시지 불러오기 (left_at 확인 후 메시지 초기화 로직 추가)
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

        // 나간 상태(left_at 존재)면 메시지 초기화
        if (participantData?.left_at) {
          console.log('✅ 이미 채팅방에서 나간 사용자입니다. 메시지를 비웁니다.');
          setMessages([]);
          return; // 여기서 바로 return
        }

        // 2️⃣ 참가자 자동 보장 (left_at이 없는 경우에만)
        await ensureMyParticipant(chatId, user.id);

        // 3️⃣ 메시지 조회
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
      try {
        // 🆕 재참여 자동 보장 (나갔던 사용자면 다시 left_at=null로 복구)
        await ensureMyParticipant(chatId, user.id);

        const insertData: directMessagesInsert = {
          chat_id: chatId,
          sender_id: user.id,
          content,
        };
        const { error } = await supabase.from('direct_messages').insert(insertData);
        if (error) throw error;
      } catch (err) {
        console.error('sendMessage error:', err);
      }
    },
    [user?.id],
  );

  // 채팅방 찾기, 생성
  const findOrCreateChat = useCallback(
    async (groupId: string, hostId: string, memberId: string): Promise<string> => {
      try {
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

        const participants = Array.isArray(existing?.direct_participants)
          ? existing.direct_participants
          : [];
        const bothLeft = participants.length === 2 && participants.every(p => p.left_at !== null);

        if (existing?.chat_id && !bothLeft) {
          console.log('reuse chat', existing.chat_id);
          await ensureMyParticipant(existing.chat_id, user?.id ?? '');
          return existing.chat_id;
        }

        if (existing?.chat_id && bothLeft) {
          console.log('둘 다 나간 방 삭제:', existing.chat_id);
          await supabase.from('direct_chats').delete().eq('chat_id', existing.chat_id);
        }

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
        if (insErr) throw insErr;
        await ensureMyParticipant(inserted.chat_id, user?.id ?? '');
        console.log('new chat created', inserted.chat_id);
        return inserted.chat_id;
      } catch (err) {
        console.error('findOrCreateChat error:', err);
        throw err;
      }
    },
    [user?.id],
  );

  // 🆕 Supabase Realtime 구독 (메시지 + 퇴장 + 삭제)
  useEffect(() => {
    const chatId = currentChat?.chat_id;
    if (!chatId || !user?.id) return;

    const channelName = `direct_chat_${chatId}`;
    const realtimeChannel = supabase
      .channel(channelName)

      // 메시지 실시간 반영
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

      // 참가자 상태 변경 (퇴장 처리)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'direct_participants',
          filter: `chat_id=eq.${chatId}`,
        },
        async payload => {
          const updated = payload.new as { user_id: string; left_at: string | null };
          if (updated.user_id === user.id && updated.left_at) {
            console.log('✅ 본인이 채팅방에서 나갔습니다.');
            setMessages([]);
            setCurrentChat(null);
            fetchChatsRef.current?.();
          }
          if (updated.user_id !== user.id && updated.left_at) {
            console.log('🆕 상대방이 채팅방에서 나감');
            fetchChatsRef.current?.();
          }
        },
      )

      // 채팅방 삭제 시 UI 초기화
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'direct_chats',
          filter: `chat_id=eq.${chatId}`,
        },
        () => {
          console.log('✅ 채팅방 완전 삭제됨 (둘 다 나감)');
          setMessages([]);
          setCurrentChat(null);
          fetchChatsRef.current?.();
        },
      )
      .subscribe(status => {
        console.log(`✅ Realtime 구독 상태: ${channelName} - ${status}`);
      });

    console.log(`✅ Realtime 구독 시작: ${channelName}`);
    return () => {
      console.log(`❌ Realtime 구독 종료: ${channelName}`);
      supabase.removeChannel(realtimeChannel);
    };
  }, [currentChat?.chat_id, user?.id]);

  // 컨텍스트 제공
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
    unreadCounts,
    setUnreadCounts,
  };

  return <DirectChatContext.Provider value={value}>{children}</DirectChatContext.Provider>;
}
