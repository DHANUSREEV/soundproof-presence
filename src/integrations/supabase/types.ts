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
      tn_digipin_profiles: {
        Row: {
          area: string | null
          avg_confidence: number | null
          characteristic_sounds: string[] | null
          city: string
          created_at: string | null
          digipin_id: string
          district: string | null
          embedding_512d: number[] | null
          id: string
          latitude: number
          longitude: number
          pincode: string | null
          street: string | null
          updated_at: string | null
          urban_type: Database["public"]["Enums"]["urban_type"] | null
          verification_count: number | null
        }
        Insert: {
          area?: string | null
          avg_confidence?: number | null
          characteristic_sounds?: string[] | null
          city: string
          created_at?: string | null
          digipin_id: string
          district?: string | null
          embedding_512d?: number[] | null
          id?: string
          latitude: number
          longitude: number
          pincode?: string | null
          street?: string | null
          updated_at?: string | null
          urban_type?: Database["public"]["Enums"]["urban_type"] | null
          verification_count?: number | null
        }
        Update: {
          area?: string | null
          avg_confidence?: number | null
          characteristic_sounds?: string[] | null
          city?: string
          created_at?: string | null
          digipin_id?: string
          district?: string | null
          embedding_512d?: number[] | null
          id?: string
          latitude?: number
          longitude?: number
          pincode?: string | null
          street?: string | null
          updated_at?: string | null
          urban_type?: Database["public"]["Enums"]["urban_type"] | null
          verification_count?: number | null
        }
        Relationships: []
      }
      user_home_profiles: {
        Row: {
          canonical_address: string | null
          city: string
          enrolled_at: string | null
          gps_lat: number | null
          gps_lon: number | null
          home_digipin_id: string | null
          home_embeddings: number[] | null
          id: string
          pincode: string | null
          raw_address: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          canonical_address?: string | null
          city: string
          enrolled_at?: string | null
          gps_lat?: number | null
          gps_lon?: number | null
          home_digipin_id?: string | null
          home_embeddings?: number[] | null
          id?: string
          pincode?: string | null
          raw_address: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          canonical_address?: string | null
          city?: string
          enrolled_at?: string | null
          gps_lat?: number | null
          gps_lon?: number | null
          home_digipin_id?: string | null
          home_embeddings?: number[] | null
          id?: string
          pincode?: string | null
          raw_address?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      validation_logs: {
        Row: {
          audio_hash: string | null
          candidates: Json | null
          confidence: number | null
          created_at: string | null
          device_id: string | null
          digipin_id: string | null
          id: string
          ip_hash: string | null
          is_home_mode: boolean | null
          match_type: Database["public"]["Enums"]["match_type"] | null
          processing_time_ms: number | null
          raw_address: string
          scene_type: Database["public"]["Enums"]["scene_type"] | null
          selected_candidate_index: number | null
          session_id: string | null
          user_id: string | null
          validation_token: string | null
          verified_address: string | null
        }
        Insert: {
          audio_hash?: string | null
          candidates?: Json | null
          confidence?: number | null
          created_at?: string | null
          device_id?: string | null
          digipin_id?: string | null
          id?: string
          ip_hash?: string | null
          is_home_mode?: boolean | null
          match_type?: Database["public"]["Enums"]["match_type"] | null
          processing_time_ms?: number | null
          raw_address: string
          scene_type?: Database["public"]["Enums"]["scene_type"] | null
          selected_candidate_index?: number | null
          session_id?: string | null
          user_id?: string | null
          validation_token?: string | null
          verified_address?: string | null
        }
        Update: {
          audio_hash?: string | null
          candidates?: Json | null
          confidence?: number | null
          created_at?: string | null
          device_id?: string | null
          digipin_id?: string | null
          id?: string
          ip_hash?: string | null
          is_home_mode?: boolean | null
          match_type?: Database["public"]["Enums"]["match_type"] | null
          processing_time_ms?: number | null
          raw_address?: string
          scene_type?: Database["public"]["Enums"]["scene_type"] | null
          selected_candidate_index?: number | null
          session_id?: string | null
          user_id?: string | null
          validation_token?: string | null
          verified_address?: string | null
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
      match_type: "exact" | "strong" | "weak" | "home_verified" | "candidates"
      scene_type:
        | "market"
        | "temple"
        | "residential"
        | "transport"
        | "hospital"
        | "school"
        | "commercial"
        | "quiet"
        | "unknown"
      urban_type:
        | "market"
        | "temple"
        | "residential"
        | "transport"
        | "hospital"
        | "school"
        | "commercial"
        | "quiet"
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
      match_type: ["exact", "strong", "weak", "home_verified", "candidates"],
      scene_type: [
        "market",
        "temple",
        "residential",
        "transport",
        "hospital",
        "school",
        "commercial",
        "quiet",
        "unknown",
      ],
      urban_type: [
        "market",
        "temple",
        "residential",
        "transport",
        "hospital",
        "school",
        "commercial",
        "quiet",
      ],
    },
  },
} as const
