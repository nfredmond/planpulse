-- PlanPulse Database Schema
-- Run this migration in your new Supabase project

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================
-- ORGANIZATIONS & USERS
-- ============================================

-- Organizations (agencies, consulting firms, MPOs, RTPAs)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('agency', 'consultant', 'mpo', 'rtpa', 'city', 'county', 'other')),
  slug TEXT UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}',
  logo_url TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('admin', 'planner', 'viewer')) DEFAULT 'planner',
  title TEXT,
  phone TEXT,
  settings JSONB DEFAULT '{}',
  custom_ai_instructions TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROJECTS & PLANS
-- ============================================

-- Projects (plans, programs, studies)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN (
    'general_plan', 'rtp', 'atpp', 'complete_streets', 
    'transit_plan', 'trail_plan', 'safety_plan', 'climate_action',
    'corridor_study', 'srts', 'lrsp', 'program', 'other'
  )),
  status TEXT CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'archived')) DEFAULT 'planning',
  description TEXT,
  client_name TEXT,
  budget NUMERIC,
  spent NUMERIC DEFAULT 0,
  start_date DATE,
  end_date DATE,
  geometry GEOMETRY(MultiPolygon, 4326),
  center_lat NUMERIC,
  center_lng NUMERIC,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project tasks
CREATE TABLE project_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('todo', 'in_progress', 'review', 'completed')) DEFAULT 'todo',
  assignee_id UUID REFERENCES profiles(id),
  due_date DATE,
  sort_order INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project documents
CREATE TABLE project_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- GRANTS
-- ============================================

-- Grant programs (ATP, HSIP, CMAQ, etc.)
CREATE TABLE grant_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  agency TEXT,
  description TEXT,
  typical_range_min NUMERIC,
  typical_range_max NUMERIC,
  match_required NUMERIC,
  eligible_applicants TEXT[],
  eligible_projects TEXT[],
  cycle_frequency TEXT,
  url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grant deadlines (recurring or one-time)
CREATE TABLE grant_deadlines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grant_program_id UUID REFERENCES grant_programs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  deadline_date DATE NOT NULL,
  description TEXT,
  is_recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grant applications
CREATE TABLE grant_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  project_id UUID REFERENCES projects(id),
  grant_program_id UUID REFERENCES grant_programs(id),
  name TEXT NOT NULL,
  description TEXT,
  amount_requested NUMERIC,
  match_amount NUMERIC,
  match_source TEXT,
  status TEXT CHECK (status IN ('drafting', 'submitted', 'under_review', 'awarded', 'denied', 'withdrawn')) DEFAULT 'drafting',
  deadline DATE,
  submitted_at TIMESTAMPTZ,
  decision_date DATE,
  amount_awarded NUMERIC,
  notes TEXT,
  score NUMERIC,
  feedback TEXT,
  documents JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- COMMUNITY ENGAGEMENT
-- ============================================

-- Engagement projects (community input campaigns)
CREATE TABLE engagement_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  project_id UUID REFERENCES projects(id),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('draft', 'active', 'closed', 'archived')) DEFAULT 'draft',
  start_date DATE,
  end_date DATE,
  center_lat NUMERIC DEFAULT 38.5816,
  center_lng NUMERIC DEFAULT -121.4944,
  zoom_level INTEGER DEFAULT 13,
  bounds GEOMETRY(Polygon, 4326),
  base_map_style TEXT DEFAULT 'streets',
  allowed_input_types TEXT[] DEFAULT ARRAY['pin', 'line', 'polygon', 'comment'],
  categories TEXT[] DEFAULT ARRAY['safety', 'infrastructure', 'accessibility', 'other'],
  require_email BOOLEAN DEFAULT false,
  moderation_enabled BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  embed_code TEXT,
  public_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community inputs (pins, comments, drawings)
CREATE TABLE community_inputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  engagement_id UUID REFERENCES engagement_projects(id) ON DELETE CASCADE,
  input_type TEXT CHECK (input_type IN ('pin', 'line', 'polygon', 'comment')) NOT NULL,
  geometry GEOMETRY(Geometry, 4326),
  category TEXT,
  title TEXT,
  content TEXT,
  sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral', 'suggestion')),
  photo_urls TEXT[],
  upvotes INTEGER DEFAULT 0,
  submitter_email TEXT,
  submitter_name TEXT,
  session_id TEXT,
  metadata JSONB DEFAULT '{}',
  moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'hidden', 'flagged')),
  moderated_by UUID REFERENCES profiles(id),
  moderated_at TIMESTAMPTZ,
  ai_summary TEXT,
  ai_themes TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Upvotes tracking (prevents duplicate votes)
CREATE TABLE input_upvotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  input_id UUID REFERENCES community_inputs(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(input_id, session_id)
);

-- ============================================
-- DATA LAYERS & ANALYTICS
-- ============================================

-- Imported data layers (transit, safety, demographics)
CREATE TABLE data_layers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN (
    'transit_routes', 'transit_stops', 'crashes', 'demographics', 
    'trails', 'bike_facilities', 'sidewalks', 'crosswalks',
    'census_tracts', 'equity_areas', 'custom'
  )),
  source TEXT,
  source_url TEXT,
  geometry_type TEXT,
  style JSONB DEFAULT '{}',
  data JSONB,
  geojson JSONB,
  is_visible BOOLEAN DEFAULT true,
  last_updated TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transit routes
CREATE TABLE transit_routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  route_id TEXT NOT NULL,
  route_short_name TEXT,
  route_long_name TEXT,
  route_type INTEGER,
  route_color TEXT,
  route_text_color TEXT,
  agency_name TEXT,
  geometry GEOMETRY(MultiLineString, 4326),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, route_id)
);

-- Transit stops
CREATE TABLE transit_stops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  stop_id TEXT NOT NULL,
  stop_name TEXT,
  stop_lat NUMERIC,
  stop_lon NUMERIC,
  geometry GEOMETRY(Point, 4326),
  wheelchair_boarding INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, stop_id)
);

-- Transit performance metrics
CREATE TABLE transit_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  route_id TEXT,
  route_name TEXT,
  date DATE,
  ridership INTEGER,
  revenue_hours NUMERIC,
  revenue_miles NUMERIC,
  operating_cost NUMERIC,
  fare_revenue NUMERIC,
  on_time_performance NUMERIC,
  passengers_per_hour NUMERIC,
  cost_per_passenger NUMERIC,
  farebox_recovery NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crash/collision data
CREATE TABLE crashes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  case_id TEXT,
  collision_date DATE,
  collision_time TIME,
  geometry GEOMETRY(Point, 4326),
  latitude NUMERIC,
  longitude NUMERIC,
  severity TEXT CHECK (severity IN ('fatal', 'severe_injury', 'visible_injury', 'complaint_of_pain', 'property_damage_only')),
  parties_involved INTEGER,
  pedestrian_involved BOOLEAN DEFAULT false,
  bicyclist_involved BOOLEAN DEFAULT false,
  motorcycle_involved BOOLEAN DEFAULT false,
  primary_factor TEXT,
  road_condition TEXT,
  weather TEXT,
  lighting TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Demographics data by geography
CREATE TABLE demographics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  geography_type TEXT CHECK (geography_type IN ('census_tract', 'block_group', 'place', 'county', 'custom')),
  geography_id TEXT,
  geography_name TEXT,
  geometry GEOMETRY(MultiPolygon, 4326),
  year INTEGER,
  total_population INTEGER,
  median_household_income NUMERIC,
  percent_below_poverty NUMERIC,
  percent_minority NUMERIC,
  percent_limited_english NUMERIC,
  percent_zero_vehicle_hh NUMERIC,
  percent_senior NUMERIC,
  percent_disabled NUMERIC,
  is_disadvantaged_community BOOLEAN,
  calenviroscreen_score NUMERIC,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AI CONVERSATIONS
-- ============================================

-- AI chat conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  project_id UUID REFERENCES projects(id),
  title TEXT DEFAULT 'New Conversation',
  context_type TEXT CHECK (context_type IN ('general', 'project', 'grant', 'data', 'engagement')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant', 'system')) NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_profiles_organization ON profiles(organization_id);
CREATE INDEX idx_projects_organization ON projects(organization_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_project_tasks_project ON project_tasks(project_id);
CREATE INDEX idx_grant_applications_organization ON grant_applications(organization_id);
CREATE INDEX idx_grant_applications_status ON grant_applications(status);
CREATE INDEX idx_engagement_projects_organization ON engagement_projects(organization_id);
CREATE INDEX idx_engagement_projects_status ON engagement_projects(status);
CREATE INDEX idx_community_inputs_engagement ON community_inputs(engagement_id);
CREATE INDEX idx_community_inputs_moderation ON community_inputs(moderation_status);
CREATE INDEX idx_transit_metrics_organization ON transit_metrics(organization_id);
CREATE INDEX idx_crashes_organization ON crashes(organization_id);
CREATE INDEX idx_crashes_date ON crashes(collision_date);
CREATE INDEX idx_conversations_user ON conversations(user_id);

-- Spatial indexes
CREATE INDEX idx_projects_geometry ON projects USING GIST(geometry);
CREATE INDEX idx_community_inputs_geometry ON community_inputs USING GIST(geometry);
CREATE INDEX idx_transit_routes_geometry ON transit_routes USING GIST(geometry);
CREATE INDEX idx_transit_stops_geometry ON transit_stops USING GIST(geometry);
CREATE INDEX idx_crashes_geometry ON crashes USING GIST(geometry);
CREATE INDEX idx_demographics_geometry ON demographics USING GIST(geometry);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_layers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transit_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transit_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE transit_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE crashes ENABLE ROW LEVEL SECURITY;
ALTER TABLE demographics ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Organization policies
CREATE POLICY "Users can view their organization"
ON organizations FOR SELECT
USING (id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Profile policies
CREATE POLICY "Users can view profiles in their organization"
ON profiles FOR SELECT
USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (id = auth.uid());

-- Project policies
CREATE POLICY "Users can view projects in their organization"
ON projects FOR SELECT
USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admins and planners can manage projects"
ON projects FOR ALL
USING (organization_id IN (
  SELECT organization_id FROM profiles 
  WHERE id = auth.uid() AND role IN ('admin', 'planner')
));

-- Grant application policies
CREATE POLICY "Users can view grant applications in their organization"
ON grant_applications FOR SELECT
USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admins and planners can manage grant applications"
ON grant_applications FOR ALL
USING (organization_id IN (
  SELECT organization_id FROM profiles 
  WHERE id = auth.uid() AND role IN ('admin', 'planner')
));

-- Engagement project policies
CREATE POLICY "Users can view engagement projects in their organization"
ON engagement_projects FOR SELECT
USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admins and planners can manage engagement projects"
ON engagement_projects FOR ALL
USING (organization_id IN (
  SELECT organization_id FROM profiles 
  WHERE id = auth.uid() AND role IN ('admin', 'planner')
));

-- Community inputs - public can insert (for engagement), org users can view all
CREATE POLICY "Anyone can submit community input"
ON community_inputs FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view inputs for their engagement projects"
ON community_inputs FOR SELECT
USING (engagement_id IN (
  SELECT id FROM engagement_projects 
  WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
));

-- Conversation policies
CREATE POLICY "Users can view their own conversations"
ON conversations FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create conversations"
ON conversations FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Message policies
CREATE POLICY "Users can view messages in their conversations"
ON messages FOR SELECT
USING (conversation_id IN (SELECT id FROM conversations WHERE user_id = auth.uid()));

CREATE POLICY "Users can create messages in their conversations"
ON messages FOR INSERT
WITH CHECK (conversation_id IN (SELECT id FROM conversations WHERE user_id = auth.uid()));

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_grant_applications_updated_at
  BEFORE UPDATE ON grant_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_engagement_projects_updated_at
  BEFORE UPDATE ON engagement_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update upvote count
CREATE OR REPLACE FUNCTION update_upvote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_inputs SET upvotes = upvotes + 1 WHERE id = NEW.input_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_inputs SET upvotes = upvotes - 1 WHERE id = OLD.input_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_input_upvotes
  AFTER INSERT OR DELETE ON input_upvotes
  FOR EACH ROW EXECUTE FUNCTION update_upvote_count();

-- ============================================
-- SEED DATA: Grant Programs
-- ============================================

INSERT INTO grant_programs (name, agency, description, typical_range_min, typical_range_max, match_required, eligible_projects, url) VALUES
('Active Transportation Program (ATP)', 'Caltrans', 'Funds projects that encourage walking and bicycling', 500000, 10000000, 11.47, ARRAY['bike_facilities', 'pedestrian', 'srts', 'trails'], 'https://catc.ca.gov/programs/active-transportation-program'),
('Highway Safety Improvement Program (HSIP)', 'Caltrans', 'Funds infrastructure safety improvements', 100000, 5000000, 10, ARRAY['safety', 'intersections', 'signals'], 'https://dot.ca.gov/programs/local-assistance/fed-and-state-programs/highway-safety-improvement-program'),
('Congestion Mitigation and Air Quality (CMAQ)', 'FHWA', 'Funds projects that reduce congestion and improve air quality', 500000, 20000000, 11.47, ARRAY['transit', 'bike_facilities', 'pedestrian', 'ev_infrastructure'], NULL),
('RAISE Grants', 'USDOT', 'Rebuilding American Infrastructure with Sustainability and Equity', 5000000, 25000000, 20, ARRAY['multimodal', 'transit', 'complete_streets'], 'https://www.transportation.gov/RAISEgrants'),
('Safe Streets and Roads for All (SS4A)', 'USDOT', 'Supports Vision Zero and safety action plans', 200000, 30000000, 20, ARRAY['safety', 'planning', 'infrastructure'], 'https://www.transportation.gov/grants/SS4A'),
('5310 Enhanced Mobility', 'FTA', 'Funds transit for seniors and individuals with disabilities', 50000, 500000, 20, ARRAY['transit', 'paratransit', 'vehicles'], NULL),
('Carbon Reduction Program (CRP)', 'FHWA', 'Reduces transportation emissions', 500000, 10000000, 11.47, ARRAY['bike_facilities', 'transit', 'ev_infrastructure'], NULL),
('Transportation Development Act (TDA) Article 3', 'RTPA', 'Local funding for bike and pedestrian projects', 10000, 500000, 0, ARRAY['bike_facilities', 'pedestrian'], NULL);


