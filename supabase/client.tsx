import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xwqicftrjcwgjtcfinik.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cWljZnRyamN3Z2p0Y2ZpbmlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDkxODYsImV4cCI6MjA1MzQyNTE4Nn0.tK8y_3uFIp-_uFn6dWR8oB3X1OQPGaPHf-cHHCyvzn0'; // Replace with your Supabase API key
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;