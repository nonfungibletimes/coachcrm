-- CoachCRM Initial Schema
-- Run this in your Supabase SQL editor

-- ============================================
-- COACHES (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS coaches (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  coaching_niche TEXT,
  avatar_url TEXT,
  stripe_customer_id TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'agency')),
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CLIENTS
-- ============================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  package TEXT,
  goals JSONB DEFAULT '[]',
  notes TEXT,
  started_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clients_coach_id ON clients(coach_id);
CREATE INDEX idx_clients_status ON clients(status);

-- ============================================
-- SESSIONS
-- ============================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT DEFAULT 60,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no-show')),
  template TEXT CHECK (template IN ('discovery', 'strategy', 'accountability', 'custom')),
  notes TEXT,
  wins TEXT,
  blocks TEXT,
  homework JSONB DEFAULT '[]',
  recap_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_coach_id ON sessions(coach_id);
CREATE INDEX idx_sessions_client_id ON sessions(client_id);
CREATE INDEX idx_sessions_scheduled_at ON sessions(scheduled_at);

-- ============================================
-- CHECK-INS
-- ============================================
CREATE TABLE IF NOT EXISTS check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'responded')),
  message TEXT,
  response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_check_ins_coach_id ON check_ins(coach_id);
CREATE INDEX idx_check_ins_client_id ON check_ins(client_id);

-- ============================================
-- PROGRESS SNAPSHOTS
-- ============================================
CREATE TABLE IF NOT EXISTS progress_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  week_of DATE NOT NULL,
  sessions_completed INT DEFAULT 0,
  homework_completion_pct DECIMAL DEFAULT 0,
  coach_notes TEXT,
  client_mood TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_progress_snapshots_client_id ON progress_snapshots(client_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_snapshots ENABLE ROW LEVEL SECURITY;

-- Coaches: only read/write own row
CREATE POLICY "coaches_self" ON coaches
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Clients: coach owns their clients
CREATE POLICY "clients_by_coach" ON clients
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

-- Sessions: coach owns their sessions
CREATE POLICY "sessions_by_coach" ON sessions
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

-- Check-ins: coach owns their check-ins
CREATE POLICY "check_ins_by_coach" ON check_ins
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

-- Progress snapshots: through clients (coach owns client)
CREATE POLICY "progress_snapshots_by_client" ON progress_snapshots
  USING (
    client_id IN (
      SELECT id FROM clients WHERE coach_id = auth.uid()
    )
  );

-- ============================================
-- AUTO-CREATE COACH PROFILE ON SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.coaches (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
