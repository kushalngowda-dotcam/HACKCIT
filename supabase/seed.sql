-- DISASTERX AI - Initial Database Seed File
-- File: supabase/seed.sql

-- 1. Incident Categories
INSERT INTO public.incident_categories (id, code, name, description, icon_name, default_urgency)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'FLOOD', 'Flash Inundation & Waterlogging', 'Urban flash flooding and submerged areas', 'Waves', 'HIGH'),
  ('22222222-2222-2222-2222-222222222222', 'FIRE', 'Industrial & Chemical Fire', 'Factory or commercial warehouse fires', 'Flame', 'CRITICAL'),
  ('33333333-3333-3333-3333-333333333333', 'EARTHQUAKE', 'Structural Collapse & Tremors', 'Building structural damage or earth tremors', 'Building', 'CRITICAL'),
  ('44444444-4444-4444-4444-444444444444', 'MEDICAL', 'Mass Casualty Medical Emergency', 'Multiple severe casualties requiring trauma care', 'Activity', 'HIGH')
ON CONFLICT (code) DO NOTHING;

-- 2. Organizations
INSERT INTO public.organizations (id, name, type, contact_number, email, district, state)
VALUES 
  ('a1111111-1111-1111-1111-111111111111', 'State Disaster Response Force', 'RESCUE_FORCE', '+91-11-24363260', 'rescue@disasterx.gov.in', 'District Urban', 'State'),
  ('a2222222-2222-2222-2222-222222222222', 'District Emergency Hospital Network', 'HOSPITAL_NETWORK', '+91-80-22253333', 'health@disasterx.gov.in', 'District Urban', 'State')
ON CONFLICT DO NOTHING;

-- 3. Hospitals
INSERT INTO public.hospitals (id, name, organization_id, latitude, longitude, district, state, contact_number)
VALUES 
  ('h1111111-1111-1111-1111-111111111111', 'District Central Trauma Hospital', 'a2222222-2222-2222-2222-222222222222', 12.9634, 77.5741, 'District Urban', 'State', '+91-80-26701150'),
  ('h2222222-2222-2222-2222-222222222222', 'Emergency Care Specialty Hospital', 'a2222222-2222-2222-2222-222222222222', 12.9592, 77.6445, 'District Urban', 'State', '+91-80-25024444')
ON CONFLICT DO NOTHING;

-- 4. Hospital Capacity (Linked to Hospitals)
INSERT INTO public.hospital_capacity (hospital_id, total_beds, available_beds, total_icu_beds, available_icu_beds, emergency_load_pct, incoming_patients)
VALUES 
  ('h1111111-1111-1111-1111-111111111111', 250, 42, 40, 6, 78, 12),
  ('h2222222-2222-2222-2222-222222222222', 180, 15, 25, 2, 92, 8)
ON CONFLICT (hospital_id) DO UPDATE SET last_updated = NOW();

-- 5. Rescue Resources & Responders
INSERT INTO public.resources (id, code, name, organization_id, status, latitude, longitude, capacity, contact_phone)
VALUES 
  ('r1111111-1111-1111-1111-111111111111', 'RESCUE-UNIT-01', 'First Rescue Response Unit Alpha', 'a1111111-1111-1111-1111-111111111111', 'AVAILABLE', 12.9716, 77.5946, 12, '+91-9876543210'),
  ('r2222222-2222-2222-2222-222222222222', 'AMB-ALS-204', 'Advanced Life Support Ambulance 204', 'a2222222-2222-2222-2222-222222222222', 'AVAILABLE', 12.9650, 77.5800, 2, '+91-9876543211')
ON CONFLICT (code) DO NOTHING;

-- 6. Emergency Shelters
INSERT INTO public.shelters (id, name, address, latitude, longitude, capacity, current_occupancy, contact_person, contact_phone)
VALUES 
  ('s1111111-1111-1111-1111-111111111111', 'District Community Emergency Shelter', 'Central Relief Grounds', 12.9698, 77.5926, 1200, 140, 'Emergency Coordinator', '+91-9876500011')
ON CONFLICT DO NOTHING;
