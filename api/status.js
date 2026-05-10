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
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ouziqhknofdyvkbvumex.supabase.co';
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91emlxaGtub2ZkeXZrYnZ1bWV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzODQ1MTcsImV4cCI6MjA5Mzk2MDUxN30.iE0w8BMH5VgfK7btISKv7RPA5w2-alkxDrUBGCQMbQc';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 4. Parsear Body
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { projectId, apiKey, sessions, sales, errors } = body || {};

    // 5. Validaciones básicas
    if (!projectId) return res.status(200).json({ success: false, error: 'No projectId' });
    if (apiKey !== 'e463a3d76c45635e547811396d5635e3ad6643b22f91ece5') {
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
