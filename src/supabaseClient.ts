/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// Get initial values from localStorage falling back to import.meta.env
const getInitialConfig = () => {
  const localUrl = localStorage.getItem('dfw_supabase_url');
  const localKey = localStorage.getItem('dfw_supabase_anon_key');
  
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  
  const url = (localUrl || envUrl || '').trim();
  const key = (localKey || envKey || '').trim();
  
  const isConfigured = !!url && !!key && !url.includes('your-supabase-project');
  return { url, key, isConfigured };
};

const config = getInitialConfig();

export let isSupabaseConfigured = config.isConfigured;
export let supabaseUrl = config.url;
export let supabaseAnonKey = config.key;

export let supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (supabase) {
  // @ts-ignore
  window.client = supabase;
}

// Reinitialization helper
export function reinitializeSupabase(url: string, anonKey: string): boolean {
  const cleanedUrl = (url || '').trim();
  const cleanedKey = (anonKey || '').trim();
  
  if (cleanedUrl && cleanedKey && !cleanedUrl.includes('your-supabase-project')) {
    localStorage.setItem('dfw_supabase_url', cleanedUrl);
    localStorage.setItem('dfw_supabase_anon_key', cleanedKey);
    supabaseUrl = cleanedUrl;
    supabaseAnonKey = cleanedKey;
    isSupabaseConfigured = true;
    supabase = createClient(cleanedUrl, cleanedKey);
    // @ts-ignore
    window.client = supabase;
    return true;
  } else {
    localStorage.removeItem('dfw_supabase_url');
    localStorage.removeItem('dfw_supabase_anon_key');
    supabaseUrl = '';
    supabaseAnonKey = '';
    isSupabaseConfigured = false;
    supabase = null;
    // @ts-ignore
    window.client = null;
    return false;
  }
}

// Helper to handle safe Supabase db actions with try-catch and falling back to localStorage
export async function safeSupabaseAction<T>(
  action: () => Promise<T>,
  fallbackValue: T
): Promise<T> {
  const currentSupabase = supabase;
  if (!isSupabaseConfigured || !currentSupabase) {
    return fallbackValue;
  }
  try {
    return await action();
  } catch (error) {
    console.error('Supabase operation failed:', error);
    return fallbackValue;
  }
}

export function getSupabaseClient() {
  return supabase;
}

export function getIsSupabaseConfigured() {
  return isSupabaseConfigured;
}


