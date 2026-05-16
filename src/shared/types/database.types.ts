export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          status: string;
          priority: string;
          due_date: string | null;
          completed_at: string | null;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
          recurrence_template_id: string | null;
          recurrence_date_key: string | null;
          position: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          status?: string;
          priority?: string;
          due_date?: string | null;
          completed_at?: string | null;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
          recurrence_template_id?: string | null;
          recurrence_date_key?: string | null;
          position?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          status?: string;
          priority?: string;
          due_date?: string | null;
          completed_at?: string | null;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
          recurrence_template_id?: string | null;
          recurrence_date_key?: string | null;
          position?: number;
        };
        Relationships: [];
      };
      checklist_items: {
        Row: {
          id: string;
          task_id: string;
          user_id: string;
          title: string;
          is_completed: boolean;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          user_id: string;
          title: string;
          is_completed?: boolean;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          user_id?: string;
          title?: string;
          is_completed?: boolean;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      task_activity_events: {
        Row: {
          id: string;
          task_id: string;
          user_id: string;
          event_type: string;
          from_value: string | null;
          to_value: string | null;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          user_id: string;
          event_type: string;
          from_value?: string | null;
          to_value?: string | null;
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      inbox_items: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          notes: string | null;
          created_at: string;
          converted_task_id: string | null;
          converted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          notes?: string | null;
          created_at?: string;
          converted_task_id?: string | null;
          converted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          notes?: string | null;
          created_at?: string;
          converted_task_id?: string | null;
          converted_at?: string | null;
        };
        Relationships: [];
      };
      recurrence_templates: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          priority: string;
          frequency: string;
          weekly_days: number[] | null;
          monthly_day: number | null;
          lead_time_days: number;
          repeat_interval: number;
          start_date: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          priority?: string;
          frequency: string;
          weekly_days?: number[] | null;
          monthly_day?: number | null;
          lead_time_days?: number;
          repeat_interval?: number;
          start_date: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          priority?: string;
          frequency?: string;
          weekly_days?: number[] | null;
          monthly_day?: number | null;
          lead_time_days?: number;
          repeat_interval?: number;
          start_date?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
