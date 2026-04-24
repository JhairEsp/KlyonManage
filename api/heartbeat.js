import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase para el Backend
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ihodhcdxxzkmhqdbmanm.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlob2RoY2R4eHprbWhxZGJtYW5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5OTMwMjAsImV4cCI6MjA5MjU2OTAyMH0.oW_EGXkGcNYDYc269FhBsSCMFZd8SooGWoLyrNK1Cg8';
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
    // 🔥 PARSEO SEGURO
    const body = typeof req.body === 'string'
      ? JSON.parse(req.body)
      : req.body;

    const projectId = body?.projectId;
    const apiKey = body?.apiKey;

    // 🔐 VALIDACIÓN
    if (!projectId || !apiKey) {
      return res.status(400).json({ error: 'Missing data' });
    }

    // Aquí usamos la clave que tú definiste
    if (apiKey !== 'eb79ae517cd24ef118c610bdea35dc67d69a8d27378c29dd') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // 📡 ACTUALIZACIÓN EN BASE DE DATOS (Esto es lo que faltaba para que se vea Online)
    const { error: dbError } = await supabase
      .from('health_checks')
      .upsert({
        project_id: projectId,
        last_ping: new Date().toISOString(),
        status: 'online'
      }, { onConflict: 'project_id' });

    if (dbError) {
      console.error('❌ Error guardando en DB:', dbError);
      throw dbError;
    }

    // 📡 LOG
    console.log('📡 Heartbeat recibido y guardado:', {
      projectId,
      time: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      message: 'Heartbeat OK - Proyecto Online'
    });

  } catch (error) {
    console.error('❌ ERROR REAL:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}
