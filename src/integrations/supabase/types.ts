export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_models: {
        Row: {
          benchmarks: Json | null
          category: string
          context_window: string | null
          created_at: string
          description: string
          id: string
          name: string
          parameters: string | null
          pricing: string | null
          provider: string
          release_date: string
          updated_at: string
          version: string
        }
        Insert: {
          benchmarks?: Json | null
          category: string
          context_window?: string | null
          created_at?: string
          description: string
          id?: string
          name: string
          parameters?: string | null
          pricing?: string | null
          provider: string
          release_date: string
          updated_at?: string
          version: string
        }
        Update: {
          benchmarks?: Json | null
          category?: string
          context_window?: string | null
          created_at?: string
          description?: string
          id?: string
          name?: string
          parameters?: string | null
          pricing?: string | null
          provider?: string
          release_date?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      article_submissions: {
        Row: {
          article_id: string | null
          created_at: string
          feedback: string | null
          id: string
          reviewed_at: string | null
          reviewer_id: string | null
          status: string
          submitted_at: string
          submitter_id: string
        }
        Insert: {
          article_id?: string | null
          created_at?: string
          feedback?: string | null
          id?: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string
          submitted_at?: string
          submitter_id: string
        }
        Update: {
          article_id?: string | null
          created_at?: string
          feedback?: string | null
          id?: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string
          submitted_at?: string
          submitter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_submissions_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author: string
          business_impact: Database["public"]["Enums"]["impact_level"] | null
          category: Database["public"]["Enums"]["article_category"]
          content: string
          created_at: string
          embeds: Json | null
          ethical_risk: Database["public"]["Enums"]["impact_level"] | null
          excerpt: string
          id: string
          image_url: string | null
          is_breaking: boolean
          is_featured: boolean
          published_at: string
          reading_time: number
          review_feedback: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          scheduled_for: string | null
          simple_content: string | null
          slug: string
          status: string | null
          submitter_id: string | null
          technical_content: string | null
          technical_impact: Database["public"]["Enums"]["impact_level"] | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          author: string
          business_impact?: Database["public"]["Enums"]["impact_level"] | null
          category: Database["public"]["Enums"]["article_category"]
          content: string
          created_at?: string
          embeds?: Json | null
          ethical_risk?: Database["public"]["Enums"]["impact_level"] | null
          excerpt: string
          id?: string
          image_url?: string | null
          is_breaking?: boolean
          is_featured?: boolean
          published_at?: string
          reading_time?: number
          review_feedback?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          scheduled_for?: string | null
          simple_content?: string | null
          slug: string
          status?: string | null
          submitter_id?: string | null
          technical_content?: string | null
          technical_impact?: Database["public"]["Enums"]["impact_level"] | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          author?: string
          business_impact?: Database["public"]["Enums"]["impact_level"] | null
          category?: Database["public"]["Enums"]["article_category"]
          content?: string
          created_at?: string
          embeds?: Json | null
          ethical_risk?: Database["public"]["Enums"]["impact_level"] | null
          excerpt?: string
          id?: string
          image_url?: string | null
          is_breaking?: boolean
          is_featured?: boolean
          published_at?: string
          reading_time?: number
          review_feedback?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          scheduled_for?: string | null
          simple_content?: string | null
          slug?: string
          status?: string | null
          submitter_id?: string | null
          technical_content?: string | null
          technical_impact?: Database["public"]["Enums"]["impact_level"] | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      breaking_news: {
        Row: {
          content: string
          created_at: string
          id: string
          is_active: boolean
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_active?: boolean
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean
        }
        Relationships: []
      }
      daily_brief_items: {
        Row: {
          brief_date: string
          content: string
          created_at: string
          id: string
          order_index: number
        }
        Insert: {
          brief_date?: string
          content: string
          created_at?: string
          id?: string
          order_index?: number
        }
        Update: {
          brief_date?: string
          content?: string
          created_at?: string
          id?: string
          order_index?: number
        }
        Relationships: []
      }
      live_stream_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          stream_id: string
          user_id: string | null
          user_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          stream_id: string
          user_id?: string | null
          user_name: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          stream_id?: string
          user_id?: string | null
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_stream_messages_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "live_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      live_streams: {
        Row: {
          created_at: string
          description: string
          id: string
          is_live: boolean | null
          is_premium: boolean | null
          playback_url: string | null
          scheduled_at: string
          stream_key: string | null
          stream_url: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          viewers_count: number | null
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          is_live?: boolean | null
          is_premium?: boolean | null
          playback_url?: string | null
          scheduled_at: string
          stream_key?: string | null
          stream_url?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          viewers_count?: number | null
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_live?: boolean | null
          is_premium?: boolean | null
          playback_url?: string | null
          scheduled_at?: string
          stream_key?: string | null
          stream_url?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          viewers_count?: number | null
        }
        Relationships: []
      }
      newsletter_subscriber_audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: string
          metadata: Json | null
          subscriber_email: string | null
          subscriber_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          subscriber_email?: string | null
          subscriber_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          subscriber_email?: string | null
          subscriber_id?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          confirmation_token: string | null
          confirmed_at: string | null
          email: string
          id: string
          is_active: boolean
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          confirmation_token?: string | null
          confirmed_at?: string | null
          email: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Update: {
          confirmation_token?: string | null
          confirmed_at?: string | null
          email?: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          id: string
          live_streams: boolean
          new_articles: boolean
          newsletters: boolean
          product_updates: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          live_streams?: boolean
          new_articles?: boolean
          newsletters?: boolean
          product_updates?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          live_streams?: boolean
          new_articles?: boolean
          newsletters?: boolean
          product_updates?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      podcasts: {
        Row: {
          audio_url: string
          created_at: string
          description: string
          duration_seconds: number
          episode_number: number | null
          id: string
          image_url: string | null
          is_premium: boolean | null
          published_at: string
          season_number: number | null
          title: string
          updated_at: string
        }
        Insert: {
          audio_url: string
          created_at?: string
          description: string
          duration_seconds?: number
          episode_number?: number | null
          id?: string
          image_url?: string | null
          is_premium?: boolean | null
          published_at?: string
          season_number?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          audio_url?: string
          created_at?: string
          description?: string
          duration_seconds?: number
          episode_number?: number | null
          id?: string
          image_url?: string | null
          is_premium?: boolean | null
          published_at?: string
          season_number?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      scheduled_newsletters: {
        Row: {
          content: string
          created_at: string
          failed_count: number | null
          id: string
          scheduled_for: string
          sent_at: string | null
          sent_count: number | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          failed_count?: number | null
          id?: string
          scheduled_for: string
          sent_at?: string | null
          sent_count?: number | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          failed_count?: number | null
          id?: string
          scheduled_for?: string
          sent_at?: string | null
          sent_count?: number | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          autumn_customer_id: string | null
          autumn_subscription_id: string | null
          billing_period: string
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          plan_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          autumn_customer_id?: string | null
          autumn_subscription_id?: string | null
          billing_period?: string
          created_at?: string
          current_period_end: string
          current_period_start?: string
          id?: string
          plan_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          autumn_customer_id?: string | null
          autumn_subscription_id?: string | null
          billing_period?: string
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_editorial_access: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "contributor"
      article_category:
        | "breaking"
        | "research"
        | "companies"
        | "policy"
        | "models"
        | "opinion"
        | "explainers"
        | "video"
      impact_level: "low" | "medium" | "high"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "editor", "contributor"],
      article_category: [
        "breaking",
        "research",
        "companies",
        "policy",
        "models",
        "opinion",
        "explainers",
        "video",
      ],
      impact_level: ["low", "medium", "high"],
    },
  },
} as const
