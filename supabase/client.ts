import { createClient } from '@supabase/supabase-js';

const supabaseUrl = string = process.env.VITE_SUPABASE_URL || ""; // Replace with your Supabase URL
const supabaseKey = string = Process.env.VITE_SUPABASE_ANON_KEY || ""; // Replace with your Supabase API key
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;