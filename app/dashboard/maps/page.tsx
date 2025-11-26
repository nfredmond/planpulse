'use client';

import { useState, useEffect, useRef } from 'react';
import { Map as MapIcon, Layers, Plus, Upload, AlertTriangle, X, FileJson, MapPin, Trash2, Database, RefreshCw, Check } from 'lucide-react';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';

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

const DEFAULT_LAYERS = [
  { id: 'projects', name: 'Projects', color: '#10b981', removable: false },
  { id: 'transit-routes', name: 'Transit Routes', color: '#3b82f6', removable: false },
  { id: 'transit-stops', name: 'Transit Stops', color: '#8b5cf6', removable: false },
  { id: 'crashes', name: 'Crashes', color: '#ef4444', removable: false },
  { id: 'community-inputs', name: 'Community Inputs', color: '#f59e0b', removable: false },
];

const LAYER_COLORS = [
  '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b', 
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
];

// Data sources configuration
const DATA_SOURCES = [
  // Safety
  { id: 'tims', name: 'TIMS Crash Data', description: 'California SWITRS collision data', category: 'safety', icon: '🚨' },
  { id: 'fars', name: 'FARS Fatal Crashes', description: 'NHTSA nationwide fatal crash data', category: 'safety', icon: '⚠️' },
  // Transit
  { id: 'gtfs-stops', name: 'GTFS Transit Stops', description: 'Transit stop locations from GTFS', category: 'transit', icon: '🚏' },
  { id: 'gtfs-routes', name: 'GTFS Transit Routes', description: 'Transit route alignments from GTFS', category: 'transit', icon: '🚌' },
  { id: 'ntd', name: 'National Transit Database', description: 'FTA transit agency performance data', category: 'transit', icon: '📊' },
  // Demographics
  { id: 'census-acs', name: 'Census ACS', description: 'Demographics, income, commute patterns', category: 'demographics', icon: '👥' },
  { id: 'lehd-lodes', name: 'LEHD LODES', description: 'Employment locations and commute flows', category: 'demographics', icon: '💼' },
  // Infrastructure
  { id: 'osm-bike', name: 'OSM Bike Infrastructure', description: 'Bike lanes, trails, paths from OpenStreetMap', category: 'infrastructure', icon: '🚴' },
  { id: 'hpms', name: 'FHWA HPMS', description: 'Highway performance and condition data', category: 'infrastructure', icon: '🛣️' },
  // Environmental
  { id: 'epa-sld', name: 'EPA Smart Location', description: 'Walkability and transit access indices', category: 'environmental', icon: '🌱' },
  { id: 'calenviroscreen', name: 'CalEnviroScreen', description: 'California environmental justice data', category: 'environmental', icon: '🏭' },
];

const CATEGORIES = [
  { id: 'all', name: 'All Sources' },
  { id: 'safety', name: 'Safety' },
  { id: 'transit', name: 'Transit' },
  { id: 'demographics', name: 'Demographics' },
  { id: 'infrastructure', name: 'Infrastructure' },
  { id: 'environmental', name: 'Environmental' },
];

interface CustomLayer {
  id: string;
  name: string;
  color: string;
  removable: boolean;
  data?: GeoJSON.FeatureCollection;
}

export default function MapsPage() {
  const [activeLayers, setActiveLayers] = useState<string[]>(['projects', 'crashes']);
  const [tokenStatus, setTokenStatus] = useState<'loading' | 'valid' | 'invalid' | 'missing'>('loading');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showNewLayerModal, setShowNewLayerModal] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const [customLayers, setCustomLayers] = useState<CustomLayer[]>([]);
  const [importedData, setImportedData] = useState<Record<string, GeoJSON.FeatureCollection>>({});
  const [loadingSource, setLoadingSource] = useState<string | null>(null);
  const [loadedSources, setLoadedSources] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // New layer form state
  const [newLayerName, setNewLayerName] = useState('');
  const [newLayerColor, setNewLayerColor] = useState(LAYER_COLORS[5]);
  const [newLayerPoints, setNewLayerPoints] = useState<Array<{ name: string; lat: string; lng: string }>>([
    { name: '', lat: '', lng: '' }
  ]);
  
  // Import form state
  const [importMethod, setImportMethod] = useState<'file' | 'paste'>('file');
  const [pastedGeoJSON, setPastedGeoJSON] = useState('');
  const [importLayerName, setImportLayerName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      setTokenStatus('missing');
    } else if (token.startsWith('pk.')) {
      setTokenStatus('valid');
    } else {
      setTokenStatus('invalid');
    }
  }, []);

  // Load custom layers from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('planpulse-map-layers');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCustomLayers(parsed.layers || []);
        setImportedData(parsed.data || {});
        setLoadedSources(new Set(parsed.loadedSources || []));
      } catch (e) {
        console.error('Failed to load custom layers:', e);
      }
    }
  }, []);

  // Save custom layers to localStorage
  useEffect(() => {
    if (customLayers.length > 0 || Object.keys(importedData).length > 0 || loadedSources.size > 0) {
      localStorage.setItem('planpulse-map-layers', JSON.stringify({
        layers: customLayers,
        data: importedData,
        loadedSources: Array.from(loadedSources)
      }));
    }
  }, [customLayers, importedData, loadedSources]);

  const allLayers = [...DEFAULT_LAYERS, ...customLayers];

  const toggleLayer = (layerId: string) => {
    setActiveLayers(prev => 
      prev.includes(layerId) 
        ? prev.filter(id => id !== layerId)
        : [...prev, layerId]
    );
  };

  const removeCustomLayer = (layerId: string) => {
    setCustomLayers(prev => prev.filter(l => l.id !== layerId));
    setActiveLayers(prev => prev.filter(id => id !== layerId));
    setImportedData(prev => {
      const newData = { ...prev };
      delete newData[layerId];
      return newData;
    });
    setLoadedSources(prev => {
      const next = new Set(prev);
      next.delete(layerId);
      return next;
    });
    toast.success('Layer removed');
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const geojson = JSON.parse(text);
      
      if (geojson.type !== 'FeatureCollection' && geojson.type !== 'Feature') {
        throw new Error('Invalid GeoJSON format');
      }

      const data: GeoJSON.FeatureCollection = geojson.type === 'Feature' 
        ? { type: 'FeatureCollection', features: [geojson] }
        : geojson;

      const layerName = importLayerName || file.name.replace(/\.(geo)?json$/i, '');
      const layerId = `imported-${Date.now()}`;
      const color = LAYER_COLORS[customLayers.length % LAYER_COLORS.length];

      setCustomLayers(prev => [...prev, { id: layerId, name: layerName, color, removable: true, data }]);
      setImportedData(prev => ({ ...prev, [layerId]: data }));
      setActiveLayers(prev => [...prev, layerId]);
      
      toast.success(`Imported ${data.features.length} features from ${file.name}`);
      setShowImportModal(false);
      setImportLayerName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      toast.error('Failed to parse GeoJSON file. Please check the format.');
      console.error(err);
    }
  };

  const handlePasteImport = () => {
    try {
      const geojson = JSON.parse(pastedGeoJSON);
      
      if (geojson.type !== 'FeatureCollection' && geojson.type !== 'Feature') {
        throw new Error('Invalid GeoJSON format');
      }

      const data: GeoJSON.FeatureCollection = geojson.type === 'Feature' 
        ? { type: 'FeatureCollection', features: [geojson] }
        : geojson;

      const layerName = importLayerName || `Imported Layer ${customLayers.length + 1}`;
      const layerId = `imported-${Date.now()}`;
      const color = LAYER_COLORS[customLayers.length % LAYER_COLORS.length];

      setCustomLayers(prev => [...prev, { id: layerId, name: layerName, color, removable: true, data }]);
      setImportedData(prev => ({ ...prev, [layerId]: data }));
      setActiveLayers(prev => [...prev, layerId]);
      
      toast.success(`Imported ${data.features.length} features`);
      setShowImportModal(false);
      setPastedGeoJSON('');
      setImportLayerName('');
    } catch (err) {
      toast.error('Failed to parse GeoJSON. Please check the format.');
      console.error(err);
    }
  };

  const handleCreateLayer = () => {
    if (!newLayerName.trim()) {
      toast.error('Please enter a layer name');
      return;
    }

    const validPoints = newLayerPoints.filter(p => p.name && p.lat && p.lng);
    if (validPoints.length === 0) {
      toast.error('Please add at least one point with coordinates');
      return;
    }

    const features: GeoJSON.Feature[] = validPoints.map((point, index) => ({
      type: 'Feature',
      properties: { name: point.name, id: index },
      geometry: {
        type: 'Point',
        coordinates: [parseFloat(point.lng), parseFloat(point.lat)]
      }
    }));

    const data: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features
    };

    const layerId = `custom-${Date.now()}`;
    
    setCustomLayers(prev => [...prev, { 
      id: layerId, 
      name: newLayerName, 
      color: newLayerColor, 
      removable: true,
      data 
    }]);
    setImportedData(prev => ({ ...prev, [layerId]: data }));
    setActiveLayers(prev => [...prev, layerId]);
    
    toast.success(`Created layer "${newLayerName}" with ${features.length} points`);
    setShowNewLayerModal(false);
    setNewLayerName('');
    setNewLayerColor(LAYER_COLORS[5]);
    setNewLayerPoints([{ name: '', lat: '', lng: '' }]);
  };

  const loadDataSource = async (sourceId: string) => {
    setLoadingSource(sourceId);
    
    try {
      const response = await fetch('/api/maps/load-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceId })
      });

      if (!response.ok) {
        throw new Error('Failed to load data');
      }

      const result = await response.json();
      const source = DATA_SOURCES.find(s => s.id === sourceId);
      
      if (result.data && result.data.features.length > 0) {
        const layerId = `api-${sourceId}`;
        const color = LAYER_COLORS[(customLayers.length + 5) % LAYER_COLORS.length];
        
        // Add or update the layer
        setCustomLayers(prev => {
          const existing = prev.find(l => l.id === layerId);
          if (existing) {
            return prev.map(l => l.id === layerId ? { ...l, data: result.data } : l);
          }
          return [...prev, { 
            id: layerId, 
            name: source?.name || sourceId, 
            color, 
            removable: true,
            data: result.data 
          }];
        });
        
        setImportedData(prev => ({ ...prev, [layerId]: result.data }));
        setActiveLayers(prev => prev.includes(layerId) ? prev : [...prev, layerId]);
        setLoadedSources(prev => new Set([...prev, sourceId]));
        
        toast.success(`Loaded ${result.featureCount} features from ${source?.name}`);
      } else {
        toast.info(`No features found for ${source?.name}`);
      }
    } catch (err) {
      console.error('Error loading data source:', err);
      toast.error(`Failed to load ${DATA_SOURCES.find(s => s.id === sourceId)?.name}`);
    } finally {
      setLoadingSource(null);
    }
  };

  const addPointRow = () => {
    setNewLayerPoints(prev => [...prev, { name: '', lat: '', lng: '' }]);
  };

  const updatePointRow = (index: number, field: 'name' | 'lat' | 'lng', value: string) => {
    setNewLayerPoints(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  const removePointRow = (index: number) => {
    if (newLayerPoints.length > 1) {
      setNewLayerPoints(prev => prev.filter((_, i) => i !== index));
    }
  };

  const filteredSources = selectedCategory === 'all' 
    ? DATA_SOURCES 
    : DATA_SOURCES.filter(s => s.category === selectedCategory);

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
          <button 
            onClick={() => setShowDataModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <Database className="w-4 h-4" />
            Load API Data
          </button>
          <button 
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors border border-slate-700"
          >
            <Upload className="w-4 h-4" />
            Import File
          </button>
          <button 
            onClick={() => setShowNewLayerModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Layer
          </button>
        </div>
      </div>

      {/* Map container */}
      <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden relative">
        {tokenStatus === 'loading' ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <MapIcon className="w-10 h-10 text-emerald-400" />
              </div>
              <p className="text-slate-400">Loading...</p>
            </div>
          </div>
        ) : tokenStatus === 'valid' ? (
          <MapComponent activeLayers={activeLayers} customData={importedData} />
        ) : tokenStatus === 'invalid' ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-10 h-10 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Invalid Mapbox Token</h3>
              <p className="text-slate-400">
                You&apos;re using a <span className="text-amber-400">secret token (sk.*)</span> instead of a <span className="text-emerald-400">public token (pk.*)</span>.
              </p>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <MapIcon className="w-10 h-10 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Map View</h3>
              <p className="text-slate-400 max-w-md">
                Configure your Mapbox token in environment variables.
              </p>
            </div>
          </div>
        )}

        {/* Layer controls */}
        <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-sm border border-slate-800 rounded-xl p-4 w-72 z-10 max-h-[calc(100%-2rem)] overflow-y-auto">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h3 className="font-medium text-white text-sm">Layers</h3>
            <span className="ml-auto text-xs text-slate-500">{activeLayers.length} active</span>
          </div>
          <div className="space-y-2">
            {allLayers.map((layer) => (
              <div key={layer.id} className="flex items-center gap-2 group">
                <label className="flex items-center gap-2 text-sm cursor-pointer flex-1">
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
                  <span className="text-slate-300 group-hover:text-white transition-colors truncate">
                    {layer.name}
                  </span>
                </label>
                {layer.removable && (
                  <button
                    onClick={() => removeCustomLayer(layer.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-700 rounded transition-all"
                    title="Remove layer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-400" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {customLayers.length > 0 && (
            <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-800">
              {customLayers.length} custom layer{customLayers.length !== 1 ? 's' : ''} • {loadedSources.size} API source{loadedSources.size !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Load API Data Modal */}
      {showDataModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-semibold text-white">Load API Data</h2>
                <p className="text-sm text-slate-400 mt-1">Connect to transportation data sources</p>
              </div>
              <button 
                onClick={() => setShowDataModal(false)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            {/* Category tabs */}
            <div className="px-6 pt-4 flex gap-2 overflow-x-auto">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid gap-3">
                {filteredSources.map(source => (
                  <div 
                    key={source.id}
                    className="flex items-center gap-4 p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-slate-600 transition-colors"
                  >
                    <div className="text-2xl">{source.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white">{source.name}</h4>
                      <p className="text-sm text-slate-400 truncate">{source.description}</p>
                    </div>
                    <button
                      onClick={() => loadDataSource(source.id)}
                      disabled={loadingSource === source.id}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                        loadedSources.has(source.id)
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-700 hover:bg-slate-600 text-white'
                      }`}
                    >
                      {loadingSource === source.id ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Loading...
                        </>
                      ) : loadedSources.has(source.id) ? (
                        <>
                          <Check className="w-4 h-4" />
                          Loaded
                        </>
                      ) : (
                        <>
                          <Database className="w-4 h-4" />
                          Load
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
              <p className="text-xs text-slate-500 text-center">
                Data is loaded from public APIs and cached locally. Some sources require API keys configured in environment variables.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Import File Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="text-xl font-semibold text-white">Import Data</h2>
              <button 
                onClick={() => setShowImportModal(false)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Layer Name (optional)</label>
                <input
                  type="text"
                  value={importLayerName}
                  onChange={(e) => setImportLayerName(e.target.value)}
                  placeholder="e.g., Bike Routes, Bus Stops"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setImportMethod('file')}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      importMethod === 'file' 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <FileJson className="w-4 h-4 inline mr-2" />
                    Upload File
                  </button>
                  <button
                    onClick={() => setImportMethod('paste')}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      importMethod === 'paste' 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Paste GeoJSON
                  </button>
                </div>

                {importMethod === 'file' ? (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json,.geojson"
                      onChange={handleFileImport}
                      className="hidden"
                      id="geojson-upload"
                    />
                    <label
                      htmlFor="geojson-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-emerald-500/50 hover:bg-slate-800/50 transition-all"
                    >
                      <Upload className="w-8 h-8 text-slate-500 mb-2" />
                      <span className="text-sm text-slate-400">Drop a GeoJSON file or click to browse</span>
                      <span className="text-xs text-slate-500 mt-1">.json or .geojson</span>
                    </label>
                  </div>
                ) : (
                  <div>
                    <textarea
                      value={pastedGeoJSON}
                      onChange={(e) => setPastedGeoJSON(e.target.value)}
                      placeholder='{"type": "FeatureCollection", "features": [...]}'
                      rows={6}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono text-sm"
                    />
                    <button
                      onClick={handlePasteImport}
                      disabled={!pastedGeoJSON.trim()}
                      className="mt-3 w-full px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                    >
                      Import GeoJSON
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Layer Modal */}
      {showNewLayerModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="text-xl font-semibold text-white">Create New Layer</h2>
              <button 
                onClick={() => setShowNewLayerModal(false)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Layer Name</label>
                <input
                  type="text"
                  value={newLayerName}
                  onChange={(e) => setNewLayerName(e.target.value)}
                  placeholder="e.g., Survey Locations, Proposed Stops"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Layer Color</label>
                <div className="flex gap-2 flex-wrap">
                  {LAYER_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewLayerColor(color)}
                      className={`w-8 h-8 rounded-lg transition-all ${
                        newLayerColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Points
                </label>
                <div className="space-y-3">
                  {newLayerPoints.map((point, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <input
                        type="text"
                        value={point.name}
                        onChange={(e) => updatePointRow(index, 'name', e.target.value)}
                        placeholder="Name"
                        className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                      <input
                        type="text"
                        value={point.lat}
                        onChange={(e) => updatePointRow(index, 'lat', e.target.value)}
                        placeholder="Lat"
                        className="w-24 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                      <input
                        type="text"
                        value={point.lng}
                        onChange={(e) => updatePointRow(index, 'lng', e.target.value)}
                        placeholder="Lng"
                        className="w-24 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                      <button
                        onClick={() => removePointRow(index)}
                        disabled={newLayerPoints.length === 1}
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-30"
                      >
                        <Trash2 className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={addPointRow}
                  className="mt-3 text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add another point
                </button>
              </div>
            </div>
            <div className="p-6 border-t border-slate-800">
              <button
                onClick={handleCreateLayer}
                className="w-full px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
              >
                Create Layer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
