'use client';

import { useState, useEffect } from 'react';
import { Map as MapIcon, Layers, Plus, Upload, AlertTriangle } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import('@/components/maps/MapView'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <MapIcon className="w-10 h-10 text-emerald-400" />
        </div>
        <p className="text-slate-400">Loading map...</p>
      </div>
    </div>
  ),
});

const LAYER_OPTIONS = [
  { id: 'projects', name: 'Projects', color: '#10b981' },
  { id: 'transit-routes', name: 'Transit Routes', color: '#3b82f6' },
  { id: 'transit-stops', name: 'Transit Stops', color: '#8b5cf6' },
  { id: 'crashes', name: 'Crashes', color: '#ef4444' },
  { id: 'community-inputs', name: 'Community Inputs', color: '#f59e0b' },
];

export default function MapsPage() {
  const [activeLayers, setActiveLayers] = useState<string[]>(['projects']);
  const [tokenStatus, setTokenStatus] = useState<'loading' | 'valid' | 'invalid' | 'missing'>('loading');

  useEffect(() => {
    // Check if Mapbox token is available and valid (must be public token pk.*)
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      setTokenStatus('missing');
    } else if (token.startsWith('pk.')) {
      setTokenStatus('valid');
    } else {
      setTokenStatus('invalid'); // Secret token (sk.*) or malformed
    }
  }, []);

  const toggleLayer = (layerId: string) => {
    setActiveLayers(prev => 
      prev.includes(layerId) 
        ? prev.filter(id => id !== layerId)
        : [...prev, layerId]
    );
  };

  return (
    <div className="h-[calc(100vh-theme(spacing.32))] flex flex-col">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Maps Workspace</h1>
          <p className="text-slate-400 mt-1">
            View and analyze spatial data
          </p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors border border-slate-700">
            <Upload className="w-4 h-4" />
            Import Data
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            New Layer
          </button>
        </div>
      </div>

      {/* Map container */}
      <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden relative">
        {tokenStatus === 'loading' ? (
          // Loading state
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <MapIcon className="w-10 h-10 text-emerald-400" />
              </div>
              <p className="text-slate-400">Loading...</p>
            </div>
          </div>
        ) : tokenStatus === 'valid' ? (
          // Render the map
          <MapComponent activeLayers={activeLayers} />
        ) : tokenStatus === 'invalid' ? (
          // Invalid token (secret token used instead of public)
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-10 h-10 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Invalid Mapbox Token</h3>
              <p className="text-slate-400">
                You&apos;re using a <span className="text-amber-400">secret token (sk.*)</span> instead of a <span className="text-emerald-400">public token (pk.*)</span>.
              </p>
              <p className="text-sm text-slate-500 mt-4">
                Get a public token from your <a href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Mapbox account</a>
              </p>
            </div>
          </div>
        ) : (
          // No token - show configuration message
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <MapIcon className="w-10 h-10 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Map View</h3>
              <p className="text-slate-400 max-w-md">
                Configure your Mapbox token in environment variables to enable the interactive map.
              </p>
              <p className="text-sm text-slate-500 mt-4">
                Add <code className="px-2 py-0.5 bg-slate-800 rounded text-emerald-400">NEXT_PUBLIC_MAPBOX_TOKEN</code> to your .env.local
              </p>
            </div>
          </div>
        )}

        {/* Layer controls */}
        <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-sm border border-slate-800 rounded-xl p-4 w-64 z-10">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h3 className="font-medium text-white text-sm">Layers</h3>
          </div>
          <div className="space-y-2">
            {LAYER_OPTIONS.map((layer) => (
              <label key={layer.id} className="flex items-center gap-2 text-sm cursor-pointer group">
                <input 
                  type="checkbox"
                  checked={activeLayers.includes(layer.id)}
                  onChange={() => toggleLayer(layer.id)}
                  className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-emerald-500 focus:ring-emerald-500/50"
                />
                <span 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: layer.color }}
                />
                <span className="text-slate-300 group-hover:text-white transition-colors">
                  {layer.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
