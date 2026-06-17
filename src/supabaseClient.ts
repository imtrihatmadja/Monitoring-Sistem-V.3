/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey && !supabaseUrl.includes('your-supabase-project');

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (supabase) {
  // @ts-ignore
  window.client = supabase;
}

// Helper to handle safe Supabase db actions with try-catch and falling back to localStorage
export async function safeSupabaseAction<T>(
  action: () => Promise<T>,
  fallbackValue: T
): Promise<T> {
  if (!isSupabaseConfigured || !supabase) {
    return fallbackValue;
  }
  try {
    return await action();
  } catch (error) {
    console.error('Supabase operation failed:', error);
    return fallbackValue;
  }
}
