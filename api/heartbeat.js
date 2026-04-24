const { createClient } = require('@supabase/supabase-js');

// 🔐 CONFIG
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ihodhcdxxzkmhqdbmanm.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'TU_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
  // ✅ CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // ✅ Preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string'
      ? JSON.parse(req.body)
      : req.body;

    const { projectId, apiKey } = body;

    if (!projectId || !apiKey) {
      return res.status(400).json({ error: 'Missing data' });
    }

    if (apiKey !== 'eb79ae517cd24ef118c610bdea35dc67d69a8d27378c29dd') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // 🔥 GUARDAR EN SUPABASE
    const { error } = await supabase
      .from('health_checks')
      .upsert({
        project_id: projectId,
        last_ping: new Date().toISOString(),
        status: 'online'
      }, { onConflict: 'project_id' });

    if (error) {
      console.error('❌ DB ERROR:', error);
      throw error;
    }

    console.log('📡 Guardado en DB:', projectId);

    return res.status(200).json({
      success: true,
      message: 'Heartbeat guardado'
    });

  } catch (error) {
    console.error('❌ ERROR:', error);

    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}
