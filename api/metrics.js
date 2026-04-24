import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ihodhcdxxzkmhqdbmanm.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlob2RoY2R4eHprbWhxZGJtYW5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5OTMwMjAsImV4cCI6MjA5MjU2OTAyMH0.oW_EGXkGcNYDYc269FhBsSCMFZd8SooGWoLyrNK1Cg8';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
  // Cabeceras obligatorias para evitar el bloqueo de CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { projectId, apiKey, sessions, sales, errors } = body;

    // Validación de seguridad idéntica a heartbeat
    if (apiKey !== 'eb79ae517cd24ef118c610bdea35dc67d69a8d27378c29dd') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Insertar métricas asegurando tipos de datos correctos
    const { error } = await supabase
      .from('metrics')
      .insert([{
        project_id: projectId,
        users: parseInt(sessions || 0) || 1, // Si es 0 o null, ponemos 1
        sales: parseFloat(sales || 0),
        errors: parseInt(errors || 0)
      }]);

    if (error) throw error;

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Metrics Error:', error.message);
    // IMPORTANTE: Devolvemos 200 aunque falle la DB para que el navegador no de error de CORS
    // Pero el error saldrá en los logs de Vercel.
    return res.status(200).json({ success: false, error: error.message });
  }
}
