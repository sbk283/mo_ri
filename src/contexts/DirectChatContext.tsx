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

  // 초기 집계: 현재 로그인 사용자의 채팅방별 미읽음 수를 RPC로 일괄 조회하여 전역 상태에 반영
  const loadUnreadCounts = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_unread_counts');
      if (error) throw error;

      // RPC 결과를 Record 형태로 변환
      const next: Record<string, number> = {};
      for (const row of data ?? []) {
        next[row.chat_id] = Number(row.unread) || 0;
      }

      // 현재 채팅 목록에 존재하지만 집계에 없으면 0으로 채움
      setUnreadCounts(prev => {
        const merged: Record<string, number> = { ...next };
        for (const c of chats) {
          if (merged[c.chat_id] == null) merged[c.chat_id] = 0;
        }
        return merged;
      });
    } catch (e) {
      // 집계 실패 시에는 기존 값을 유지
      console.error('loadUnreadCounts failed:', e);
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
        // 목록이 비면 미읽음도 초기화
        setUnreadCounts({});
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

      // 목록 갱신 직후 미읽음 집계를 한 번만 수행
      await loadUnreadCounts();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      setChats([]);
      setUnreadCounts({});
    } finally {
      setLoading(false);
    }
  }, [user?.id, loadUnreadCounts]);

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

        // 내 참가 상태 확인: 나가있으면 화면 비움
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

        // 참여 보장 (재참여 시 joined_at 갱신)
        await ensureMyParticipant(chatId, user.id);

        // 갱신된 joined_at 재조회(정확한 컷오프 반영)
        const { data: me } = await supabase
          .from('direct_participants')
          .select('joined_at')
          .eq('chat_id', chatId)
          .eq('user_id', user.id)
          .maybeSingle();

        const joinedAt = me?.joined_at ?? participantData?.joined_at ?? new Date(0).toISOString();
        myJoinedAtRef.current = joinedAt;

        // 컷오프 이후 메시지만 불러오기
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
          .gte('created_at', joinedAt)
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

  // 채팅을 열었을 때 읽음 처리: 서버에 last_read_at을 찍고 전역 unreadCounts를 0으로 동기화
  const markAsRead = useCallback(async (chatId: string) => {
    try {
      await supabase.rpc('mark_chat_read', { p_chat_id: chatId });
      setUnreadCounts(prev => ({ ...prev, [chatId]: 0 }));
    } catch (e) {
      console.error('markAsRead failed:', e);
    }
  }, []);

  useEffect(() => {
    const id = currentChat?.chat_id;
    if (!id) return;
    fetchMessages(id).then(() => markAsRead(id));
  }, [currentChat?.chat_id, fetchMessages, markAsRead]);

  // ------------------------------------------------------
  // 3. 메시지 전송 (자기 화면 즉시 반영)
  // ------------------------------------------------------
  const sendMessage = useCallback(
    async (chatId: string, content: string): Promise<void> => {
      if (!user?.id) return;
      try {
        // 상대가 나가 있었다면 먼저 재참여 처리하여 joined_at이 메시지 생성 시각보다 앞서도록 보장
        // 주의: rejoin_counterpart는 "left_at IS NOT NULL"일 때만 joined_at을 now()로 갱신하도록 서버에서 보강 권장
        await supabase.rpc('rejoin_counterpart', { p_chat_id: chatId, p_sender: user.id });

        // 내 참가 상태도 보장 (본인 레코드 없거나 나가있던 경우 복구)
        await ensureMyParticipant(chatId, user.id);

        // 메시지 INSERT (이제 created_at >= 상대의 joined_at이 성립하므로 컷오프에 걸리지 않음)
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
      } catch (err) {
        console.error('sendMessage error:', err);
      }
    },
    [user?.id],
  );

  // ------------------------------------------------------
  // 4. 채팅방 생성 또는 재활용 (쌍당 1개 방 보장)
  // ------------------------------------------------------
  const findOrCreateChat = useCallback(
    async (groupId: string, hostId: string, memberId: string): Promise<string> => {
      try {
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
          await ensureMyParticipant(existing.chat_id, user?.id ?? '');
          return existing.chat_id;
        }

        const newChat: directChatsInsert = {
          group_id: groupId,
          host_id: hostId,
          member_id: memberId,
          created_by: user?.id ?? null,
        };

        const { data: upserted, error: upsertErr } = await supabase
          .from('direct_chats')
          .upsert(newChat, { onConflict: 'group_id,user_low,user_high' })
          .select('chat_id')
          .single();

        if (upsertErr) throw upsertErr;

        await ensureMyParticipant(upserted.chat_id, user?.id ?? '');

        return upserted.chat_id;
      } catch (err: unknown) {
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
    const activeChatId = currentChat?.chat_id;
    if (!activeChatId || !user?.id) return;

    const channelName = `direct_chat_${activeChatId}`;
    const realtimeChannel = supabase
      .channel(channelName)

      // 메시지 실시간 수신
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'direct_messages' },
        async payload => {
          const newMessage = payload.new as directMessages;

          // 현재 선택된 채팅 이외의 메시지는 리스트 증분만 처리
          const isCurrent = newMessage.chat_id === activeChatId;

          // 컷오프 이전 메시지는 무시 (joined_at은 fetchMessages 시점 기준)
          const joinedAt = myJoinedAtRef.current;
          if (joinedAt && new Date(newMessage.created_at) < new Date(joinedAt)) {
            return;
          }

          // 본인이 보낸 메시지는 미읽음 증가 대상이 아님
          if (newMessage.sender_id === user.id) return;

          if (isCurrent) {
            // 현재 방이면 프로필 보강 후 즉시 렌더
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

            // 현재 보고 있는 방이면 미읽음은 0 유지
            setUnreadCounts(prev => ({ ...prev, [activeChatId]: 0 }));
          } else {
            // 다른 방이면 미읽음 수만 +1
            setUnreadCounts(prev => ({
              ...prev,
              [newMessage.chat_id]: (prev[newMessage.chat_id] ?? 0) + 1,
            }));
          }
        },
      )

      // 참가자 상태 변경 감지
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'direct_participants',
          filter: `chat_id=eq.${activeChatId}`,
        },
        payload => {
          const updated = payload.new as { user_id: string; left_at: string | null };

          // 본인이 나간 경우: 현재 화면 정리 및 목록 새로고침
          if (updated.user_id === user.id && updated.left_at) {
            setMessages([]);
            setCurrentChat(null);
            setUnreadCounts(prev => ({ ...prev, [activeChatId]: 0 }));
            fetchChatsRef.current?.();
            return;
          }

          // 상대방이 나간 경우: 목록만 새로고침
          if (updated.user_id !== user.id && updated.left_at) {
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
          filter: `chat_id=eq.${activeChatId}`,
        },
        () => {
          setMessages([]);
          setCurrentChat(null);
          setUnreadCounts(prev => ({ ...prev, [activeChatId]: 0 }));
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
