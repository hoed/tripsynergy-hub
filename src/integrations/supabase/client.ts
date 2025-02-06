import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xwqicftrjcwgjtcfinik.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cWljZnRyamN3Z2p0Y2ZpbmlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDkxODYsImV4cCI6MjA1MzQyNTE4Nn0.tK8y_3uFIp-_uFn6dWR8oB3X1OQPGaPHf-cHHCyvzn0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token',
    flowType: 'pkce',
    debug: true,
    storage: window.localStorage
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web',
    },
  },
  db: {
    schema: 'public'
  }
});