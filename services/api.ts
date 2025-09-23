import { supabase } from '../lib/supabaseClient';
import type { Task, Goal, ScheduleBlock, Transaction, TransactionCategory, JournalEntry, DevelopmentPlan, UserProfile } from '../types';

const handleSupabaseError = (error: any, context: string) => {
    if (error) {
        console.error(`Supabase error in ${context}:`, error.message);
        throw new Error(error.message);
    }
};

// --- Task API ---
export const taskApi = {
    getTasks: async (userId: string): Promise<Task[]> => {
        const { data, error } = await supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        handleSupabaseError(error, 'getTasks');
        return data || [];
    },
    createTask: async (taskData: Omit<Task, 'id' | 'created_at' | 'user_id'>, userId: string): Promise<Task> => {
        const { data, error } = await supabase.from('tasks').insert({ ...taskData, user_id: userId }).select().single();
        handleSupabaseError(error, 'createTask');
        return data;
    },
    updateTask: async (id: string, updates: Partial<Omit<Task, 'id' | 'user_id'>>, userId: string): Promise<Task> => {
        const { data, error } = await supabase.from('tasks').update(updates).eq('id', id).eq('user_id', userId).select().single();
        handleSupabaseError(error, 'updateTask');
        return data;
    },
    deleteTask: async (id: string, userId: string): Promise<void> => {
        const { error } = await supabase.from('tasks').delete().eq('id', id).eq('user_id', userId);
        handleSupabaseError(error, 'deleteTask');
    },
    updateMultipleTasks: async (updates: { id: string, data: Partial<Omit<Task, 'id'>> }[], userId: string): Promise<Task[]> => {
        const { data, error } = await supabase.from('tasks').upsert(updates.map(u => ({...u.data, id: u.id, user_id: userId}))).select();
        handleSupabaseError(error, 'updateMultipleTasks');
        return data;
    },
    deleteMultipleTasks: async (ids: string[], userId: string): Promise<void> => {
        const { error } = await supabase.from('tasks').delete().in('id', ids).eq('user_id', userId);
        handleSupabaseError(error, 'deleteMultipleTasks');
    },
};

// --- Goal API ---
export const goalApi = {
    getGoals: async (userId: string): Promise<Goal[]> => {
        const { data, error } = await supabase.from('goals').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        handleSupabaseError(error, 'getGoals');
        return data || [];
    },
    createGoal: async (goalData: Omit<Goal, 'id' | 'created_at' | 'user_id'>, userId: string): Promise<Goal> => {
        const { data, error } = await supabase.from('goals').insert({ ...goalData, user_id: userId }).select().single();
        handleSupabaseError(error, 'createGoal');
        return data;
    },
    updateGoal: async (id: string, updates: Partial<Omit<Goal, 'id' | 'user_id'>>, userId: string): Promise<Goal> => {
        const { data, error } = await supabase.from('goals').update(updates).eq('id', id).eq('user_id', userId).select().single();
        handleSupabaseError(error, 'updateGoal');
        return data;
    },
    deleteGoal: async (id: string, userId: string): Promise<void> => {
        const { error } = await supabase.from('goals').delete().eq('id', id).eq('user_id', userId);
        handleSupabaseError(error, 'deleteGoal');
    },
};

// --- Schedule API ---
export const scheduleApi = {
    getBlocks: async (userId: string): Promise<ScheduleBlock[]> => {
        const { data, error } = await supabase.from('schedule_blocks').select('*').eq('user_id', userId).order('day_of_week').order('start_time');
        handleSupabaseError(error, 'getScheduleBlocks');
        return data || [];
    },
    addBlock: async (blockData: Omit<ScheduleBlock, 'id' | 'user_id'>, userId: string): Promise<ScheduleBlock> => {
        const { data, error } = await supabase.from('schedule_blocks').insert({ ...blockData, user_id: userId }).select().single();
        handleSupabaseError(error, 'addScheduleBlock');
        return data;
    },
    deleteBlock: async (id: string, userId: string): Promise<void> => {
        const { error } = await supabase.from('schedule_blocks').delete().eq('id', id).eq('user_id', userId);
        handleSupabaseError(error, 'deleteScheduleBlock');
    },
    updateBlock: async (id: string, updates: Partial<Omit<ScheduleBlock, 'id' | 'user_id'>>, userId: string): Promise<ScheduleBlock> => {
        const { data, error } = await supabase.from('schedule_blocks').update(updates).eq('id', id).eq('user_id', userId).select().single();
        handleSupabaseError(error, 'updateScheduleBlock');
        return data;
    }
};

// --- Money API ---
export const moneyApi = {
    getTransactions: async (userId: string): Promise<Transaction[]> => {
        const { data, error } = await supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false });
        handleSupabaseError(error, 'getTransactions');
        return data || [];
    },
    addTransaction: async (transactionData: Omit<Transaction, 'id' | 'user_id'>, userId: string): Promise<Transaction> => {
        const { data, error } = await supabase.from('transactions').insert({ ...transactionData, user_id: userId }).select().single();
        handleSupabaseError(error, 'addTransaction');
        return data;
    },
    deleteTransaction: async (id: string, userId: string): Promise<void> => {
        const { error } = await supabase.from('transactions').delete().eq('id', id).eq('user_id', userId);
        handleSupabaseError(error, 'deleteTransaction');
    },
    getCategories: async (userId: string): Promise<TransactionCategory[]> => {
        const { data, error } = await supabase.from('transaction_categories').select('*').eq('user_id', userId);
        handleSupabaseError(error, 'getTransactionCategories');
        return data || [];
    }
};

// --- Journal API ---
export const journalApi = {
    getEntries: async (userId: string): Promise<JournalEntry[]> => {
        const { data, error } = await supabase.from('journal_entries').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        handleSupabaseError(error, 'getJournalEntries');
        return data || [];
    },
    addEntry: async (entryData: Omit<JournalEntry, 'id' | 'user_id'>, userId: string): Promise<JournalEntry> => {
        const { data, error } = await supabase.from('journal_entries').insert({ ...entryData, user_id: userId }).select().single();
        handleSupabaseError(error, 'addJournalEntry');
        return data;
    },
    updateEntry: async (id: string, updates: Partial<Omit<JournalEntry, 'id' | 'user_id'>>, userId: string): Promise<JournalEntry> => {
        const { data, error } = await supabase.from('journal_entries').update(updates).eq('id', id).eq('user_id', userId).select().single();
        handleSupabaseError(error, 'updateJournalEntry');
        return data;
    },
    deleteEntry: async (id: string, userId: string): Promise<void> => {
        const { error } = await supabase.from('journal_entries').delete().eq('id', id).eq('user_id', userId);
        handleSupabaseError(error, 'deleteJournalEntry');
    }
};

// --- Personal Development API ---
export const devPlanApi = {
    getPlans: async (userId: string): Promise<DevelopmentPlan[]> => {
        const { data, error } = await supabase.from('development_plans').select('*').eq('user_id', userId);
        handleSupabaseError(error, 'getDevPlans');
        return data || [];
    },
    createPlan: async (planData: Omit<DevelopmentPlan, 'id' | 'user_id'>, userId: string): Promise<DevelopmentPlan> => {
        const { data, error } = await supabase.from('development_plans').insert({ ...planData, user_id: userId }).select().single();
        handleSupabaseError(error, 'createDevPlan');
        return data;
    },
    updatePlan: async (id: string, updates: Partial<Omit<DevelopmentPlan, 'id' | 'user_id'>>, userId: string): Promise<DevelopmentPlan> => {
        const { data, error } = await supabase.from('development_plans').update(updates).eq('id', id).eq('user_id', userId).select().single();
        handleSupabaseError(error, 'updateDevPlan');
        return data;
    },
    deletePlan: async (id: string, userId: string): Promise<void> => {
        const { error } = await supabase.from('development_plans').delete().eq('id', id).eq('user_id', userId);
        handleSupabaseError(error, 'deleteDevPlan');
    }
};

// --- User Profile API (for settings) ---
export const profileApi = {
    getProfile: async (userId: string): Promise<UserProfile | null> => {
        const { data, error } = await supabase.from('user_profiles').select('*').eq('user_id', userId).single();
        if (error && error.code !== 'PGRST116') { // Ignore 'exact one row' error for new users
            handleSupabaseError(error, 'getProfile');
        }
        return data;
    },
    updateProfile: async (userId: string, updates: Partial<Omit<UserProfile, 'id' | 'user_id'>>): Promise<UserProfile> => {
        const { data, error } = await supabase.from('user_profiles').upsert({ user_id: userId, ...updates }).select().single();
        handleSupabaseError(error, 'updateProfile');
        return data;
    }
};