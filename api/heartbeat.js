import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase para el Backend (Node.js)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ihodhcdxxzkmhqdbmanm.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlob2RoY2R4eHprbWhxZGJtYW5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5OTMwMjAsImV4cCI6MjA5MjU2OTAyMH0.oW_EGXkGcNYDYc269FhBsSCMFZd8SooGWoLyrNK1Cg8';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
  // ✅ Configuración de CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { projectId, apiKey } = req.body;

    if (!projectId || !apiKey) {
      return res.status(400).json({ error: 'Missing projectId or apiKey' });
    }

    // 🔐 VALIDACIÓN DINÁMICA: Buscamos el proyecto en TU Supabase
    const { data: project, error: authError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('api_key', apiKey)
      .single();

    if (authError || !project) {
      return res.status(401).json({ error: 'Unauthorized: Invalid Project ID or API Key' });
    }

    // 📡 ACTUALIZACIÓN: Registramos el estado online y el último ping
    const { error: updateError } = await supabase
      .from('health_checks')
      .upsert({
        project_id: projectId,
        last_ping: new Date().toISOString(),
        status: 'online'
      }, { onConflict: 'project_id' });

    if (updateError) throw updateError;

    console.log(`📡 Heartbeat exitoso para: ${projectId}`);

    return res.status(200).json({
      success: true,
      message: 'Status updated to online'
    });

  } catch (error) {
    console.error('Error en heartbeat:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
