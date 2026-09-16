import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    supabaseUrl !== 'https://your-supabase-project.supabase.co' &&
    supabaseAnonKey !== 'your-supabase-anon-key'
  );
};

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  return createClient(supabaseUrl, supabaseAnonKey);
};

export const testSupabaseConnection = async (): Promise<{
  connected: boolean;
  message: string;
  details?: unknown;
}> => {
  if (!isSupabaseConfigured()) {
    return {
      connected: false,
      message: 'Supabase credentials are not configured in environment variables (.env)',
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      connected: false,
      message: 'Failed to initialize Supabase client instance',
    };
  }

  try {
    // Attempt a lightweight query to test PostgreSQL database connection
    const { data, error } = await client.from('medicines').select('count', { count: 'exact', head: true });
    
    if (error) {
      // If table doesn't exist yet or connection error occurs
      return {
        connected: false,
        message: `Supabase database error: ${error.message}`,
        details: error,
      };
    }

    return {
      connected: true,
      message: 'Successfully connected to Supabase PostgreSQL database',
      details: { medicinesCount: data },
    };
  } catch (err: unknown) {
    const error = err as Error;
    return {
      connected: false,
      message: `Supabase connection attempt failed: ${error.message || 'Unknown network error'}`,
    };
  }
};
