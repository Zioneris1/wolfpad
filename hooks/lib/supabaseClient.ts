// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types';

// In a browser-only environment without a build step, process.env is not available.
// Using the hardcoded values directly to prevent a startup crash.
const supabaseUrl = 'https://bdxbayuxzybtgwkromzd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkeGJheXV4enlidGd3a3JvbXpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MjczMTAsImV4cCI6MjA3NDIwMzMxMH0.dKa4bERYqZD4eJZULDsdXjhZY09fEr27pILKdOlcJM8';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
