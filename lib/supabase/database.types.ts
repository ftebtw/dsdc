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
      anonymous_feedback: {
        Row: {
          body: string
          created_at: string
          id: string
          role_hint: Database["public"]["Enums"]["feedback_role_hint"]
          subject: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          role_hint: Database["public"]["Enums"]["feedback_role_hint"]
          subject: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          role_hint?: Database["public"]["Enums"]["feedback_role_hint"]
          subject?: string
        }
        Relationships: []
      }
      attendance_records: {
        Row: {
          camera_on: boolean
          class_id: string
          id: string
          marked_at: string
          marked_by: string | null
          session_date: string
          status: Database["public"]["Enums"]["attendance_status"]
          student_id: string
        }
        Insert: {
          camera_on?: boolean
          class_id: string
          id?: string
          marked_at?: string
          marked_by?: string | null
          session_date: string
          status?: Database["public"]["Enums"]["attendance_status"]
          student_id: string
        }
        Update: {
          camera_on?: boolean
          class_id?: string
          id?: string
          marked_at?: string
          marked_by?: string | null
          session_date?: string
          status?: Database["public"]["Enums"]["attendance_status"]
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_marked_by_fkey"
            columns: ["marked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      class_credits: {
        Row: {
          amount_sessions: number
          class_type: Database["public"]["Enums"]["class_type"]
          created_at: string
          id: string
          issued_by: string | null
          reason: string
          redeemed: boolean
          redeemed_at: string | null
          student_id: string
        }
        Insert: {
          amount_sessions: number
          class_type: Database["public"]["Enums"]["class_type"]
          created_at?: string
          id?: string
          issued_by?: string | null
          reason: string
          redeemed?: boolean
          redeemed_at?: string | null
          student_id: string
        }
        Update: {
          amount_sessions?: number
          class_type?: Database["public"]["Enums"]["class_type"]
          created_at?: string
          id?: string
          issued_by?: string | null
          reason?: string
          redeemed?: boolean
          redeemed_at?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_credits_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_credits_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          coach_id: string | null
          created_at: string
          description: string | null
          eligible_sub_tier: Database["public"]["Enums"]["coach_tier"]
          id: string
          max_students: number
          name: string
          schedule_day: Database["public"]["Enums"]["schedule_day"]
          schedule_end_time: string
          schedule_start_time: string
          term_id: string
          timezone: string
          type: Database["public"]["Enums"]["class_type"]
          zoom_link: string | null
        }
        Insert: {
          coach_id?: string | null
          created_at?: string
          description?: string | null
          eligible_sub_tier: Database["public"]["Enums"]["coach_tier"]
          id?: string
          max_students?: number
          name: string
          schedule_day: Database["public"]["Enums"]["schedule_day"]
          schedule_end_time: string
          schedule_start_time: string
          term_id: string
          timezone?: string
          type: Database["public"]["Enums"]["class_type"]
          zoom_link?: string | null
        }
        Update: {
          coach_id?: string | null
          created_at?: string
          description?: string | null
          eligible_sub_tier?: Database["public"]["Enums"]["coach_tier"]
          id?: string
          max_students?: number
          name?: string
          schedule_day?: Database["public"]["Enums"]["schedule_day"]
          schedule_end_time?: string
          schedule_start_time?: string
          term_id?: string
          timezone?: string
          type?: Database["public"]["Enums"]["class_type"]
          zoom_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_availability: {
        Row: {
          available_date: string
          coach_id: string
          created_at: string
          end_time: string
          id: string
          is_group: boolean
          is_private: boolean
          start_time: string
          timezone: string
        }
        Insert: {
          available_date: string
          coach_id: string
          created_at?: string
          end_time: string
          id?: string
          is_group?: boolean
          is_private?: boolean
          start_time: string
          timezone: string
        }
        Update: {
          available_date?: string
          coach_id?: string
          created_at?: string
          end_time?: string
          id?: string
          is_group?: boolean
          is_private?: boolean
          start_time?: string
          timezone?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_availability_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_checkins: {
        Row: {
          checked_in_at: string
          class_id: string
          coach_id: string
          created_at: string
          id: string
          session_date: string
        }
        Insert: {
          checked_in_at?: string
          class_id: string
          coach_id: string
          created_at?: string
          id?: string
          session_date: string
        }
        Update: {
          checked_in_at?: string
          class_id?: string
          coach_id?: string
          created_at?: string
          id?: string
          session_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_checkins_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_checkins_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_profiles: {
        Row: {
          coach_id: string
          created_at: string
          hourly_rate: number | null
          is_ta: boolean
          tier: Database["public"]["Enums"]["coach_tier"] | null
        }
        Insert: {
          coach_id: string
          created_at?: string
          hourly_rate?: number | null
          is_ta?: boolean
          tier?: Database["public"]["Enums"]["coach_tier"] | null
        }
        Update: {
          coach_id?: string
          created_at?: string
          hourly_rate?: number | null
          is_ta?: boolean
          tier?: Database["public"]["Enums"]["coach_tier"] | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_profiles_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_tier_assignments: {
        Row: {
          coach_id: string
          created_at: string
          tier: Database["public"]["Enums"]["coach_tier"]
        }
        Insert: {
          coach_id: string
          created_at?: string
          tier: Database["public"]["Enums"]["coach_tier"]
        }
        Update: {
          coach_id?: string
          created_at?: string
          tier?: Database["public"]["Enums"]["coach_tier"]
        }
        Relationships: [
          {
            foreignKeyName: "coach_tier_assignments_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          approval_expires_at: string | null
          class_id: string
          created_at: string
          enrolled_at: string
          etransfer_expires_at: string | null
          etransfer_sent_at: string | null
          etransfer_token: string | null
          id: string
          payment_method: string | null
          status: Database["public"]["Enums"]["enrollment_status"]
          stripe_checkout_session_id: string | null
          student_id: string
        }
        Insert: {
          approval_expires_at?: string | null
          class_id: string
          created_at?: string
          enrolled_at?: string
          etransfer_expires_at?: string | null
          etransfer_sent_at?: string | null
          etransfer_token?: string | null
          id?: string
          payment_method?: string | null
          status?: Database["public"]["Enums"]["enrollment_status"]
          stripe_checkout_session_id?: string | null
          student_id: string
        }
        Update: {
          approval_expires_at?: string | null
          class_id?: string
          created_at?: string
          enrolled_at?: string
          etransfer_expires_at?: string | null
          etransfer_sent_at?: string | null
          etransfer_token?: string | null
          id?: string
          payment_method?: string | null
          status?: Database["public"]["Enums"]["enrollment_status"]
          stripe_checkout_session_id?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          end_time: string | null
          event_date: string
          event_type: string
          id: string
          is_visible: boolean
          location: string | null
          start_time: string | null
          timezone: string
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time?: string | null
          event_date: string
          event_type?: string
          id?: string
          is_visible?: boolean
          location?: string | null
          start_time?: string | null
          timezone?: string
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time?: string | null
          event_date?: string
          event_type?: string
          id?: string
          is_visible?: boolean
          location?: string | null
          start_time?: string | null
          timezone?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          color: string
          created_at: string
          created_by: string
          description: string | null
          end_time: string
          event_date: string
          id: string
          is_all_day: boolean
          start_time: string
          timezone: string
          title: string
          visibility: string
        }
        Insert: {
          color?: string
          created_at?: string
          created_by: string
          description?: string | null
          end_time: string
          event_date: string
          id?: string
          is_all_day?: boolean
          start_time: string
          timezone?: string
          title: string
          visibility?: string
        }
        Update: {
          color?: string
          created_at?: string
          created_by?: string
          description?: string | null
          end_time?: string
          event_date?: string
          id?: string
          is_all_day?: boolean
          start_time?: string
          timezone?: string
          title?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invite_codes: {
        Row: {
          claimed_at: string | null
          claimed_by: string | null
          code: string
          created_at: string
          expires_at: string
          id: string
          parent_id: string
        }
        Insert: {
          claimed_at?: string | null
          claimed_by?: string | null
          code: string
          created_at?: string
          expires_at: string
          id?: string
          parent_id: string
        }
        Update: {
          claimed_at?: string | null
          claimed_by?: string | null
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          parent_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invite_codes_claimed_by_fkey"
            columns: ["claimed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invite_codes_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      link_verification_codes: {
        Row: {
          code: string
          created_at: string
          expires_at: string
          id: string
          parent_id: string
          student_email: string
          student_id: string | null
          verified_at: string | null
        }
        Insert: {
          code: string
          created_at?: string
          expires_at: string
          id?: string
          parent_id: string
          student_email: string
          student_id?: string | null
          verified_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          parent_id?: string
          student_email?: string
          student_id?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "link_verification_codes_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "link_verification_codes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_documents: {
        Row: {
          changes_per_event: boolean
          created_at: string
          description: string | null
          file_path: string
          id: string
          required_for: Database["public"]["Enums"]["legal_required_for"]
          title: string
        }
        Insert: {
          changes_per_event?: boolean
          created_at?: string
          description?: string | null
          file_path: string
          id?: string
          required_for: Database["public"]["Enums"]["legal_required_for"]
          title: string
        }
        Update: {
          changes_per_event?: boolean
          created_at?: string
          description?: string | null
          file_path?: string
          id?: string
          required_for?: Database["public"]["Enums"]["legal_required_for"]
          title?: string
        }
        Relationships: []
      }
      legal_signatures: {
        Row: {
          created_at: string
          document_id: string
          id: string
          ip_address: string | null
          signature_image_path: string
          signed_at: string
          signed_for_student_id: string | null
          signer_id: string
          signer_role: Database["public"]["Enums"]["app_role"]
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          document_id: string
          id?: string
          ip_address?: string | null
          signature_image_path: string
          signed_at?: string
          signed_for_student_id?: string | null
          signer_id: string
          signer_role: Database["public"]["Enums"]["app_role"]
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          document_id?: string
          id?: string
          ip_address?: string | null
          signature_image_path?: string
          signed_at?: string
          signed_for_student_id?: string | null
          signer_id?: string
          signer_role?: Database["public"]["Enums"]["app_role"]
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "legal_signatures_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "legal_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_signatures_signed_for_student_id_fkey"
            columns: ["signed_for_student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_signatures_signer_id_fkey"
            columns: ["signer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_log: {
        Row: {
          id: string
          notification_type: string
          recipient_id: string
          reference_id: string
          sent_at: string
        }
        Insert: {
          id?: string
          notification_type: string
          recipient_id: string
          reference_id: string
          sent_at?: string
        }
        Update: {
          id?: string
          notification_type?: string
          recipient_id?: string
          reference_id?: string
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_log_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_student_links: {
        Row: {
          created_at: string
          id: string
          parent_id: string
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          parent_id: string
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          parent_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_student_links_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_student_links_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_login_log: {
        Row: {
          display_name: string | null
          email: string
          id: string
          ip_address: string | null
          logged_in_at: string
          role: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          display_name?: string | null
          email: string
          id?: string
          ip_address?: string | null
          logged_in_at?: string
          role: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          display_name?: string | null
          email?: string
          id?: string
          ip_address?: string | null
          logged_in_at?: string
          role?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_login_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      private_sessions: {
        Row: {
          admin_approved_at: string | null
          admin_approved_by: string | null
          availability_id: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          coach_id: string
          coach_notes: string | null
          completed_at: string | null
          confirmed_at: string | null
          created_at: string
          id: string
          payment_method: string | null
          price_cad: number | null
          proposed_by: string | null
          proposed_date: string | null
          proposed_end_time: string | null
          proposed_start_time: string | null
          requested_date: string
          requested_end_time: string
          requested_start_time: string
          status: Database["public"]["Enums"]["private_session_status"]
          stripe_checkout_session_id: string | null
          student_id: string
          student_notes: string | null
          timezone: string
          zoom_link: string | null
        }
        Insert: {
          admin_approved_at?: string | null
          admin_approved_by?: string | null
          availability_id?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          coach_id: string
          coach_notes?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          id?: string
          payment_method?: string | null
          price_cad?: number | null
          proposed_by?: string | null
          proposed_date?: string | null
          proposed_end_time?: string | null
          proposed_start_time?: string | null
          requested_date: string
          requested_end_time: string
          requested_start_time: string
          status?: Database["public"]["Enums"]["private_session_status"]
          stripe_checkout_session_id?: string | null
          student_id: string
          student_notes?: string | null
          timezone: string
          zoom_link?: string | null
        }
        Update: {
          admin_approved_at?: string | null
          admin_approved_by?: string | null
          availability_id?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          coach_id?: string
          coach_notes?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          id?: string
          payment_method?: string | null
          price_cad?: number | null
          proposed_by?: string | null
          proposed_date?: string | null
          proposed_end_time?: string | null
          proposed_start_time?: string | null
          requested_date?: string
          requested_end_time?: string
          requested_start_time?: string
          status?: Database["public"]["Enums"]["private_session_status"]
          stripe_checkout_session_id?: string | null
          student_id?: string
          student_notes?: string | null
          timezone?: string
          zoom_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "private_sessions_admin_approved_by_fkey"
            columns: ["admin_approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "private_sessions_availability_id_fkey"
            columns: ["availability_id"]
            isOneToOne: false
            referencedRelation: "coach_availability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "private_sessions_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "private_sessions_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "private_sessions_proposed_by_fkey"
            columns: ["proposed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "private_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string
          id: string
          locale: Database["public"]["Enums"]["locale_code"]
          notification_preferences: Json
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          timezone: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email: string
          id: string
          locale?: Database["public"]["Enums"]["locale_code"]
          notification_preferences?: Json
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          timezone?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          locale?: Database["public"]["Enums"]["locale_code"]
          notification_preferences?: Json
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          timezone?: string
        }
        Relationships: []
      }
      report_cards: {
        Row: {
          class_id: string
          created_at: string
          file_path: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          status: Database["public"]["Enums"]["report_card_status"]
          student_id: string
          term_id: string
          written_by: string | null
        }
        Insert: {
          class_id: string
          created_at?: string
          file_path: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: Database["public"]["Enums"]["report_card_status"]
          student_id: string
          term_id: string
          written_by?: string | null
        }
        Update: {
          class_id?: string
          created_at?: string
          file_path?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: Database["public"]["Enums"]["report_card_status"]
          student_id?: string
          term_id?: string
          written_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_cards_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_cards_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_cards_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_cards_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_cards_written_by_fkey"
            columns: ["written_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          class_id: string | null
          created_at: string
          file_path: string | null
          id: string
          posted_by: string
          title: string
          type: Database["public"]["Enums"]["resource_type"]
          url: string | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          file_path?: string | null
          id?: string
          posted_by: string
          title: string
          type: Database["public"]["Enums"]["resource_type"]
          url?: string | null
        }
        Update: {
          class_id?: string | null
          created_at?: string
          file_path?: string | null
          id?: string
          posted_by?: string
          title?: string
          type?: Database["public"]["Enums"]["resource_type"]
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resources_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resources_posted_by_fkey"
            columns: ["posted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_absences: {
        Row: {
          class_id: string
          created_at: string
          id: string
          reason: string | null
          reported_at: string
          reported_by: string | null
          session_date: string
          student_id: string
        }
        Insert: {
          class_id: string
          created_at?: string
          id?: string
          reason?: string | null
          reported_at?: string
          reported_by?: string | null
          session_date: string
          student_id: string
        }
        Update: {
          class_id?: string
          created_at?: string
          id?: string
          reason?: string | null
          reported_at?: string
          reported_by?: string | null
          session_date?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_absences_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_absences_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_absences_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sub_requests: {
        Row: {
          accepted_at: string | null
          accepting_coach_id: string | null
          class_id: string
          created_at: string
          id: string
          reason: string | null
          requesting_coach_id: string
          session_date: string
          status: Database["public"]["Enums"]["sub_request_status"]
        }
        Insert: {
          accepted_at?: string | null
          accepting_coach_id?: string | null
          class_id: string
          created_at?: string
          id?: string
          reason?: string | null
          requesting_coach_id: string
          session_date: string
          status?: Database["public"]["Enums"]["sub_request_status"]
        }
        Update: {
          accepted_at?: string | null
          accepting_coach_id?: string | null
          class_id?: string
          created_at?: string
          id?: string
          reason?: string | null
          requesting_coach_id?: string
          session_date?: string
          status?: Database["public"]["Enums"]["sub_request_status"]
        }
        Relationships: [
          {
            foreignKeyName: "sub_requests_accepting_coach_id_fkey"
            columns: ["accepting_coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sub_requests_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sub_requests_requesting_coach_id_fkey"
            columns: ["requesting_coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ta_requests: {
        Row: {
          accepted_at: string | null
          accepting_ta_id: string | null
          class_id: string
          created_at: string
          id: string
          reason: string | null
          requesting_coach_id: string
          session_date: string
          status: Database["public"]["Enums"]["sub_request_status"]
        }
        Insert: {
          accepted_at?: string | null
          accepting_ta_id?: string | null
          class_id: string
          created_at?: string
          id?: string
          reason?: string | null
          requesting_coach_id: string
          session_date: string
          status?: Database["public"]["Enums"]["sub_request_status"]
        }
        Update: {
          accepted_at?: string | null
          accepting_ta_id?: string | null
          class_id?: string
          created_at?: string
          id?: string
          reason?: string | null
          requesting_coach_id?: string
          session_date?: string
          status?: Database["public"]["Enums"]["sub_request_status"]
        }
        Relationships: [
          {
            foreignKeyName: "ta_requests_accepting_ta_id_fkey"
            columns: ["accepting_ta_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ta_requests_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ta_requests_requesting_coach_id_fkey"
            columns: ["requesting_coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      terms: {
        Row: {
          created_at: string
          end_date: string
          id: string
          is_active: boolean
          name: string
          start_date: string
          weeks: number
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          is_active?: boolean
          name: string
          start_date: string
          weeks: number
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          is_active?: boolean
          name?: string
          start_date?: string
          weeks?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_accept_sub_request: {
        Args: { target_sub_request_id: string }
        Returns: boolean
      }
      can_accept_ta_request: {
        Args: { target_ta_request_id: string }
        Returns: boolean
      }
      can_view_class_as_student_or_parent: {
        Args: { target_class_id: string }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_coach_or_ta: { Args: never; Returns: boolean }
      is_parent_of_student: {
        Args: { target_student_id: string }
        Returns: boolean
      }
      student_linked_to_parent: {
        Args: { target_student_id: string }
        Returns: boolean
      }
      teaches_class: { Args: { target_class_id: string }; Returns: boolean }
      try_parse_uuid: { Args: { value: string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "coach" | "ta" | "student" | "parent"
      attendance_status: "present" | "absent" | "late" | "sick" | "makeup"
      class_type:
        | "novice_debate"
        | "intermediate_debate"
        | "advanced_debate"
        | "public_speaking"
        | "wsc"
      coach_tier: "junior" | "senior" | "wsc"
      enrollment_status:
        | "active"
        | "dropped"
        | "completed"
        | "pending_etransfer"
        | "etransfer_sent"
        | "etransfer_lapsed"
        | "pending_approval"
      feedback_role_hint: "student" | "parent"
      legal_required_for: "all_students" | "all_coaches" | "trip" | "event"
      locale_code: "en" | "zh"
      private_session_status:
        | "pending"
        | "confirmed"
        | "cancelled"
        | "completed"
        | "coach_accepted"
        | "awaiting_payment"
        | "rescheduled_by_coach"
        | "rescheduled_by_student"
      report_card_status: "draft" | "submitted" | "approved" | "rejected"
      resource_type:
        | "homework"
        | "lesson_plan"
        | "slides"
        | "document"
        | "recording"
        | "other"
      schedule_day: "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun"
      sub_request_status: "open" | "accepted" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Relationships: []
      }
      buckets_analytics: {
        Row: {
          created_at: string
          deleted_at: string | null
          format: string
          id: string
          name: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      buckets_vectors: {
        Row: {
          created_at: string
          id: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      vector_indexes: {
        Row: {
          bucket_id: string
          created_at: string
          data_type: string
          dimension: number
          distance_metric: string
          id: string
          metadata_configuration: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          data_type: string
          dimension: number
          distance_metric: string
          id?: string
          metadata_configuration?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          data_type?: string
          dimension?: number
          distance_metric?: string
          id?: string
          metadata_configuration?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vector_indexes_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets_vectors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string }
        Returns: undefined
      }
      extension: { Args: { name: string }; Returns: string }
      filename: { Args: { name: string }; Returns: string }
      foldername: { Args: { name: string }; Returns: string[] }
      get_common_prefix: {
        Args: { p_delimiter: string; p_key: string; p_prefix: string }
        Returns: string
      }
      get_size_by_bucket: {
        Args: never
        Returns: {
          bucket_id: string
          size: number
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
          prefix_param: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          _bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_token?: string
          prefix_param: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      operation: { Args: never; Returns: string }
      search: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_by_timestamp: {
        Args: {
          p_bucket_id: string
          p_level: number
          p_limit: number
          p_prefix: string
          p_sort_column: string
          p_sort_column_after: string
          p_sort_order: string
          p_start_after: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v2: {
        Args: {
          bucket_name: string
          levels?: number
          limits?: number
          prefix: string
          sort_column?: string
          sort_column_after?: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      buckettype: "STANDARD" | "ANALYTICS" | "VECTOR"
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
    Enums: {
      app_role: ["admin", "coach", "ta", "student", "parent"],
      attendance_status: ["present", "absent", "late", "sick", "makeup"],
      class_type: [
        "novice_debate",
        "intermediate_debate",
        "advanced_debate",
        "public_speaking",
        "wsc",
      ],
      coach_tier: ["junior", "senior", "wsc"],
      enrollment_status: [
        "active",
        "dropped",
        "completed",
        "pending_etransfer",
        "etransfer_sent",
        "etransfer_lapsed",
        "pending_approval",
      ],
      feedback_role_hint: ["student", "parent"],
      legal_required_for: ["all_students", "all_coaches", "trip", "event"],
      locale_code: ["en", "zh"],
      private_session_status: [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
        "coach_accepted",
        "awaiting_payment",
        "rescheduled_by_coach",
        "rescheduled_by_student",
      ],
      report_card_status: ["draft", "submitted", "approved", "rejected"],
      resource_type: [
        "homework",
        "lesson_plan",
        "slides",
        "document",
        "recording",
        "other",
      ],
      schedule_day: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
      sub_request_status: ["open", "accepted", "cancelled"],
    },
  },
  storage: {
    Enums: {
      buckettype: ["STANDARD", "ANALYTICS", "VECTOR"],
    },
  },
} as const
