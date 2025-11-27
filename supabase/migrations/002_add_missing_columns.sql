-- PlanPulse Migration: Add missing columns and tables
-- Fixes API/Schema mismatches and adds Caltrans LAPM support

-- ============================================
-- 1. ADD MISSING PROJECT COLUMNS
-- ============================================

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS discipline TEXT,
ADD COLUMN IF NOT EXISTS caltrans_project_number TEXT,
ADD COLUMN IF NOT EXISTS federal_aid_number TEXT,
ADD COLUMN IF NOT EXISTS funding_source TEXT;

-- ============================================
-- 2. CALTRANS LAPM TABLES
-- ============================================

-- Caltrans LAPM Phases (PE, RW, RW-UTIL, CON, CE)
CREATE TABLE IF NOT EXISTS caltrans_phases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  phase TEXT CHECK (phase IN ('PE', 'RW', 'RW-UTIL', 'CON', 'CE')),
  e76_number TEXT,
  e76_date DATE,
  authorization_amount NUMERIC,
  nepa_status TEXT,
  ped_due_date DATE,  -- Project End Date (must invoice within 120 days)
  dbe_goal NUMERIC,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'authorized', 'active', 'closed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LAPM Invoices (Form 5-A format)
CREATE TABLE IF NOT EXISTS caltrans_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phase_id UUID REFERENCES caltrans_phases(id) ON DELETE CASCADE,
  invoice_number TEXT,
  period_start DATE,
  period_end DATE,
  direct_costs NUMERIC DEFAULT 0,
  indirect_costs NUMERIC DEFAULT 0,
  consultant_costs NUMERIC DEFAULT 0,
  amount NUMERIC GENERATED ALWAYS AS (direct_costs + indirect_costs + consultant_costs) STORED,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'paid')),
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Caltrans tables
CREATE INDEX IF NOT EXISTS idx_caltrans_phases_project ON caltrans_phases(project_id);
CREATE INDEX IF NOT EXISTS idx_caltrans_invoices_phase ON caltrans_invoices(phase_id);

-- ============================================
-- 3. ENABLE RLS ON CALTRANS TABLES
-- ============================================

ALTER TABLE caltrans_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE caltrans_invoices ENABLE ROW LEVEL SECURITY;

-- Caltrans phases policies
CREATE POLICY "Users can view phases for their projects"
ON caltrans_phases FOR SELECT
USING (project_id IN (
  SELECT id FROM projects 
  WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
));

CREATE POLICY "Admins and planners can manage phases"
ON caltrans_phases FOR ALL
USING (project_id IN (
  SELECT id FROM projects 
  WHERE organization_id IN (
    SELECT organization_id FROM profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'planner')
  )
));

-- Caltrans invoices policies
CREATE POLICY "Users can view invoices for their phases"
ON caltrans_invoices FOR SELECT
USING (phase_id IN (
  SELECT cp.id FROM caltrans_phases cp
  JOIN projects p ON cp.project_id = p.id
  WHERE p.organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
));

CREATE POLICY "Admins and planners can manage invoices"
ON caltrans_invoices FOR ALL
USING (phase_id IN (
  SELECT cp.id FROM caltrans_phases cp
  JOIN projects p ON cp.project_id = p.id
  WHERE p.organization_id IN (
    SELECT organization_id FROM profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'planner')
  )
));

-- ============================================
-- 4. ADD MISSING RLS POLICIES FOR DATA TABLES
-- ============================================

-- Data layers policies
DO $$ BEGIN
  CREATE POLICY "Users can view data layers in their org"
  ON data_layers FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins and planners can manage data layers"
  ON data_layers FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'planner')
  ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Transit routes policies
DO $$ BEGIN
  CREATE POLICY "Users can view transit routes in their org"
  ON transit_routes FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins and planners can manage transit routes"
  ON transit_routes FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'planner')
  ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Transit stops policies
DO $$ BEGIN
  CREATE POLICY "Users can view transit stops in their org"
  ON transit_stops FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins and planners can manage transit stops"
  ON transit_stops FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'planner')
  ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Transit metrics policies
DO $$ BEGIN
  CREATE POLICY "Users can view transit metrics in their org"
  ON transit_metrics FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins and planners can manage transit metrics"
  ON transit_metrics FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'planner')
  ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Crashes policies
DO $$ BEGIN
  CREATE POLICY "Users can view crashes in their org"
  ON crashes FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins and planners can manage crashes"
  ON crashes FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'planner')
  ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Demographics policies
DO $$ BEGIN
  CREATE POLICY "Users can view demographics in their org"
  ON demographics FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins and planners can manage demographics"
  ON demographics FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'planner')
  ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 5. ADD UPDATED_AT TRIGGER FOR CALTRANS_PHASES
-- ============================================

CREATE TRIGGER update_caltrans_phases_updated_at
  BEFORE UPDATE ON caltrans_phases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

