import {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  useRef,
  type PropsWithChildren,
} from "react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import type { careers } from "../types/careerType";
import type { group_members } from "../types/group";

// 타입 정의
export type MemberStatus = "applied" | "approved" | "rejected" | "left";
export type MemberRole = "host" | "member";

export interface UserMiniProfile {
  user_id: string | null;
  nickname: string | null;
  avatar_url: string | null;
}

// GroupMember에 profile 필드 추가
export interface GroupMember {
  member_id: string;
  user_id: string;
  group_id: string;
  member_status: MemberStatus;
  member_role: MemberRole;
  member_joined_at: string;
  profile?: UserMiniProfile;
}

interface GroupMemberContextType {
  members: GroupMember[];
  loading: boolean;
  error: string | null;

  fetchMembers: (groupId: string) => Promise<void>;
  fetchMemberCount: (groupId: string) => Promise<number>;
  fetchAllCounts: (groupIds: string[]) => Promise<void>;

  joinGroup: (groupId: string) => Promise<"success" | "already" | "error">;
  leaveGroup: (groupId: string) => Promise<"success" | "error">;
  fetchUserCareers: (userId: string) => Promise<careers[]>;

  memberCounts: Record<string, number>;
  subscribeToGroup: (groupId: string) => void;

  kickMember: (
    groupId: string,
    targetUserId: string,
  ) => Promise<"success" | "error" | "denied">;
}

const GroupMemberContext = createContext<GroupMemberContextType | null>(null);

interface GroupMemberProviderProps extends PropsWithChildren {
  onMemberCountChange?: (groupId: string, delta: number) => void;
}

export const GroupMemberProvider: React.FC<GroupMemberProviderProps> = ({
  children,
  onMemberCountChange,
}) => {
  const { user } = useAuth();

  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // memberCounts는 useRef로 관리해 렌더링 최소화
  const memberCountsRef = useRef<Record<string, number>>({});

  // 화면 표시용 렌더링 state
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});

  const [subscribedGroups, setSubscribedGroups] = useState<Set<string>>(
    new Set(),
  );

  // 유저 커리어 조회
  const fetchUserCareers = useCallback(
    async (userId: string): Promise<careers[]> => {
      try {
        const { data, error } = await supabase
          .from("user_careers")
          .select("*")
          .eq("profile_id", userId)
          .order("start_date", { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "알 수 없는 오류";
        console.error("유저 커리어 조회 실패:", errorMessage);
        return [];
      }
    },
    [],
  );

  // approved 멤버 목록 조회
  const fetchMembers = useCallback(async (groupId: string) => {
    if (!groupId || groupId === "undefined") {
      console.warn("fetchMembers 호출 중 groupId 비어 있음:", groupId);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("group_members")
        .select(
          `
          member_id,
          user_id,
          group_id,
          member_status,
          member_role,
          member_joined_at,
          user_profiles ( user_id, nickname, avatar_url )
        `,
        )
        .eq("group_id", groupId)
        .eq("member_status", "approved")
        .order("member_joined_at", { ascending: true });

      if (error) throw error;

      const mapped: GroupMember[] = (data ?? []).map((row) => {
        const raw = (row as any)["user_profiles"];
        const prof = Array.isArray(raw) && raw.length > 0 ? raw[0] : raw;

        return {
          member_id: row.member_id,
          user_id: row.user_id,
          group_id: row.group_id,
          member_status: row.member_status,
          member_role: row.member_role,
          member_joined_at: row.member_joined_at,
          profile: prof
            ? {
                user_id: prof.user_id ?? null,
                nickname: prof.nickname ?? null,
                avatar_url: prof.avatar_url ?? null,
              }
            : undefined,
        };
      });

      setMembers(mapped);
    } catch (err) {
      const m = err instanceof Error ? err.message : "멤버 조회 실패";
      console.error(m);
      setError(m);
    } finally {
      setLoading(false);
    }
  }, []);

  // 멤버 카운트
  const fetchMemberCount = useCallback(
    async (groupId: string): Promise<number> => {
      if (!groupId || groupId === "preview-temp-id") {
        console.warn("미리보기 모드: 카운트 조회 건너뜀");
        return 0;
      }

      try {
        const { count, error } = await supabase
          .from("group_members")
          .select("member_id", { count: "exact", head: true })
          .eq("group_id", groupId)
          .eq("member_status", "approved");

        if (error) throw error;

        const next = count ?? 0;
        memberCountsRef.current[groupId] = next;

        setMemberCounts((prev) => {
          if (prev[groupId] === next) return prev;
          return { ...prev, [groupId]: next };
        });

        return next;
      } catch (err) {
        const m = err instanceof Error ? err.message : "멤버 카운트 조회 실패";
        console.error(m);
        return 0;
      }
    },
    [],
  );

  // Realtime subscribe
  useEffect(() => {
    const channel = supabase
      .channel("group_members_realtime")
      .on<group_members>(
        "postgres_changes",
        { event: "*", schema: "public", table: "group_members" },
        (payload: RealtimePostgresChangesPayload<group_members>) => {
          let groupId: string | undefined;

          if (
            payload.eventType === "INSERT" ||
            payload.eventType === "UPDATE"
          ) {
            groupId = payload.new.group_id;
          } else if (payload.eventType === "DELETE") {
            groupId = payload.old.group_id;
          }

          if (groupId) {
            fetchMemberCount(groupId);

            if (subscribedGroups.has(groupId)) {
              fetchMembers(groupId);
            }

            if (payload.eventType === "INSERT") {
              onMemberCountChange?.(groupId, +1);
            } else if (payload.eventType === "DELETE") {
              onMemberCountChange?.(groupId, -1);
            }
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [subscribedGroups, fetchMemberCount, fetchMembers, onMemberCountChange]);

  // 상세 페이지용 subscribe
  const subscribeToGroup = useCallback((groupId: string) => {
    const channel = supabase
      .channel(`group_members_${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "group_members",
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          fetchMemberCount(groupId);
          fetchMembers(groupId);
        },
      )
      .subscribe();
  }, []);
  // const subscribeToGroup = useCallback((groupId: string) => {
  //   setSubscribedGroups((prev) => {
  //     const next = new Set(prev);
  //     next.add(groupId);
  //     return next;
  //   });
  // }, []);

  // 모임 참가
  const joinGroup = useCallback(
    async (groupId: string): Promise<"success" | "already" | "error"> => {
      if (!user) return "error";
      setLoading(true);
      setError(null);

      try {
        const { data: existing } = await supabase
          .from("group_members")
          .select("member_status, member_role")
          .eq("group_id", groupId)
          .eq("user_id", user.id)
          .maybeSingle();

        if (existing) {
          return "already";
        }

        const { error } = await supabase.from("group_members").insert({
          group_id: groupId,
          user_id: user.id,
          member_role: "member",
          member_status: "approved",
        });

        if (error) throw error;

        return "success";
      } catch (err) {
        const m = err instanceof Error ? err.message : "참가 실패";
        console.error(m);
        setError(m);
        return "error";
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  // 모임 탈퇴
  const leaveGroup = useCallback(
    async (groupId: string): Promise<"success" | "error"> => {
      if (!user) return "error";
      setLoading(true);

      try {
        const { error } = await supabase
          .from("group_members")
          .update({ member_status: "left" })
          .eq("group_id", groupId)
          .eq("user_id", user.id);

        if (error) throw error;
        return "success";
      } catch (err) {
        const m = err instanceof Error ? err.message : "탈퇴 실패";
        console.error(m);
        setError(m);
        return "error";
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  // 추방
  const kickMember = useCallback(
    async (groupId: string, targetUserId: string) => {
      if (!user) return "error";

      try {
        const { data: target, error: fetchError } = await supabase
          .from("group_members")
          .select("member_role")
          .eq("group_id", groupId)
          .eq("user_id", targetUserId)
          .maybeSingle();

        if (fetchError) throw fetchError;
        if (target?.member_role === "host") return "denied";

        const { error: updateError } = await supabase
          .from("group_members")
          .update({ member_status: "left" })
          .eq("group_id", groupId)
          .eq("user_id", targetUserId);

        if (updateError) throw updateError;

        setMembers((prev) =>
          prev.filter(
            (m) => !(m.group_id === groupId && m.user_id === targetUserId),
          ),
        );

        const current = memberCountsRef.current[groupId] ?? 0;
        memberCountsRef.current[groupId] = Math.max(0, current - 1);

        setMemberCounts((prev) => ({
          ...prev,
          [groupId]: Math.max(0, current - 1),
        }));

        return "success";
      } catch (err) {
        const m = err instanceof Error ? err.message : "추방 실패";
        console.error(m);
        return "error";
      }
    },
    [user],
  );

  const fetchAllCounts = useCallback(async (groupIds: string[]) => {
    if (!groupIds || groupIds.length === 0) return;

    try {
      const { data, error } = await supabase
        .from("group_members")
        .select("group_id, member_id")
        .in("group_id", groupIds)
        .eq("member_status", "approved");

      if (error) throw error;

      const aggregated = data.reduce((acc: Record<string, number>, row) => {
        acc[row.group_id] = (acc[row.group_id] ?? 0) + 1;
        return acc;
      }, {});

      setMemberCounts((prev) => ({
        ...prev,
        ...aggregated,
      }));

      // ref에도 반영
      memberCountsRef.current = {
        ...memberCountsRef.current,
        ...aggregated,
      };
    } catch (err) {
      console.error("전체 멤버 카운트 조회 실패:", err);
    }
  }, []);

  return (
    <GroupMemberContext.Provider
      value={{
        members,
        loading,
        error,
        fetchUserCareers,
        fetchMembers,
        fetchMemberCount,
        joinGroup,
        leaveGroup,
        memberCounts,
        fetchAllCounts,
        subscribeToGroup,
        kickMember,
      }}
    >
      {children}
    </GroupMemberContext.Provider>
  );
};

export function useGroupMember() {
  const ctx = useContext(GroupMemberContext);
  if (!ctx)
    throw new Error(
      "useGroupMember은 GroupMemberProvider 안에서만 사용해야 합니다.",
    );
  return ctx;
}
