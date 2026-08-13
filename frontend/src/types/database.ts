export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      activities: {
        Row: {
          category: string
          city_id: number
          created_at: string
          currency_code: string | null
          description: string | null
          duration_minutes: number | null
          estimated_cost: number | null
          fsq_place_id: string
          id: number
          image_url: string | null
          latitude: number
          longitude: number
          name: string
          price_tier: number | null
          provider_category_id: string | null
          provider_category_name: string | null
          provider_popularity: number | null
          provider_synced_at: string
          rating: number | null
          updated_at: string
        }
        Insert: {
          category: string
          city_id: number
          created_at?: string
          currency_code?: string | null
          description?: string | null
          duration_minutes?: number | null
          estimated_cost?: number | null
          fsq_place_id: string
          id?: number
          image_url?: string | null
          latitude: number
          longitude: number
          name: string
          price_tier?: number | null
          provider_category_id?: string | null
          provider_category_name?: string | null
          provider_popularity?: number | null
          provider_synced_at: string
          rating?: number | null
          updated_at?: string
        }
        Update: {
          category?: string
          city_id?: number
          created_at?: string
          currency_code?: string | null
          description?: string | null
          duration_minutes?: number | null
          estimated_cost?: number | null
          fsq_place_id?: string
          id?: number
          image_url?: string | null
          latitude?: number
          longitude?: number
          name?: string
          price_tier?: number | null
          provider_category_id?: string | null
          provider_category_name?: string | null
          provider_popularity?: number | null
          provider_synced_at?: string
          rating?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          cost_index: number | null
          country_code: string
          created_at: string
          description: string | null
          geonames_id: number
          id: number
          image_url: string | null
          latitude: number
          longitude: number
          name: string
          population: number | null
          region: string | null
          timezone: string
          updated_at: string
        }
        Insert: {
          cost_index?: number | null
          country_code: string
          created_at?: string
          description?: string | null
          geonames_id: number
          id?: number
          image_url?: string | null
          latitude: number
          longitude: number
          name: string
          population?: number | null
          region?: string | null
          timezone: string
          updated_at?: string
        }
        Update: {
          cost_index?: number | null
          country_code?: string
          created_at?: string
          description?: string | null
          geonames_id?: number
          id?: number
          image_url?: string | null
          latitude?: number
          longitude?: number
          name?: string
          population?: number | null
          region?: string | null
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      itinerary_items: {
        Row: {
          activity_id: number | null
          created_at: string
          description: string | null
          ends_at: string | null
          estimated_cost: number | null
          id: string
          kind: string
          notes: string | null
          position: number
          starts_at: string | null
          stop_id: string
          title: string
          updated_at: string
        }
        Insert: {
          activity_id?: number | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          estimated_cost?: number | null
          id?: string
          kind: string
          notes?: string | null
          position: number
          starts_at?: string | null
          stop_id: string
          title: string
          updated_at?: string
        }
        Update: {
          activity_id?: number | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          estimated_cost?: number | null
          id?: string
          kind?: string
          notes?: string | null
          position?: number
          starts_at?: string | null
          stop_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "itinerary_items_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itinerary_items_stop_id_fkey"
            columns: ["stop_id"]
            isOneToOne: false
            referencedRelation: "trip_stops"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string
          home_city: string | null
          home_country_code: string | null
          id: string
          language_code: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name: string
          home_city?: string | null
          home_country_code?: string | null
          id: string
          language_code?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          home_city?: string | null
          home_country_code?: string | null
          id?: string
          language_code?: string
          updated_at?: string
        }
        Relationships: []
      }
      trip_stops: {
        Row: {
          city_id: number
          created_at: string
          end_date: string | null
          id: string
          notes: string | null
          position: number
          start_date: string | null
          trip_id: string
          updated_at: string
        }
        Insert: {
          city_id: number
          created_at?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          position: number
          start_date?: string | null
          trip_id: string
          updated_at?: string
        }
        Update: {
          city_id?: number
          created_at?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          position?: number
          start_date?: string | null
          trip_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_stops_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_stops_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          budget_amount: number | null
          cover_url: string | null
          created_at: string
          currency_code: string
          description: string | null
          end_date: string
          id: string
          owner_id: string
          published_at: string | null
          share_slug: string | null
          start_date: string
          state: string
          title: string
          updated_at: string
          visibility: string
        }
        Insert: {
          budget_amount?: number | null
          cover_url?: string | null
          created_at?: string
          currency_code: string
          description?: string | null
          end_date: string
          id?: string
          owner_id: string
          published_at?: string | null
          share_slug?: string | null
          start_date: string
          state?: string
          title: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          budget_amount?: number | null
          cover_url?: string | null
          created_at?: string
          currency_code?: string
          description?: string | null
          end_date?: string
          id?: string
          owner_id?: string
          published_at?: string | null
          share_slug?: string | null
          start_date?: string
          state?: string
          title?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_activity_to_stop: {
        Args: { p_activity_id: number; p_stop_id: string }
        Returns: string
      }
      add_custom_itinerary_item: {
        Args: {
          p_estimated_cost?: number
          p_kind: string
          p_local_date: string
          p_local_time: string
          p_stop_id: string
          p_title: string
        }
        Returns: string
      }
      create_trip: { Args: { input: Json }; Returns: string }
      finish_trip: { Args: { p_trip_id: string }; Returns: undefined }
      remove_itinerary_item: { Args: { p_item_id: string }; Returns: undefined }
      reorder_itinerary_items: {
        Args: { p_ordered_item_ids: string[]; p_stop_id: string }
        Returns: undefined
      }
      reorder_trip_stops: {
        Args: { p_ordered_stop_ids: string[]; p_trip_id: string }
        Returns: undefined
      }
      schedule_itinerary_item: {
        Args: {
          p_estimated_cost?: number
          p_item_id: string
          p_local_date: string
          p_local_time: string
        }
        Returns: undefined
      }
      search_city_catalog: {
        Args: { p_limit?: number; p_query: string }
        Returns: {
          cost_index: number | null
          country_code: string
          created_at: string
          description: string | null
          geonames_id: number
          id: number
          image_url: string | null
          latitude: number
          longitude: number
          name: string
          population: number | null
          region: string | null
          timezone: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "cities"
          isOneToOne: false
          isSetofReturn: true
        }
      }
    }
    Enums: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
