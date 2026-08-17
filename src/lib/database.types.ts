import type { HabitValues } from "@/lib/habits";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      daily_entries: {
        Row: {
          id: string;
          user_id: string;
          entry_date: string;
          habit_values: HabitValues;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          entry_date: string;
          habit_values?: HabitValues;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          habit_values?: HabitValues;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};

export type DailyEntry = Database["public"]["Tables"]["daily_entries"]["Row"];
