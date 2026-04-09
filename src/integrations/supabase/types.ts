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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      consignments: {
        Row: {
          cbm: number | null
          client: string | null
          consignment_no: string
          created_at: string
          created_by: string | null
          date: string | null
          destination: string | null
          gw: number | null
          id: string
          marka: string | null
          remarks: string | null
          status: string | null
          total_ctns: number | null
          updated_at: string
        }
        Insert: {
          cbm?: number | null
          client?: string | null
          consignment_no: string
          created_at?: string
          created_by?: string | null
          date?: string | null
          destination?: string | null
          gw?: number | null
          id?: string
          marka?: string | null
          remarks?: string | null
          status?: string | null
          total_ctns?: number | null
          updated_at?: string
        }
        Update: {
          cbm?: number | null
          client?: string | null
          consignment_no?: string
          created_at?: string
          created_by?: string | null
          date?: string | null
          destination?: string | null
          gw?: number | null
          id?: string
          marka?: string | null
          remarks?: string | null
          status?: string | null
          total_ctns?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      containers: {
        Row: {
          arrival_date: string | null
          arrival_location: string | null
          container_no: string
          created_at: string
          created_by: string | null
          dispatched_date: string | null
          dispatched_from: string | null
          id: string
          total_consignments: number | null
          updated_at: string
        }
        Insert: {
          arrival_date?: string | null
          arrival_location?: string | null
          container_no: string
          created_at?: string
          created_by?: string | null
          dispatched_date?: string | null
          dispatched_from?: string | null
          id?: string
          total_consignments?: number | null
          updated_at?: string
        }
        Update: {
          arrival_date?: string | null
          arrival_location?: string | null
          container_no?: string
          created_at?: string
          created_by?: string | null
          dispatched_date?: string | null
          dispatched_from?: string | null
          id?: string
          total_consignments?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      loading_list: {
        Row: {
          arrival_date_nylam: string | null
          cbm: number | null
          client: string | null
          consignment_no: string
          container: string | null
          created_at: string
          created_by: string | null
          date: string | null
          destination: string | null
          dispatched_from: string | null
          follow_up: boolean | null
          gw: number | null
          id: string
          kerung: Json | null
          lot_no: string | null
          marka: string | null
          origin: string | null
          remarks: string | null
          status: string | null
          tatopani: Json | null
          total_ctns: number | null
          updated_at: string
        }
        Insert: {
          arrival_date_nylam?: string | null
          cbm?: number | null
          client?: string | null
          consignment_no: string
          container?: string | null
          created_at?: string
          created_by?: string | null
          date?: string | null
          destination?: string | null
          dispatched_from?: string | null
          follow_up?: boolean | null
          gw?: number | null
          id?: string
          kerung?: Json | null
          lot_no?: string | null
          marka?: string | null
          origin?: string | null
          remarks?: string | null
          status?: string | null
          tatopani?: Json | null
          total_ctns?: number | null
          updated_at?: string
        }
        Update: {
          arrival_date_nylam?: string | null
          cbm?: number | null
          client?: string | null
          consignment_no?: string
          container?: string | null
          created_at?: string
          created_by?: string | null
          date?: string | null
          destination?: string | null
          dispatched_from?: string | null
          follow_up?: boolean | null
          gw?: number | null
          id?: string
          kerung?: Json | null
          lot_no?: string | null
          marka?: string | null
          origin?: string | null
          remarks?: string | null
          status?: string | null
          tatopani?: Json | null
          total_ctns?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      old_nylam_goods: {
        Row: {
          arrival_date: string | null
          arrival_location: string | null
          cbm: number | null
          client: string | null
          consignment_no: string | null
          created_at: string
          created_by: string | null
          ctn_remaining_nylam: number | null
          date: string | null
          destination: string | null
          dispatched_from_nylam: string | null
          follow_up: boolean | null
          gw: number | null
          id: string
          loaded_ctn: number | null
          marka: string | null
          nylam_container: string | null
          total_ctn: number | null
          updated_at: string
        }
        Insert: {
          arrival_date?: string | null
          arrival_location?: string | null
          cbm?: number | null
          client?: string | null
          consignment_no?: string | null
          created_at?: string
          created_by?: string | null
          ctn_remaining_nylam?: number | null
          date?: string | null
          destination?: string | null
          dispatched_from_nylam?: string | null
          follow_up?: boolean | null
          gw?: number | null
          id?: string
          loaded_ctn?: number | null
          marka?: string | null
          nylam_container?: string | null
          total_ctn?: number | null
          updated_at?: string
        }
        Update: {
          arrival_date?: string | null
          arrival_location?: string | null
          cbm?: number | null
          client?: string | null
          consignment_no?: string | null
          created_at?: string
          created_by?: string | null
          ctn_remaining_nylam?: number | null
          date?: string | null
          destination?: string | null
          dispatched_from_nylam?: string | null
          follow_up?: boolean | null
          gw?: number | null
          id?: string
          loaded_ctn?: number | null
          marka?: string | null
          nylam_container?: string | null
          total_ctn?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      remaining_ctns: {
        Row: {
          cbm: number | null
          client: string | null
          consignment_date: string | null
          consignment_no: string | null
          created_at: string
          created_by: string | null
          destination: string | null
          gw: number | null
          id: string
          marka: string | null
          remaining_ctn: number | null
          remaining_ctn_location: string | null
          total_ctn: number | null
          updated_at: string
        }
        Insert: {
          cbm?: number | null
          client?: string | null
          consignment_date?: string | null
          consignment_no?: string | null
          created_at?: string
          created_by?: string | null
          destination?: string | null
          gw?: number | null
          id?: string
          marka?: string | null
          remaining_ctn?: number | null
          remaining_ctn_location?: string | null
          total_ctn?: number | null
          updated_at?: string
        }
        Update: {
          cbm?: number | null
          client?: string | null
          consignment_date?: string | null
          consignment_no?: string | null
          created_at?: string
          created_by?: string | null
          destination?: string | null
          gw?: number | null
          id?: string
          marka?: string | null
          remaining_ctn?: number | null
          remaining_ctn_location?: string | null
          total_ctn?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          approved: boolean
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          approved?: boolean
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          approved?: boolean
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
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_approved: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "staff"
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
      app_role: ["admin", "staff"],
    },
  },
} as const
