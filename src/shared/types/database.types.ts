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
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
