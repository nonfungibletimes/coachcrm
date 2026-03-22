-- Additional feature tables for CoachCRM growth features

CREATE TABLE IF NOT EXISTS progress_report_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS session_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  duration_minutes INT DEFAULT 60,
  notes_template TEXT,
  homework_template JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS client_portal_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE progress_report_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_portal_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shares_by_coach" ON progress_report_shares
  FOR ALL USING (client_id IN (SELECT id FROM clients WHERE coach_id = auth.uid()))
  WITH CHECK (client_id IN (SELECT id FROM clients WHERE coach_id = auth.uid()));

CREATE POLICY "templates_by_coach" ON session_templates
  FOR ALL USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

CREATE POLICY "portal_tokens_by_coach" ON client_portal_tokens
  FOR ALL USING (client_id IN (SELECT id FROM clients WHERE coach_id = auth.uid()))
  WITH CHECK (client_id IN (SELECT id FROM clients WHERE coach_id = auth.uid()));
