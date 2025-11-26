'use client';

import { Map, Layers, Plus, Upload } from 'lucide-react';

export default function MapsPage() {
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
        {/* Placeholder for Mapbox */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <Map className="w-10 h-10 text-emerald-400" />
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

        {/* Layer controls (placeholder) */}
        <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-sm border border-slate-800 rounded-xl p-4 w-64">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h3 className="font-medium text-white text-sm">Layers</h3>
          </div>
          <div className="space-y-2">
            {['Projects', 'Transit Routes', 'Transit Stops', 'Crashes', 'Community Inputs'].map((layer) => (
              <label key={layer} className="flex items-center gap-2 text-sm">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-emerald-500 focus:ring-emerald-500/50"
                />
                <span className="text-slate-300">{layer}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

