import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL || 'https://hypgevncuxfkujuhhhov.supabase.co';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5cGdldm5jdXhma3VqdWhoaG92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3NDE5MTAsImV4cCI6MjEwMTMxNzkxMH0.WGsBEY-dbB_N1jGvASJeW6zrkPb3b0HzvgCn_Y36BPU';

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
