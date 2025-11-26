'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDemo } from '@/lib/hooks/useDemo';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Settings,
  Eye,
  Save,
  Map as MapIcon
} from 'lucide-react';

const INPUT_TYPES = [
  { id: 'pin', name: 'Pin', description: 'Drop pins on the map' },
  { id: 'line', name: 'Line', description: 'Draw lines/routes' },
  { id: 'polygon', name: 'Area', description: 'Draw areas/zones' },
  { id: 'comment', name: 'Comment', description: 'Text-only feedback' },
];

const DEFAULT_CATEGORIES = [
  'Safety',
  'Infrastructure',
  'Accessibility',
  'Bike/Pedestrian',
  'Transit',
  'Parking',
  'Lighting',
  'Other',
];

const MAP_STYLES = [
  { id: 'streets', name: 'Streets', preview: '🗺️' },
  { id: 'satellite', name: 'Satellite', preview: '🛰️' },
  { id: 'light', name: 'Light', preview: '⬜' },
  { id: 'dark', name: 'Dark', preview: '⬛' },
];

export default function NewEngagementPage() {
  const router = useRouter();
  const { isDemo } = useDemo();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'map' | 'settings'>('basic');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    centerLat: '38.5816',
    centerLng: '-121.4944',
    zoomLevel: 13,
    baseMapStyle: 'streets',
    allowedInputTypes: ['pin', 'comment'] as string[],
    categories: DEFAULT_CATEGORIES,
    requireEmail: false,
    moderationEnabled: true,
  });

  const handleInputTypeToggle = (typeId: string) => {
    setFormData(prev => ({
      ...prev,
      allowedInputTypes: prev.allowedInputTypes.includes(typeId)
        ? prev.allowedInputTypes.filter(t => t !== typeId)
        : [...prev.allowedInputTypes, typeId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    if (formData.allowedInputTypes.length === 0) {
      toast.error('Please select at least one input type');
      return;
    }

    setSaving(true);

    try {
      if (isDemo) {
        // Simulate save in demo mode
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success('Engagement project created! (Demo mode)');
        router.push('/dashboard/community');
        return;
      }

      const response = await fetch('/api/community/engagements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          start_date: formData.startDate || null,
          end_date: formData.endDate || null,
          center_lat: parseFloat(formData.centerLat),
          center_lng: parseFloat(formData.centerLng),
          zoom_level: formData.zoomLevel,
          base_map_style: formData.baseMapStyle,
          allowed_input_types: formData.allowedInputTypes,
          categories: formData.categories,
          require_email: formData.requireEmail,
          moderation_enabled: formData.moderationEnabled,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create engagement');
      }

      const result = await response.json();
      toast.success('Engagement project created!');
      router.push(`/dashboard/community/${result.id}`);
    } catch (err) {
      console.error('Error creating engagement:', err);
      toast.error('Failed to create engagement project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/dashboard/community"
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">New Engagement Project</h1>
          <p className="text-slate-400 mt-1">
            Create an interactive map to collect community input
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('basic')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'basic'
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4 inline mr-2" />
          Basic Info
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'map'
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <MapIcon className="w-4 h-4 inline mr-2" />
          Map Settings
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'settings'
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Settings className="w-4 h-4 inline mr-2" />
          Settings
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="space-y-6 bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Downtown Bike Lane Feedback"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what feedback you're looking for..."
                rows={4}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Allowed Input Types *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {INPUT_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleInputTypeToggle(type.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      formData.allowedInputTypes.includes(type.id)
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="font-medium">{type.name}</div>
                    <div className="text-xs mt-1 opacity-70">{type.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Map Settings Tab */}
        {activeTab === 'map' && (
          <div className="space-y-6 bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Center Latitude
                </label>
                <input
                  type="text"
                  value={formData.centerLat}
                  onChange={(e) => setFormData({ ...formData, centerLat: e.target.value })}
                  placeholder="38.5816"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Center Longitude
                </label>
                <input
                  type="text"
                  value={formData.centerLng}
                  onChange={(e) => setFormData({ ...formData, centerLng: e.target.value })}
                  placeholder="-121.4944"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Default Zoom Level: {formData.zoomLevel}
              </label>
              <input
                type="range"
                min="8"
                max="18"
                value={formData.zoomLevel}
                onChange={(e) => setFormData({ ...formData, zoomLevel: parseInt(e.target.value) })}
                className="w-full accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Regional (8)</span>
                <span>Neighborhood (13)</span>
                <span>Street (18)</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Base Map Style
              </label>
              <div className="grid grid-cols-4 gap-3">
                {MAP_STYLES.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, baseMapStyle: style.id })}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      formData.baseMapStyle === style.id
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-2xl mb-1">{style.preview}</div>
                    <div className="text-sm font-medium">{style.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
              <p className="text-sm text-slate-400">
                💡 <strong className="text-slate-300">Tip:</strong> You can click on the map preview 
                to set the center point, or enter coordinates manually. Sacramento is used as the default.
              </p>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6 bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Input Categories
              </label>
              <div className="flex flex-wrap gap-2">
                {formData.categories.map((cat, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 flex items-center gap-2"
                  >
                    {cat}
                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        categories: formData.categories.filter((_, i) => i !== index)
                      })}
                      className="text-slate-500 hover:text-red-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Add custom category and press Enter"
                className="mt-3 w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const input = e.target as HTMLInputElement;
                    if (input.value.trim() && !formData.categories.includes(input.value.trim())) {
                      setFormData({
                        ...formData,
                        categories: [...formData.categories, input.value.trim()]
                      });
                      input.value = '';
                    }
                  }
                }}
              />
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700 cursor-pointer group">
                <div>
                  <div className="font-medium text-white">Require Email</div>
                  <div className="text-sm text-slate-400">Ask participants for their email address</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.requireEmail}
                  onChange={(e) => setFormData({ ...formData, requireEmail: e.target.checked })}
                  className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-emerald-500 focus:ring-emerald-500/50"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700 cursor-pointer group">
                <div>
                  <div className="font-medium text-white">Enable Moderation</div>
                  <div className="text-sm text-slate-400">Review inputs before they appear publicly</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.moderationEnabled}
                  onChange={(e) => setFormData({ ...formData, moderationEnabled: e.target.checked })}
                  className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-emerald-500 focus:ring-emerald-500/50"
                />
              </label>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-between mt-6">
          <Link
            href="/dashboard/community"
            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </Link>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                toast.info('Preview not available in creation mode');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors border border-slate-700"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 text-white font-medium rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
