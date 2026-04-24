import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ihodhcdxxzkmhqdbmanm.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlob2RoY2R4eHprbWhxZGJtYW5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5OTMwMjAsImV4cCI6MjA5MjU2OTAyMH0.oW_EGXkGcNYDYc269FhBsSCMFZd8SooGWoLyrNK1Cg8';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
  // ✅ CONFIGURACIÓN TOTAL DE CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // Permitir cualquier origen
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Responder a la verificación Preflight (OPTIONS)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parseo del body
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { projectId, apiKey, sessions, sales, errors } = body;

    if (!projectId || !apiKey) {
      return res.status(400).json({ error: 'Missing projectId or apiKey' });
    }

    // Validación de tu clave fija
    if (apiKey !== 'eb79ae517cd24ef118c610bdea35dc67d69a8d27378c29dd') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // 📡 GUARDAR EN SUPABASE
    // Nota: He mapeado 'sessions' a 'users' que es como se llama tu columna en la DB
    const { error: dbError } = await supabase
      .from('metrics')
      .insert([{
        project_id: projectId,
        users: sessions || 0,
        sales: sales || 0,
        errors: errors || 0
      }]);

    if (dbError) throw dbError;

    return res.status(200).json({ success: true, message: 'Metrics saved' });
  } catch (error) {
    console.error('❌ Error API Metrics:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
