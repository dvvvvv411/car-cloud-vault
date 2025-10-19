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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      brandings: {
        Row: {
          case_number: string
          company_name: string
          court_decision_pdf_url: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          kanzlei_logo_url: string | null
          lawyer_address_city: string
          lawyer_address_street: string
          lawyer_email: string
          lawyer_firm_name: string
          lawyer_firm_subtitle: string | null
          lawyer_name: string
          lawyer_phone: string
          lawyer_photo_url: string | null
          lawyer_website_url: string
          resend_api_key: string | null
          resend_sender_email: string | null
          resend_sender_name: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          case_number: string
          company_name: string
          court_decision_pdf_url?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          kanzlei_logo_url?: string | null
          lawyer_address_city: string
          lawyer_address_street: string
          lawyer_email: string
          lawyer_firm_name: string
          lawyer_firm_subtitle?: string | null
          lawyer_name: string
          lawyer_phone: string
          lawyer_photo_url?: string | null
          lawyer_website_url: string
          resend_api_key?: string | null
          resend_sender_email?: string | null
          resend_sender_name?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          case_number?: string
          company_name?: string
          court_decision_pdf_url?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          kanzlei_logo_url?: string | null
          lawyer_address_city?: string
          lawyer_address_street?: string
          lawyer_email?: string
          lawyer_firm_name?: string
          lawyer_firm_subtitle?: string | null
          lawyer_name?: string
          lawyer_phone?: string
          lawyer_photo_url?: string | null
          lawyer_website_url?: string
          resend_api_key?: string | null
          resend_sender_email?: string | null
          resend_sender_name?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cold_call_callers: {
        Row: {
          created_at: string
          created_by: string | null
          first_name: string
          id: string
          last_name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          first_name: string
          id?: string
          last_name: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          first_name?: string
          id?: string
          last_name?: string
        }
        Relationships: []
      }
      cold_call_campaigns: {
        Row: {
          branding_id: string
          caller_id: string
          campaign_date: string
          created_at: string
          id: string
          interested_count: number
          invalid_count: number
          mailbox_count: number
          not_interested_count: number
          total_leads: number
          upload_date: string
        }
        Insert: {
          branding_id: string
          caller_id: string
          campaign_date?: string
          created_at?: string
          id?: string
          interested_count?: number
          invalid_count?: number
          mailbox_count?: number
          not_interested_count?: number
          total_leads?: number
          upload_date?: string
        }
        Update: {
          branding_id?: string
          caller_id?: string
          campaign_date?: string
          created_at?: string
          id?: string
          interested_count?: number
          invalid_count?: number
          mailbox_count?: number
          not_interested_count?: number
          total_leads?: number
          upload_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "cold_call_campaigns_branding_id_fkey"
            columns: ["branding_id"]
            isOneToOne: false
            referencedRelation: "brandings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cold_call_campaigns_caller_id_fkey"
            columns: ["caller_id"]
            isOneToOne: false
            referencedRelation: "cold_call_callers"
            referencedColumns: ["id"]
          },
        ]
      }
      cold_call_leads: {
        Row: {
          campaign_id: string
          company_name: string
          created_at: string
          email: string | null
          email_sent_status: string | null
          id: string
          interested_timestamp: string | null
          invalid_timestamp: string | null
          mailbox_timestamp: string | null
          not_interested_timestamp: string | null
          phone_number: string
          status: string
          updated_at: string
        }
        Insert: {
          campaign_id: string
          company_name: string
          created_at?: string
          email?: string | null
          email_sent_status?: string | null
          id?: string
          interested_timestamp?: string | null
          invalid_timestamp?: string | null
          mailbox_timestamp?: string | null
          not_interested_timestamp?: string | null
          phone_number: string
          status?: string
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          company_name?: string
          created_at?: string
          email?: string | null
          email_sent_status?: string | null
          id?: string
          interested_timestamp?: string | null
          invalid_timestamp?: string | null
          mailbox_timestamp?: string | null
          not_interested_timestamp?: string | null
          phone_number?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cold_call_leads_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "cold_call_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          branding_id: string | null
          call_priority: boolean | null
          city: string
          company_name: string | null
          created_at: string
          customer_type: string
          email: string
          first_name: string
          id: string
          last_name: string
          lead_id: string | null
          message: string | null
          phone: string
          selected_vehicles: Json
          status: Database["public"]["Enums"]["inquiry_status"]
          status_updated_at: string | null
          street: string
          total_price: number
          zip_code: string
        }
        Insert: {
          branding_id?: string | null
          call_priority?: boolean | null
          city: string
          company_name?: string | null
          created_at?: string
          customer_type: string
          email: string
          first_name: string
          id?: string
          last_name: string
          lead_id?: string | null
          message?: string | null
          phone: string
          selected_vehicles: Json
          status?: Database["public"]["Enums"]["inquiry_status"]
          status_updated_at?: string | null
          street: string
          total_price: number
          zip_code: string
        }
        Update: {
          branding_id?: string | null
          call_priority?: boolean | null
          city?: string
          company_name?: string | null
          created_at?: string
          customer_type?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          lead_id?: string | null
          message?: string | null
          phone?: string
          selected_vehicles?: Json
          status?: Database["public"]["Enums"]["inquiry_status"]
          status_updated_at?: string | null
          street?: string
          total_price?: number
          zip_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_branding_id_fkey"
            columns: ["branding_id"]
            isOneToOne: false
            referencedRelation: "brandings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiry_notes: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          inquiry_id: string
          note_text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          inquiry_id: string
          note_text: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          inquiry_id?: string
          note_text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiry_notes_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_campaigns: {
        Row: {
          branding_id: string
          campaign_name: string
          created_at: string
          created_by: string | null
          id: string
          total_leads: number
          upload_date: string
        }
        Insert: {
          branding_id: string
          campaign_name: string
          created_at?: string
          created_by?: string | null
          id?: string
          total_leads?: number
          upload_date?: string
        }
        Update: {
          branding_id?: string
          campaign_name?: string
          created_at?: string
          created_by?: string | null
          id?: string
          total_leads?: number
          upload_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_campaigns_branding_id_fkey"
            columns: ["branding_id"]
            isOneToOne: false
            referencedRelation: "brandings"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_reserved_vehicles: {
        Row: {
          id: string
          lead_id: string
          reserved_at: string | null
          reserved_by: string | null
          vehicle_chassis: string
        }
        Insert: {
          id?: string
          lead_id: string
          reserved_at?: string | null
          reserved_by?: string | null
          vehicle_chassis: string
        }
        Update: {
          id?: string
          lead_id?: string
          reserved_at?: string | null
          reserved_by?: string | null
          vehicle_chassis?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_reserved_vehicles_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          branding_id: string
          campaign_id: string
          created_at: string
          email: string
          first_login_at: string | null
          has_logged_in: boolean
          id: string
          inquiry_id: string | null
          last_login_at: string | null
          login_count: number
          password: string
        }
        Insert: {
          branding_id: string
          campaign_id: string
          created_at?: string
          email: string
          first_login_at?: string | null
          has_logged_in?: boolean
          id?: string
          inquiry_id?: string | null
          last_login_at?: string | null
          login_count?: number
          password: string
        }
        Update: {
          branding_id?: string
          campaign_id?: string
          created_at?: string
          email?: string
          first_login_at?: string | null
          has_logged_in?: boolean
          id?: string
          inquiry_id?: string | null
          last_login_at?: string | null
          login_count?: number
          password?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_branding_id_fkey"
            columns: ["branding_id"]
            isOneToOne: false
            referencedRelation: "brandings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "lead_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          anzahl_sitzplaetze: string | null
          anzahl_tueren: string | null
          aufbau: string | null
          bemerkungen: string | null
          bereifung: Json | null
          brand: string
          chassis: string
          created_at: string | null
          detail_photos: Json | null
          faelligkeit_hu: string | null
          farbe: string | null
          first_registration: string
          gesamtgewicht: string | null
          getriebeart: string | null
          hubraum: string | null
          id: string
          innenraum_zustand: Json | null
          kilometers: number
          kraftstoffart: string | null
          leistung: string | null
          model: string
          motorart: string | null
          optische_schaeden: Json | null
          polster_typ: string | null
          price: number
          report_nr: string
          serienausstattung: Json | null
          sonderausstattung: Json | null
          updated_at: string | null
          vehicle_photos: Json | null
          wartung_datum: string | null
          wartung_kilometerstand: string | null
          zustandsbericht_pdf_url: string | null
        }
        Insert: {
          anzahl_sitzplaetze?: string | null
          anzahl_tueren?: string | null
          aufbau?: string | null
          bemerkungen?: string | null
          bereifung?: Json | null
          brand: string
          chassis: string
          created_at?: string | null
          detail_photos?: Json | null
          faelligkeit_hu?: string | null
          farbe?: string | null
          first_registration: string
          gesamtgewicht?: string | null
          getriebeart?: string | null
          hubraum?: string | null
          id?: string
          innenraum_zustand?: Json | null
          kilometers: number
          kraftstoffart?: string | null
          leistung?: string | null
          model: string
          motorart?: string | null
          optische_schaeden?: Json | null
          polster_typ?: string | null
          price: number
          report_nr: string
          serienausstattung?: Json | null
          sonderausstattung?: Json | null
          updated_at?: string | null
          vehicle_photos?: Json | null
          wartung_datum?: string | null
          wartung_kilometerstand?: string | null
          zustandsbericht_pdf_url?: string | null
        }
        Update: {
          anzahl_sitzplaetze?: string | null
          anzahl_tueren?: string | null
          aufbau?: string | null
          bemerkungen?: string | null
          bereifung?: Json | null
          brand?: string
          chassis?: string
          created_at?: string | null
          detail_photos?: Json | null
          faelligkeit_hu?: string | null
          farbe?: string | null
          first_registration?: string
          gesamtgewicht?: string | null
          getriebeart?: string | null
          hubraum?: string | null
          id?: string
          innenraum_zustand?: Json | null
          kilometers?: number
          kraftstoffart?: string | null
          leistung?: string | null
          model?: string
          motorart?: string | null
          optische_schaeden?: Json | null
          polster_typ?: string | null
          price?: number
          report_nr?: string
          serienausstattung?: Json | null
          sonderausstattung?: Json | null
          updated_at?: string | null
          vehicle_photos?: Json | null
          wartung_datum?: string | null
          wartung_kilometerstand?: string | null
          zustandsbericht_pdf_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      convert_first_registration_format: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_all_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          email: string
          id: string
          last_sign_in_at: string
          role: Database["public"]["Enums"]["app_role"]
        }[]
      }
      get_user_email: {
        Args: { user_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "admin"
      inquiry_status:
        | "Neu"
        | "Möchte RG/KV"
        | "RG/KV gesendet"
        | "Bezahlt"
        | "Exchanged"
        | "Kein Interesse"
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
      app_role: ["user", "admin"],
      inquiry_status: [
        "Neu",
        "Möchte RG/KV",
        "RG/KV gesendet",
        "Bezahlt",
        "Exchanged",
        "Kein Interesse",
      ],
    },
  },
} as const
