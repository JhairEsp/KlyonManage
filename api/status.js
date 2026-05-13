import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {

    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );

    const body =
      typeof req.body === 'string'
        ? JSON.parse(req.body)
        : req.body;

    const {
      projectId,
      apiKey,
      sessions,
      sales,
      errors
    } = body || {};

    // VALIDAR DATOS
    if (!projectId || !apiKey) {
      return res.status(200).json({
        success: false,
        error: 'Missing credentials'
      });
    }

    // 🔥 VALIDAR EN BASE DE DATOS
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('api_key', apiKey)
      .single();

    if (projectError || !project) {
      return res.status(200).json({
        success: false,
        error: 'Invalid Key'
      });
    }

    // HEARTBEAT
    await supabase
      .from('health_checks')
      .upsert({
        project_id: projectId,
        last_ping: new Date().toISOString(),
        status: 'online'
      }, {
        onConflict: 'project_id'
      });

    // MÉTRICAS
    await supabase
      .from('metrics')
      .insert([{
        project_id: projectId,
        users: parseInt(sessions || 0),
        sales: parseFloat(sales || 0),
        errors: parseInt(errors || 0)
      }]);

    // RESPUESTA
    return res.status(200).json({
      success: true,
      version: 'KLYON_V5',
      project: project.name,
      status: project.status,
      config: project.remote_config || {}
    });

  } catch (err) {

    console.error(err);

    return res.status(200).json({
      success: false,
      error: err.message
    });

  }
}
