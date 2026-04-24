# Guía de Integración Klyon

Para conectar tus aplicaciones externas y monitorear su estado y métricas, utiliza los siguientes métodos.

## 1. Heartbeat (Monitoreo de Estado)

Agrega este código en tu aplicación (ej. un Cron Job o un Middleware) para notificar que el sistema está en línea.

```javascript
// Ejemplo en Node.js / Next.js
const sendHeartbeat = async () => {
  try {
    await fetch('https://tu-klyon-app.com/api/heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: 'TU_PROJECT_ID',
        apiKey: 'TU_API_KEY'
      })
    });
  } catch (error) {
    console.error('Error enviando heartbeat', error);
  }
};

// Ejecutar cada 1 minuto
setInterval(sendHeartbeat, 60000);
```

## 2. Envío de Métricas

Para registrar actividad como ventas o errores:

```javascript
const reportMetrics = async (data) => {
  await fetch('https://tu-klyon-app.com/api/metrics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      projectId: 'TU_PROJECT_ID',
      apiKey: 'TU_API_KEY',
      users: data.users,
      sales: data.sales,
      errors: data.errors
    })
  });
};
```

## 3. Lógica de Backend (Next.js App Router)

Si decides migrar este Dashboard a Next.js para tener el Backend integrado, aquí tienes el ejemplo del endpoint:

```typescript
// app/api/heartbeat/route.ts
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  const { projectId, apiKey } = await req.json();

  // 1. Validar API Key
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('api_key', apiKey)
    .single();

  if (!project) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // 2. Registrar Ping
  await supabase.from('health_checks').upsert({
    project_id: projectId,
    last_ping: new Date().toISOString(),
    status: 'online'
  });

  return Response.json({ success: true });
}
```

## 4. Estructura de Base de Datos Recomendada

Asegúrate de ejecutar el script `supabase_schema.sql` en tu consola de SQL de Supabase para crear todas las tablas necesarias.
