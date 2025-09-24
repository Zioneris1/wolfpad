// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types';

// This is a definitive fix to bypass the unreliable build-time injection of environment variables.
// Supabase URL and Anon Key are designed to be public. Security is managed by Row Level Security (RLS) in your Supabase dashboard.
const supabaseUrl = 'https://bdxbayuxzybtgwkromzd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkeGJheXV4enlidGd3a3JvbXpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE3MzU4MTgsImV4cCI6MjAzNzMxMTgxOH0.g8ILBfSHxot22LqSKvzfz_z4Qo7FUq2xxw72tB5w-nk';

if (!supabaseUrl || !supabaseKey) {
  // This check is a safeguard for development.
  throw new Error("Supabase URL and Key are missing in lib/supabaseClient.ts");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
