// 채팅 타입 (그룹 조인 포함)
export interface DirectChatWithGroup extends directChats {
  partnerNickname?: string;
  partnerAvatar?: string | null;
  groupTitle?: string | null;
  lastMessage?: string;
  lastMessageAt?: string;

  host?: {
    nickname: string | null;
    avatar_url: string | null;
  } | null;

  member?: {
    nickname: string | null;
    avatar_url: string | null;
  } | null;
}

export interface UserProfileMinimal {
  nickname: string | null;
  avatar_url: string | null;
}

// Context 타입
export interface DirectChatContextType {
  chats: DirectChatWithGroup[];
  messages: directMessages[];

  currentChat: Partial<DirectChatWithGroup> | null;
  setCurrentChat: React.Dispatch<React.SetStateAction<Partial<DirectChatWithGroup> | null>>;

  loading: boolean;
  error: string | null;

  fetchChats: (groupId?: string) => Promise<void>;
  fetchMessages: (chatId: string) => Promise<void>;
  sendMessage: (chatId: string, content: string) => Promise<void>;
  findOrCreateChat: (groupId: string, hostId: string, memberId: string) => Promise<string>;
}

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      direct_chats: {
        Row: {
          chat_id: string;
          created_at: string;
          created_by: string | null;
          group_id: string;
          host_id: string;
          member_id: string;
          updated_at: string;
        };
        Insert: {
          chat_id?: string;
          created_at?: string;
          created_by?: string | null;
          group_id: string;
          host_id: string;
          member_id: string;
          updated_at?: string;
        };
        Update: Partial<directChats>;
      };
      direct_messages: {
        Row: {
          chat_id: string;
          content: string;
          created_at: string;
          message_id: string;
          sender_id: string;
          updated_at: string;
        };
        Insert: {
          chat_id: string;
          content: string;
          sender_id: string;
          created_at?: string;
          updated_at?: string;
          message_id?: string;
        };
        Update: Partial<directMessages>;
      };
      direct_participants: {
        Row: {
          chat_id: string;
          user_id: string;
          joined_at: string | null;
          last_read_at: string | null;
          left_at: string | null;
        };
        Insert: {
          chat_id: string;
          user_id: string;
          joined_at?: string | null;
          last_read_at?: string | null;
          left_at?: string | null;
        };
        Update: Partial<directParticipants>;
      };
    };
  };
};

export type directChats = Database['public']['Tables']['direct_chats']['Row'];
export type directChatsInsert = Database['public']['Tables']['direct_chats']['Insert'];
export type directMessages = Database['public']['Tables']['direct_messages']['Row'] & {
  nickname?: string | null;
  avatar_url?: string | null;
  user_profiles?:
    | UserProfileMinimal
    | UserProfileMinimal[] // Supabase 조인 시 배열로 오는 경우
    | null;
};
export type directMessagesInsert = Database['public']['Tables']['direct_messages']['Insert'];
export type directParticipants = Database['public']['Tables']['direct_participants']['Row'];
