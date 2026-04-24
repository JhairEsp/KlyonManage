import { createClient } from '@supabase/supabase-js';

// Prioridad: 1. Variables de entorno (Vercel) | 2. Tus credenciales directas (Respaldo)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ihodhcdxxzkmhqdbmanm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlob2RoY2R4eHprbWhxZGJtYW5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5OTMwMjAsImV4cCI6MjA5MjU2OTAyMH0.oW_EGXkGcNYDYc269FhBsSCMFZd8SooGWoLyrNK1Cg8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

