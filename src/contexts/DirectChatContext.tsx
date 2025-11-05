import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type PropsWithChildren,
} from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import { insertNotification } from "../lib/notify";
import type {
  DirectChatContextType,
  DirectChatWithGroup,
  directMessages,
  directMessagesInsert,
  directChatsInsert,
  UserProfileMinimal,
} from "../types/chat";

const DirectChatContext = createContext<DirectChatContextType | null>(null);

export const useDirectChat = () => {
  const ctx = useContext(DirectChatContext);
  if (!ctx)
    throw new Error("useDirectChat must be used within DirectChatProvider");
  return ctx;
};

// 참가자 보장 (존재X → insert, 존재하지만 나가있음 → 재참여로 전환: left_at=NULL, joined_at=now())
export async function ensureMyParticipant(chatId: string, userId: string) {
  if (!userId) return;
  try {
    const { data: existing } = await supabase
      .from("direct_participants")
      .select("left_at, joined_at")
      .eq("chat_id", chatId)
      .eq("user_id", userId)
      .maybeSingle();

    // 없으면 새로 참여 (joined_at = now)
    if (!existing) {
      await supabase.from("direct_participants").upsert(
        {
          chat_id: chatId,
          user_id: userId,
          left_at: null,
          joined_at: new Date().toISOString(),
        },
        { onConflict: "chat_id,user_id" },
      );
      return;
    }

    // 있되 나가 있었다면 재참여: left_at=NULL, joined_at=now()
    if (existing.left_at !== null) {
      await supabase
        .from("direct_participants")
        .update({ left_at: null, joined_at: new Date().toISOString() })
        .eq("chat_id", chatId)
        .eq("user_id", userId);
    }
  } catch (err) {
    console.error("ensureMyParticipant failed:", err);
  }
}

export function DirectChatProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  // 상태 변수
  const [chats, setChats] = useState<DirectChatWithGroup[]>([]);
  const [messages, setMessages] = useState<directMessages[]>([]);
  const [currentChat, setCurrentChat] =
    useState<Partial<DirectChatWithGroup> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  // 2025-10-30 미읽음 집계: 함수 안정화를 위해 chats 의존성 제거
  //          호출 측에서 최신 chatIds를 전달받아 병합 처리
  const loadUnreadCounts = useCallback(async (chatIds: string[] = []) => {
    try {
      const { data, error } = await supabase.rpc("get_unread_counts");
      if (error) throw error;

      const next: Record<string, number> = {};
      for (const row of data ?? []) {
        next[row.chat_id] = Number(row.unread) || 0;
      }

      setUnreadCounts(() => {
        const merged: Record<string, number> = { ...next };
        for (const id of chatIds) {
          if (merged[id] == null) merged[id] = 0;
        }
        return merged;
      });
    } catch (e) {
      console.error("loadUnreadCounts failed:", e);
    }
  }, []);

  const fetchChatsRef = useRef<() => Promise<void>>();

  // ------------------------------------------------------
  // 1. 채팅방 목록 조회
  // ------------------------------------------------------
  // 2025-10-30 함수 안정화: loadUnreadCounts가 chats에 의존하지 않도록 개선하여 fetchChats 참조가 불필요하게 바뀌지 않게 함
  const fetchChats = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("direct_chats")
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
        .eq("direct_participants.user_id", user.id)
        .is("direct_participants.left_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        setChats([]);
        // 목록이 비면 미읽음도 초기화
        setUnreadCounts({});
        return;
      }

      // 마지막 메시지 조회
      const chatIds = data.map((c) => c.chat_id);
      const lastMap = new Map<
        string,
        { content: string; created_at: string }
      >();

      if (chatIds.length > 0) {
        const { data: lastMsgs } = await supabase
          .from("direct_messages")
          .select("chat_id, content, created_at")
          .in("chat_id", chatIds)
          .order("created_at", { ascending: false });

        for (const msg of lastMsgs ?? []) {
          if (!lastMap.has(msg.chat_id)) {
            lastMap.set(msg.chat_id, {
              content: msg.content,
              created_at: msg.created_at,
            });
          }
        }
      }

      // 매핑 변환 (타입 일치)
      const mappedChats: DirectChatWithGroup[] = data.map((chatObj) => {
        const isHost = chatObj.host_id === user.id;
        const partnerProfileArr = isHost ? chatObj.member : chatObj.host;
        const partnerProfile: UserProfileMinimal | null = Array.isArray(
          partnerProfileArr,
        )
          ? partnerProfileArr[0]
          : partnerProfileArr;

        const last = lastMap.get(chatObj.chat_id);
        const groupData = Array.isArray(chatObj.groups)
          ? chatObj.groups[0]
          : chatObj.groups;

        return {
          chat_id: chatObj.chat_id,
          group_id: chatObj.group_id,
          host_id: chatObj.host_id,
          member_id: chatObj.member_id,
          created_at: chatObj.created_at,
          updated_at: chatObj.updated_at,
          created_by: chatObj.created_by,
          partnerNickname: partnerProfile?.nickname ?? "알 수 없음",
          partnerAvatar: partnerProfile?.avatar_url ?? null,
          groupTitle: groupData?.group_title ?? "모임",
          lastMessage: last?.content ?? "",
          lastMessageAt: last?.created_at ?? undefined,
        };
      });

      setChats(mappedChats);

      // 2025-10-30 목록 갱신 직후 최신 chatIds로 미읽음 집계 수행
      const chatIdsForCounts = mappedChats.map((c) => c.chat_id);
      await loadUnreadCounts(chatIdsForCounts);
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
          .from("direct_participants")
          .select("left_at, joined_at")
          .eq("chat_id", chatId)
          .eq("user_id", user.id)
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
          .from("direct_participants")
          .select("joined_at")
          .eq("chat_id", chatId)
          .eq("user_id", user.id)
          .maybeSingle();

        const joinedAt =
          me?.joined_at ??
          participantData?.joined_at ??
          new Date(0).toISOString();
        myJoinedAtRef.current = joinedAt;

        // 컷오프 이후 메시지만 불러오기
        const isFirstJoin = !participantData; // 존재X면 첫참여

        let query = supabase
          .from("direct_messages")
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
          .eq("chat_id", chatId)
          .order("created_at", { ascending: true });

        if (!isFirstJoin && joinedAt) {
          query = query.gte("created_at", joinedAt);
        }

        const { data, error } = await query;

        if (error) throw error;

        const formatted: directMessages[] = (data ?? []).map((msg) => {
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
      await supabase.rpc("mark_chat_read", { p_chat_id: chatId });
      setUnreadCounts((prev) => ({ ...prev, [chatId]: 0 }));
    } catch (e) {
      console.error("markAsRead failed:", e);
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
    async (chatId: string | null, content: string): Promise<void> => {
      if (!user?.id) return;
      try {
        let finalChatId = chatId;

        // 채팅방이 존재하지 않으면 자동 생성
        if (!finalChatId) {
          // A와 B의 조합으로 기존 방 있는지 확인
          const { data: existing } = await supabase
            .from("direct_chats")
            .select("chat_id, host_id, member_id, group_id")
            .or(
              `and(host_id.eq.${user.id},member_id.neq.${user.id}),
             and(member_id.eq.${user.id},host_id.neq.${user.id})`,
            )
            .maybeSingle();

          if (existing?.chat_id) {
            finalChatId = existing.chat_id;
          } else {
            // 방이 없으면 새로 생성
            const { data: created, error: createErr } = await supabase
              .from("direct_chats")
              .insert({
                host_id: user.id, // 보낸 사람을 host로 지정
                member_id: null, // 나중에 상대방 연결
                created_by: user.id,
                group_id: null,
              })
              .select("chat_id")
              .single();

            if (createErr) throw createErr;
            finalChatId = created.chat_id;
            console.log("[sendMessage] 새로운 채팅방 생성됨:", finalChatId);
          }
        }

        // 내 참가 상태 보장
        await ensureMyParticipant(finalChatId!, user.id);

        // 상대방 참가자 보장 (없으면 rejoin_counterpart로 추가)
        const { data: chatInfo } = await supabase
          .from("direct_chats")
          .select("host_id, member_id, group_id")
          .eq("chat_id", finalChatId)
          .maybeSingle();

        if (chatInfo) {
          const recipientId =
            chatInfo.host_id === user.id
              ? chatInfo.member_id
              : chatInfo.host_id;

          // 참가자 보장 강제 처리
          if (recipientId && recipientId !== user.id) {
            await supabase.rpc("rejoin_counterpart", {
              p_chat_id: finalChatId!,
              p_sender: user.id,
            });
          }
        }

        // 메시지 INSERT
        const insertData: directMessagesInsert = {
          chat_id: finalChatId!,
          sender_id: user.id,
          content,
        };

        const { data, error } = await supabase
          .from("direct_messages")
          .insert(insertData)
          .select(
            `message_id, chat_id, sender_id, content, created_at, updated_at, user_profiles!inner(nickname, avatar_url)`,
          )
          .single();

        if (error) throw error;

        // 내 화면 즉시 반영
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

        setMessages((prev) => [...prev, enriched]);

        // 상대방에게 알림 전송
        if (chatInfo) {
          const recipientId =
            chatInfo.host_id === user.id
              ? chatInfo.member_id
              : chatInfo.host_id;

          if (recipientId && recipientId !== user.id) {
            const senderNickname = profile?.nickname ?? "알 수 없음";
            await insertNotification({
              userId: recipientId,
              type: "chat",
              title: "새로운 채팅",
              message: `${senderNickname}님으로부터 메시지가 도착했습니다: ${content.substring(0, 50)}${
                content.length > 50 ? "..." : ""
              }`,
              groupId: chatInfo.group_id,
              targetId: finalChatId,
            });
          }
        }

        // 목록 즉시 갱신 (채팅방 새로 생겼을 때 반영)
        fetchChatsRef.current?.();
      } catch (err) {
        console.error("sendMessage error:", err);
      }
    },
    [user?.id],
  );

  // ------------------------------------------------------
  // 4. 채팅방 생성 또는 재활용 (쌍당 1개 방 보장)
  // ------------------------------------------------------
  const findOrCreateChat = useCallback(
    async (
      groupId: string,
      hostId: string,
      memberId: string,
    ): Promise<string> => {
      try {
        // FK 오류 방지: user_profiles 존재 확인
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("user_id")
          .eq("user_id", user?.id ?? "")
          .maybeSingle();

        if (!profile) {
          console.warn(
            "[findOrCreateChat] user_profiles에 없는 사용자입니다. Chat 생성 중단",
          );
          return "";
        }

        // 기존 채팅방 존재 여부 우선 확인
        const { data: chatsInGroup, error: selErr } = await supabase
          .from("direct_chats")
          .select("chat_id, host_id, member_id")
          .eq("group_id", groupId);

        if (selErr) throw selErr;

        const existing = chatsInGroup?.find(
          (c) =>
            (c.host_id === hostId && c.member_id === memberId) ||
            (c.host_id === memberId && c.member_id === hostId),
        );

        if (selErr) throw selErr;

        // 이미 있으면 참가자 보장 후 반환
        if (existing?.chat_id) {
          await ensureMyParticipant(existing.chat_id, user?.id ?? "");
          return existing.chat_id;
        }

        // 없으면 방 새로 생성 + 양쪽 참가자 보장
        const { data: created, error: createErr } = await supabase
          .from("direct_chats")
          .insert({
            group_id: groupId,
            host_id: hostId,
            member_id: memberId,
            created_by: user?.id ?? null,
          })
          .select("chat_id")
          .single();

        if (createErr) throw createErr;

        // 나 (보낸 사람) 참가자 보장
        await ensureMyParticipant(created.chat_id, user?.id ?? "");

        // 상대방 참가자 보장 (없으면 자동 생성)
        await supabase.rpc("rejoin_counterpart", {
          p_chat_id: created.chat_id,
          p_sender: user?.id,
        });

        fetchChatsRef.current?.();
        return created.chat_id;
      } catch (err: any) {
        if (err?.status === 409) {
          console.warn(
            "[findOrCreateChat] 409 Conflict 발생, 기존 채팅 재조회 시도",
          );
          const { data: fallback } = await supabase
            .from("direct_chats")
            .select("chat_id")
            .eq("group_id", groupId)
            .or(
              `and(host_id.eq.${hostId},member_id.eq.${memberId}),
             and(host_id.eq.${memberId},member_id.eq.${hostId})`,
            )
            .maybeSingle();

          if (fallback?.chat_id) {
            await ensureMyParticipant(fallback.chat_id, user?.id ?? "");
            return fallback.chat_id;
          }
        }
        console.error("findOrCreateChat error:", err);
        return "";
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
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "direct_messages" },
        async (payload) => {
          const newMessage = payload.new as directMessages;

          // 현재 선택된 채팅 이외의 메시지는 리스트 증분만 처리
          const isCurrent = newMessage.chat_id === activeChatId;

          // 컷오프 이전 메시지는 무시 (joined_at은 fetchMessages 시점 기준)
          const joinedAt = myJoinedAtRef.current;
          if (
            joinedAt &&
            new Date(newMessage.created_at) < new Date(joinedAt)
          ) {
            return;
          }

          // 본인이 보낸 메시지는 미읽음 증가 대상이 아님
          if (newMessage.sender_id === user.id) return;

          if (isCurrent) {
            // 현재 방이면 프로필 보강 후 즉시 렌더
            const { data: profile } = await supabase
              .from("user_profiles")
              .select("nickname, avatar_url")
              .eq("user_id", newMessage.sender_id)
              .maybeSingle();

            const enriched: directMessages = {
              ...newMessage,
              nickname: profile?.nickname ?? null,
              avatar_url: profile?.avatar_url ?? null,
            };

            setMessages((prev) => [...prev, enriched]);

            // 현재 보고 있는 방이면 미읽음은 0 유지
            setUnreadCounts((prev) => ({ ...prev, [activeChatId]: 0 }));
          } else {
            // 다른 방이면 미읽음 수만 +1
            setUnreadCounts((prev) => ({
              ...prev,
              [newMessage.chat_id]: (prev[newMessage.chat_id] ?? 0) + 1,
            }));
          }
        },
      )

      // 참가자 상태 변경 감지
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "direct_participants",
          filter: `chat_id=eq.${activeChatId}`,
        },
        (payload) => {
          const updated = payload.new as {
            user_id: string;
            left_at: string | null;
          };

          // 본인이 나간 경우: 현재 화면 정리 및 목록 새로고침
          if (updated.user_id === user.id && updated.left_at) {
            setMessages([]);
            setCurrentChat(null);
            setUnreadCounts((prev) => ({ ...prev, [activeChatId]: 0 }));
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
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "direct_chats",
          filter: `chat_id=eq.${activeChatId}`,
        },
        () => {
          setMessages([]);
          setCurrentChat(null);
          setUnreadCounts((prev) => ({ ...prev, [activeChatId]: 0 }));
          fetchChatsRef.current?.();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(realtimeChannel);
    };
  }, [currentChat?.chat_id, user?.id]);

  // ------------------------------------------------------
  // 전역 참가 상태 구독: 내 direct_participants 변화 감지
  // 2025-10-30 joined_at/last_read_at 등 단순 업데이트로 인한 과도한 새로고침 방지
  //          left_at 값 변화(퇴장/재입장) 같은 구조적 변경일 때만 목록 새로고침
  // ------------------------------------------------------
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`dp_user_${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "direct_participants",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // 2025-10-30 left_at 값 변화가 없으면 무시 (joined_at/last_read_at 등은 목록 새로고침 불필요)
          const oldLeft =
            (payload.old as { left_at: string | null } | null)?.left_at ?? null;
          const newLeft =
            (payload.new as { left_at: string | null } | null)?.left_at ?? null;
          if (oldLeft === newLeft) return;
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

  return (
    <DirectChatContext.Provider value={value}>
      {children}
    </DirectChatContext.Provider>
  );
}
