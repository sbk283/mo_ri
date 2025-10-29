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

// 참가자 보장 (존재X → insert, 존재하지만 나가있음 → 재참여로 전환: left_at=NULL, joined_at=now())
async function ensureMyParticipant(chatId: string, userId: string) {
  if (!userId) return;
  try {
    const { data: existing } = await supabase
      .from('direct_participants')
      .select('left_at, joined_at')
      .eq('chat_id', chatId)
      .eq('user_id', userId)
      .maybeSingle();

    // 없으면 새로 참여 (joined_at = now)
    if (!existing) {
      await supabase.from('direct_participants').insert({
        chat_id: chatId,
        user_id: userId,
        left_at: null,
        joined_at: new Date().toISOString(),
      });
      return;
    }

    // 있되 나가 있었다면 재참여: left_at=NULL, joined_at=now()
    if (existing.left_at !== null) {
      await supabase
        .from('direct_participants')
        .update({ left_at: null, joined_at: new Date().toISOString() })
        .eq('chat_id', chatId)
        .eq('user_id', userId);
    }
    // 이미 참여 중이면 아무 것도 하지 않음
  } catch (err) {
    console.error('ensureMyParticipant failed:', err);
  }
}

export function DirectChatProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();

  // 상태 변수
  const [chats, setChats] = useState<DirectChatWithGroup[]>([]);
  const [messages, setMessages] = useState<directMessages[]>([]);
  const [currentChat, setCurrentChat] = useState<Partial<DirectChatWithGroup> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  // 채팅 목록 변경 시, unreadCounts 초기화
  useEffect(() => {
    if (chats.length > 0) {
      const initial: Record<string, number> = {};
      chats.forEach(c => (initial[c.chat_id] = 0));
      setUnreadCounts(initial);
    }
  }, [chats]);

  const fetchChatsRef = useRef<() => Promise<void>>();

  // ------------------------------------------------------
  // 1. 채팅방 목록 조회
  // ------------------------------------------------------
  const fetchChats = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('direct_chats')
        .select(
          `
          chat_id,
          group_id,
          host_id,
          member_id,
          created_at,
          updated_at,
          created_by,
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

      if (!data || data.length === 0) {
        setChats([]);
        return;
      }

      // 마지막 메시지 조회
      const chatIds = data.map(c => c.chat_id);
      const lastMap = new Map<string, { content: string; created_at: string }>();

      if (chatIds.length > 0) {
        const { data: lastMsgs } = await supabase
          .from('direct_messages')
          .select('chat_id, content, created_at')
          .in('chat_id', chatIds)
          .order('created_at', { ascending: false });

        for (const msg of lastMsgs ?? []) {
          if (!lastMap.has(msg.chat_id)) {
            lastMap.set(msg.chat_id, { content: msg.content, created_at: msg.created_at });
          }
        }
      }

      // 매핑 변환 (타입 일치)
      const mappedChats: DirectChatWithGroup[] = data.map(chatObj => {
        const isHost = chatObj.host_id === user.id;
        const partnerProfileArr = isHost ? chatObj.member : chatObj.host;
        const partnerProfile: UserProfileMinimal | null = Array.isArray(partnerProfileArr)
          ? partnerProfileArr[0]
          : partnerProfileArr;

        const last = lastMap.get(chatObj.chat_id);
        const groupData = Array.isArray(chatObj.groups) ? chatObj.groups[0] : chatObj.groups;

        return {
          chat_id: chatObj.chat_id,
          group_id: chatObj.group_id,
          host_id: chatObj.host_id,
          member_id: chatObj.member_id,
          created_at: chatObj.created_at,
          updated_at: chatObj.updated_at,
          created_by: chatObj.created_by,
          partnerNickname: partnerProfile?.nickname ?? '알 수 없음',
          partnerAvatar: partnerProfile?.avatar_url ?? null,
          groupTitle: groupData?.group_title ?? '모임',
          lastMessage: last?.content ?? '',
          lastMessageAt: last?.created_at ?? undefined,
        };
      });

      setChats(mappedChats);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      setChats([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchChatsRef.current = fetchChats;
  }, [fetchChats]);

  // ------------------------------------------------------
  // 2. 메시지 불러오기
  // ------------------------------------------------------
  const myJoinedAtRef = useRef<string | null>(null);

  const fetchMessages = useCallback(
    async (chatId: string): Promise<void> => {
      if (!user?.id) return;
      try {
        setLoading(true);

        // 1) 내 참가 상태 확인: 나가있으면 화면 비움
        const { data: participantData, error: pErr } = await supabase
          .from('direct_participants')
          .select('left_at, joined_at')
          .eq('chat_id', chatId)
          .eq('user_id', user.id)
          .maybeSingle();
        if (pErr) throw pErr;

        if (participantData?.left_at) {
          myJoinedAtRef.current = null;
          setMessages([]);
          return;
        }

        // 2) 참여 보장 (재참여 시 joined_at 갱신)
        await ensureMyParticipant(chatId, user.id);

        // 3) 갱신된 joined_at 재조회(정확한 컷오프 반영)
        const { data: me } = await supabase
          .from('direct_participants')
          .select('joined_at')
          .eq('chat_id', chatId)
          .eq('user_id', user.id)
          .maybeSingle();

        const joinedAt = me?.joined_at ?? participantData?.joined_at ?? new Date(0).toISOString();
        myJoinedAtRef.current = joinedAt;

        // 4) 컷오프 이후 메시지만 불러오기
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
          .gte('created_at', joinedAt) // <<<<<<<<<< 핵심
          .order('created_at', { ascending: true });

        if (error) throw error;

        const formatted: directMessages[] = (data ?? []).map(msg => {
          const profile = Array.isArray(msg.user_profiles)
            ? (msg.user_profiles[0] as UserProfileMinimal)
            : (msg.user_profiles as UserProfileMinimal | null);
          return {
            message_id: msg.message_id,
            chat_id: msg.chat_id,
            sender_id: msg.sender_id,
            content: msg.content,
            created_at: msg.created_at,
            updated_at: msg.updated_at,
            nickname: profile?.nickname ?? null,
            avatar_url: profile?.avatar_url ?? null,
          };
        });

        setMessages(formatted);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [user?.id],
  );

  // ------------------------------------------------------
  // 3. 메시지 전송 (자기 화면 즉시 반영)
  // ------------------------------------------------------
  const sendMessage = useCallback(
    async (chatId: string, content: string): Promise<void> => {
      if (!user?.id) return;
      try {
        await ensureMyParticipant(chatId, user.id);

        const insertData: directMessagesInsert = {
          chat_id: chatId,
          sender_id: user.id,
          content,
        };

        const { data, error } = await supabase
          .from('direct_messages')
          .insert(insertData)
          .select(
            `message_id, chat_id, sender_id, content, created_at, updated_at, user_profiles!inner(nickname, avatar_url)`,
          )
          .single();

        if (error) throw error;

        const profile = Array.isArray(data.user_profiles)
          ? (data.user_profiles[0] as UserProfileMinimal)
          : (data.user_profiles as UserProfileMinimal | null);

        const enriched: directMessages = {
          message_id: data.message_id,
          chat_id: data.chat_id,
          sender_id: data.sender_id,
          content: data.content,
          created_at: data.created_at,
          updated_at: data.updated_at ?? data.created_at,
          nickname: profile?.nickname ?? null,
          avatar_url: profile?.avatar_url ?? null,
        };

        // 본인 화면에 즉시 추가
        setMessages(prev => [...prev, enriched]);

        // 새로 추가: 상대방이 나간 상태였다면 즉시 재참여 처리하여 대화가 이어지도록 함
        await supabase.rpc('rejoin_counterpart', { p_chat_id: chatId, p_sender: user.id });
      } catch (err) {
        console.error('sendMessage error:', err);
      }
    },
    [user?.id],
  );

  // ------------------------------------------------------
  // 4. 채팅방 생성 또는 재활용 (쌍당 1개 방 보장)
  // - 같은 그룹에서 같은 쌍(host_id, member_id)은 1개만 존재
  // - 양쪽이 나간 경우 RPC가 방을 삭제하므로, 그 후에는 새 방 생성 가능
  // - DB에 (group_id, user_low, user_high) 유니크 인덱스가 있어 중복 생성 차단
  // - upsert(onConflict)로 동시성까지 안전하게 처리
  // ------------------------------------------------------
  const findOrCreateChat = useCallback(
    async (groupId: string, hostId: string, memberId: string): Promise<string> => {
      try {
        // 1) 먼저 기존 방 조회: 현재 존재하는 방이 있으면 그걸 사용
        //    둘 다 나갔다면 RPC에서 방을 삭제하므로, 존재한다면 "활성" 방이라고 가정 가능
        const { data: existing, error: selErr } = await supabase
          .from('direct_chats')
          .select('chat_id')
          .eq('group_id', groupId)
          .or(
            `and(host_id.eq.${hostId},member_id.eq.${memberId}),and(host_id.eq.${memberId},member_id.eq.${hostId})`,
          )
          .maybeSingle();

        if (selErr) throw selErr;

        if (existing?.chat_id) {
          // 기존 방을 재사용
          await ensureMyParticipant(existing.chat_id, user?.id ?? '');
          return existing.chat_id;
        }

        // 2) 기존 방이 없으면 신규 생성 시도
        //    저장 생성 열(user_low/user_high)을 기반으로 유니크 인덱스가 걸려 있으므로
        //    동일 쌍에 대해 동시 요청이 오면 한쪽만 성공한다.
        const newChat: directChatsInsert = {
          group_id: groupId,
          host_id: hostId,
          member_id: memberId,
          created_by: user?.id ?? null,
        };

        // onConflict에 저장 생성 열을 포함한 키 지정
        const { data: upserted, error: upsertErr } = await supabase
          .from('direct_chats')
          .upsert(newChat, { onConflict: 'group_id,user_low,user_high' })
          .select('chat_id')
          .single();

        if (upsertErr) throw upsertErr;

        // 3) 참가자 보장
        await ensureMyParticipant(upserted.chat_id, user?.id ?? '');

        return upserted.chat_id;
      } catch (err: unknown) {
        // 4) 드물게 경쟁상황 등으로 에러가 나면, 마지막으로 다시 한번 기존 방을 조회해서 반환
        const { data: fallback } = await supabase
          .from('direct_chats')
          .select('chat_id')
          .eq('group_id', groupId)
          .or(
            `and(host_id.eq.${hostId},member_id.eq.${memberId}),and(host_id.eq.${memberId},member_id.eq.${hostId})`,
          )
          .maybeSingle();

        if (fallback?.chat_id) {
          await ensureMyParticipant(fallback.chat_id, user?.id ?? '');
          return fallback.chat_id;
        }
        console.error('findOrCreateChat error:', err);
        throw err;
      }
    },
    [user?.id],
  );

  // ------------------------------------------------------
  // 5. 실시간 이벤트 처리
  // ------------------------------------------------------
  useEffect(() => {
    const chatId = currentChat?.chat_id;
    if (!chatId || !user?.id) return;

    const channelName = `direct_chat_${chatId}`;
    const realtimeChannel = supabase
      .channel(channelName)

      // 메시지 실시간 수신
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'direct_messages' },
        async payload => {
          const newMessage = payload.new as directMessages;
          const chatId = currentChat?.chat_id;
          if (!chatId || newMessage.chat_id !== chatId) return;

          // 컷오프 이전 메시지는 무시
          const joinedAt = myJoinedAtRef.current;
          if (joinedAt && new Date(newMessage.created_at) < new Date(joinedAt)) {
            return;
          }

          if (newMessage.sender_id === user.id) return;

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
          setUnreadCounts(prev => ({
            ...prev,
            [chatId]: currentChat?.chat_id === chatId ? 0 : (prev[chatId] ?? 0) + 1,
          }));
        },
      )

      // 참가자 상태 변경 감지
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
          const currentUserId = user.id;

          // 본인이 나간 경우에만 UI 비움
          if (updated.user_id === currentUserId && updated.left_at) {
            setMessages([]);
            setCurrentChat(null);
            fetchChatsRef.current?.();
            return;
          }

          // 상대방이 나간 경우엔 채팅 유지, 목록만 새로고침
          if (updated.user_id !== currentUserId && updated.left_at) {
            fetchChatsRef.current?.();
          }
        },
      )

      // 채팅방 삭제 시 UI 정리
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
          fetchChatsRef.current?.();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(realtimeChannel);
    };
  }, [currentChat?.chat_id, user?.id]);

  // ------------------------------------------------------
  // 전역 참가 상태 구독: 내 direct_participants가 업데이트되면 목록 새로고침
  // - 효과: 상대가 메시지를 보내면 rejoin_counterpart로 내 left_at이 NULL이 되고,
  //         이 변화를 감지해 사이드바가 새로고침되어 방이 다시 나타남
  // ------------------------------------------------------
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`dp_user_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'direct_participants',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // 내 참가 상태가 변하면 목록을 갱신한다
          fetchChatsRef.current?.();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // ------------------------------------------------------
  // 6. Context 값 제공
  // ------------------------------------------------------
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
