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

interface PublicEngagementMapProps {
  inputs: CommunityInput[];
  center: [number, number];
  zoom: number;
  onMapClick?: (lngLat: { lng: number; lat: number }) => void;
  selectedLocation?: { lat: number; lng: number } | null;
}

const SENTIMENT_COLORS: Record<string, string> = {
  positive: '#10b981',
  negative: '#ef4444',
  neutral: '#6b7280',
  suggestion: '#3b82f6',
};

export default function PublicEngagementMap({
  inputs,
  center,
  zoom,
  onMapClick,
  selectedLocation,
}: PublicEngagementMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const selectedMarker = useRef<mapboxgl.Marker | null>(null);
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
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      'bottom-right'
    );

    if (onMapClick) {
      map.current.on('click', (e) => {
        onMapClick({ lng: e.lngLat.lng, lat: e.lngLat.lat });
      });
    }

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      markers.current.forEach(m => m.remove());
      if (selectedMarker.current) selectedMarker.current.remove();
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [center, zoom, onMapClick]);

  // Add/update selected location marker
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove old marker
    if (selectedMarker.current) {
      selectedMarker.current.remove();
      selectedMarker.current = null;
    }

    // Add new marker if location is selected
    if (selectedLocation) {
      const el = document.createElement('div');
      el.innerHTML = `
        <div style="
          width: 40px;
          height: 40px;
          background: #10b981;
          border: 4px solid white;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          animation: pulse 2s infinite;
        "></div>
        <style>
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
            70% { box-shadow: 0 0 0 20px rgba(16, 185, 129, 0); }
            100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
          }
        </style>
      `;

      selectedMarker.current = new mapboxgl.Marker(el)
        .setLngLat([selectedLocation.lng, selectedLocation.lat])
        .addTo(map.current);

      // Pan to selected location
      map.current.flyTo({
        center: [selectedLocation.lng, selectedLocation.lat],
        zoom: Math.max(map.current.getZoom(), 15),
        duration: 500,
      });
    }
  }, [selectedLocation, mapLoaded]);

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
      
      const el = document.createElement('div');
      el.innerHTML = `
        <div style="
          width: 28px;
          height: 28px;
          background: ${color};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
          cursor: pointer;
          transition: transform 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        " onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25, closeButton: true, maxWidth: '300px' })
        .setHTML(`
          <div style="padding: 8px;">
            <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px;">${input.title}</div>
            <div style="font-size: 13px; color: #64748b; margin-bottom: 8px;">${input.content.slice(0, 150)}${input.content.length > 150 ? '...' : ''}</div>
            <div style="display: flex; gap: 8px; font-size: 12px;">
              <span style="background: ${color}20; color: ${color}; padding: 2px 8px; border-radius: 4px;">${input.category}</span>
              <span style="color: #94a3b8;">👍 ${input.upvotes}</span>
            </div>
          </div>
        `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([input.lng, input.lat])
        .setPopup(popup)
        .addTo(map.current);

      markers.current.push(marker);
    });
  }, [inputs, mapLoaded]);

  return (
    <div 
      ref={mapContainer} 
      className="w-full h-full cursor-crosshair"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
    />
  );
}

