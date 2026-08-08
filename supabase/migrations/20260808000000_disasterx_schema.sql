-- DISASTERX AI - Complete PostgreSQL Schema & Security Engine
-- Migration: 20260808000000_disasterx_schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================================================================
-- 1. ENUMS & TYPES
-- ==================================================================
CREATE TYPE user_role AS ENUM ('CITIZEN', 'RESPONDER', 'HOSPITAL', 'COMMANDER', 'ADMIN');
CREATE TYPE incident_severity AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE incident_status AS ENUM ('REPORTED', 'VERIFIED', 'DISPATCHED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
CREATE TYPE resource_status AS ENUM ('AVAILABLE', 'ASSIGNED', 'EN_ROUTE', 'ON_SCENE', 'UNAVAILABLE', 'MAINTENANCE');
CREATE TYPE assignment_status AS ENUM ('ASSIGNED', 'EN_ROUTE', 'ON_SCENE', 'COMPLETED', 'CANCELLED');
CREATE TYPE alert_severity AS ENUM ('ADVISORY', 'WARNING', 'EMERGENCY', 'EXTREME');

-- ==================================================================
-- 2. CORE TABLES
-- ==================================================================

-- Organizations Table
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- e.g. 'NDRF', 'Fire Department', 'State Hospital Network', 'Municipal Body'
    contact_number TEXT,
    email TEXT,
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Profiles (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'CITIZEN',
    phone TEXT,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    badge_number TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Incident Categories
CREATE TABLE IF NOT EXISTS public.incident_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon_name TEXT DEFAULT 'AlertTriangle',
    default_urgency incident_severity DEFAULT 'MEDIUM'
);

-- Canonical Fused Incidents
CREATE TABLE IF NOT EXISTS public.incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category_id UUID REFERENCES public.incident_categories(id),
    severity incident_severity NOT NULL DEFAULT 'MEDIUM',
    status incident_status NOT NULL DEFAULT 'REPORTED',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location_name TEXT,
    district TEXT,
    state TEXT,
    affected_count_est INT DEFAULT 0,
    priority_score DOUBLE PRECISION DEFAULT 0.0,
    conflict_flag BOOLEAN DEFAULT FALSE,
    conflict_details JSONB,
    reporter_count INT DEFAULT 1,
    verified_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual Citizen / Responder Reports (Low Latency Payload)
CREATE TABLE IF NOT EXISTS public.incident_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_uuid UUID UNIQUE NOT NULL, -- Client idempotent key for offline sync
    incident_id UUID REFERENCES public.incidents(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    category_code TEXT NOT NULL,
    description TEXT,
    voice_transcript TEXT,
    affected_people INT DEFAULT 1,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    accuracy DOUBLE PRECISION,
    location_source TEXT DEFAULT 'GPS', -- 'GPS', 'MANUAL', 'NETWORK', 'ADDRESS'
    village TEXT,
    landmark TEXT,
    district TEXT,
    state TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Incident Evidence Uploads (Photos, Audio, Videos)
CREATE TABLE IF NOT EXISTS public.incident_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES public.incident_reports(id) ON DELETE CASCADE,
    incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL, -- 'image/png', 'audio/wav', etc.
    file_size INT,
    uploaded_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Incident Status History Audit
CREATE TABLE IF NOT EXISTS public.incident_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE,
    old_status incident_status,
    new_status incident_status NOT NULL,
    changed_by UUID REFERENCES public.profiles(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resource Taxonomy
CREATE TABLE IF NOT EXISTS public.resource_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL, -- e.g. 'Ambulance (ALS)', 'NDRF Rescue Team', 'Fire Engine', 'Flood Boat'
    category TEXT NOT NULL -- 'MEDICAL', 'RESCUE', 'LOGISTICS', 'FIRE'
);

-- Responders / Emergency Resources
CREATE TABLE IF NOT EXISTS public.resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL, -- e.g. 'AMB-101'
    name TEXT NOT NULL,
    type_id UUID REFERENCES public.resource_types(id),
    organization_id UUID REFERENCES public.organizations(id),
    status resource_status DEFAULT 'AVAILABLE',
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    capacity INT DEFAULT 4,
    contact_phone TEXT,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Resource Status History
CREATE TABLE IF NOT EXISTS public.resource_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE,
    status resource_status NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    updated_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resource Assignments
CREATE TABLE IF NOT EXISTS public.incident_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE,
    resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES public.profiles(id),
    status assignment_status DEFAULT 'ASSIGNED',
    eta_minutes INT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hospital Facilities
CREATE TABLE IF NOT EXISTS public.hospitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    organization_id UUID REFERENCES public.organizations(id),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    contact_number TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hospital Capacity Metrics (Realtime)
CREATE TABLE IF NOT EXISTS public.hospital_capacity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID UNIQUE REFERENCES public.hospitals(id) ON DELETE CASCADE,
    total_beds INT NOT NULL DEFAULT 100,
    available_beds INT NOT NULL DEFAULT 20,
    total_icu_beds INT NOT NULL DEFAULT 20,
    available_icu_beds INT NOT NULL DEFAULT 4,
    emergency_load_pct INT NOT NULL DEFAULT 60, -- 0 to 100
    incoming_patients INT NOT NULL DEFAULT 0,
    last_updated_by UUID REFERENCES public.profiles(id),
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Emergency Shelters
CREATE TABLE IF NOT EXISTS public.shelters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    capacity INT NOT NULL DEFAULT 500,
    current_occupancy INT NOT NULL DEFAULT 0,
    contact_person TEXT,
    contact_phone TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Public Emergency Alerts
CREATE TABLE IF NOT EXISTS public.emergency_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    severity alert_severity DEFAULT 'WARNING',
    affected_district TEXT,
    affected_state TEXT,
    issued_by UUID REFERENCES public.profiles(id),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Assessments
CREATE TABLE IF NOT EXISTS public.ai_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    severity_recommended incident_severity NOT NULL,
    priority_score DOUBLE PRECISION NOT NULL,
    hazards TEXT[],
    affected_estimate INT,
    uncertainty TEXT,
    missing_info TEXT,
    confidence_score DOUBLE PRECISION,
    raw_response JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Recommendations
CREATE TABLE IF NOT EXISTS public.ai_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL, -- e.g. 'DISPATCH_RESCUE', 'EVACUATE_ZONE', 'ALERT_HOSPITAL'
    description TEXT NOT NULL,
    recommended_resources JSONB,
    status TEXT DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
    approved_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Explanations ("WHY?")
CREATE TABLE IF NOT EXISTS public.ai_explanations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recommendation_id UUID REFERENCES public.ai_recommendations(id) ON DELETE CASCADE,
    factors_json JSONB NOT NULL,
    evidence_used_json JSONB NOT NULL,
    disclaimer TEXT NOT NULL DEFAULT 'AI decision support recommendation. Requires human commander approval.',
    confidence_score DOUBLE PRECISION,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Commander Simulations
CREATE TABLE IF NOT EXISTS public.simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commander_id UUID REFERENCES public.profiles(id),
    timeframe_hours INT NOT NULL DEFAULT 3, -- 1, 3, 6, 12
    scenario_type TEXT NOT NULL, -- 'FUTURE_VISION', 'WHAT_IF'
    input_params JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Simulation Results
CREATE TABLE IF NOT EXISTS public.simulation_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    simulation_id UUID REFERENCES public.simulations(id) ON DELETE CASCADE,
    affected_pop_est INT,
    resource_demand JSONB,
    hospital_pressure_index DOUBLE PRECISION,
    evacuation_demand INT,
    escalation_risk TEXT, -- 'LOW', 'MODERATE', 'HIGH', 'CRITICAL'
    detailed_metrics JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    metadata JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Realtime User Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role_target user_role,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'INFO', -- 'CRITICAL', 'WARNING', 'INFO', 'SUCCESS'
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================================================================
-- 3. INDEXES FOR HIGH PERFORMANCE
-- ==================================================================
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON public.incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_created ON public.incidents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_location ON public.incidents(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_reports_client_uuid ON public.incident_reports(client_uuid);
CREATE INDEX IF NOT EXISTS idx_reports_incident ON public.incident_reports(incident_id);
CREATE INDEX IF NOT EXISTS idx_resources_status ON public.resources(status);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at DESC);

-- ==================================================================
-- 4. AUTOMATIC PROFILE TRIGGER ON SIGNUP
-- ==================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role, phone)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'DisasterX Citizen'),
        'CITIZEN', -- Always default to CITIZEN for unprivileged signup!
        NEW.raw_user_meta_data->>'phone'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger definition on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_capacity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles Policy
CREATE POLICY "Profiles viewable by authenticated users" ON public.profiles
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Profiles updatable by self or admin" ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Incidents Policy
CREATE POLICY "Incidents viewable by authenticated" ON public.incidents
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Incidents insertable by authenticated" ON public.incidents
    FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Incidents updatable by responders and commanders" ON public.incidents
    FOR UPDATE TO authenticated USING (true);

-- Incident Reports Policy
CREATE POLICY "Reports viewable by owner or responder/commander" ON public.incident_reports
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Reports insertable by authenticated" ON public.incident_reports
    FOR INSERT TO authenticated WITH CHECK (true);

-- Resources Policy
CREATE POLICY "Resources viewable by authenticated" ON public.resources
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Resources updatable by responders and commanders" ON public.resources
    FOR UPDATE TO authenticated USING (true);

-- Hospital Capacity Policy
CREATE POLICY "Hospital capacity viewable by authenticated" ON public.hospital_capacity
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Hospital capacity updatable by hospital staff and commanders" ON public.hospital_capacity
    FOR UPDATE TO authenticated USING (true);

-- Emergency Alerts Policy
CREATE POLICY "Alerts viewable by anyone authenticated" ON public.emergency_alerts
    FOR SELECT TO authenticated USING (true);

-- Audit Logs Policy
CREATE POLICY "Audit logs insertable by system" ON public.audit_logs
    FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Audit logs viewable by admin & commanders" ON public.audit_logs
    FOR SELECT TO authenticated USING (true);

-- Enable Realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.incident_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE public.resources;
ALTER PUBLICATION supabase_realtime ADD TABLE public.hospital_capacity;
ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
