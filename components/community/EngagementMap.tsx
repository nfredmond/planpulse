'use client';

import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface CommunityInput {
  id: string;
  input_type: string;
  category: string;
  title: string;
  content: string;
  sentiment: string;
  upvotes: number;
  lat?: number;
  lng?: number;
}

interface EngagementMapProps {
  inputs: CommunityInput[];
  center: [number, number];
  zoom: number;
  onSelectInput?: (input: CommunityInput | null) => void;
  interactive?: boolean;
  onMapClick?: (lngLat: { lng: number; lat: number }) => void;
}

const SENTIMENT_COLORS: Record<string, string> = {
  positive: '#10b981',
  negative: '#ef4444',
  neutral: '#6b7280',
  suggestion: '#3b82f6',
};

const CATEGORY_ICONS: Record<string, string> = {
  safety: '⚠️',
  infrastructure: '🏗️',
  accessibility: '♿',
  'bike/pedestrian': '🚴',
  transit: '🚌',
  parking: '🅿️',
  lighting: '💡',
  other: '📍',
};

export default function EngagementMap({
  inputs,
  center,
  zoom,
  onSelectInput,
  interactive = true,
  onMapClick,
}: EngagementMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;
    if (map.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;

    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: center,
      zoom: zoom,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    if (interactive && onMapClick) {
      map.current.on('click', (e) => {
        onMapClick({ lng: e.lngLat.lng, lat: e.lngLat.lat });
      });
    }

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      markers.current.forEach(m => m.remove());
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [center, zoom, interactive, onMapClick]);

  // Add markers for inputs
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markers.current.forEach(m => m.remove());
    markers.current = [];

    // Add new markers
    inputs.forEach(input => {
      if (!input.lat || !input.lng || !map.current) return;

      const color = SENTIMENT_COLORS[input.sentiment] || SENTIMENT_COLORS.neutral;
      
      // Create marker element
      const el = document.createElement('div');
      el.className = 'engagement-marker';
      el.innerHTML = `
        <div style="
          width: 32px;
          height: 32px;
          background: ${color};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          cursor: pointer;
          transition: transform 0.2s;
        " onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">
          ${CATEGORY_ICONS[input.category.toLowerCase()] || '📍'}
        </div>
      `;

      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
        .setHTML(`
          <div style="padding: 8px; max-width: 250px;">
            <div style="font-weight: 600; margin-bottom: 4px;">${input.title}</div>
            <div style="font-size: 13px; color: #666; margin-bottom: 8px;">${input.content.slice(0, 100)}${input.content.length > 100 ? '...' : ''}</div>
            <div style="display: flex; gap: 8px; font-size: 12px; color: #888;">
              <span style="background: ${color}20; color: ${color}; padding: 2px 8px; border-radius: 4px;">${input.category}</span>
              <span>👍 ${input.upvotes}</span>
            </div>
          </div>
        `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([input.lng, input.lat])
        .setPopup(popup)
        .addTo(map.current);

      el.addEventListener('click', () => {
        if (onSelectInput) {
          onSelectInput(input);
        }
      });

      markers.current.push(marker);
    });
  }, [inputs, mapLoaded, onSelectInput]);

  return (
    <div 
      ref={mapContainer} 
      className="w-full h-full"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
    />
  );
}

