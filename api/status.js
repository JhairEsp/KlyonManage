import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // 1. Cabeceras de CORS instantáneas
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // 2. Manejar Preflight (OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 3. Inicializar Supabase dentro para atrapar errores de entorno
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ihodhcdxxzkmhqdbmanm.supabase.co';
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlob2RoY2R4eHprbWhxZGJtYW5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5OTMwMjAsImV4cCI6MjA5MjU2OTAyMH0.oW_EGXkGcNYDYc269FhBsSCMFZd8SooGWoLyrNK1Cg8';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 4. Parsear Body
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { projectId, apiKey, sessions, sales, errors } = body || {};

    // 5. Validaciones básicas
    if (!projectId) return res.status(200).json({ success: false, error: 'No projectId' });
    if (apiKey !== 'eb79ae517cd24ef118c610bdea35dc67d69a8d27378c29dd') {
       return res.status(200).json({ success: false, error: 'Invalid Key' });
    }

    // 6. Intentar guardar en Supabase (con timeout o captura de error)
    try {
      await supabase.from('health_checks').upsert({
        project_id: projectId,
        last_ping: new Date().toISOString(),
        status: 'online'
      }, { onConflict: 'project_id' });

      if (sessions || sales || errors) {
        await supabase.from('metrics').insert([{
          project_id: projectId,
          users: parseInt(sessions || 0),
          sales: parseFloat(sales || 0),
          errors: parseInt(errors || 0)
        }]);
      }
    } catch (dbErr) {
      console.error('DB Error:', dbErr);
    }

    // 7. Obtener Config
    const { data: project } = await supabase
      .from('projects')
      .select('remote_config, status')
      .eq('id', projectId)
      .single();

    // RESPUESTA SIEMPRE 200 PARA EVITAR CORS ERROR
    return res.status(200).json({ 
      v: "KLYON_V4_ULTRA",
      status: project?.status || 'active',
      config: project?.remote_config || { show_popup: false }
    });

  } catch (err) {
    console.error('Global API Error:', err);
    return res.status(200).json({ 
      v: "KLYON_V4_ERROR",
      error: err.message
    });
  }
}
