import { Incident, Resource, Hospital, Shelter, RoadBlockage, EvacuationRoute, AlertNotification, AIRiskZone } from '../types';
import { DISASTER_IMAGES } from '../utils/svgImages';

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'inc-101',
    title: 'Multi-Story Commercial Building Structural Failure',
    description: '4-story building partially collapsed following torrential downpour. Severe structural breach reported with multiple victims trapped on 2nd floor.',
    incident_type: 'Building Collapse',
    severity: 'CRITICAL',
    status: 'VERIFIED',
    priority_score: 96,
    confidence: 94,
    verification_status: 'VERIFIED',
    verification_score: 98,
    people_at_risk: 86,
    location: {
      lat: 12.9716,
      lng: 77.5946,
      address: 'MG Road Metro Station North Exit',
      area: 'Central Business District, Bengaluru'
    },
    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
    updated_at: new Date().toISOString(),
    image_url: DISASTER_IMAGES.buildingCollapse,
    detected_hazards: ['Structural Collapse', 'Gas Line Leak Risk', 'Exposed High-Voltage Wiring', 'Trapped Victims'],
    infrastructure_damage: ['Primary Concrete Beam Fractured', 'Feeder Road Blocked', 'Power Transformer Offline'],
    recommended_resources: [
      { type: 'RESCUE_TEAM', count: 4 },
      { type: 'AMBULANCE', count: 3 },
      { type: 'FIRE_ENGINE', count: 2 }
    ],
    recommended_actions: [
      'Deploy heavy hydraulic cutter team immediately',
      'Establish 200m perimeter lock due to gas smell',
      'Route ambulances via Residency Road bypass'
    ],
    assigned_resources: ['res-201', 'res-101'],
    eta_minutes: 7,
    reasoning: 'Critical high density building collapse with confirmed trapped victims. High risk of electrical secondary fire and ongoing structural instability.'
  },
  {
    id: 'inc-102',
    title: 'Severe Flash Flooding & Stranded Vehicle Submersion',
    description: 'Outer Ring Road flooded under 4.5 ft water. Over 40 vehicles submerged near tech park flyover with passengers stranded on vehicle roofs.',
    incident_type: 'Urban Flooding',
    severity: 'HIGH',
    status: 'IN_PROGRESS',
    priority_score: 84,
    confidence: 91,
    verification_status: 'VERIFIED',
    verification_score: 92,
    people_at_risk: 240,
    location: {
      lat: 12.9850,
      lng: 77.7289,
      address: 'Outer Ring Road Flyover Junction',
      area: 'Whitefield Tech Corridor, Bengaluru'
    },
    created_at: new Date(Date.now() - 32 * 60000).toISOString(),
    updated_at: new Date().toISOString(),
    image_url: DISASTER_IMAGES.urbanFlooding,
    detected_hazards: ['Flash Flood Currents', 'Submerged Drain Openings', 'Automobile Fuel Spills'],
    infrastructure_damage: ['Drainage Channel Overflow', 'Substation Submersion', 'Traffic Gridlock'],
    recommended_resources: [
      { type: 'RESCUE_BOAT', count: 3 },
      { type: 'RESCUE_TEAM', count: 2 },
      { type: 'RELIEF_SUPPLIES', count: 2 }
    ],
    recommended_actions: [
      'Deploy inflatable rescue craft to clear passengers',
      'Divert inbound traffic at Marathahalli junction',
      'Open emergency drainage floodgates'
    ],
    assigned_resources: ['res-501', 'res-202'],
    eta_minutes: 12,
    reasoning: 'Rapidly rising water depth threatening stranded motorists. High population exposure in tech corridor.'
  },
  {
    id: 'inc-103',
    title: 'Industrial Chemical Storage Tank Leak & Vapor Plume',
    description: 'Hazardous ammonia solvent leak detected at industrial storage facility following power surge failure. Strong toxic plume blowing eastward.',
    incident_type: 'Chemical Leak',
    severity: 'CRITICAL',
    status: 'VERIFIED',
    priority_score: 92,
    confidence: 88,
    verification_status: 'VERIFIED',
    verification_score: 89,
    people_at_risk: 420,
    location: {
      lat: 13.0285,
      lng: 77.5197,
      address: 'Industrial Area Phase 2, Gate 4',
      area: 'Peenya Industrial Zone, Bengaluru'
    },
    created_at: new Date(Date.now() - 45 * 60000).toISOString(),
    updated_at: new Date().toISOString(),
    image_url: DISASTER_IMAGES.chemicalLeak,
    detected_hazards: ['Toxic Inhalation Hazard', 'Corrosive Vapor Plume', 'Secondary Explosion Risk'],
    infrastructure_damage: ['Factory Containment Unit Damaged', 'HVAC System Compromised'],
    recommended_resources: [
      { type: 'FIRE_ENGINE', count: 4 },
      { type: 'MEDICAL_TEAM', count: 3 },
      { type: 'POLICE_UNIT', count: 3 }
    ],
    recommended_actions: [
      'Issue immediate shelter-in-place & mask directive downwind',
      'Deploy Hazmat neutralization foam unit',
      'Evacuate residential quarters within 1.2km radius'
    ],
    assigned_resources: ['res-301'],
    eta_minutes: 9,
    reasoning: 'Airborne toxic hazard posing immediate respiratory risk to dense neighboring residential quarters.'
  },
  {
    id: 'inc-104',
    title: 'Landslide Mudslip Blocking Hill Connector Road',
    description: 'Heavy rain triggered mudslide burying 120 meters of mountain access highway. 3 vehicles partially buried, access cut off to 2 villages.',
    incident_type: 'Landslide',
    severity: 'HIGH',
    status: 'REPORTED',
    priority_score: 78,
    confidence: 85,
    verification_status: 'LIKELY',
    verification_score: 82,
    people_at_risk: 110,
    location: {
      lat: 12.9250,
      lng: 77.5800,
      address: 'Nandi Hills Bypass Section km 14',
      area: 'North Outskirts, Bengaluru'
    },
    created_at: new Date(Date.now() - 60 * 60000).toISOString(),
    updated_at: new Date().toISOString(),
    image_url: DISASTER_IMAGES.landslide,
    detected_hazards: ['Unstable Slope Erosion', 'Debris Boulder Falls', 'Isolated Access Route'],
    infrastructure_damage: ['Guardrail Destruction', 'Asphalt Buckling', 'Optical Fiber Cable Severed'],
    recommended_resources: [
      { type: 'RESCUE_TEAM', count: 2 },
      { type: 'RELIEF_SUPPLIES', count: 2 }
    ],
    recommended_actions: [
      'Deploy earthmoving excavators to clear bypass track',
      'Air drop emergency satellite communications box',
      'Set up medical triage tent at hill base'
    ],
    assigned_resources: [],
    eta_minutes: 18,
    reasoning: 'Physical isolation of mountain communities requiring rapid earth-clearing equipment and emergency supplies.'
  },
  {
    id: 'inc-105',
    title: 'Substation Transformer Fire & Power Grid Blackout',
    description: 'High-voltage oil-filled transformer ignited during lightning surge. Fire spreading to adjacent switchgear room. Emergency grid shutoff activated.',
    incident_type: 'Power Grid Failure',
    severity: 'MEDIUM',
    status: 'IN_PROGRESS',
    priority_score: 64,
    confidence: 96,
    verification_status: 'VERIFIED',
    verification_score: 97,
    people_at_risk: 350,
    location: {
      lat: 12.9352,
      lng: 77.6245,
      address: 'Grid Substation 220kV',
      area: 'Koramangala 4th Block, Bengaluru'
    },
    created_at: new Date(Date.now() - 75 * 60000).toISOString(),
    updated_at: new Date().toISOString(),
    image_url: DISASTER_IMAGES.powerGrid,
    detected_hazards: ['High-Voltage Arc Risk', 'Transformer Oil Fire', 'Substation Blackout'],
    infrastructure_damage: ['Switchgear Transformer Destroyed', 'Local District Grid Offline'],
    recommended_resources: [
      { type: 'FIRE_ENGINE', count: 3 },
      { type: 'POLICE_UNIT', count: 2 }
    ],
    recommended_actions: [
      'Apply CO2 & dry chemical fire suppression powder',
      'Isolate 66kV transmission ring',
      'Deploy backup mobile generators to nearby district hospital'
    ],
    assigned_resources: ['res-302'],
    eta_minutes: 8,
    reasoning: 'Critical municipal utility infrastructure failure affecting neighborhood hospital power feeds.'
  }
];

export const INITIAL_RESOURCES: Resource[] = [
  {
    id: 'res-101',
    name: 'Advanced Trauma ALS Unit 01',
    type: 'AMBULANCE',
    status: 'EN_ROUTE',
    capacity: 2,
    unit_code: 'AMB-ALPHA-1',
    current_location: { lat: 12.9680, lng: 77.5890, address: 'Richmond Road Junction', area: 'Central' },
    assigned_incident_id: 'inc-101',
    eta_minutes: 5,
    contact_number: '+91 98765 43210'
  },
  {
    id: 'res-102',
    name: 'Trauma Care Unit 04',
    type: 'AMBULANCE',
    status: 'AVAILABLE',
    capacity: 2,
    unit_code: 'AMB-BETA-4',
    current_location: { lat: 12.9380, lng: 77.6100, address: 'Koramangala Fire Station', area: 'South-East' },
    contact_number: '+91 98765 43211'
  },
  {
    id: 'res-103',
    name: 'Mobile ICU Express 02',
    type: 'AMBULANCE',
    status: 'AVAILABLE',
    capacity: 3,
    unit_code: 'AMB-GAMMA-2',
    current_location: { lat: 13.0100, lng: 77.5500, address: 'Yeshwanthpur Base', area: 'North' },
    contact_number: '+91 98765 43212'
  },
  {
    id: 'res-201',
    name: 'Heavy Urban Search & Rescue Team 1',
    type: 'RESCUE_TEAM',
    status: 'DISPATCHED',
    capacity: 12,
    unit_code: 'USAR-BRAVO-1',
    current_location: { lat: 12.9750, lng: 77.6000, address: 'Ulsoor Depot', area: 'Central' },
    assigned_incident_id: 'inc-101',
    eta_minutes: 7,
    contact_number: '+91 98765 43220'
  },
  {
    id: 'res-202',
    name: 'Disaster Relief Squad 3',
    type: 'RESCUE_TEAM',
    status: 'ON_SITE',
    capacity: 15,
    unit_code: 'USAR-DELTA-3',
    current_location: { lat: 12.9850, lng: 77.7289, address: 'Whitefield Flyover', area: 'East' },
    assigned_incident_id: 'inc-102',
    eta_minutes: 0,
    contact_number: '+91 98765 43221'
  },
  {
    id: 'res-301',
    name: 'Peenya Hazmat Fire Tender 09',
    type: 'FIRE_ENGINE',
    status: 'EN_ROUTE',
    capacity: 6,
    unit_code: 'HAZMAT-FIRE-9',
    current_location: { lat: 13.0200, lng: 77.5300, address: 'Tumkur Road Express', area: 'Peenya' },
    assigned_incident_id: 'inc-103',
    eta_minutes: 6,
    contact_number: '+91 98765 43230'
  },
  {
    id: 'res-302',
    name: 'High Pressure Water Cannon Engine 03',
    type: 'FIRE_ENGINE',
    status: 'ON_SITE',
    capacity: 5,
    unit_code: 'FIRE-ENGINE-3',
    current_location: { lat: 12.9352, lng: 77.6245, address: 'Koramangala Grid', area: 'Koramangala' },
    assigned_incident_id: 'inc-105',
    eta_minutes: 0,
    contact_number: '+91 98765 43231'
  },
  {
    id: 'res-401',
    name: 'Rapid Police Response Fleet 12',
    type: 'POLICE_UNIT',
    status: 'AVAILABLE',
    capacity: 8,
    unit_code: 'COP-ECHO-12',
    current_location: { lat: 12.9600, lng: 77.6400, address: 'Indiranagar HQ', area: 'East' },
    contact_number: '+91 98765 43240'
  },
  {
    id: 'res-501',
    name: 'Flood Relief Rescue Motorboat Fleet',
    type: 'RESCUE_BOAT',
    status: 'ON_SITE',
    capacity: 20,
    unit_code: 'AQUA-BOAT-1',
    current_location: { lat: 12.9850, lng: 77.7289, address: 'Outer Ring Road Waterway', area: 'Whitefield' },
    assigned_incident_id: 'inc-102',
    eta_minutes: 0,
    contact_number: '+91 98765 43250'
  },
  {
    id: 'res-601',
    name: 'Field Triage Doctor Taskforce',
    type: 'MEDICAL_TEAM',
    status: 'AVAILABLE',
    capacity: 10,
    unit_code: 'MED-TASK-1',
    current_location: { lat: 12.9600, lng: 77.5900, address: 'Victoria Hospital Base', area: 'Central' },
    contact_number: '+91 98765 43260'
  },
  {
    id: 'res-701',
    name: 'Mobile Water Purification & Ration Truck',
    type: 'RELIEF_SUPPLIES',
    status: 'AVAILABLE',
    capacity: 500,
    unit_code: 'LOG-SUPPLY-1',
    current_location: { lat: 12.9200, lng: 77.6000, address: 'Jayanagar Logistics Hub', area: 'South' },
    contact_number: '+91 98765 43270'
  }
];

export const INITIAL_HOSPITALS: Hospital[] = [
  {
    id: 'hosp-1',
    name: 'Victoria Level-1 Trauma Center & Government Medical Hospital',
    location: { lat: 12.9630, lng: 77.5740, address: 'Fort Area, Kalasipalyam', area: 'Central Bengaluru' },
    total_beds: 450,
    available_beds: 78,
    icu_available: 12,
    trauma_center: true,
    status: 'OPERATIONAL',
    contact: '+91 80 2670 1150'
  },
  {
    id: 'hosp-2',
    name: 'Manipal Super Specialty Hospital Whitefield',
    location: { lat: 12.9810, lng: 77.7220, address: 'ITPL Main Road', area: 'Whitefield' },
    total_beds: 300,
    available_beds: 24,
    icu_available: 3,
    trauma_center: true,
    status: 'HIGH_CAPACITY',
    contact: '+91 80 2502 4444'
  },
  {
    id: 'hosp-3',
    name: 'Columbia Asia / Manipal Yeshwanthpur',
    location: { lat: 13.0130, lng: 77.5550, address: '26/4 Brigade Gateway', area: 'Yeshwanthpur' },
    total_beds: 250,
    available_beds: 42,
    icu_available: 8,
    trauma_center: true,
    status: 'OPERATIONAL',
    contact: '+91 80 3989 8969'
  },
  {
    id: 'hosp-4',
    name: 'St. John’s National Academy of Health Sciences',
    location: { lat: 12.9320, lng: 77.6190, address: 'Sarjapur Main Road', area: 'Koramangala' },
    total_beds: 500,
    available_beds: 15,
    icu_available: 1,
    trauma_center: true,
    status: 'CRITICAL_OVERLOAD',
    contact: '+91 80 2206 5000'
  }
];

export const INITIAL_SHELTERS: Shelter[] = [
  {
    id: 'shelt-1',
    name: 'Kanteerava Indoor Stadium Relief Hub',
    location: { lat: 12.9690, lng: 77.5920, address: 'Kasturba Road', area: 'Sampangi Rama Nagar' },
    capacity: 2500,
    current_occupancy: 640,
    supplies_status: 'ADEQUATE',
    medical_staff_present: true,
    contact: '+91 80 2221 4455'
  },
  {
    id: 'shelt-2',
    name: 'Whitefield Community Center Shelter',
    location: { lat: 12.9700, lng: 77.7400, address: 'Main Road Ward 84', area: 'Whitefield' },
    capacity: 1200,
    current_occupancy: 910,
    supplies_status: 'MODERATE',
    medical_staff_present: true,
    contact: '+91 80 2845 1122'
  },
  {
    id: 'shelt-3',
    name: 'Peenya Industrial Sports Complex Emergency Camp',
    location: { lat: 13.0300, lng: 77.5100, address: '3rd Stage', area: 'Peenya' },
    capacity: 1800,
    current_occupancy: 320,
    supplies_status: 'ADEQUATE',
    medical_staff_present: false,
    contact: '+91 80 2839 7788'
  }
];

export const INITIAL_BLOCKAGES: RoadBlockage[] = [
  {
    id: 'blk-1',
    road_name: 'Outer Ring Road Submerged Underpass',
    cause: 'Heavy Urban Water Inundation (4.5ft depth)',
    severity: 'TOTAL',
    coordinates: [
      [12.9830, 77.7250],
      [12.9870, 77.7320]
    ]
  },
  {
    id: 'blk-2',
    road_name: 'MG Road Metro Debris Zone',
    cause: 'Debris from Structural Collapse',
    severity: 'PARTIAL',
    coordinates: [
      [12.9710, 77.5930],
      [12.9725, 77.5960]
    ]
  },
  {
    id: 'blk-3',
    road_name: 'Tumkur Road Industrial Underpass',
    cause: 'Chemical Spill Containment Zone',
    severity: 'TOTAL',
    coordinates: [
      [13.0270, 77.5210],
      [13.0300, 77.5180]
    ]
  }
];

export const INITIAL_ROUTES: EvacuationRoute[] = [
  {
    id: 'route-1',
    name: 'Whitefield Corridor North Evacuation Route',
    origin: 'Whitefield Tech Park Flyover',
    destination: 'Kanteerava Stadium Relief Hub',
    safety_score: 92,
    travel_time_minutes: 24,
    path: [
      [12.9850, 77.7289],
      [12.9900, 77.7100],
      [12.9950, 77.6700],
      [12.9800, 77.6300],
      [12.9690, 77.5920]
    ],
    is_blocked: false,
    recommended_for: ['Urban Flooding Victims', 'Stranded Commuters']
  },
  {
    id: 'route-2',
    name: 'MG Road Emergency Bypass Route',
    origin: 'MG Road Metro Station Collapse',
    destination: 'Victoria Hospital Trauma Center',
    safety_score: 88,
    travel_time_minutes: 11,
    path: [
      [12.9716, 77.5946],
      [12.9650, 77.5900],
      [12.9630, 77.5740]
    ],
    is_blocked: false,
    recommended_for: ['Building Collapse Victims', 'Emergency Ambulance Convoys']
  },
  {
    id: 'route-3',
    name: 'Peenya Industrial Zone Hazmat Evacuation Corridor',
    origin: 'Industrial Area Phase 2 Gate 4',
    destination: 'Peenya Sports Complex Emergency Camp',
    safety_score: 85,
    travel_time_minutes: 18,
    path: [
      [13.0285, 77.5197],
      [13.0290, 77.5150],
      [13.0295, 77.5120],
      [13.0300, 77.5100]
    ],
    is_blocked: false,
    recommended_for: ['Chemical Leak Evacuees', 'Industrial Workers']
  },
  {
    id: 'route-4',
    name: 'Nandi Hills Bypass Alternate Mountain Route',
    origin: 'Nandi Hills Bypass km 14',
    destination: 'Kanteerava Stadium Relief Hub',
    safety_score: 72,
    travel_time_minutes: 45,
    path: [
      [12.9250, 77.5800],
      [12.9350, 77.5820],
      [12.9500, 77.5850],
      [12.9600, 77.5880],
      [12.9690, 77.5920]
    ],
    is_blocked: false,
    recommended_for: ['Landslide Affected Villagers', 'Stranded Motorists']
  },
  {
    id: 'route-5',
    name: 'Koramangala Grid Emergency Hospital Route',
    origin: 'Grid Substation 220kV Koramangala',
    destination: "St. John's Hospital Trauma Center",
    safety_score: 90,
    travel_time_minutes: 8,
    path: [
      [12.9352, 77.6245],
      [12.9340, 77.6220],
      [12.9330, 77.6200],
      [12.9320, 77.6190]
    ],
    is_blocked: false,
    recommended_for: ['Power Grid Fire Casualties', 'Emergency Ambulance Convoys']
  }
];

export const INITIAL_ALERTS: AlertNotification[] = [
  {
    id: 'alt-1',
    title: 'RED ALERT: Flash Flood Warning for Whitefield & Marathahalli',
    message: 'Extreme precipitation exceeds 140mm/hr. Low-lying tech parks advised to evacuate immediately.',
    severity: 'CRITICAL',
    timestamp: new Date(Date.now() - 10 * 60000).toLocaleTimeString(),
    read: false
  },
  {
    id: 'alt-2',
    title: 'HAZMAT ALERT: Chemical Containment Zone active in Peenya Phase 2',
    message: 'Ammonia vapor plume detected. Residents within 1.2km radius must wear masks and stay indoors.',
    severity: 'CRITICAL',
    timestamp: new Date(Date.now() - 25 * 60000).toLocaleTimeString(),
    read: false
  },
  {
    id: 'alt-3',
    title: 'GRID ALERT: Power Outage in Koramangala 4th Block',
    message: 'Substation transformer fire isolated. Backup generators dispatched to regional health centers.',
    severity: 'HIGH',
    timestamp: new Date(Date.now() - 50 * 60000).toLocaleTimeString(),
    read: true
  }
];

export const INITIAL_RISK_ZONES: AIRiskZone[] = [
  {
    id: 'risk-zone-a',
    name: 'ZONE A — MG Road Metro Shear Vector',
    level: 'CRITICAL',
    population_exposure: 8600,
    vulnerabilities: ['Structural Debris Instability', 'High Pedestrian Density', 'Underground Gas Main'],
    potential_escalation: 'Secondary building collapse if rain continues >40mm/hr',
    recommended_precaution: 'Deploy USAR heavy breaching teams and enforce 200m isolation perimeter.',
    center: [12.9716, 77.5946],
    radius: 1200
  },
  {
    id: 'risk-zone-b',
    name: 'ZONE B — Whitefield Low Road Drainage Basin',
    level: 'HIGH',
    population_exposure: 4820,
    vulnerabilities: ['Low road accessibility', 'Severe arterial traffic gridlock', 'Submerged drainage channels'],
    potential_escalation: 'Water depth rising to 6ft; electric vehicle battery thermal runaway',
    recommended_precaution: 'Prepare evacuation route B and launch rescue motorboats.',
    center: [12.9850, 77.7289],
    radius: 1800
  },
  {
    id: 'risk-zone-c',
    name: 'ZONE C — Peenya Chemical Vapor Downwind Sector',
    level: 'HIGH',
    population_exposure: 12400,
    vulnerabilities: ['Industrial chemical storage density', 'High wind dispersion towards residential blocks'],
    potential_escalation: 'Toxic ammonia solvent gas plume expanding 1.5km eastward',
    recommended_precaution: 'Issue immediate shelter-in-place order and distribute Hazmat filter masks.',
    center: [13.0285, 77.5197],
    radius: 2200
  },
  {
    id: 'risk-zone-d',
    name: 'ZONE D — Koramangala Grid Substation Buffer',
    level: 'MEDIUM',
    population_exposure: 3100,
    vulnerabilities: ['Power grid blackout', 'Substation oil transformer thermal radiation'],
    potential_escalation: 'Secondary feeder blackout expanding to South Regional Trauma Hospital',
    recommended_precaution: 'Pre-stage mobile diesel generators and CO2 foam tenders.',
    center: [12.9352, 77.6245],
    radius: 1400
  }
];

