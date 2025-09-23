// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types';

// These environment variables should be configured in your deployment environment.
// For local development, you might use a .env file.
const supabaseUrl = process.env.SUPABASE_URL || 'https://bdxbayuxzybtgwkromzd.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkeGJheXV4enlidGd3a3JvbXpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MjczMTAsImV4cCI6MjA3NDIwMzMxMH0.dKa4bERYqZD4eJZULDsdXjhZY09fEr27pILKdOlcJM8';

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL and Key must be provided in environment variables.");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
