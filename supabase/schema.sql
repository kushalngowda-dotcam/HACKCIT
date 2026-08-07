-- DisasterX AI PostgreSQL Database Schema for Supabase

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('CITIZEN', 'RESPONDER', 'COORDINATOR', 'ADMINISTRATOR')) DEFAULT 'CITIZEN',
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Incidents Table
CREATE TABLE IF NOT EXISTS public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  incident_type TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')) NOT NULL,
  status TEXT CHECK (status IN ('REPORTED', 'VERIFIED', 'DISPATCHED', 'IN_PROGRESS', 'CONTAINED', 'RESOLVED')) DEFAULT 'VERIFIED',
  priority_score INT CHECK (priority_score BETWEEN 0 AND 100) DEFAULT 50,
  confidence INT DEFAULT 90,
  verification_status TEXT CHECK (verification_status IN ('VERIFIED', 'LIKELY', 'UNCERTAIN', 'POTENTIALLY_FALSE')) DEFAULT 'VERIFIED',
  verification_score INT DEFAULT 90,
  people_at_risk INT DEFAULT 0,
  location_lat NUMERIC(10, 6) NOT NULL,
  location_lng NUMERIC(10, 6) NOT NULL,
  location_address TEXT NOT NULL,
  location_area TEXT NOT NULL,
  image_url TEXT,
  detected_hazards TEXT[],
  infrastructure_damage TEXT[],
  recommended_resources JSONB,
  recommended_actions TEXT[],
  reasoning TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Incident Reports Table
CREATE TABLE IF NOT EXISTS public.incident_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES public.users(id),
  incident_id UUID REFERENCES public.incidents(id),
  description TEXT NOT NULL,
  location_address TEXT,
  media_url TEXT,
  status TEXT DEFAULT 'SUBMITTED',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. AI Analysis Logs
CREATE TABLE IF NOT EXISTS public.ai_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES public.incidents(id),
  raw_prompt TEXT,
  structured_output JSONB NOT NULL,
  confidence_score INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Emergency Resources Table
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT CHECK (status IN ('AVAILABLE', 'DISPATCHED', 'EN_ROUTE', 'ON_SITE', 'MAINTENANCE')) DEFAULT 'AVAILABLE',
  unit_code TEXT UNIQUE NOT NULL,
  capacity INT DEFAULT 2,
  current_lat NUMERIC(10, 6) NOT NULL,
  current_lng NUMERIC(10, 6) NOT NULL,
  current_address TEXT,
  contact_number TEXT,
  assigned_incident_id UUID REFERENCES public.incidents(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Resource Assignments
CREATE TABLE IF NOT EXISTS public.resource_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID REFERENCES public.resources(id),
  incident_id UUID REFERENCES public.incidents(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'ACTIVE',
  eta_minutes INT
);

-- 7. Hospitals Table
CREATE TABLE IF NOT EXISTS public.hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  lat NUMERIC(10, 6) NOT NULL,
  lng NUMERIC(10, 6) NOT NULL,
  address TEXT NOT NULL,
  total_beds INT NOT NULL,
  available_beds INT NOT NULL,
  icu_available INT NOT NULL,
  trauma_center BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'OPERATIONAL',
  contact TEXT
);

-- 8. Shelters Table
CREATE TABLE IF NOT EXISTS public.shelters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  lat NUMERIC(10, 6) NOT NULL,
  lng NUMERIC(10, 6) NOT NULL,
  address TEXT NOT NULL,
  capacity INT NOT NULL,
  current_occupancy INT DEFAULT 0,
  supplies_status TEXT DEFAULT 'ADEQUATE',
  medical_staff BOOLEAN DEFAULT TRUE,
  contact TEXT
);

-- 9. Evacuation Routes Table
CREATE TABLE IF NOT EXISTS public.routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  safety_score INT DEFAULT 90,
  travel_time_minutes INT,
  path_coordinates JSONB NOT NULL,
  is_blocked BOOLEAN DEFAULT FALSE
);

-- 10. Alerts Table
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')) NOT NULL,
  broadcast_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Disaster Scenarios
CREATE TABLE IF NOT EXISTS public.disaster_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rainfall_mm INT,
  population_affected INT,
  simulation_result JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. AI Recommendations
CREATE TABLE IF NOT EXISTS public.ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type TEXT NOT NULL,
  recommendation_text TEXT NOT NULL,
  confidence INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Response Logs
CREATE TABLE IF NOT EXISTS public.response_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES public.incidents(id),
  action_taken TEXT NOT NULL,
  performed_by TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON public.incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents(status);
CREATE INDEX IF NOT EXISTS idx_resources_status ON public.resources(status);
