-- SQL Schema for Supabase

-- 1. Projects Table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('web', 'system_web', 'system_app', 'university')) NOT NULL,
  url TEXT,
  admin_url TEXT,
  api_key TEXT DEFAULT encode(gen_random_bytes(24), 'hex') UNIQUE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Subscriptions Table
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  price DECIMAL(10, 2) NOT NULL,
  billing_cycle TEXT DEFAULT 'monthly',
  start_date DATE DEFAULT CURRENT_DATE,
  next_payment_date DATE NOT NULL,
  grace_days INTEGER DEFAULT 3,
  is_paid BOOLEAN DEFAULT true
);

-- 3. Health Checks Table
CREATE TABLE health_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  last_ping TIMESTAMPTZ DEFAULT now(),
  status TEXT CHECK (status IN ('online', 'offline'))
);

-- 4. Metrics Table
CREATE TABLE metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  users INTEGER DEFAULT 0,
  sales DECIMAL(10, 2) DEFAULT 0,
  errors INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Realtime for health checks
ALTER PUBLICATION supabase_realtime ADD TABLE health_checks;
ALTER PUBLICATION supabase_realtime ADD TABLE metrics;
