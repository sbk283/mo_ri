import type { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import { supabase } from "../lib/supabase";

// 1. 인증 컨텍스트 타입
type AuthContextType = {
  session: Session | null;
  user: User | null;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signInWithKakao: () => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  loading: boolean;

  // 2025-11-11-유비 닉네임 글로벌 관리 로직 추가
  nickname: string;
  updateNickname: (n: string) => void;
};

// 2. 인증 컨텍스트 생성
const AuthContext = createContext<AuthContextType | null>(null);

// 3. 인증 컨텍스트 프로바이더
export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // 2025-11-11-유비 닉네임 상태 추가
  const [nickname, setNickname] = useState<string>("");

  // 2025-11-11-유비 닉네임변경함수(setter함수)
  const updateNickname = (newName: string) => {
    setNickname(newName);
  };

  useEffect(() => {
    const loadSession = async () => {
      try {
        setLoading(true);
        const { data } = await supabase.auth.getSession();
        setSession(data.session ? data.session : null);
        setUser(data.session?.user ?? null);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    loadSession();

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ? data.session : null);
      setUser(data.session?.user ?? null);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const signUp: AuthContextType["signUp"] = async (email, password) => {
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      return { error: error.message };
    }
    return {};
  };

  const signIn: AuthContextType["signIn"] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {},
    });
    if (error) {
      return { error: error.message };
    }
    return {};
  };

  const signInWithKakao: AuthContextType["signInWithKakao"] = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) return { error: error.message };
    return {};
  };

  const signInWithGoogle: AuthContextType["signInWithGoogle"] = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) return { error: error.message };
    return {};
  };

  const signOut: AuthContextType["signOut"] = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        signUp,
        signIn,
        signOut,
        user,
        session,
        loading,
        signInWithKakao,
        signInWithGoogle,
        nickname, // 2025-11-11-유비
        updateNickname, // 2025-11-11-유비
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// const {signUp, signIn, signOut, user, session} = useAuth()
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("AuthContext 가 없습니다.");
  }
  return ctx;
};
