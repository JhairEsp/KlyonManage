import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ouziqhknofdyvkbvumex.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91emlxaGtub2ZkeXZrYnZ1bWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzODQ1MTcsImV4cCI6MjA5Mzk2MDUxN30.iE0w8BMH5VgfK7btISKv7RPA5w2-alkxDrUBGCQMbQc';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { projectId, apiKey } = body;

    if (!projectId || !apiKey) return res.status(400).json({ error: 'Missing data' });

    // Tu clave de validación
    if (apiKey !== 'e463a3d76c45635e547811396d5635e3ad6643b22f91ece5') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Insertar o Actualizar
    const { error } = await supabase
      .from('health_checks')
      .upsert({
        project_id: projectId,
        last_ping: new Date().toISOString(),
        status: 'online'
      }, { onConflict: 'project_id' });

    if (error) throw error;

    return res.status(200).json({ success: true, message: 'Online' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
