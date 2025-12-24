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
      articles: {
        Row: {
          author: string
          business_impact: Database["public"]["Enums"]["impact_level"] | null
          category: Database["public"]["Enums"]["article_category"]
          content: string
          created_at: string
          ethical_risk: Database["public"]["Enums"]["impact_level"] | null
          excerpt: string
          id: string
          image_url: string | null
          is_breaking: boolean
          is_featured: boolean
          published_at: string
          reading_time: number
          simple_content: string | null
          slug: string
          technical_content: string | null
          technical_impact: Database["public"]["Enums"]["impact_level"] | null
          title: string
          updated_at: string
        }
        Insert: {
          author: string
          business_impact?: Database["public"]["Enums"]["impact_level"] | null
          category: Database["public"]["Enums"]["article_category"]
          content: string
          created_at?: string
          ethical_risk?: Database["public"]["Enums"]["impact_level"] | null
          excerpt: string
          id?: string
          image_url?: string | null
          is_breaking?: boolean
          is_featured?: boolean
          published_at?: string
          reading_time?: number
          simple_content?: string | null
          slug: string
          technical_content?: string | null
          technical_impact?: Database["public"]["Enums"]["impact_level"] | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          business_impact?: Database["public"]["Enums"]["impact_level"] | null
          category?: Database["public"]["Enums"]["article_category"]
          content?: string
          created_at?: string
          ethical_risk?: Database["public"]["Enums"]["impact_level"] | null
          excerpt?: string
          id?: string
          image_url?: string | null
          is_breaking?: boolean
          is_featured?: boolean
          published_at?: string
          reading_time?: number
          simple_content?: string | null
          slug?: string
          technical_content?: string | null
          technical_impact?: Database["public"]["Enums"]["impact_level"] | null
          title?: string
          updated_at?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      article_category:
        | "breaking"
        | "research"
        | "companies"
        | "policy"
        | "models"
        | "opinion"
        | "explainers"
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
      article_category: [
        "breaking",
        "research",
        "companies",
        "policy",
        "models",
        "opinion",
        "explainers",
      ],
      impact_level: ["low", "medium", "high"],
    },
  },
} as const
