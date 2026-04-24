import { createClient } from '@supabase/supabase-js';

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

    if (apiKey !== 'eb79ae517cd24ef118c610bdea35dc67d69a8d27378c29dd') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // 📡 LOG
    console.log('📡 Heartbeat recibido:', {
      projectId,
      time: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      message: 'Heartbeat OK'
    });

  } catch (error) {
    console.error('❌ ERROR REAL:', error);

    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}
