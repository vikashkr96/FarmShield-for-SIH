import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dykjepfsrndzamkkzcxf.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_K8HRl4YEkhw1hcztFjJ7kA_bWfWg-rT';

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
