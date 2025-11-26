/**
 * Transportation Data Sources API Integration
 * 
 * Supported APIs:
 * - TIMS (Transportation Injury Mapping System) - California crash data
 * - GTFS (General Transit Feed Specification) - Transit routes/stops
 * - US Census - Demographics and commute data
 * - OpenStreetMap/Overpass - Infrastructure data
 * - LEHD (LODES) - Employment/commute flows
 * - EPA Smart Location - Walkability/transit access
 * - FHWA HPMS - Highway performance data
 */

export interface DataSource {
  id: string;
  name: string;
  description: string;
  category: 'safety' | 'transit' | 'demographics' | 'infrastructure' | 'environmental';
  icon: string;
  available: boolean;
  requiresApiKey: boolean;
  apiKeyEnvVar?: string;
}

export const DATA_SOURCES: DataSource[] = [
  // Safety Data
  {
    id: 'tims',
    name: 'TIMS Crash Data',
    description: 'California Statewide Integrated Traffic Records System - collision data from CHP',
    category: 'safety',
    icon: '🚨',
    available: true,
    requiresApiKey: false,
  },
  {
    id: 'fars',
    name: 'FARS Fatal Crashes',
    description: 'NHTSA Fatality Analysis Reporting System - nationwide fatal crash data',
    category: 'safety',
    icon: '⚠️',
    available: true,
    requiresApiKey: false,
  },
  
  // Transit Data
  {
    id: 'gtfs',
    name: 'GTFS Transit Feeds',
    description: 'General Transit Feed Specification - routes, stops, schedules',
    category: 'transit',
    icon: '🚌',
    available: true,
    requiresApiKey: false,
  },
  {
    id: 'ntd',
    name: 'National Transit Database',
    description: 'FTA transit agency performance and financial data',
    category: 'transit',
    icon: '📊',
    available: true,
    requiresApiKey: false,
  },
  
  // Demographics
  {
    id: 'census-acs',
    name: 'Census ACS',
    description: 'American Community Survey - demographics, commute patterns, income',
    category: 'demographics',
    icon: '👥',
    available: true,
    requiresApiKey: true,
    apiKeyEnvVar: 'CENSUS_API_KEY',
  },
  {
    id: 'lehd-lodes',
    name: 'LEHD LODES',
    description: 'Longitudinal Employer-Household Dynamics - employment locations, commute flows',
    category: 'demographics',
    icon: '💼',
    available: true,
    requiresApiKey: false,
  },
  
  // Infrastructure
  {
    id: 'osm',
    name: 'OpenStreetMap',
    description: 'Bike lanes, sidewalks, trails, crosswalks via Overpass API',
    category: 'infrastructure',
    icon: '🛤️',
    available: true,
    requiresApiKey: false,
  },
  {
    id: 'hpms',
    name: 'FHWA HPMS',
    description: 'Highway Performance Monitoring System - road conditions, VMT',
    category: 'infrastructure',
    icon: '🛣️',
    available: true,
    requiresApiKey: false,
  },
  
  // Environmental
  {
    id: 'epa-sld',
    name: 'EPA Smart Location',
    description: 'Walkability, transit access, job accessibility indices',
    category: 'environmental',
    icon: '🌱',
    available: true,
    requiresApiKey: false,
  },
  {
    id: 'calenviroscreen',
    name: 'CalEnviroScreen',
    description: 'California environmental justice screening tool',
    category: 'environmental',
    icon: '🏭',
    available: true,
    requiresApiKey: false,
  },
];

// TIMS API - California crash data
export async function fetchTIMSData(params: {
  county?: string;
  startYear?: number;
  endYear?: number;
  bbox?: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
}): Promise<GeoJSON.FeatureCollection> {
  // TIMS data is available via their API or as downloadable CSVs
  // For demo, we'll use sample data. In production, integrate with:
  // https://tims.berkeley.edu/help/SWITRS.php
  
  const { bbox } = params;
  
  // Demo data for Sacramento area
  const demoFeatures: GeoJSON.Feature[] = [
    { type: 'Feature', properties: { id: 1, year: 2023, severity: 'fatal', type: 'pedestrian', date: '2023-06-15' }, geometry: { type: 'Point', coordinates: [-121.4944, 38.5816] } },
    { type: 'Feature', properties: { id: 2, year: 2023, severity: 'severe', type: 'bicycle', date: '2023-07-22' }, geometry: { type: 'Point', coordinates: [-121.4852, 38.5765] } },
    { type: 'Feature', properties: { id: 3, year: 2023, severity: 'injury', type: 'vehicle', date: '2023-08-10' }, geometry: { type: 'Point', coordinates: [-121.5044, 38.5616] } },
    { type: 'Feature', properties: { id: 4, year: 2023, severity: 'fatal', type: 'pedestrian', date: '2023-09-05' }, geometry: { type: 'Point', coordinates: [-121.4694, 38.5916] } },
    { type: 'Feature', properties: { id: 5, year: 2022, severity: 'severe', type: 'bicycle', date: '2022-04-18' }, geometry: { type: 'Point', coordinates: [-121.4784, 38.5706] } },
    { type: 'Feature', properties: { id: 6, year: 2022, severity: 'injury', type: 'vehicle', date: '2022-11-30' }, geometry: { type: 'Point', coordinates: [-121.4594, 38.5866] } },
    { type: 'Feature', properties: { id: 7, year: 2023, severity: 'severe', type: 'pedestrian', date: '2023-02-14' }, geometry: { type: 'Point', coordinates: [-121.5144, 38.5516] } },
    { type: 'Feature', properties: { id: 8, year: 2023, severity: 'injury', type: 'bicycle', date: '2023-05-28' }, geometry: { type: 'Point', coordinates: [-121.4444, 38.5616] } },
  ];

  // Filter by bbox if provided
  let features = demoFeatures;
  if (bbox) {
    features = demoFeatures.filter(f => {
      const coords = (f.geometry as GeoJSON.Point).coordinates;
      return coords[0] >= bbox[0] && coords[0] <= bbox[2] && 
             coords[1] >= bbox[1] && coords[1] <= bbox[3];
    });
  }

  return { type: 'FeatureCollection', features };
}

// GTFS Transit Data
export async function fetchGTFSData(params: {
  agencyId?: string;
  feedUrl?: string;
  dataType: 'stops' | 'routes' | 'shapes';
}): Promise<GeoJSON.FeatureCollection> {
  // In production, fetch from transit agency's GTFS feed or use:
  // - Transitland API: https://www.transit.land/documentation
  // - OpenMobilityData: https://transitfeeds.com/
  
  const { dataType } = params;
  
  // Demo Sacramento RT data
  const demoStops: GeoJSON.Feature[] = [
    { type: 'Feature', properties: { stop_id: '1001', name: 'Downtown Transit Center', routes: ['Gold Line', 'Blue Line', '30'] }, geometry: { type: 'Point', coordinates: [-121.4934, 38.5826] } },
    { type: 'Feature', properties: { stop_id: '1002', name: '16th St Station', routes: ['Gold Line', 'Blue Line'] }, geometry: { type: 'Point', coordinates: [-121.4684, 38.5686] } },
    { type: 'Feature', properties: { stop_id: '1003', name: '29th St Station', routes: ['Gold Line'] }, geometry: { type: 'Point', coordinates: [-121.4484, 38.5686] } },
    { type: 'Feature', properties: { stop_id: '1004', name: 'Arden/Del Paso Station', routes: ['Blue Line'] }, geometry: { type: 'Point', coordinates: [-121.4034, 38.6126] } },
    { type: 'Feature', properties: { stop_id: '1005', name: 'Swanston Station', routes: ['Blue Line'] }, geometry: { type: 'Point', coordinates: [-121.4234, 38.6426] } },
    { type: 'Feature', properties: { stop_id: '1006', name: 'Power Inn Station', routes: ['Gold Line'] }, geometry: { type: 'Point', coordinates: [-121.4084, 38.5486] } },
    { type: 'Feature', properties: { stop_id: '1007', name: 'City College Station', routes: ['Gold Line'] }, geometry: { type: 'Point', coordinates: [-121.3884, 38.5386] } },
    { type: 'Feature', properties: { stop_id: '1008', name: 'Florin Station', routes: ['Blue Line'] }, geometry: { type: 'Point', coordinates: [-121.4934, 38.4926] } },
  ];

  const demoRoutes: GeoJSON.Feature[] = [
    { 
      type: 'Feature', 
      properties: { route_id: 'gold', name: 'Gold Line', type: 'light_rail', color: '#FFD700' }, 
      geometry: { 
        type: 'LineString', 
        coordinates: [
          [-121.4934, 38.5826], [-121.4684, 38.5686], [-121.4484, 38.5686],
          [-121.4084, 38.5486], [-121.3884, 38.5386]
        ] 
      } 
    },
    { 
      type: 'Feature', 
      properties: { route_id: 'blue', name: 'Blue Line', type: 'light_rail', color: '#0066CC' }, 
      geometry: { 
        type: 'LineString', 
        coordinates: [
          [-121.4934, 38.5826], [-121.4684, 38.5686], [-121.4034, 38.6126],
          [-121.4234, 38.6426]
        ] 
      } 
    },
    { 
      type: 'Feature', 
      properties: { route_id: 'green', name: 'Green Line', type: 'light_rail', color: '#00AA00' }, 
      geometry: { 
        type: 'LineString', 
        coordinates: [
          [-121.4934, 38.5826], [-121.4934, 38.4926]
        ] 
      } 
    },
  ];

  if (dataType === 'stops') {
    return { type: 'FeatureCollection', features: demoStops };
  } else if (dataType === 'routes') {
    return { type: 'FeatureCollection', features: demoRoutes };
  }
  
  return { type: 'FeatureCollection', features: [] };
}

// Census ACS Data
export async function fetchCensusData(params: {
  variables: string[];
  geography: 'tract' | 'block-group' | 'county';
  state: string;
  county?: string;
}): Promise<GeoJSON.FeatureCollection> {
  const apiKey = process.env.CENSUS_API_KEY;
  
  // For demo, return sample demographic data
  // In production, use: https://api.census.gov/data/2022/acs/acs5
  
  const demoTracts: GeoJSON.Feature[] = [
    { 
      type: 'Feature', 
      properties: { 
        tract: '000100', 
        population: 4521, 
        median_income: 52340,
        pct_transit_commute: 12.5,
        pct_walk_bike: 8.2,
        pct_zero_vehicle: 15.3
      }, 
      geometry: { 
        type: 'Polygon', 
        coordinates: [[
          [-121.51, 38.59], [-121.48, 38.59], [-121.48, 38.57], [-121.51, 38.57], [-121.51, 38.59]
        ]] 
      } 
    },
    { 
      type: 'Feature', 
      properties: { 
        tract: '000200', 
        population: 3842, 
        median_income: 68450,
        pct_transit_commute: 8.1,
        pct_walk_bike: 5.4,
        pct_zero_vehicle: 6.2
      }, 
      geometry: { 
        type: 'Polygon', 
        coordinates: [[
          [-121.48, 38.59], [-121.45, 38.59], [-121.45, 38.57], [-121.48, 38.57], [-121.48, 38.59]
        ]] 
      } 
    },
  ];

  return { type: 'FeatureCollection', features: demoTracts };
}

// OpenStreetMap/Overpass - Bike infrastructure
export async function fetchOSMBikeInfra(params: {
  bbox: [number, number, number, number]; // [south, west, north, east]
}): Promise<GeoJSON.FeatureCollection> {
  // Overpass API query for bike infrastructure
  // In production, use: https://overpass-api.de/api/interpreter
  
  const demoBikeLanes: GeoJSON.Feature[] = [
    { 
      type: 'Feature', 
      properties: { type: 'bike_lane', name: 'J Street Bikeway', surface: 'asphalt', protection: 'protected' }, 
      geometry: { 
        type: 'LineString', 
        coordinates: [[-121.52, 38.58], [-121.48, 38.58], [-121.44, 38.58]] 
      } 
    },
    { 
      type: 'Feature', 
      properties: { type: 'bike_lane', name: 'L Street Bikeway', surface: 'asphalt', protection: 'buffered' }, 
      geometry: { 
        type: 'LineString', 
        coordinates: [[-121.52, 38.575], [-121.48, 38.575], [-121.44, 38.575]] 
      } 
    },
    { 
      type: 'Feature', 
      properties: { type: 'trail', name: 'American River Trail', surface: 'paved' }, 
      geometry: { 
        type: 'LineString', 
        coordinates: [[-121.50, 38.60], [-121.45, 38.61], [-121.40, 38.605], [-121.35, 38.61]] 
      } 
    },
    { 
      type: 'Feature', 
      properties: { type: 'trail', name: 'Sacramento River Trail', surface: 'paved' }, 
      geometry: { 
        type: 'LineString', 
        coordinates: [[-121.51, 38.59], [-121.52, 38.57], [-121.53, 38.55]] 
      } 
    },
  ];

  return { type: 'FeatureCollection', features: demoBikeLanes };
}

// EPA Smart Location Database
export async function fetchEPASLD(params: {
  bbox?: [number, number, number, number];
}): Promise<GeoJSON.FeatureCollection> {
  // EPA Smart Location Database provides walkability indices
  // In production, use ArcGIS REST API or download from:
  // https://www.epa.gov/smartgrowth/smart-location-mapping
  
  const demoSLD: GeoJSON.Feature[] = [
    { 
      type: 'Feature', 
      properties: { 
        geoid: '06067000100',
        walkability_index: 15.2,
        transit_freq: 'High',
        d3b: 245.5, // Employment entropy
        d4a: 8.2, // Distance to transit
        nwi: 0.85 // National Walkability Index
      }, 
      geometry: { 
        type: 'Polygon', 
        coordinates: [[
          [-121.51, 38.59], [-121.48, 38.59], [-121.48, 38.57], [-121.51, 38.57], [-121.51, 38.59]
        ]] 
      } 
    },
  ];

  return { type: 'FeatureCollection', features: demoSLD };
}

// CalEnviroScreen - Environmental Justice data
export async function fetchCalEnviroScreen(params: {
  county?: string;
}): Promise<GeoJSON.FeatureCollection> {
  // CalEnviroScreen 4.0 data
  // In production, use: https://oehha.ca.gov/calenviroscreen/report/calenviroscreen-40
  
  const demoCES: GeoJSON.Feature[] = [
    { 
      type: 'Feature', 
      properties: { 
        tract: '06067000100',
        ces_score: 72.5,
        percentile: 85,
        pollution_burden: 68.2,
        population_characteristics: 76.8,
        traffic_pctl: 82,
        diesel_pm_pctl: 75,
        poverty_pctl: 88
      }, 
      geometry: { 
        type: 'Polygon', 
        coordinates: [[
          [-121.51, 38.59], [-121.48, 38.59], [-121.48, 38.57], [-121.51, 38.57], [-121.51, 38.59]
        ]] 
      } 
    },
  ];

  return { type: 'FeatureCollection', features: demoCES };
}

// Main function to load data by source ID
export async function loadDataSource(
  sourceId: string, 
  params: Record<string, unknown> = {}
): Promise<GeoJSON.FeatureCollection> {
  switch (sourceId) {
    case 'tims':
      return fetchTIMSData(params as Parameters<typeof fetchTIMSData>[0]);
    case 'gtfs-stops':
      return fetchGTFSData({ ...params, dataType: 'stops' } as Parameters<typeof fetchGTFSData>[0]);
    case 'gtfs-routes':
      return fetchGTFSData({ ...params, dataType: 'routes' } as Parameters<typeof fetchGTFSData>[0]);
    case 'census-acs':
      return fetchCensusData(params as Parameters<typeof fetchCensusData>[0]);
    case 'osm-bike':
      return fetchOSMBikeInfra(params as Parameters<typeof fetchOSMBikeInfra>[0]);
    case 'epa-sld':
      return fetchEPASLD(params as Parameters<typeof fetchEPASLD>[0]);
    case 'calenviroscreen':
      return fetchCalEnviroScreen(params as Parameters<typeof fetchCalEnviroScreen>[0]);
    default:
      throw new Error(`Unknown data source: ${sourceId}`);
  }
}

// Get all available data sources by category
export function getDataSourcesByCategory(category?: DataSource['category']): DataSource[] {
  if (!category) return DATA_SOURCES;
  return DATA_SOURCES.filter(ds => ds.category === category);
}

