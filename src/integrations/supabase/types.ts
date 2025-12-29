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
      guarantors: {
        Row: {
          accepted_at: string | null
          created_at: string
          guaranteed_amount: number
          guarantor_member_id: string
          id: string
          loan_id: string
          status: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          guaranteed_amount: number
          guarantor_member_id: string
          id?: string
          loan_id: string
          status?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          guaranteed_amount?: number
          guarantor_member_id?: string
          id?: string
          loan_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "guarantors_guarantor_member_id_fkey"
            columns: ["guarantor_member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guarantors_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_approvals: {
        Row: {
          approver_id: string
          approver_role: Database["public"]["Enums"]["app_role"]
          created_at: string
          decision: string
          id: string
          loan_id: string
          remarks: string | null
        }
        Insert: {
          approver_id: string
          approver_role: Database["public"]["Enums"]["app_role"]
          created_at?: string
          decision: string
          id?: string
          loan_id: string
          remarks?: string | null
        }
        Update: {
          approver_id?: string
          approver_role?: Database["public"]["Enums"]["app_role"]
          created_at?: string
          decision?: string
          id?: string
          loan_id?: string
          remarks?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loan_approvals_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
        ]
      }
      loans: {
        Row: {
          application_date: string
          approval_date: string | null
          completion_date: string | null
          created_at: string
          disbursement_date: string | null
          id: string
          interest_rate: number
          loan_type: Database["public"]["Enums"]["loan_type"]
          member_id: string
          monthly_payment: number
          principal_amount: number
          purpose: string | null
          remaining_balance: number
          status: Database["public"]["Enums"]["loan_status"]
          term_months: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          application_date?: string
          approval_date?: string | null
          completion_date?: string | null
          created_at?: string
          disbursement_date?: string | null
          id?: string
          interest_rate: number
          loan_type: Database["public"]["Enums"]["loan_type"]
          member_id: string
          monthly_payment: number
          principal_amount: number
          purpose?: string | null
          remaining_balance: number
          status?: Database["public"]["Enums"]["loan_status"]
          term_months: number
          total_amount: number
          updated_at?: string
        }
        Update: {
          application_date?: string
          approval_date?: string | null
          completion_date?: string | null
          created_at?: string
          disbursement_date?: string | null
          id?: string
          interest_rate?: number
          loan_type?: Database["public"]["Enums"]["loan_type"]
          member_id?: string
          monthly_payment?: number
          principal_amount?: number
          purpose?: string | null
          remaining_balance?: number
          status?: Database["public"]["Enums"]["loan_status"]
          term_months?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loans_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          address: string | null
          approved_at: string | null
          approved_by: string | null
          bank_account: string | null
          bank_name: string | null
          city: string | null
          created_at: string
          date_of_birth: string | null
          department: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          employee_id: string | null
          employer: string | null
          gender: string | null
          heir_name: string | null
          heir_phone: string | null
          heir_relationship: string | null
          id: string
          member_number: string
          monthly_salary: number | null
          region: string | null
          status: Database["public"]["Enums"]["membership_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bank_account?: string | null
          bank_name?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          department?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employee_id?: string | null
          employer?: string | null
          gender?: string | null
          heir_name?: string | null
          heir_phone?: string | null
          heir_relationship?: string | null
          id?: string
          member_number: string
          monthly_salary?: number | null
          region?: string | null
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bank_account?: string | null
          bank_name?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          department?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employee_id?: string | null
          employer?: string | null
          gender?: string | null
          heir_name?: string | null
          heir_phone?: string | null
          heir_relationship?: string | null
          id?: string
          member_number?: string
          monthly_salary?: number | null
          region?: string | null
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      savings_accounts: {
        Row: {
          balance: number
          created_at: string
          id: string
          last_contribution_date: string | null
          member_id: string
          monthly_contribution: number
          total_interest_earned: number
          updated_at: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          last_contribution_date?: string | null
          member_id: string
          monthly_contribution?: number
          total_interest_earned?: number
          updated_at?: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          last_contribution_date?: string | null
          member_id?: string
          monthly_contribution?: number
          total_interest_earned?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "savings_accounts_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          balance_after: number | null
          created_at: string
          description: string | null
          id: string
          loan_id: string | null
          member_id: string
          processed_by: string | null
          reference_number: string | null
          savings_account_id: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
        }
        Insert: {
          amount: number
          balance_after?: number | null
          created_at?: string
          description?: string | null
          id?: string
          loan_id?: string | null
          member_id: string
          processed_by?: string | null
          reference_number?: string | null
          savings_account_id?: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
        }
        Update: {
          amount?: number
          balance_after?: number | null
          created_at?: string
          description?: string | null
          id?: string
          loan_id?: string | null
          member_id?: string
          processed_by?: string | null
          reference_number?: string | null
          savings_account_id?: string | null
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "transactions_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_savings_account_id_fkey"
            columns: ["savings_account_id"]
            isOneToOne: false
            referencedRelation: "savings_accounts"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_member_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "admin"
        | "accountant"
        | "loan_committee"
        | "management_committee"
        | "chairperson"
        | "member"
      loan_status:
        | "draft"
        | "pending_approval"
        | "approved"
        | "rejected"
        | "disbursed"
        | "repaying"
        | "completed"
        | "defaulted"
      loan_type: "short_term" | "long_term" | "holiday"
      membership_status: "pending" | "active" | "suspended" | "inactive"
      transaction_type:
        | "savings_deposit"
        | "savings_withdrawal"
        | "loan_disbursement"
        | "loan_repayment"
        | "interest_earned"
        | "fee"
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
      app_role: [
        "admin",
        "accountant",
        "loan_committee",
        "management_committee",
        "chairperson",
        "member",
      ],
      loan_status: [
        "draft",
        "pending_approval",
        "approved",
        "rejected",
        "disbursed",
        "repaying",
        "completed",
        "defaulted",
      ],
      loan_type: ["short_term", "long_term", "holiday"],
      membership_status: ["pending", "active", "suspended", "inactive"],
      transaction_type: [
        "savings_deposit",
        "savings_withdrawal",
        "loan_disbursement",
        "loan_repayment",
        "interest_earned",
        "fee",
      ],
    },
  },
} as const
