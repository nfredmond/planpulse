'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapViewProps {
  activeLayers: string[];
  customData?: Record<string, GeoJSON.FeatureCollection>;
}

// Demo data for Sacramento region - base layers
const DEMO_DATA = {
  projects: {
    type: 'FeatureCollection' as const,
    features: [
      {
        type: 'Feature' as const,
        properties: { name: 'Downtown Complete Streets Plan', status: 'active', type: 'complete_streets' },
        geometry: { type: 'Point' as const, coordinates: [-121.4944, 38.5816] }
      },
      {
        type: 'Feature' as const,
        properties: { name: 'Safe Routes to School - Oak Park', status: 'active', type: 'srts' },
        geometry: { type: 'Point' as const, coordinates: [-121.4452, 38.5502] }
      },
      {
        type: 'Feature' as const,
        properties: { name: 'American River Trail Extension', status: 'planning', type: 'trail' },
        geometry: { type: 'Point' as const, coordinates: [-121.3628, 38.6048] }
      },
      {
        type: 'Feature' as const,
        properties: { name: 'Elk Grove Main Street', status: 'active', type: 'main_street' },
        geometry: { type: 'Point' as const, coordinates: [-121.3716, 38.4088] }
      },
    ]
  },
  crashes: {
    type: 'FeatureCollection' as const,
    features: [
      { type: 'Feature' as const, properties: { severity: 'fatal', type: 'pedestrian', year: 2023 }, geometry: { type: 'Point' as const, coordinates: [-121.4894, 38.5766] } },
      { type: 'Feature' as const, properties: { severity: 'severe', type: 'bicycle', year: 2023 }, geometry: { type: 'Point' as const, coordinates: [-121.4744, 38.5816] } },
      { type: 'Feature' as const, properties: { severity: 'fatal', type: 'pedestrian', year: 2022 }, geometry: { type: 'Point' as const, coordinates: [-121.5044, 38.5616] } },
      { type: 'Feature' as const, properties: { severity: 'injury', type: 'vehicle', year: 2023 }, geometry: { type: 'Point' as const, coordinates: [-121.4594, 38.5916] } },
      { type: 'Feature' as const, properties: { severity: 'severe', type: 'bicycle', year: 2022 }, geometry: { type: 'Point' as const, coordinates: [-121.4494, 38.5716] } },
      { type: 'Feature' as const, properties: { severity: 'fatal', type: 'pedestrian', year: 2023 }, geometry: { type: 'Point' as const, coordinates: [-121.5144, 38.5516] } },
    ]
  },
  'community-inputs': {
    type: 'FeatureCollection' as const,
    features: [
      { type: 'Feature' as const, properties: { type: 'safety', text: 'Need crosswalk here', votes: 24 }, geometry: { type: 'Point' as const, coordinates: [-121.4944, 38.5716] } },
      { type: 'Feature' as const, properties: { type: 'bike', text: 'Protected bike lane needed', votes: 18 }, geometry: { type: 'Point' as const, coordinates: [-121.4844, 38.5766] } },
      { type: 'Feature' as const, properties: { type: 'transit', text: 'Bus stop shelter request', votes: 12 }, geometry: { type: 'Point' as const, coordinates: [-121.4794, 38.5866] } },
      { type: 'Feature' as const, properties: { type: 'lighting', text: 'Street lighting needed', votes: 31 }, geometry: { type: 'Point' as const, coordinates: [-121.4694, 38.5666] } },
    ]
  },
  'transit-stops': {
    type: 'FeatureCollection' as const,
    features: [
      { type: 'Feature' as const, properties: { name: 'Downtown Transit Center', routes: 'Gold, Blue, 30', ridership: 8500 }, geometry: { type: 'Point' as const, coordinates: [-121.4934, 38.5826] } },
      { type: 'Feature' as const, properties: { name: '16th St Station', routes: 'Gold, Blue', ridership: 4200 }, geometry: { type: 'Point' as const, coordinates: [-121.4684, 38.5686] } },
      { type: 'Feature' as const, properties: { name: '29th St Station', routes: 'Gold', ridership: 2800 }, geometry: { type: 'Point' as const, coordinates: [-121.4484, 38.5686] } },
      { type: 'Feature' as const, properties: { name: 'Arden/Del Paso Station', routes: 'Blue', ridership: 1900 }, geometry: { type: 'Point' as const, coordinates: [-121.4034, 38.6126] } },
      { type: 'Feature' as const, properties: { name: 'Power Inn Station', routes: 'Gold', ridership: 3100 }, geometry: { type: 'Point' as const, coordinates: [-121.4084, 38.5486] } },
    ]
  },
  'transit-routes': {
    type: 'FeatureCollection' as const,
    features: [
      { 
        type: 'Feature' as const, 
        properties: { name: 'Gold Line', type: 'light_rail', color: '#FFD700' }, 
        geometry: { 
          type: 'LineString' as const, 
          coordinates: [
            [-121.4934, 38.5826], [-121.4684, 38.5686], [-121.4484, 38.5686],
            [-121.4084, 38.5486], [-121.3884, 38.5386]
          ] 
        } 
      },
      { 
        type: 'Feature' as const, 
        properties: { name: 'Blue Line', type: 'light_rail', color: '#0066CC' }, 
        geometry: { 
          type: 'LineString' as const, 
          coordinates: [
            [-121.4934, 38.5826], [-121.4684, 38.5686], [-121.4034, 38.6126],
            [-121.4234, 38.6426]
          ] 
        } 
      },
    ]
  }
};

// Layer color mapping
const LAYER_COLORS: Record<string, string> = {
  projects: '#10b981',
  crashes: '#ef4444',
  'community-inputs': '#f59e0b',
  'transit-stops': '#8b5cf6',
  'transit-routes': '#3b82f6',
};

export default function MapView({ activeLayers, customData = {} }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addedCustomLayers = useRef<Set<string>>(new Set());

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;
    if (map.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      setError('Mapbox token not configured');
      return;
    }

    mapboxgl.accessToken = token;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-121.4944, 38.5816],
        zoom: 11,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
      map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setError(`Map error: ${e.error?.message || 'Unknown error'}`);
      });

      map.current.on('load', () => {
        if (!map.current) return;
        
        // Add base layer sources
        Object.entries(DEMO_DATA).forEach(([key, data]) => {
          if (!map.current) return;
          
          map.current.addSource(key, {
            type: 'geojson',
            data: data
          });
        });

        // Add transit routes layer (lines)
        map.current.addLayer({
          id: 'transit-routes',
          type: 'line',
          source: 'transit-routes',
          paint: {
            'line-color': ['get', 'color'],
            'line-width': 4,
            'line-opacity': 0.8
          },
          layout: {
            'visibility': activeLayers.includes('transit-routes') ? 'visible' : 'none'
          }
        });

        // Add point layers
        map.current.addLayer({
          id: 'projects',
          type: 'circle',
          source: 'projects',
          paint: {
            'circle-radius': 12,
            'circle-color': LAYER_COLORS.projects,
            'circle-stroke-width': 3,
            'circle-stroke-color': '#fff'
          },
          layout: {
            'visibility': activeLayers.includes('projects') ? 'visible' : 'none'
          }
        });

        map.current.addLayer({
          id: 'crashes',
          type: 'circle',
          source: 'crashes',
          paint: {
            'circle-radius': [
              'match',
              ['get', 'severity'],
              'fatal', 12,
              'severe', 9,
              6
            ],
            'circle-color': [
              'match',
              ['get', 'severity'],
              'fatal', '#dc2626',
              'severe', '#f97316',
              '#fbbf24'
            ],
            'circle-opacity': 0.85,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff'
          },
          layout: {
            'visibility': activeLayers.includes('crashes') ? 'visible' : 'none'
          }
        });

        map.current.addLayer({
          id: 'community-inputs',
          type: 'circle',
          source: 'community-inputs',
          paint: {
            'circle-radius': 10,
            'circle-color': LAYER_COLORS['community-inputs'],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff'
          },
          layout: {
            'visibility': activeLayers.includes('community-inputs') ? 'visible' : 'none'
          }
        });

        map.current.addLayer({
          id: 'transit-stops',
          type: 'circle',
          source: 'transit-stops',
          paint: {
            'circle-radius': 8,
            'circle-color': LAYER_COLORS['transit-stops'],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff'
          },
          layout: {
            'visibility': activeLayers.includes('transit-stops') ? 'visible' : 'none'
          }
        });

        setMapLoaded(true);
      });
    } catch (err) {
      console.error('Failed to initialize map:', err);
      setError(`Failed to initialize map: ${err}`);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update layer visibility
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const allLayerIds = ['projects', 'crashes', 'community-inputs', 'transit-stops', 'transit-routes', ...addedCustomLayers.current];
    
    allLayerIds.forEach(layerId => {
      if (map.current?.getLayer(layerId)) {
        const visibility = activeLayers.includes(layerId) ? 'visible' : 'none';
        map.current.setLayoutProperty(layerId, 'visibility', visibility);
      }
    });
  }, [activeLayers, mapLoaded]);

  // Add custom data layers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    Object.entries(customData).forEach(([layerId, data]) => {
      if (!map.current) return;
      
      // Skip if already added
      if (addedCustomLayers.current.has(layerId)) {
        // Update existing source
        const source = map.current.getSource(layerId) as mapboxgl.GeoJSONSource;
        if (source) {
          source.setData(data);
        }
        return;
      }

      // Determine layer type based on geometry
      const firstFeature = data.features[0];
      if (!firstFeature) return;

      const geomType = firstFeature.geometry.type;
      
      // Add source
      map.current.addSource(layerId, {
        type: 'geojson',
        data: data
      });

      // Determine a color (cycle through colors)
      const colorIndex = addedCustomLayers.current.size % 10;
      const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'];
      const color = colors[colorIndex];

      // Add layer based on geometry type
      if (geomType === 'Point' || geomType === 'MultiPoint') {
        map.current.addLayer({
          id: layerId,
          type: 'circle',
          source: layerId,
          paint: {
            'circle-radius': 8,
            'circle-color': color,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff'
          }
        });
      } else if (geomType === 'LineString' || geomType === 'MultiLineString') {
        map.current.addLayer({
          id: layerId,
          type: 'line',
          source: layerId,
          paint: {
            'line-color': color,
            'line-width': 3
          }
        });
      } else if (geomType === 'Polygon' || geomType === 'MultiPolygon') {
        map.current.addLayer({
          id: layerId,
          type: 'fill',
          source: layerId,
          paint: {
            'fill-color': color,
            'fill-opacity': 0.3,
            'fill-outline-color': color
          }
        });
      }

      addedCustomLayers.current.add(layerId);

      // Add click handler for popups
      map.current.on('click', layerId, (e) => {
        if (!e.features?.length || !map.current) return;
        
        const feature = e.features[0];
        const props = feature.properties || {};
        
        let html = '<div class="p-2">';
        Object.entries(props).forEach(([key, value]) => {
          if (value && key !== 'id') {
            html += `<div><strong>${key}:</strong> ${value}</div>`;
          }
        });
        html += '</div>';

        const coords = geomType.includes('Point') 
          ? (feature.geometry as GeoJSON.Point).coordinates as [number, number]
          : e.lngLat.toArray() as [number, number];

        new mapboxgl.Popup()
          .setLngLat(coords)
          .setHTML(html)
          .addTo(map.current);
      });

      map.current.on('mouseenter', layerId, () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', layerId, () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
    });
  }, [customData, mapLoaded]);

  // Add click handlers for base layers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const handleClick = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }, layerId: string) => {
      if (!e.features?.length || !map.current) return;
      
      const feature = e.features[0];
      const coordinates = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number];
      const props = feature.properties || {};
      
      let html = '';
      switch (layerId) {
        case 'projects':
          html = `<div class="font-medium text-emerald-600">${props.name}</div>
                  <div class="text-sm text-gray-600">Status: ${props.status}</div>
                  <div class="text-sm text-gray-600">Type: ${props.type}</div>`;
          break;
        case 'crashes':
          html = `<div class="font-medium text-red-600">Crash Location</div>
                  <div class="text-sm">Severity: <span class="font-medium">${props.severity}</span></div>
                  <div class="text-sm">Type: ${props.type}</div>
                  <div class="text-sm">Year: ${props.year}</div>`;
          break;
        case 'community-inputs':
          html = `<div class="font-medium text-amber-600">Community Input</div>
                  <div class="text-sm">Type: ${props.type}</div>
                  <div class="text-sm italic">"${props.text}"</div>
                  <div class="text-sm">Votes: ${props.votes}</div>`;
          break;
        case 'transit-stops':
          html = `<div class="font-medium text-purple-600">${props.name}</div>
                  <div class="text-sm">Routes: ${props.routes}</div>
                  <div class="text-sm">Daily Ridership: ${props.ridership?.toLocaleString()}</div>`;
          break;
        case 'transit-routes':
          html = `<div class="font-medium" style="color: ${props.color}">${props.name}</div>
                  <div class="text-sm">Type: ${props.type}</div>`;
          break;
      }

      if (layerId === 'transit-routes') {
        new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(`<div class="p-2">${html}</div>`)
          .addTo(map.current);
      } else {
        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(`<div class="p-2">${html}</div>`)
          .addTo(map.current);
      }
    };

    ['projects', 'crashes', 'community-inputs', 'transit-stops', 'transit-routes'].forEach(layerId => {
      map.current?.on('click', layerId, (e) => handleClick(e, layerId));
      map.current?.on('mouseenter', layerId, () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current?.on('mouseleave', layerId, () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
    });
  }, [mapLoaded]);

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
        <div className="text-center text-red-400">
          <p className="font-medium">Map Error</p>
          <p className="text-sm text-slate-500 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapContainer} 
      className="w-full h-full"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
    />
  );
}
