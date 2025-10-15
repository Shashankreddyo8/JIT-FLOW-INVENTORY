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
      alerts: {
        Row: {
          created_at: string | null
          id: string
          inventory_item_id: string | null
          is_read: boolean | null
          message: string
          severity: Database["public"]["Enums"]["alert_severity"]
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          inventory_item_id?: string | null
          is_read?: boolean | null
          message: string
          severity?: Database["public"]["Enums"]["alert_severity"]
          title: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          inventory_item_id?: string | null
          is_read?: boolean | null
          message?: string
          severity?: Database["public"]["Enums"]["alert_severity"]
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_optimization_recommendations: {
        Row: {
          applied_at: string | null
          current_cost: number
          details: Json
          generated_at: string | null
          id: string
          inventory_item_id: string
          potential_cost: number
          recommendation_type: string
          savings_amount: number
          savings_percentage: number
          status: string | null
        }
        Insert: {
          applied_at?: string | null
          current_cost: number
          details: Json
          generated_at?: string | null
          id?: string
          inventory_item_id: string
          potential_cost: number
          recommendation_type: string
          savings_amount: number
          savings_percentage: number
          status?: string | null
        }
        Update: {
          applied_at?: string | null
          current_cost?: number
          details?: Json
          generated_at?: string | null
          id?: string
          inventory_item_id?: string
          potential_cost?: number
          recommendation_type?: string
          savings_amount?: number
          savings_percentage?: number
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cost_optimization_recommendations_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_orders: {
        Row: {
          actual_delivery: string | null
          courier_service: string | null
          created_at: string | null
          customer_id: string
          expected_delivery: string | null
          gst_amount: number | null
          id: string
          items: Json
          order_number: string
          shipping_address: string
          status: string
          total_amount: number
          total_with_gst: number
          tracking_number: string | null
          updated_at: string | null
        }
        Insert: {
          actual_delivery?: string | null
          courier_service?: string | null
          created_at?: string | null
          customer_id: string
          expected_delivery?: string | null
          gst_amount?: number | null
          id?: string
          items: Json
          order_number: string
          shipping_address: string
          status?: string
          total_amount: number
          total_with_gst: number
          tracking_number?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_delivery?: string | null
          courier_service?: string | null
          created_at?: string | null
          customer_id?: string
          expected_delivery?: string | null
          gst_amount?: number | null
          id?: string
          items?: Json
          order_number?: string
          shipping_address?: string
          status?: string
          total_amount?: number
          total_with_gst?: number
          tracking_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_portal_access"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_portal_access: {
        Row: {
          access_token: string
          address: string | null
          created_at: string | null
          customer_email: string
          customer_name: string
          gst_number: string | null
          id: string
          is_active: boolean | null
          last_login: string | null
          phone: string | null
          user_id: string | null
        }
        Insert: {
          access_token?: string
          address?: string | null
          created_at?: string | null
          customer_email: string
          customer_name: string
          gst_number?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          phone?: string | null
          user_id?: string | null
        }
        Update: {
          access_token?: string
          address?: string | null
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          gst_number?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          phone?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      delivery_routes: {
        Row: {
          actual_delivery_time: string | null
          carbon_emissions: number | null
          cost_estimate: number | null
          courier_service: string
          created_at: string | null
          customer_order_id: string | null
          destination_address: string
          destination_pincode: string
          distance_km: number | null
          estimated_time_hours: number | null
          id: string
          order_id: string | null
          origin_address: string
          origin_pincode: string
          route_waypoints: Json | null
          status: string | null
        }
        Insert: {
          actual_delivery_time?: string | null
          carbon_emissions?: number | null
          cost_estimate?: number | null
          courier_service: string
          created_at?: string | null
          customer_order_id?: string | null
          destination_address: string
          destination_pincode: string
          distance_km?: number | null
          estimated_time_hours?: number | null
          id?: string
          order_id?: string | null
          origin_address: string
          origin_pincode: string
          route_waypoints?: Json | null
          status?: string | null
        }
        Update: {
          actual_delivery_time?: string | null
          carbon_emissions?: number | null
          cost_estimate?: number | null
          courier_service?: string
          created_at?: string | null
          customer_order_id?: string | null
          destination_address?: string
          destination_pincode?: string
          distance_km?: number | null
          estimated_time_hours?: number | null
          id?: string
          order_id?: string | null
          origin_address?: string
          origin_pincode?: string
          route_waypoints?: Json | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_routes_customer_order_id_fkey"
            columns: ["customer_order_id"]
            isOneToOne: false
            referencedRelation: "customer_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_routes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      demand_forecasts: {
        Row: {
          confidence_score: number | null
          forecast_period: string
          forecasted_demand: number
          generated_at: string | null
          id: string
          inventory_item_id: string
        }
        Insert: {
          confidence_score?: number | null
          forecast_period: string
          forecasted_demand: number
          generated_at?: string | null
          id?: string
          inventory_item_id: string
        }
        Update: {
          confidence_score?: number | null
          forecast_period?: string
          forecasted_demand?: number
          generated_at?: string | null
          id?: string
          inventory_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "demand_forecasts_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          barcode: string | null
          category: string | null
          created_at: string | null
          current_quantity: number
          description: string | null
          gst_rate: number | null
          hsn_code: string | null
          id: string
          location: string | null
          name: string
          optimal_quantity: number
          reorder_point: number
          sku: string
          supplier_id: string | null
          unit_cost: number
          updated_at: string | null
        }
        Insert: {
          barcode?: string | null
          category?: string | null
          created_at?: string | null
          current_quantity?: number
          description?: string | null
          gst_rate?: number | null
          hsn_code?: string | null
          id?: string
          location?: string | null
          name: string
          optimal_quantity?: number
          reorder_point?: number
          sku: string
          supplier_id?: string | null
          unit_cost?: number
          updated_at?: string | null
        }
        Update: {
          barcode?: string | null
          category?: string | null
          created_at?: string | null
          current_quantity?: number
          description?: string | null
          gst_rate?: number | null
          hsn_code?: string | null
          id?: string
          location?: string | null
          name?: string
          optimal_quantity?: number
          reorder_point?: number
          sku?: string
          supplier_id?: string | null
          unit_cost?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          inventory_item_id: string
          order_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          inventory_item_id: string
          order_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          inventory_item_id?: string
          order_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          actual_delivery_date: string | null
          created_at: string | null
          created_by: string | null
          expected_delivery_date: string | null
          gst_amount: number | null
          id: string
          notes: string | null
          order_number: string
          status: Database["public"]["Enums"]["order_status"]
          supplier_id: string | null
          total_amount: number
          total_with_gst: number | null
          updated_at: string | null
        }
        Insert: {
          actual_delivery_date?: string | null
          created_at?: string | null
          created_by?: string | null
          expected_delivery_date?: string | null
          gst_amount?: number | null
          id?: string
          notes?: string | null
          order_number: string
          status?: Database["public"]["Enums"]["order_status"]
          supplier_id?: string | null
          total_amount?: number
          total_with_gst?: number | null
          updated_at?: string | null
        }
        Update: {
          actual_delivery_date?: string | null
          created_at?: string | null
          created_by?: string | null
          expected_delivery_date?: string | null
          gst_amount?: number | null
          id?: string
          notes?: string | null
          order_number?: string
          status?: Database["public"]["Enums"]["order_status"]
          supplier_id?: string | null
          total_amount?: number
          total_with_gst?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      supplier_portal_access: {
        Row: {
          access_token: string
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          last_login: string | null
          supplier_id: string
          user_id: string | null
        }
        Insert: {
          access_token?: string
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          supplier_id: string
          user_id?: string | null
        }
        Update: {
          access_token?: string
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          supplier_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_portal_access_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          average_delivery_days: number | null
          contact_person: string | null
          created_at: string | null
          email: string | null
          gst_number: string | null
          id: string
          name: string
          pan_number: string | null
          phone: string | null
          pincode: string | null
          rating: number | null
          state: string | null
          total_orders: number | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          average_delivery_days?: number | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          gst_number?: string | null
          id?: string
          name: string
          pan_number?: string | null
          phone?: string | null
          pincode?: string | null
          rating?: number | null
          state?: string | null
          total_orders?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          average_delivery_days?: number | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          gst_number?: string | null
          id?: string
          name?: string
          pan_number?: string | null
          phone?: string | null
          pincode?: string | null
          rating?: number | null
          state?: string | null
          total_orders?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sustainability_metrics: {
        Row: {
          assessed_date: string
          certification: string | null
          created_at: string | null
          id: string
          measurement_unit: string
          metric_type: string
          metric_value: number
          supplier_id: string | null
        }
        Insert: {
          assessed_date?: string
          certification?: string | null
          created_at?: string | null
          id?: string
          measurement_unit: string
          metric_type: string
          metric_value: number
          supplier_id?: string | null
        }
        Update: {
          assessed_date?: string
          certification?: string | null
          created_at?: string | null
          id?: string
          measurement_unit?: string
          metric_type?: string
          metric_value?: number
          supplier_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sustainability_metrics_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
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
          role: Database["public"]["Enums"]["app_role"]
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
      waste_analytics: {
        Row: {
          carbon_footprint: number | null
          created_at: string | null
          disposal_cost: number | null
          id: string
          inventory_item_id: string | null
          notes: string | null
          recorded_date: string
          recyclable: boolean | null
          waste_quantity: number
          waste_reason: string
          waste_type: string
        }
        Insert: {
          carbon_footprint?: number | null
          created_at?: string | null
          disposal_cost?: number | null
          id?: string
          inventory_item_id?: string | null
          notes?: string | null
          recorded_date?: string
          recyclable?: boolean | null
          waste_quantity: number
          waste_reason: string
          waste_type: string
        }
        Update: {
          carbon_footprint?: number | null
          created_at?: string | null
          disposal_cost?: number | null
          id?: string
          inventory_item_id?: string | null
          notes?: string | null
          recorded_date?: string
          recyclable?: boolean | null
          waste_quantity?: number
          waste_reason?: string
          waste_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "waste_analytics_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_gst: {
        Args: { base_amount: number; gst_rate?: number }
        Returns: {
          gst_amount: number
          total_with_gst: number
        }[]
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
      alert_severity: "low" | "medium" | "high" | "critical"
      app_role: "admin" | "manager" | "operator"
      order_status:
        | "pending"
        | "confirmed"
        | "in_transit"
        | "delivered"
        | "cancelled"
      portal_role: "supplier" | "customer"
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
      alert_severity: ["low", "medium", "high", "critical"],
      app_role: ["admin", "manager", "operator"],
      order_status: [
        "pending",
        "confirmed",
        "in_transit",
        "delivered",
        "cancelled",
      ],
      portal_role: ["supplier", "customer"],
    },
  },
} as const
