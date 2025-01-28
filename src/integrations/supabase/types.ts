export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      accommodations: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          location: string
          name: string
          price_per_night: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          location: string
          name: string
          price_per_night: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          location?: string
          name?: string
          price_per_night?: number
          updated_at?: string
        }
        Relationships: []
      }
      attractions: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          location: string
          name: string
          price_per_person: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          location: string
          name: string
          price_per_person: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          location?: string
          name?: string
          price_per_person?: number
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          accommodation_id: string | null
          attraction_id: string | null
          client_id: string
          created_at: string
          end_date: string
          id: string
          meal_id: string | null
          number_of_people: number
          start_date: string
          status: string
          total_price: number
          transportation_id: string | null
          updated_at: string
        }
        Insert: {
          accommodation_id?: string | null
          attraction_id?: string | null
          client_id: string
          created_at?: string
          end_date: string
          id?: string
          meal_id?: string | null
          number_of_people: number
          start_date: string
          status?: string
          total_price: number
          transportation_id?: string | null
          updated_at?: string
        }
        Update: {
          accommodation_id?: string | null
          attraction_id?: string | null
          client_id?: string
          created_at?: string
          end_date?: string
          id?: string
          meal_id?: string | null
          number_of_people?: number
          start_date?: string
          status?: string
          total_price?: number
          transportation_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_accommodation_id_fkey"
            columns: ["accommodation_id"]
            isOneToOne: false
            referencedRelation: "accommodations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_attraction_id_fkey"
            columns: ["attraction_id"]
            isOneToOne: false
            referencedRelation: "attractions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_transportation_id_fkey"
            columns: ["transportation_id"]
            isOneToOne: false
            referencedRelation: "transportation"
            referencedColumns: ["id"]
          },
        ]
      }
      meals: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          price_per_person: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          price_per_person: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          price_per_person?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transportation: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          price_per_person: number
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          price_per_person: number
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          price_per_person?: number
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      trip_additionals: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          price_per_unit: number
          total_price: number
          trip_id: string | null
          units: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          price_per_unit: number
          total_price: number
          trip_id?: string | null
          units: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          price_per_unit?: number
          total_price?: number
          trip_id?: string | null
          units?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_additionals_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          end_date: string
          id: string
          profit_percentage: number | null
          start_date: string
          status: string | null
          title: string
          total_price: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          end_date: string
          id?: string
          profit_percentage?: number | null
          start_date: string
          status?: string | null
          title: string
          total_price?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string
          id?: string
          profit_percentage?: number | null
          start_date?: string
          status?: string | null
          title?: string
          total_price?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          role: string
          user_id: number
        }
        Insert: {
          role: string
          user_id?: number
        }
        Update: {
          role?: string
          user_id?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: {
          user_id: string
        }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      is_staff: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "owner" | "operator" | "marketing" | "client" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
