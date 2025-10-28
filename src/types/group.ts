// 개별 커리큘럼 단계
export interface CurriculumItem {
  title: string;
  detail: string;
  files?: File[];
}

// groups + 조인된 카테고리 포함 타입
export interface GroupWithCategory extends groups {
  categories_major?: Pick<categoryMajor, 'category_major_name' | 'category_major_slug'>;
  categories_sub?: Pick<categorySub, 'category_sub_name' | 'category_sub_slug'>;

  member_count?: number; // 모임 참여 인원 수
  category_major_name?: string; // 필수 표시용 문자열
  category_sub_name?: string;
}

// 모임 생성 전체 폼 데이터
export interface GroupFormData {
  // 카테고리
  interestMajor: string; // 대분류
  interestSub: string; // 중분류

  // DB 저장용 FK 연결됨
  major_id: string;
  sub_id: string;

  // 일정
  startDate: string; // 시작일
  endDate: string; // 종료일
  groupType: 'oneday' | 'short' | 'long' | ''; // 모임 유형

  // 지역
  group_region: string;
  group_region_any: boolean;

  // 모임 기본 정보
  title: string; // 모임 이름
  memberCount: number; // 모집 인원
  images: File[]; // 대표 + 서브 이미지
  description: string; // 모임 소개 (RichText)
  summary: string; // 간략 소개

  // 커리큘럼
  curriculum: CurriculumItem[]; // 단계별 커리큘럼
  files: File[][]; // 단계별 첨부 이미지

  // 모임장 정보 - 이거 추후 DB 테이블 네이밍대로 할거임!
  leaderName: string; // 모임장 이름
  leaderLocation: string; // 모임장 위치
  leaderCareer: string; // 모임장 경력
}

// 모임 (groupsInsert 쪽 타입정의)
export interface GroupInsertPayload {
  group_title: string;
  group_region: string | null;
  created_by: string;
  group_short_intro?: string | null;
  group_content?: string | null;
  group_start_day: string;
  group_end_day: string;
  status?: 'recruiting' | 'closed' | 'finished';
  group_capacity?: number | null;
  group_region_any?: boolean;
  major_id: string;
  sub_id: string;
}

// ===== supabase 연동 props 타입 =====

// Step1 Props
export interface StepOneProps {
  formData: GroupFormData;
  onChange: <Field extends keyof GroupFormData>(field: Field, value: GroupFormData[Field]) => void;
  onPrev?: () => void;
  onNext?: () => void;
}

// Step2 Props
export interface StepTwoProps {
  formData: GroupFormData;
  onChange: <Field extends keyof GroupFormData>(field: Field, value: GroupFormData[Field]) => void;
  onPrev?: () => void;
  onNext?: () => void;
}

// Step3 Props
export interface StepThreeProps {
  formData: GroupFormData;
  onPrev?: () => void;
  onNext?: () => void;
}
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// 게시판 타입
export type board_type = Database['public']['Tables']['board_type']['Row'];
export type board_typeInsert = Database['public']['Tables']['board_type']['Row'];
export type board_typeUpdate = Database['public']['Tables']['board_type']['Row'];

// 그룹 멤버
export type group_members = Database['public']['Tables']['group_members']['Row'];
export type group_membersInsert = Database['public']['Tables']['group_members']['Row'];
export type group_membersUpdate = Database['public']['Tables']['group_members']['Row'];

// 그룹 게시글
export type group_posts = Database['public']['Tables']['group_posts']['Row'];
export type group_postsInsert = Database['public']['Tables']['group_posts']['Row'];
export type group_postsUpdate = Database['public']['Tables']['group_posts']['Row'];

// 그룹 일정 (스케쥴)
export type group_schedule = Database['public']['Tables']['group_schedule']['Row'];
export type group_scheduleInsert = Database['public']['Tables']['group_schedule']['Row'];
export type group_scheduleUpdate = Database['public']['Tables']['group_schedule']['Row'];

// 그룹 테이블
export type groups = Database['public']['Tables']['groups']['Row'];
export type groupsInsert = Database['public']['Tables']['groups']['Row'];
export type groupsUpdate = Database['public']['Tables']['groups']['Row'];

// 게시글 신고
export type post_reports = Database['public']['Tables']['post_reports']['Row'];
export type post_reportsInsert = Database['public']['Tables']['post_reports']['Row'];
export type post_reportsUpdate = Database['public']['Tables']['post_reports']['Row'];

// 카테고리 - 대분류
export type categoryMajor = Database['public']['Tables']['categories_major']['Row'];
export type categoryMajorInsert = Database['public']['Tables']['categories_major']['Insert'];
export type categoryMajorUpdate = Database['public']['Tables']['categories_major']['Update'];

// 카테고리 - 중분류
export type categorySub = Database['public']['Tables']['categories_sub']['Row'];
export type categorySubrInsert = Database['public']['Tables']['categories_sub']['Insert'];
export type categorySubUpdate = Database['public']['Tables']['categories_sub']['Update'];
export type categorySubRelationships =
  Database['public']['Tables']['categories_sub']['Relationships'];

// 유저 관심사
export type interests = Database['public']['Tables']['user_interests']['Row'];
export type interestsInsert = Database['public']['Tables']['user_interests']['Insert'];
export type interestsUpdate = Database['public']['Tables']['user_interests']['Update'];
export type interestsRelationships =
  Database['public']['Tables']['user_interests']['Relationships'];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.5';
  };
  public: {
    Tables: {
      board_type: {
        Row: {
          allow_host: boolean;
          allow_member: boolean;
          board_type: string;
        };
        Insert: {
          allow_host?: boolean;
          allow_member?: boolean;
          board_type: string;
        };
        Update: {
          allow_host?: boolean;
          allow_member?: boolean;
          board_type?: string;
        };
        Relationships: [];
      };
      categories_major: {
        Row: {
          category_major_name: string;
          category_major_slug: string;
          major_id: string;
        };
        Insert: {
          category_major_name: string;
          category_major_slug: string;
          major_id?: string;
        };
        Update: {
          category_major_name?: string;
          category_major_slug?: string;
          major_id?: string;
        };
        Relationships: [];
      };
      categories_sub: {
        Row: {
          category_sub_name: string;
          category_sub_slug: string;
          major_id: string;
          sub_id: string;
        };
        Insert: {
          category_sub_name: string;
          category_sub_slug: string;
          major_id: string;
          sub_id?: string;
        };
        Update: {
          category_sub_name?: string;
          category_sub_slug?: string;
          major_id?: string;
          sub_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'categories_sub_major_id_fkey';
            columns: ['major_id'];
            isOneToOne: false;
            referencedRelation: 'categories_major';
            referencedColumns: ['major_id'];
          },
        ];
      };
      group_members: {
        Row: {
          group_id: string;
          member_id: string;
          member_joined_at: string;
          member_role: Database['public']['Enums']['member_role_enum'];
          member_status: Database['public']['Enums']['member_status_enum'];
          user_id: string | null;
        };
        Insert: {
          group_id: string;
          member_id?: string;
          member_joined_at?: string;
          member_role?: Database['public']['Enums']['member_role_enum'];
          member_status?: Database['public']['Enums']['member_status_enum'];
          user_id?: string | null;
        };
        Update: {
          group_id?: string;
          member_id?: string;
          member_joined_at?: string;
          member_role?: Database['public']['Enums']['member_role_enum'];
          member_status?: Database['public']['Enums']['member_status_enum'];
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'group_members_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'groups';
            referencedColumns: ['group_id'];
          },
          {
            foreignKeyName: 'group_members_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['user_id'];
          },
        ];
      };
      group_posts: {
        Row: {
          board_type: string;
          group_id: string;
          post_body_md: string | null;
          post_created_at: string;
          post_id: string;
          post_title: string;
          user_id: string | null;
        };
        Insert: {
          board_type: string;
          group_id: string;
          post_body_md?: string | null;
          post_created_at?: string;
          post_id?: string;
          post_title: string;
          user_id?: string | null;
        };
        Update: {
          board_type?: string;
          group_id?: string;
          post_body_md?: string | null;
          post_created_at?: string;
          post_id?: string;
          post_title?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'group_posts_board_type_fkey';
            columns: ['board_type'];
            isOneToOne: false;
            referencedRelation: 'board_type';
            referencedColumns: ['board_type'];
          },
          {
            foreignKeyName: 'group_posts_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'groups';
            referencedColumns: ['group_id'];
          },
          {
            foreignKeyName: 'group_posts_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['user_id'];
          },
        ];
      };
      group_schedule: {
        Row: {
          group_id: string;
          schedule_created_at: string;
          schedule_end_at: string | null;
          schedule_id: string;
          schedule_place_name: string | null;
          schedule_start_at: string;
          schedule_title: string | null;
          user_id: string | null;
        };
        Insert: {
          group_id: string;
          schedule_created_at?: string;
          schedule_end_at?: string | null;
          schedule_id?: string;
          schedule_place_name?: string | null;
          schedule_start_at?: string;
          schedule_title?: string | null;
          user_id?: string | null;
        };
        Update: {
          group_id?: string;
          schedule_created_at?: string;
          schedule_end_at?: string | null;
          schedule_id?: string;
          schedule_place_name?: string | null;
          schedule_start_at?: string;
          schedule_title?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'group_schedule_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'groups';
            referencedColumns: ['group_id'];
          },
          {
            foreignKeyName: 'group_schedule_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['user_id'];
          },
        ];
      };
      groups: {
        Row: {
          approved: boolean;
          created_by: string | null;
          curriculum: Json | null;
          favorite: boolean | null;
          group_capacity: number | null;
          group_content: string | null;
          group_created_at: string;
          group_end_day: string;
          group_id: string;
          group_region: string | null;
          group_region_any: boolean;
          group_short_intro: string | null;
          group_slug: string | null;
          group_start_day: string;
          group_title: string;
          group_updated_at: string;
          image_urls: string[] | null;
          major_id: string | null;
          status: Database['public']['Enums']['group_status_enum'];
          sub_id: string | null;
        };
        Insert: {
          approved?: boolean;
          created_by?: string | null;
          curriculum?: Json | null;
          favorite?: boolean | null;
          group_capacity?: number | null;
          group_content?: string | null;
          group_created_at?: string;
          group_end_day: string;
          group_id?: string;
          group_region?: string | null;
          group_region_any?: boolean;
          group_short_intro?: string | null;
          group_slug?: string | null;
          group_start_day: string;
          group_title: string;
          group_updated_at?: string;
          image_urls?: string[] | null;
          major_id?: string | null;
          status?: Database['public']['Enums']['group_status_enum'];
          sub_id?: string | null;
        };
        Update: {
          approved?: boolean;
          created_by?: string | null;
          curriculum?: Json | null;
          favorite?: boolean | null;
          group_capacity?: number | null;
          group_content?: string | null;
          group_created_at?: string;
          group_end_day?: string;
          group_id?: string;
          group_region?: string | null;
          group_region_any?: boolean;
          group_short_intro?: string | null;
          group_slug?: string | null;
          group_start_day?: string;
          group_title?: string;
          group_updated_at?: string;
          image_urls?: string[] | null;
          major_id?: string | null;
          status?: Database['public']['Enums']['group_status_enum'];
          sub_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'groups_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'groups_major_id_fkey';
            columns: ['major_id'];
            isOneToOne: false;
            referencedRelation: 'categories_major';
            referencedColumns: ['major_id'];
          },
          {
            foreignKeyName: 'groups_sub_id_fkey';
            columns: ['sub_id'];
            isOneToOne: false;
            referencedRelation: 'categories_sub';
            referencedColumns: ['sub_id'];
          },
        ];
      };
      post_reports: {
        Row: {
          post_id: string;
          report_avatar_url: string | null;
          report_created_at: string;
          report_detail_etc: string | null;
          report_id: string;
          report_reason: Database['public']['Enums']['report_reason_enum'];
          report_reviewed_at: string | null;
          report_status: Database['public']['Enums']['report_status_enum'];
          user_id: string | null;
        };
        Insert: {
          post_id: string;
          report_avatar_url?: string | null;
          report_created_at?: string;
          report_detail_etc?: string | null;
          report_id?: string;
          report_reason: Database['public']['Enums']['report_reason_enum'];
          report_reviewed_at?: string | null;
          report_status?: Database['public']['Enums']['report_status_enum'];
          user_id?: string | null;
        };
        Update: {
          post_id?: string;
          report_avatar_url?: string | null;
          report_created_at?: string;
          report_detail_etc?: string | null;
          report_id?: string;
          report_reason?: Database['public']['Enums']['report_reason_enum'];
          report_reviewed_at?: string | null;
          report_status?: Database['public']['Enums']['report_status_enum'];
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'post_reports_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'group_posts';
            referencedColumns: ['post_id'];
          },
          {
            foreignKeyName: 'post_reports_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['user_id'];
          },
        ];
      };
      user_careers: {
        Row: {
          career_id: string;
          career_image_url: string | null;
          company_name: string;
          created_at: string | null;
          end_date: string;
          original_file_name: string | null;
          profile_id: string | null;
          start_date: string;
          updated_at: string | null;
        };
        Insert: {
          career_id?: string;
          career_image_url?: string | null;
          company_name: string;
          created_at?: string | null;
          end_date: string;
          original_file_name?: string | null;
          profile_id?: string | null;
          start_date: string;
          updated_at?: string | null;
        };
        Update: {
          career_id?: string;
          career_image_url?: string | null;
          company_name?: string;
          created_at?: string | null;
          end_date?: string;
          original_file_name?: string | null;
          profile_id?: string | null;
          start_date?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'user_careers_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['user_id'];
          },
        ];
      };
      user_delete_logs: {
        Row: {
          delete_feedback: string | null;
          delete_id: string;
          delete_reason: string | null;
          deleted_at: string;
          ip_addr: unknown;
          log_key: string;
          user_agent: string | null;
          user_id: string | null;
        };
        Insert: {
          delete_feedback?: string | null;
          delete_id?: string;
          delete_reason?: string | null;
          deleted_at?: string;
          ip_addr?: unknown;
          log_key: string;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Update: {
          delete_feedback?: string | null;
          delete_id?: string;
          delete_reason?: string | null;
          deleted_at?: string;
          ip_addr?: unknown;
          log_key?: string;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'user_delete_logs_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['user_id'];
          },
        ];
      };
      user_inquiries: {
        Row: {
          inquiry_answer: string | null;
          inquiry_answered_at: string | null;
          inquiry_created_at: string;
          inquiry_detail: string;
          inquiry_file_urls: Json | null;
          inquiry_id: string;
          inquiry_main_type: string;
          inquiry_status: Database['public']['Enums']['inquiry_status_enum'];
          inquiry_sub_type: string;
          user_id: string;
        };
        Insert: {
          inquiry_answer?: string | null;
          inquiry_answered_at?: string | null;
          inquiry_created_at?: string;
          inquiry_detail: string;
          inquiry_file_urls?: Json | null;
          inquiry_id?: string;
          inquiry_main_type: string;
          inquiry_status?: Database['public']['Enums']['inquiry_status_enum'];
          inquiry_sub_type: string;
          user_id: string;
        };
        Update: {
          inquiry_answer?: string | null;
          inquiry_answered_at?: string | null;
          inquiry_created_at?: string;
          inquiry_detail?: string;
          inquiry_file_urls?: Json | null;
          inquiry_id?: string;
          inquiry_main_type?: string;
          inquiry_status?: Database['public']['Enums']['inquiry_status_enum'];
          inquiry_sub_type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_inquiries_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['user_id'];
          },
        ];
      };
      user_interests: {
        Row: {
          category_sub_id: string | null;
          created_at: string;
          interest_id: string;
          user_id: string;
        };
        Insert: {
          category_sub_id?: string | null;
          created_at?: string;
          interest_id?: string;
          user_id: string;
        };
        Update: {
          category_sub_id?: string | null;
          created_at?: string;
          interest_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_interests_category_sub_id_fkey';
            columns: ['category_sub_id'];
            isOneToOne: false;
            referencedRelation: 'categories_sub';
            referencedColumns: ['sub_id'];
          },
          {
            foreignKeyName: 'user_interests_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['user_id'];
          },
        ];
      };
      user_profiles: {
        Row: {
          agree_email: boolean | null;
          agree_push: boolean | null;
          agree_sms: boolean | null;
          agree_updated_at: string;
          avatar_url: string | null;
          created_at: string;
          email: string;
          is_active: boolean;
          name: string;
          nickname: string;
          user_id: string;
        };
        Insert: {
          agree_email?: boolean | null;
          agree_push?: boolean | null;
          agree_sms?: boolean | null;
          agree_updated_at?: string;
          avatar_url?: string | null;
          created_at?: string;
          email: string;
          is_active?: boolean;
          name: string;
          nickname: string;
          user_id: string;
        };
        Update: {
          agree_email?: boolean | null;
          agree_push?: boolean | null;
          agree_sms?: boolean | null;
          agree_updated_at?: string;
          avatar_url?: string | null;
          created_at?: string;
          email?: string;
          is_active?: boolean;
          name?: string;
          nickname?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_group_host: {
        Args: { p_group_id: string; p_user_id: string };
        Returns: boolean;
      };
      is_group_member: {
        Args: { p_group_id: string; p_user_id: string };
        Returns: boolean;
      };
      unaccent: { Args: { '': string }; Returns: string };
    };
    Enums: {
      group_kind_enum: 'study' | 'hobby' | 'sports' | 'volunteer' | 'etc';
      group_status_enum: 'recruiting' | 'closed' | 'finished';
      inquiry_status_enum: 'pending' | 'answered' | 'closed';
      member_role_enum: 'host' | 'member';
      member_status_enum: 'applied' | 'approved' | 'rejected' | 'left';
      report_reason_enum: 'spam' | 'abuse' | 'inappropriate' | 'advertisement' | 'etc';
      report_status_enum: 'open' | 'in_progress' | 'closed';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      group_kind_enum: ['study', 'hobby', 'sports', 'volunteer', 'etc'],
      group_status_enum: ['recruiting', 'closed', 'finished'],
      inquiry_status_enum: ['pending', 'answered', 'closed'],
      member_role_enum: ['host', 'member'],
      member_status_enum: ['applied', 'approved', 'rejected', 'left'],
      report_reason_enum: ['spam', 'abuse', 'inappropriate', 'advertisement', 'etc'],
      report_status_enum: ['open', 'in_progress', 'closed'],
    },
  },
} as const;
