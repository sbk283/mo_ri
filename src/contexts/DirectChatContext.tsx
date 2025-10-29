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

  const { data: existing } = await supabase
    .from('direct_participants')
    .select('left_at')
    .eq('chat_id', chatId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    if (existing.left_at !== null) {
      const { error: updErr } = await supabase
        .from('direct_participants')
        .update({ left_at: null })
        .eq('chat_id', chatId)
        .eq('user_id', userId);
      if (updErr) console.error('ensureMyParticipant restore error:', updErr.message);
    }
  } else {
    const { error } = await supabase
      .from('direct_participants')
      .upsert({ chat_id: chatId, user_id: userId, left_at: null });
    if (error) console.error('ensureMyParticipant insert error:', error.message);
  }
}

// 양쪽 참가자 보장
async function ensureBothParticipants(chatId: string, hostId: string, memberId: string) {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getUser();
    if (sessionError) throw sessionError;
    const currentUserId = sessionData.user?.id;
    if (!currentUserId) return;

    if (currentUserId === hostId) {
      await ensureMyParticipant(chatId, hostId);
    } else if (currentUserId === memberId) {
      await ensureMyParticipant(chatId, memberId);
    } else {
      console.warn('ensureBothParticipants skipped: user not host/member of this chat');
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('ensureBothParticipants error:', message);
  }
}

export function DirectChatProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();

  const [chats, setChats] = useState<DirectChatWithGroup[]>([]);
  const [messages, setMessages] = useState<directMessages[]>([]);
  const [currentChat, setCurrentChat] = useState<Partial<DirectChatWithGroup> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 새로운 상태: 채팅별 미읽음 카운트
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  // 새 메시지 감지 시 미읽음 카운트 증가
  const incrementUnread = useCallback((chatId: string) => {
    setUnreadCounts(prev => ({
      ...prev,
      [chatId]: (prev[chatId] ?? 0) + 1,
    }));
  }, []);

  // 채팅방을 열면 해당 채팅의 미읽음 카운트를 0으로 초기화
  const resetUnread = useCallback((chatId: string) => {
    setUnreadCounts(prev => {
      if (!(chatId in prev)) return prev;
      const updated = { ...prev };
      delete updated[chatId];
      return updated;
    });
  }, []);

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

        const { data: participantData } = await supabase
          .from('direct_participants')
          .select('left_at')
          .eq('chat_id', chatId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (participantData?.left_at) {
          console.log('이미 채팅방에서 나간 사용자입니다. 메시지를 비웁니다.');
          setMessages([]);
          return;
        }

        await ensureMyParticipant(chatId, user.id);

        // 참가자 상태 확인
        const { data: participants, error: partErr } = await supabase
          .from('direct_participants')
          .select('user_id, left_at')
          .eq('chat_id', chatId);

        if (partErr) throw partErr;

        // 둘 다 나간 경우만 종료로 인식
        const bothLeft = participants?.every(p => p.left_at !== null);

        if (bothLeft) {
          console.warn('두 명 모두 나간 방입니다. 메시지 로드를 생략합니다.');
          resetUnread(chatId);
          setMessages([]);
          return;
        }

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

        // 메시지를 열었으므로 미읽음 카운트 초기화
        resetUnread(chatId);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('fetchMessages error:', message);
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [user?.id, resetUnread],
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
    async (groupId: string, hostIdParam: string | null, memberId: string): Promise<string> => {
      let hostId: string | null = hostIdParam;

      // hostId가 null이면 group_members에서 조회
      if (!hostId) {
        const { data: hostRow, error: hostErr } = await supabase
          .from('group_members')
          .select('user_id')
          .eq('group_id', groupId)
          .eq('role', 'host')
          .maybeSingle();

        if (hostErr) throw hostErr;
        if (!hostRow?.user_id) throw new Error('호스트를 찾을 수 없습니다.');
        hostId = hostRow.user_id;
      }

      const confirmedHostId = hostId as string;

      // 자기 자신 채팅 금지 (제약조건 방지)
      if (confirmedHostId === memberId) {
        console.warn('자기 자신과의 채팅은 불가능합니다.');
        return '';
      }

      // 기존 채팅방 확인
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
          `and(host_id.eq.${confirmedHostId},member_id.eq.${memberId}),and(host_id.eq.${memberId},member_id.eq.${confirmedHostId})`,
        )
        .maybeSingle();

      if (selErr) throw selErr;

      const participants = Array.isArray(existing?.direct_participants)
        ? existing.direct_participants
        : [];

      // 각자 상태
      const myP = participants.find(p => p.user_id === user?.id);
      // const partnerP = participants.find(p => p.user_id !== user?.id);
      const iLeft = myP?.left_at !== null && myP !== undefined;
      // const partnerStillHere = partnerP && partnerP.left_at === null;
      const bothLeft = participants.length === 2 && participants.every(p => p.left_at !== null);

      // 상황별 처리
      // 기존방 존재 + 두명 다 안나감 → 재사용
      if (existing?.chat_id && !bothLeft) {
        console.log('기존 채팅방 재사용');
        // 내가 나갔던 경우 다시 참가 복구
        if (iLeft) {
          await ensureMyParticipant(existing.chat_id, user!.id);
        }
        return existing.chat_id;
      }

      // 기존방 존재 + 두명 다 나감 → 삭제 후 새로 생성
      if (existing?.chat_id && bothLeft) {
        console.log('🗑️ 두명 다 나간 방 → 삭제 후 새 생성');
        await supabase.from('direct_participants').delete().eq('chat_id', existing.chat_id);
        await supabase.from('direct_messages').delete().eq('chat_id', existing.chat_id);
        await supabase.from('direct_chats').delete().eq('chat_id', existing.chat_id);
      }

      // 새 채팅방 생성
      const newChat: directChatsInsert = {
        group_id: groupId,
        host_id: confirmedHostId,
        member_id: memberId,
        created_by: user?.id ?? null,
      };

      let inserted: { chat_id: string } | null = null;

      try {
        const { data, error: insErr } = await supabase
          .from('direct_chats')
          .insert(newChat)
          .select('chat_id')
          .single();
        if (insErr) throw insErr;
        inserted = data;
      } catch (err: unknown) {
        if (err instanceof Error && err.message.includes('duplicate key')) {
          const { data: retry } = await supabase
            .from('direct_chats')
            .select('chat_id')
            .eq('group_id', groupId)
            .or(
              `and(host_id.eq.${confirmedHostId},member_id.eq.${memberId}),and(host_id.eq.${memberId},member_id.eq.${confirmedHostId})`,
            )
            .maybeSingle();
          if (retry) inserted = retry;
          else throw err;
        } else {
          throw err;
        }
      }

      // 참가자 등록 보장
      await ensureMyParticipant(inserted!.chat_id, user!.id);
      await ensureMyParticipant(inserted!.chat_id, memberId);

      return inserted!.chat_id;
    },
    [user],
  );

  // 개별 채팅 실시간 메세지 구독
  useEffect(() => {
    const chatId = currentChat?.chat_id;
    if (!chatId) return;

    const channelName = `direct_chat_${chatId}`;
    const realtimeChannel = supabase
      .channel(channelName)
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
      // 참가자 나감 감지 → 목록 자동 갱신
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'direct_participants',
          filter: `chat_id=eq.${chatId}`,
        },
        payload => {
          const updated = payload.new as { chat_id: string; left_at: string | null };
          if (updated.left_at) {
            fetchChats(); // 멤버리스트 즉시 갱신
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(realtimeChannel);
    };
  }, [currentChat?.chat_id, fetchChats]);

  // 전역 실시간 구독 (모든 새 direct_messages 감지 → 미읽음 카운트 증가)
  useEffect(() => {
    if (!user?.id) return;

    const subscription = supabase
      .channel('direct_messages_global')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'direct_messages' },
        payload => {
          const newMessage = payload.new as directMessages;

          // 내가 보낸 메시지는 무시
          if (newMessage.sender_id === user.id) return;

          // 현재 열려 있는 채팅방이 아닐 경우만 미읽음 카운트 증가
          if (currentChat?.chat_id !== newMessage.chat_id) {
            incrementUnread(newMessage.chat_id);
          } else {
            // 내가 보고 있는 방이면 읽음 처리
            resetUnread(newMessage.chat_id);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user?.id, currentChat?.chat_id, incrementUnread, resetUnread]);

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
    unreadCounts,
    setUnreadCounts,
  };

  return <DirectChatContext.Provider value={value}>{children}</DirectChatContext.Provider>;
}
