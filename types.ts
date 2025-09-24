// types.ts

export type View =
  | 'dashboard'
  | 'goals'
  | 'weekly'
  | 'schedule'
  | 'financials'
  | 'personalDevelopment'
  | 'analytics'
  | 'agents'
  | 'theDen'
  | 'settings';

export interface Task {
  id: string;
  user_id: string;
  name: string;
  description: string;
  completed: boolean;
  due_date?: string;
  created_at: string;
  completed_at?: string;
  impact: number; // 1-10
  effort: number; // 1-5
  tags: string[];
  time_spent: number; // in seconds
  is_tracking: boolean;
  tracking_start_time?: number; // timestamp
  goal_id?: string;
  promoted_to_dashboard: boolean;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  description: string;
  created_at: string;
  type: 'standard'; // for future use
}

export interface GoalWithProgress extends Goal {
  taskCount: number;
  completedTaskCount: number;
  progress: number;
}

export interface ScheduleBlock {
    id: string;
    user_id: string;
    name: string;
    day_of_week: number; // 0 for Sunday, 1 for Monday, etc.
    start_time: string; // "HH:MM"
    end_time: string; // "HH:MM"
    last_completed?: string; // YYYY-MM-DD
}

export interface Transaction {
    id: string;
    user_id: string;
    date: string; // YYYY-MM-DD
    description: string;
    amount: number;
    category: string;
    currency: string;
}

export interface TransactionCategory {
    id: string;
    user_id: string;
    name: string;
    type: 'income' | 'expense';
}

export interface JournalEntry {
    id: string;
    user_id: string;
    created_at: string; // ISO string
    content: string;
}

export interface DevelopmentResource {
    title: string;
    author_or_channel: string;
}

export interface DevelopmentPlan {
    id: string;
    user_id: string;
    goal: string;
    books: DevelopmentResource[];
    youtube_channels: DevelopmentResource[];
    podcasts: DevelopmentResource[];
}

export interface AppContextData {
    tasks: Task[];
    goals: GoalWithProgress[];
    scheduleBlocks: ScheduleBlock[];
    transactions: Transaction[];
    currentView: View;
}

export interface AssistantResponse {
    responseType: 'answer' | 'navigation_suggestion';
    text: string;
    view?: View;
}

export interface ChatMessage {
    id: string;
    sender: 'user' | 'ai';
    text: string;
    navigationSuggestion?: View;
    feedback?: 'up' | 'down';
}

export interface UserProfile {
  id: string;
  user_id: string;
  theme: string;
  language: string;
  // Fix: Add optional currency property to UserProfile type.
  currency?: string;
}

// Fix: Add and export ThemeOption type.
export interface ThemeOption {
  id: string;
  name: string;
  styles: Record<string, string>;
}

// Fix: Add and export SuggestedTaskValues for AI suggestions.
export interface SuggestedTaskValues {
    description: string;
    effort: number;
    impact: number;
    tags: string[];
}

// Fix: Add and export SuggestedTask for AI goal breakdowns.
export interface SuggestedTask {
    name: string;
    description: string;
    effort: number;
    impact: number;
}


// Supabase generated types (simplified for this context)
export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: Task;
        Insert: Omit<Task, 'id' | 'created_at'>;
        Update: Partial<Task>;
      };
      goals: {
        Row: Goal;
        Insert: Omit<Goal, 'id' | 'created_at'>;
        Update: Partial<Goal>;
      };
      schedule_blocks: {
        Row: ScheduleBlock;
        Insert: Omit<ScheduleBlock, 'id'>;
        Update: Partial<ScheduleBlock>;
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, 'id'>;
        Update: Partial<Transaction>;
      };
      transaction_categories: {
        Row: TransactionCategory;
        Insert: Omit<TransactionCategory, 'id'>;
        Update: Partial<TransactionCategory>;
      };
      journal_entries: {
        Row: JournalEntry;
        Insert: Omit<JournalEntry, 'id'>;
        Update: Partial<JournalEntry>;
      };
      development_plans: {
        Row: DevelopmentPlan;
        Insert: Omit<DevelopmentPlan, 'id'>;
        Update: Partial<DevelopmentPlan>;
      };
      user_profiles: {
        Row: UserProfile;
        Insert: Partial<UserProfile>;
        Update: Partial<UserProfile>;
      }
    };
  };
}