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
      actor_analytics: {
        Row: {
          actor_id: number
          actor_name: string
          age_group_stats: Json | null
          avg_rating: number | null
          created_at: string | null
          gender_stats: Json | null
          id: string
          mood_associations: Json | null
          popularity_score: number | null
          profile_path: string | null
          updated_at: string | null
          watch_count: number | null
        }
        Insert: {
          actor_id: number
          actor_name: string
          age_group_stats?: Json | null
          avg_rating?: number | null
          created_at?: string | null
          gender_stats?: Json | null
          id?: string
          mood_associations?: Json | null
          popularity_score?: number | null
          profile_path?: string | null
          updated_at?: string | null
          watch_count?: number | null
        }
        Update: {
          actor_id?: number
          actor_name?: string
          age_group_stats?: Json | null
          avg_rating?: number | null
          created_at?: string | null
          gender_stats?: Json | null
          id?: string
          mood_associations?: Json | null
          popularity_score?: number | null
          profile_path?: string | null
          updated_at?: string | null
          watch_count?: number | null
        }
        Relationships: []
      }
      admin_activity_logs: {
        Row: {
          action: string
          admin_id: string
          admin_name: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id: string
          admin_name: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          admin_name?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      collection_movies: {
        Row: {
          added_at: string
          collection_id: string
          id: string
          movie_id: number
          poster_path: string | null
          title: string
        }
        Insert: {
          added_at?: string
          collection_id: string
          id?: string
          movie_id: number
          poster_path?: string | null
          title: string
        }
        Update: {
          added_at?: string
          collection_id?: string
          id?: string
          movie_id?: number
          poster_path?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_movies_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          mood: string | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          mood?: string | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          mood?: string | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collections_user_id_key_users_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "key_users"
            referencedColumns: ["id"]
          },
        ]
      }
      content_history: {
        Row: {
          change_description: string | null
          components: Json | null
          content: Json
          created_at: string
          created_by: string | null
          id: string
          page_key: string
          version: number
        }
        Insert: {
          change_description?: string | null
          components?: Json | null
          content: Json
          created_at?: string
          created_by?: string | null
          id?: string
          page_key: string
          version: number
        }
        Update: {
          change_description?: string | null
          components?: Json | null
          content?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          page_key?: string
          version?: number
        }
        Relationships: []
      }
      content_performance: {
        Row: {
          avg_rating: number | null
          completion_rate: number | null
          created_at: string | null
          drop_off_point: number | null
          id: string
          mood_performance: Json | null
          movie_id: number
          poster_path: string | null
          title: string
          updated_at: string | null
          watch_count: number | null
        }
        Insert: {
          avg_rating?: number | null
          completion_rate?: number | null
          created_at?: string | null
          drop_off_point?: number | null
          id?: string
          mood_performance?: Json | null
          movie_id: number
          poster_path?: string | null
          title: string
          updated_at?: string | null
          watch_count?: number | null
        }
        Update: {
          avg_rating?: number | null
          completion_rate?: number | null
          created_at?: string | null
          drop_off_point?: number | null
          id?: string
          mood_performance?: Json | null
          movie_id?: number
          poster_path?: string | null
          title?: string
          updated_at?: string | null
          watch_count?: number | null
        }
        Relationships: []
      }
      key_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          ip_address: string | null
          is_remembered: boolean | null
          token_hash: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          ip_address?: string | null
          is_remembered?: boolean | null
          token_hash: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          is_remembered?: boolean | null
          token_hash?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "key_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "key_users"
            referencedColumns: ["id"]
          },
        ]
      }
      key_users: {
        Row: {
          created_at: string
          date_of_birth: string | null
          display_name: string
          gender: string | null
          id: string
          key_hash: string
          last_login_at: string | null
          purpose: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          display_name: string
          gender?: string | null
          id?: string
          key_hash: string
          last_login_at?: string | null
          purpose?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          display_name?: string
          gender?: string | null
          id?: string
          key_hash?: string
          last_login_at?: string | null
          purpose?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      mood_journal: {
        Row: {
          created_at: string
          id: string
          mood: string
          movie_id: number | null
          movie_poster: string | null
          movie_title: string | null
          note: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mood: string
          movie_id?: number | null
          movie_poster?: string | null
          movie_title?: string | null
          note?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mood?: string
          movie_id?: number | null
          movie_poster?: string | null
          movie_title?: string | null
          note?: string | null
          user_id?: string
        }
        Relationships: []
      }
      mood_selections: {
        Row: {
          id: string
          mood: string
          selected_at: string
          user_id: string | null
        }
        Insert: {
          id?: string
          mood: string
          selected_at?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          mood?: string
          selected_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      mood_streaks: {
        Row: {
          created_at: string
          current_streak: number | null
          id: string
          last_active_date: string | null
          longest_streak: number | null
          total_days_active: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number | null
          id?: string
          last_active_date?: string | null
          longest_streak?: number | null
          total_days_active?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number | null
          id?: string
          last_active_date?: string | null
          longest_streak?: number | null
          total_days_active?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      movie_battles: {
        Row: {
          created_at: string
          id: string
          movie_a_id: number
          movie_a_poster: string | null
          movie_a_title: string
          movie_b_id: number
          movie_b_poster: string | null
          movie_b_title: string
          user_id: string | null
          winner_id: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          movie_a_id: number
          movie_a_poster?: string | null
          movie_a_title: string
          movie_b_id: number
          movie_b_poster?: string | null
          movie_b_title: string
          user_id?: string | null
          winner_id?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          movie_a_id?: number
          movie_a_poster?: string | null
          movie_a_title?: string
          movie_b_id?: number
          movie_b_poster?: string | null
          movie_b_title?: string
          user_id?: string | null
          winner_id?: number | null
        }
        Relationships: []
      }
      page_layouts: {
        Row: {
          components: Json
          draft_components: Json | null
          id: string
          is_published: boolean
          page_key: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          components?: Json
          draft_components?: Json | null
          id?: string
          is_published?: boolean
          page_key: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          components?: Json
          draft_components?: Json | null
          id?: string
          is_published?: boolean
          page_key?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          accent_color: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          favorite_genres: string[] | null
          id: string
          is_public: boolean | null
          preferred_languages: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accent_color?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          favorite_genres?: string[] | null
          id?: string
          is_public?: boolean | null
          preferred_languages?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accent_color?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          favorite_genres?: string[] | null
          id?: string
          is_public?: boolean | null
          preferred_languages?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_key_users_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "key_users"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendation_logs: {
        Row: {
          id: string
          mood: string | null
          movie_id: number
          movie_title: string
          recommended_at: string
          user_id: string | null
        }
        Insert: {
          id?: string
          mood?: string | null
          movie_id: number
          movie_title: string
          recommended_at?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          mood?: string | null
          movie_id?: number
          movie_title?: string
          recommended_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      recommendation_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      review_reactions: {
        Row: {
          created_at: string
          id: string
          reaction_type: string
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reaction_type: string
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reaction_type?: string
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_reactions_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      review_replies: {
        Row: {
          created_at: string
          id: string
          is_edited: boolean | null
          parent_reply_id: string | null
          reply_text: string
          review_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_edited?: boolean | null
          parent_reply_id?: string | null
          reply_text: string
          review_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_edited?: boolean | null
          parent_reply_id?: string | null
          reply_text?: string
          review_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_replies_parent_reply_id_fkey"
            columns: ["parent_reply_id"]
            isOneToOne: false
            referencedRelation: "review_replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_replies_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          created_at: string
          id: string
          movie_id: number
          movie_poster: string | null
          movie_title: string
          rating: number
          review_text: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          movie_id: number
          movie_poster?: string | null
          movie_title: string
          rating: number
          review_text?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          movie_id?: number
          movie_poster?: string | null
          movie_title?: string
          rating?: number
          review_text?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_user_id_key_users_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "key_users"
            referencedColumns: ["id"]
          },
        ]
      }
      site_content: {
        Row: {
          content: Json
          draft_content: Json | null
          id: string
          is_published: boolean
          page_key: string
          updated_at: string
          updated_by: string | null
          version: number
        }
        Insert: {
          content?: Json
          draft_content?: Json | null
          id?: string
          is_published?: boolean
          page_key: string
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Update: {
          content?: Json
          draft_content?: Json | null
          id?: string
          is_published?: boolean
          page_key?: string
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Relationships: []
      }
      site_themes: {
        Row: {
          colors: Json
          id: string
          is_active: boolean
          theme_key: string
          typography: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          colors?: Json
          id?: string
          is_active?: boolean
          theme_key?: string
          typography?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          colors?: Json
          id?: string
          is_active?: boolean
          theme_key?: string
          typography?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_description: string | null
          badge_icon: string | null
          badge_id: string
          badge_name: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_description?: string | null
          badge_icon?: string | null
          badge_id: string
          badge_name: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_description?: string | null
          badge_icon?: string | null
          badge_id?: string
          badge_name?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_demographics: {
        Row: {
          age_group: string | null
          created_at: string | null
          device_type: string | null
          first_visit: string | null
          gender: string | null
          id: string
          is_returning: boolean | null
          last_visit: string | null
          updated_at: string | null
          user_id: string
          visit_count: number | null
        }
        Insert: {
          age_group?: string | null
          created_at?: string | null
          device_type?: string | null
          first_visit?: string | null
          gender?: string | null
          id?: string
          is_returning?: boolean | null
          last_visit?: string | null
          updated_at?: string | null
          user_id: string
          visit_count?: number | null
        }
        Update: {
          age_group?: string | null
          created_at?: string | null
          device_type?: string | null
          first_visit?: string | null
          gender?: string | null
          id?: string
          is_returning?: boolean | null
          last_visit?: string | null
          updated_at?: string | null
          user_id?: string
          visit_count?: number | null
        }
        Relationships: []
      }
      user_engagement: {
        Row: {
          created_at: string
          duration_ms: number | null
          event_type: string
          id: string
          metadata: Json | null
          movie_id: number | null
          movie_title: string | null
          page_path: string
          session_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          event_type: string
          id?: string
          metadata?: Json | null
          movie_id?: number | null
          movie_title?: string | null
          page_path: string
          session_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          event_type?: string
          id?: string
          metadata?: Json | null
          movie_id?: number | null
          movie_title?: string | null
          page_path?: string
          session_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_engagement_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "key_users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
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
          role?: Database["public"]["Enums"]["app_role"]
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
      watch_history: {
        Row: {
          id: string
          movie_id: number
          poster_path: string | null
          rating: number | null
          title: string
          user_id: string
          watched_at: string
        }
        Insert: {
          id?: string
          movie_id: number
          poster_path?: string | null
          rating?: number | null
          title: string
          user_id: string
          watched_at?: string
        }
        Update: {
          id?: string
          movie_id?: number
          poster_path?: string | null
          rating?: number | null
          title?: string
          user_id?: string
          watched_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "watch_history_user_id_key_users_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "key_users"
            referencedColumns: ["id"]
          },
        ]
      }
      watchlist: {
        Row: {
          created_at: string
          id: string
          is_public: boolean | null
          movie_id: number
          overview: string | null
          poster_path: string | null
          rating: number | null
          release_year: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_public?: boolean | null
          movie_id: number
          overview?: string | null
          poster_path?: string | null
          rating?: number | null
          release_year?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_public?: boolean | null
          movie_id?: number
          overview?: string | null
          poster_path?: string | null
          rating?: number | null
          release_year?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watchlist_user_id_key_users_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "key_users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_admin_role: {
        Args: {
          p_role: Database["public"]["Enums"]["app_role"]
          p_user_id: string
        }
        Returns: Json
      }
      cleanup_expired_sessions: { Args: never; Returns: undefined }
      get_admin_stats: { Args: never; Returns: Json }
      get_admin_users: { Args: never; Returns: Json }
      get_content_performance_stats: { Args: never; Returns: Json }
      get_engagement_analytics: { Args: { time_range?: string }; Returns: Json }
      get_enhanced_admin_stats: { Args: never; Returns: Json }
      get_mood_analytics: { Args: { time_range?: string }; Returns: Json }
      get_most_watchlisted_movies: { Args: never; Returns: Json }
      get_top_recommended_movies: { Args: never; Returns: Json }
      get_trending_moods: { Args: { time_range?: string }; Returns: Json }
      get_user_demographics_stats: { Args: never; Returns: Json }
      get_user_role: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_admin_activity: {
        Args: {
          p_action: string
          p_admin_id: string
          p_admin_name: string
          p_details?: Json
          p_resource_id?: string
          p_resource_type?: string
        }
        Returns: string
      }
      remove_admin_role: {
        Args: {
          p_role: Database["public"]["Enums"]["app_role"]
          p_user_id: string
        }
        Returns: Json
      }
      save_page_layout: {
        Args: {
          p_components: Json
          p_page_key: string
          p_publish?: boolean
          p_user_id: string
        }
        Returns: Json
      }
      save_site_content: {
        Args: {
          p_content: Json
          p_description?: string
          p_page_key: string
          p_publish?: boolean
          p_user_id: string
        }
        Returns: Json
      }
      update_recommendation_setting: {
        Args: {
          p_setting_key: string
          p_setting_value: Json
          p_updated_by: string
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "super_admin" | "analyst"
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
      app_role: ["admin", "moderator", "user", "super_admin", "analyst"],
    },
  },
} as const
