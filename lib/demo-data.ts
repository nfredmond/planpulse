// Demo data for PlanPulse platform
// This allows users to explore the platform without signing up

export const DEMO_ORGANIZATION = {
  id: 'demo-org-id',
  name: 'City of Sacramento',
  type: 'city',
  slug: 'city-of-sacramento',
};

export const DEMO_USER = {
  id: 'demo-user-id',
  email: 'demo@planpulse.io',
  full_name: 'Demo Planner',
  role: 'admin',
  organization_id: DEMO_ORGANIZATION.id,
};

export const DEMO_PROJECTS = [
  {
    id: 'proj-1',
    name: 'Downtown Complete Streets Plan',
    type: 'complete_streets',
    status: 'active',
    description: 'Comprehensive redesign of downtown corridors to improve safety and accessibility for all users.',
    client_name: 'City of Sacramento',
    budget: 2500000,
    spent: 875000,
    start_date: '2024-03-01',
    end_date: '2025-06-30',
    center_lat: 38.5816,
    center_lng: -121.4944,
    updated_at: '2024-11-20T10:30:00Z',
    created_at: '2024-03-01T00:00:00Z',
  },
  {
    id: 'proj-2',
    name: 'American River Trail Extension',
    type: 'trail_plan',
    status: 'planning',
    description: 'Extend the American River Parkway trail system to connect underserved neighborhoods.',
    client_name: 'Sacramento County',
    budget: 4200000,
    spent: 125000,
    start_date: '2024-09-01',
    end_date: '2026-12-31',
    center_lat: 38.6047,
    center_lng: -121.3758,
    updated_at: '2024-11-18T14:20:00Z',
    created_at: '2024-09-01T00:00:00Z',
  },
  {
    id: 'proj-3',
    name: 'Safe Routes to School - Oak Park',
    type: 'srts',
    status: 'active',
    description: 'Improve pedestrian and bicycle infrastructure around Oak Park elementary schools.',
    client_name: 'Sacramento City USD',
    budget: 850000,
    spent: 420000,
    start_date: '2024-01-15',
    end_date: '2024-12-31',
    center_lat: 38.5483,
    center_lng: -121.4559,
    updated_at: '2024-11-22T09:15:00Z',
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'proj-4',
    name: 'Regional Transit Priority Corridors',
    type: 'transit_plan',
    status: 'active',
    description: 'Identify and implement transit priority treatments on key corridors.',
    client_name: 'SacRT',
    budget: 1800000,
    spent: 650000,
    start_date: '2024-04-01',
    end_date: '2025-03-31',
    center_lat: 38.5676,
    center_lng: -121.4684,
    updated_at: '2024-11-21T16:45:00Z',
    created_at: '2024-04-01T00:00:00Z',
  },
  {
    id: 'proj-5',
    name: 'Local Road Safety Plan',
    type: 'lrsp',
    status: 'planning',
    description: 'Develop a comprehensive safety action plan targeting high-injury network locations.',
    client_name: 'City of Sacramento',
    budget: 450000,
    spent: 45000,
    start_date: '2024-10-01',
    end_date: '2025-09-30',
    center_lat: 38.5816,
    center_lng: -121.4944,
    updated_at: '2024-11-15T11:00:00Z',
    created_at: '2024-10-01T00:00:00Z',
  },
];

export const DEMO_GRANT_APPLICATIONS = [
  {
    id: 'grant-1',
    name: 'ATP Cycle 7 - Downtown Bike Network',
    description: 'Protected bike lane network connecting downtown to midtown neighborhoods.',
    amount_requested: 5200000,
    match_amount: 680000,
    match_source: 'Measure A Funds',
    status: 'submitted',
    deadline: '2025-01-15',
    submitted_at: '2024-11-01T00:00:00Z',
    grant_program: 'Active Transportation Program (ATP)',
    project_id: 'proj-1',
  },
  {
    id: 'grant-2',
    name: 'HSIP - High Injury Intersections',
    description: 'Signal improvements and pedestrian safety enhancements at 12 high-crash locations.',
    amount_requested: 2800000,
    match_amount: 311000,
    match_source: 'General Fund',
    status: 'drafting',
    deadline: '2025-02-28',
    grant_program: 'Highway Safety Improvement Program (HSIP)',
    project_id: 'proj-5',
  },
  {
    id: 'grant-3',
    name: 'SS4A Planning Grant',
    description: 'Develop a comprehensive Safety Action Plan for the City.',
    amount_requested: 400000,
    match_amount: 100000,
    match_source: 'In-kind staff time',
    status: 'awarded',
    deadline: '2024-08-15',
    submitted_at: '2024-07-20T00:00:00Z',
    decision_date: '2024-10-01',
    amount_awarded: 400000,
    grant_program: 'Safe Streets and Roads for All (SS4A)',
    project_id: 'proj-5',
  },
  {
    id: 'grant-4',
    name: 'TDA Article 3 - Trail Wayfinding',
    description: 'Install wayfinding signage along American River Trail extension.',
    amount_requested: 125000,
    match_amount: 0,
    status: 'under_review',
    deadline: '2024-09-30',
    submitted_at: '2024-09-15T00:00:00Z',
    grant_program: 'Transportation Development Act (TDA) Article 3',
    project_id: 'proj-2',
  },
];

export const DEMO_ENGAGEMENT_PROJECTS = [
  {
    id: 'eng-1',
    name: 'Downtown Complete Streets Input Map',
    description: 'Share your ideas for improving walking, biking, and transit downtown.',
    status: 'active',
    start_date: '2024-10-01',
    end_date: '2024-12-31',
    center_lat: 38.5816,
    center_lng: -121.4944,
    zoom_level: 14,
    project_id: 'proj-1',
    input_count: 247,
  },
  {
    id: 'eng-2',
    name: 'Oak Park SRTS Community Input',
    description: 'Help us identify safety concerns around Oak Park schools.',
    status: 'active',
    start_date: '2024-09-15',
    end_date: '2024-11-30',
    center_lat: 38.5483,
    center_lng: -121.4559,
    zoom_level: 15,
    project_id: 'proj-3',
    input_count: 89,
  },
  {
    id: 'eng-3',
    name: 'Trail Extension Route Preferences',
    description: 'Vote on preferred alignment options for the trail extension.',
    status: 'draft',
    start_date: '2025-01-15',
    end_date: '2025-03-15',
    center_lat: 38.6047,
    center_lng: -121.3758,
    zoom_level: 13,
    project_id: 'proj-2',
    input_count: 0,
  },
];

export const DEMO_COMMUNITY_INPUTS = [
  {
    id: 'input-1',
    engagement_id: 'eng-1',
    input_type: 'pin',
    category: 'safety',
    title: 'Dangerous intersection',
    content: 'Cars frequently run the red light here. Need better signal timing and enforcement.',
    sentiment: 'negative',
    upvotes: 34,
    lat: 38.5795,
    lng: -121.4932,
    created_at: '2024-11-15T14:30:00Z',
  },
  {
    id: 'input-2',
    engagement_id: 'eng-1',
    input_type: 'pin',
    category: 'infrastructure',
    title: 'Need bike parking',
    content: 'There is nowhere to lock bikes near the farmers market. Would use bike more if parking available.',
    sentiment: 'suggestion',
    upvotes: 28,
    lat: 38.5823,
    lng: -121.4956,
    created_at: '2024-11-14T10:15:00Z',
  },
  {
    id: 'input-3',
    engagement_id: 'eng-1',
    input_type: 'pin',
    category: 'accessibility',
    title: 'ADA ramp needed',
    content: 'Missing curb ramp on northwest corner. My wheelchair cannot cross here safely.',
    sentiment: 'negative',
    upvotes: 42,
    lat: 38.5801,
    lng: -121.4918,
    created_at: '2024-11-12T16:45:00Z',
  },
  {
    id: 'input-4',
    engagement_id: 'eng-2',
    input_type: 'pin',
    category: 'safety',
    title: 'No crosswalk for students',
    content: 'Kids have to cross 4 lanes with no marked crosswalk to get to school.',
    sentiment: 'negative',
    upvotes: 56,
    lat: 38.5489,
    lng: -121.4571,
    created_at: '2024-10-20T08:30:00Z',
  },
  {
    id: 'input-5',
    engagement_id: 'eng-1',
    input_type: 'pin',
    category: 'other',
    title: 'Love the new bike lane!',
    content: 'The protected bike lane on J Street is amazing. Please extend it further east!',
    sentiment: 'positive',
    upvotes: 67,
    lat: 38.5812,
    lng: -121.4889,
    created_at: '2024-11-10T12:00:00Z',
  },
];

export const DEMO_TRANSIT_METRICS = [
  { route_id: '1', route_name: 'Route 1 - Greenback', ridership: 4520, revenue_hours: 156, cost_per_passenger: 4.82, on_time_performance: 0.87 },
  { route_id: '2', route_name: 'Route 2 - Riverside', ridership: 3890, revenue_hours: 142, cost_per_passenger: 5.21, on_time_performance: 0.91 },
  { route_id: '15', route_name: 'Route 15 - Del Paso', ridership: 2150, revenue_hours: 98, cost_per_passenger: 6.45, on_time_performance: 0.84 },
  { route_id: '23', route_name: 'Route 23 - El Camino', ridership: 1780, revenue_hours: 88, cost_per_passenger: 7.12, on_time_performance: 0.79 },
  { route_id: '30', route_name: 'Route 30 - J Street', ridership: 5210, revenue_hours: 168, cost_per_passenger: 4.15, on_time_performance: 0.93 },
  { route_id: '51', route_name: 'Route 51 - Broadway', ridership: 3420, revenue_hours: 124, cost_per_passenger: 5.67, on_time_performance: 0.86 },
  { route_id: '62', route_name: 'Route 62 - Freeport', ridership: 1950, revenue_hours: 92, cost_per_passenger: 6.89, on_time_performance: 0.82 },
  { route_id: '81', route_name: 'Route 81 - Florin', ridership: 2680, revenue_hours: 108, cost_per_passenger: 5.98, on_time_performance: 0.88 },
];

export const DEMO_CRASH_DATA = [
  { id: 'crash-1', date: '2024-09-15', severity: 'visible_injury', lat: 38.5801, lng: -121.4918, pedestrian: true, bicycle: false },
  { id: 'crash-2', date: '2024-08-22', severity: 'complaint_of_pain', lat: 38.5756, lng: -121.4892, pedestrian: false, bicycle: true },
  { id: 'crash-3', date: '2024-07-10', severity: 'severe_injury', lat: 38.5489, lng: -121.4571, pedestrian: true, bicycle: false },
  { id: 'crash-4', date: '2024-06-05', severity: 'property_damage_only', lat: 38.5834, lng: -121.4956, pedestrian: false, bicycle: false },
  { id: 'crash-5', date: '2024-05-18', severity: 'visible_injury', lat: 38.5812, lng: -121.4889, pedestrian: false, bicycle: true },
  { id: 'crash-6', date: '2024-04-30', severity: 'fatal', lat: 38.5795, lng: -121.4932, pedestrian: true, bicycle: false },
  { id: 'crash-7', date: '2024-03-12', severity: 'complaint_of_pain', lat: 38.5678, lng: -121.4723, pedestrian: false, bicycle: true },
  { id: 'crash-8', date: '2024-02-28', severity: 'visible_injury', lat: 38.5901, lng: -121.5012, pedestrian: true, bicycle: false },
];

export const DEMO_GRANT_PROGRAMS = [
  {
    id: 'gp-1',
    name: 'Active Transportation Program (ATP)',
    agency: 'Caltrans',
    description: 'Funds projects that encourage walking and bicycling',
    typical_range_min: 500000,
    typical_range_max: 10000000,
    match_required: 11.47,
    url: 'https://catc.ca.gov/programs/active-transportation-program',
  },
  {
    id: 'gp-2',
    name: 'Highway Safety Improvement Program (HSIP)',
    agency: 'Caltrans',
    description: 'Funds infrastructure safety improvements',
    typical_range_min: 100000,
    typical_range_max: 5000000,
    match_required: 10,
    url: 'https://dot.ca.gov/programs/local-assistance/fed-and-state-programs/highway-safety-improvement-program',
  },
  {
    id: 'gp-3',
    name: 'Safe Streets and Roads for All (SS4A)',
    agency: 'USDOT',
    description: 'Supports Vision Zero and safety action plans',
    typical_range_min: 200000,
    typical_range_max: 30000000,
    match_required: 20,
    url: 'https://www.transportation.gov/grants/SS4A',
  },
  {
    id: 'gp-4',
    name: 'RAISE Grants',
    agency: 'USDOT',
    description: 'Rebuilding American Infrastructure with Sustainability and Equity',
    typical_range_min: 5000000,
    typical_range_max: 25000000,
    match_required: 20,
    url: 'https://www.transportation.gov/RAISEgrants',
  },
];

// Helper to check if we're in demo mode
export function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('planpulse_demo_mode') === 'true';
}

export function enableDemoMode(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('planpulse_demo_mode', 'true');
  // Also set a cookie so middleware can read it
  document.cookie = 'planpulse_demo=true; path=/; max-age=86400'; // 24 hours
}

export function disableDemoMode(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('planpulse_demo_mode');
  // Also remove the cookie
  document.cookie = 'planpulse_demo=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

// Calculate demo stats
export function getDemoStats() {
  return {
    activeProjects: DEMO_PROJECTS.filter(p => p.status === 'active' || p.status === 'planning').length,
    pendingGrants: DEMO_GRANT_APPLICATIONS.filter(g => ['drafting', 'submitted', 'under_review'].includes(g.status)).length,
    totalEngagements: DEMO_ENGAGEMENT_PROJECTS.filter(e => e.status === 'active').length,
    totalInputs: DEMO_COMMUNITY_INPUTS.length,
  };
}

