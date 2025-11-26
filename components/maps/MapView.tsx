'use client';

import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useDemo } from '@/lib/hooks/useDemo';

// Set the access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface MapViewProps {
  activeLayers: string[];
}

// Demo data for Sacramento region
const DEMO_DATA = {
  projects: {
    type: 'FeatureCollection' as const,
    features: [
      {
        type: 'Feature' as const,
        properties: { name: 'Downtown Complete Streets Plan', status: 'active' },
        geometry: { type: 'Point' as const, coordinates: [-121.4944, 38.5816] }
      },
      {
        type: 'Feature' as const,
        properties: { name: 'Safe Routes to School - Oak Park', status: 'active' },
        geometry: { type: 'Point' as const, coordinates: [-121.4452, 38.5502] }
      },
      {
        type: 'Feature' as const,
        properties: { name: 'American River Trail Extension', status: 'planning' },
        geometry: { type: 'Point' as const, coordinates: [-121.3628, 38.6048] }
      },
      {
        type: 'Feature' as const,
        properties: { name: 'Elk Grove Main Street', status: 'active' },
        geometry: { type: 'Point' as const, coordinates: [-121.3716, 38.4088] }
      },
    ]
  },
  crashes: {
    type: 'FeatureCollection' as const,
    features: [
      { type: 'Feature' as const, properties: { severity: 'high', count: 5 }, geometry: { type: 'Point' as const, coordinates: [-121.4894, 38.5766] } },
      { type: 'Feature' as const, properties: { severity: 'medium', count: 3 }, geometry: { type: 'Point' as const, coordinates: [-121.4744, 38.5816] } },
      { type: 'Feature' as const, properties: { severity: 'high', count: 4 }, geometry: { type: 'Point' as const, coordinates: [-121.5044, 38.5616] } },
      { type: 'Feature' as const, properties: { severity: 'low', count: 2 }, geometry: { type: 'Point' as const, coordinates: [-121.4594, 38.5916] } },
    ]
  },
  communityInputs: {
    type: 'FeatureCollection' as const,
    features: [
      { type: 'Feature' as const, properties: { type: 'safety', text: 'Need crosswalk here' }, geometry: { type: 'Point' as const, coordinates: [-121.4944, 38.5716] } },
      { type: 'Feature' as const, properties: { type: 'bike', text: 'Protected bike lane needed' }, geometry: { type: 'Point' as const, coordinates: [-121.4844, 38.5766] } },
      { type: 'Feature' as const, properties: { type: 'transit', text: 'Bus stop shelter request' }, geometry: { type: 'Point' as const, coordinates: [-121.4794, 38.5866] } },
    ]
  },
  transitStops: {
    type: 'FeatureCollection' as const,
    features: [
      { type: 'Feature' as const, properties: { name: 'Downtown Transit Center', routes: '30, 1, 2' }, geometry: { type: 'Point' as const, coordinates: [-121.4934, 38.5826] } },
      { type: 'Feature' as const, properties: { name: 'J Street Station', routes: '30' }, geometry: { type: 'Point' as const, coordinates: [-121.4784, 38.5806] } },
      { type: 'Feature' as const, properties: { name: 'Broadway & 16th', routes: '1, 62' }, geometry: { type: 'Point' as const, coordinates: [-121.4684, 38.5686] } },
    ]
  }
};

export default function MapView({ activeLayers }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { isDemo } = useDemo();

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-121.4944, 38.5816], // Sacramento
      zoom: 12,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
    map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

    map.current.on('load', () => {
      if (!map.current) return;
      
      // Add demo data sources
      map.current.addSource('projects', {
        type: 'geojson',
        data: DEMO_DATA.projects
      });

      map.current.addSource('crashes', {
        type: 'geojson',
        data: DEMO_DATA.crashes
      });

      map.current.addSource('community-inputs', {
        type: 'geojson',
        data: DEMO_DATA.communityInputs
      });

      map.current.addSource('transit-stops', {
        type: 'geojson',
        data: DEMO_DATA.transitStops
      });

      // Add layers
      map.current.addLayer({
        id: 'projects',
        type: 'circle',
        source: 'projects',
        paint: {
          'circle-radius': 10,
          'circle-color': '#10b981',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff'
        }
      });

      map.current.addLayer({
        id: 'crashes',
        type: 'circle',
        source: 'crashes',
        paint: {
          'circle-radius': ['get', 'count'],
          'circle-color': '#ef4444',
          'circle-opacity': 0.7,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff'
        }
      });

      map.current.addLayer({
        id: 'community-inputs',
        type: 'circle',
        source: 'community-inputs',
        paint: {
          'circle-radius': 8,
          'circle-color': '#f59e0b',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff'
        }
      });

      map.current.addLayer({
        id: 'transit-stops',
        type: 'circle',
        source: 'transit-stops',
        paint: {
          'circle-radius': 6,
          'circle-color': '#8b5cf6',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff'
        }
      });

      setMapLoaded(true);
    });

    // Cleanup
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update layer visibility when activeLayers changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const layerIds = ['projects', 'crashes', 'community-inputs', 'transit-stops', 'transit-routes'];
    
    layerIds.forEach(layerId => {
      if (map.current?.getLayer(layerId)) {
        const visibility = activeLayers.includes(layerId) ? 'visible' : 'none';
        map.current.setLayoutProperty(layerId, 'visibility', visibility);
      }
    });
  }, [activeLayers, mapLoaded]);

  // Add click handlers for popups
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const handleClick = (e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }, layerId: string) => {
      if (!e.features?.length || !map.current) return;
      
      const feature = e.features[0];
      const coordinates = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number];
      
      let html = '';
      switch (layerId) {
        case 'projects':
          html = `<strong>${feature.properties?.name}</strong><br/>Status: ${feature.properties?.status}`;
          break;
        case 'crashes':
          html = `<strong>Crash Location</strong><br/>Severity: ${feature.properties?.severity}<br/>Count: ${feature.properties?.count}`;
          break;
        case 'community-inputs':
          html = `<strong>Community Input</strong><br/>Type: ${feature.properties?.type}<br/>"${feature.properties?.text}"`;
          break;
        case 'transit-stops':
          html = `<strong>${feature.properties?.name}</strong><br/>Routes: ${feature.properties?.routes}`;
          break;
      }

      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(html)
        .addTo(map.current);
    };

    ['projects', 'crashes', 'community-inputs', 'transit-stops'].forEach(layerId => {
      map.current?.on('click', layerId, (e) => handleClick(e, layerId));
      map.current?.on('mouseenter', layerId, () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current?.on('mouseleave', layerId, () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
    });
  }, [mapLoaded]);

  return <div ref={mapContainer} className="absolute inset-0" />;
}

