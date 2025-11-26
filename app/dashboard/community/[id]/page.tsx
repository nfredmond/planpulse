'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useDemo } from '@/lib/hooks/useDemo';
import { DEMO_ENGAGEMENT_PROJECTS, DEMO_COMMUNITY_INPUTS } from '@/lib/demo-data';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  MapPin,
  ThumbsUp,
  Calendar,
  Settings,
  Eye,
  Share2,
  Download,
  Check,
  X,
  Flag,
  Image,
  MessageSquare,
  ExternalLink,
  Copy,
  BarChart3,
  Filter
} from 'lucide-react';

// Dynamic import for map
const EngagementMap = dynamic(() => import('@/components/community/EngagementMap'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-slate-800/50 rounded-xl flex items-center justify-center">
      <p className="text-slate-400">Loading map...</p>
    </div>
  ),
});

interface CommunityInput {
  id: string;
  input_type: string;
  category: string;
  title: string;
  content: string;
  sentiment: string;
  photo_urls: string[];
  upvotes: number;
  moderation_status: string;
  created_at: string;
  lat?: number;
  lng?: number;
}

interface Engagement {
  id: string;
  name: string;
  description: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  center_lat: number;
  center_lng: number;
  zoom_level: number;
  base_map_style: string;
  moderation_enabled: boolean;
  public_url?: string;
}

export default function EngagementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isDemo, mounted } = useDemo();
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [inputs, setInputs] = useState<CommunityInput[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inputs' | 'map' | 'analytics'>('inputs');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedInput, setSelectedInput] = useState<CommunityInput | null>(null);

  useEffect(() => {
    if (!mounted) return;

    if (isDemo) {
      // Load demo data
      const demoEngagement = DEMO_ENGAGEMENT_PROJECTS.find(e => e.id === params.id);
      if (demoEngagement) {
        setEngagement({
          ...demoEngagement,
          center_lat: 38.5816,
          center_lng: -121.4944,
          zoom_level: 13,
          base_map_style: 'streets',
          moderation_enabled: true,
          public_url: `https://planpulse.io/engage/${params.id}`,
        } as Engagement);
        
        // Map demo inputs
        setInputs(DEMO_COMMUNITY_INPUTS.map(input => ({
          ...input,
          input_type: 'pin',
          photo_urls: [],
          moderation_status: 'approved',
          lat: 38.5816 + (Math.random() - 0.5) * 0.05,
          lng: -121.4944 + (Math.random() - 0.5) * 0.05,
        })));
      }
      setLoading(false);
      return;
    }

    // Real data loading
    loadEngagement();
  }, [mounted, isDemo, params.id]);

  const loadEngagement = async () => {
    try {
      const response = await fetch(`/api/community/engagements/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setEngagement(data.engagement);
        setInputs(data.inputs || []);
      }
    } catch (err) {
      console.error('Error loading engagement:', err);
      toast.error('Failed to load engagement');
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (inputId: string, status: 'approved' | 'hidden' | 'flagged') => {
    if (isDemo) {
      setInputs(prev => prev.map(i => 
        i.id === inputId ? { ...i, moderation_status: status } : i
      ));
      toast.success(`Input ${status}`);
      return;
    }

    try {
      const response = await fetch(`/api/community/inputs/${inputId}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setInputs(prev => prev.map(i => 
          i.id === inputId ? { ...i, moderation_status: status } : i
        ));
        toast.success(`Input ${status}`);
      }
    } catch (err) {
      toast.error('Failed to moderate input');
    }
  };

  const copyPublicUrl = () => {
    const url = engagement?.public_url || `${window.location.origin}/engage/${params.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Public URL copied to clipboard');
  };

  const toggleStatus = async () => {
    if (!engagement) return;
    
    const newStatus = engagement.status === 'active' ? 'closed' : 'active';
    
    if (isDemo) {
      setEngagement({ ...engagement, status: newStatus });
      toast.success(`Engagement ${newStatus === 'active' ? 'activated' : 'closed'}`);
      return;
    }

    try {
      const response = await fetch(`/api/community/engagements/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setEngagement({ ...engagement, status: newStatus });
        toast.success(`Engagement ${newStatus === 'active' ? 'activated' : 'closed'}`);
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filteredInputs = filterStatus === 'all' 
    ? inputs 
    : inputs.filter(i => i.moderation_status === filterStatus);

  const stats = {
    total: inputs.length,
    approved: inputs.filter(i => i.moderation_status === 'approved').length,
    pending: inputs.filter(i => i.moderation_status === 'pending').length,
    hidden: inputs.filter(i => i.moderation_status === 'hidden').length,
    totalUpvotes: inputs.reduce((sum, i) => sum + i.upvotes, 0),
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-slate-800 rounded w-1/3" />
        <div className="h-64 bg-slate-800 rounded-xl" />
      </div>
    );
  }

  if (!engagement) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-white mb-2">Engagement not found</h2>
        <Link href="/dashboard/community" className="text-emerald-400 hover:underline">
          Back to Community
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/community"
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{engagement.name}</h1>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                engagement.status === 'active' 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : engagement.status === 'closed'
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
              }`}>
                {engagement.status}
              </span>
            </div>
            {engagement.description && (
              <p className="text-slate-400 mt-1">{engagement.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={copyPublicUrl}
            className="inline-flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors"
          >
            <Copy className="w-4 h-4" />
            Copy Link
          </button>
          <Link
            href={`/engage/${params.id}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View Public Map
          </Link>
          <button
            onClick={toggleStatus}
            className={`inline-flex items-center gap-2 px-4 py-2 font-medium text-sm rounded-lg transition-colors ${
              engagement.status === 'active'
                ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                : 'bg-emerald-500 text-white hover:bg-emerald-600'
            }`}
          >
            {engagement.status === 'active' ? 'Close Engagement' : 'Activate'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Total Inputs</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Approved</p>
          <p className="text-2xl font-bold text-emerald-400">{stats.approved}</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Pending Review</p>
          <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Hidden</p>
          <p className="text-2xl font-bold text-slate-500">{stats.hidden}</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Total Upvotes</p>
          <p className="text-2xl font-bold text-blue-400">{stats.totalUpvotes}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('inputs')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'inputs'
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4 inline mr-2" />
          Inputs ({inputs.length})
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'map'
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4 inline mr-2" />
          Map View
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'analytics'
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4 inline mr-2" />
          Analytics
        </button>
      </div>

      {/* Content */}
      {activeTab === 'inputs' && (
        <div className="space-y-4">
          {/* Filter */}
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="all">All Inputs</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="hidden">Hidden</option>
              <option value="flagged">Flagged</option>
            </select>
          </div>

          {/* Input list */}
          {filteredInputs.length > 0 ? (
            <div className="space-y-4">
              {filteredInputs.map((input) => (
                <div
                  key={input.id}
                  className={`bg-slate-900/50 border rounded-xl p-5 transition-all ${
                    input.moderation_status === 'pending'
                      ? 'border-amber-500/30'
                      : input.moderation_status === 'hidden'
                      ? 'border-slate-700 opacity-60'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          input.sentiment === 'positive' ? 'bg-emerald-500/20 text-emerald-400' :
                          input.sentiment === 'negative' ? 'bg-red-500/20 text-red-400' :
                          input.sentiment === 'suggestion' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {input.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          input.moderation_status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                          input.moderation_status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                          input.moderation_status === 'flagged' ? 'bg-red-500/10 text-red-400' :
                          'bg-slate-500/10 text-slate-500'
                        }`}>
                          {input.moderation_status}
                        </span>
                        {input.photo_urls && input.photo_urls.length > 0 && (
                          <span className="text-slate-400">
                            <Image className="w-4 h-4" />
                          </span>
                        )}
                      </div>
                      <h4 className="font-medium text-white">{input.title}</h4>
                      <p className="text-sm text-slate-400 mt-1">{input.content}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3.5 h-3.5" />
                          {input.upvotes} upvotes
                        </span>
                        <span>{new Date(input.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {/* Moderation actions */}
                    {engagement.moderation_enabled && (
                      <div className="flex items-center gap-2 ml-4">
                        {input.moderation_status !== 'approved' && (
                          <button
                            onClick={() => handleModerate(input.id, 'approved')}
                            className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {input.moderation_status !== 'hidden' && (
                          <button
                            onClick={() => handleModerate(input.id, 'hidden')}
                            className="p-2 rounded-lg bg-slate-700 text-slate-400 hover:bg-slate-600 transition-colors"
                            title="Hide"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        {input.moderation_status !== 'flagged' && (
                          <button
                            onClick={() => handleModerate(input.id, 'flagged')}
                            className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                            title="Flag"
                          >
                            <Flag className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-900/50 border border-slate-800 rounded-xl">
              <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No inputs found</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'map' && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
          <div className="h-[500px]">
            <EngagementMap
              inputs={inputs.filter(i => i.moderation_status === 'approved')}
              center={[engagement.center_lng, engagement.center_lat]}
              zoom={engagement.zoom_level}
              onSelectInput={setSelectedInput}
            />
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category breakdown */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-4">By Category</h3>
            <div className="space-y-3">
              {Array.from(new Set(inputs.map(i => i.category))).map(category => {
                const count = inputs.filter(i => i.category === category).length;
                const percentage = (count / inputs.length) * 100;
                return (
                  <div key={category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">{category}</span>
                      <span className="text-slate-400">{count}</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sentiment breakdown */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-4">By Sentiment</h3>
            <div className="space-y-3">
              {['positive', 'negative', 'neutral', 'suggestion'].map(sentiment => {
                const count = inputs.filter(i => i.sentiment === sentiment).length;
                const percentage = inputs.length > 0 ? (count / inputs.length) * 100 : 0;
                const colors: Record<string, string> = {
                  positive: 'bg-emerald-500',
                  negative: 'bg-red-500',
                  neutral: 'bg-slate-500',
                  suggestion: 'bg-blue-500',
                };
                return (
                  <div key={sentiment}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300 capitalize">{sentiment}</span>
                      <span className="text-slate-400">{count}</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${colors[sentiment]}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Export options */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 md:col-span-2">
            <h3 className="font-semibold text-white mb-4">Export Data</h3>
            <div className="flex gap-3">
              <button
                onClick={() => toast.info('Export to CSV coming soon')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={() => toast.info('Export to GeoJSON coming soon')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export GeoJSON
              </button>
              <button
                onClick={() => toast.info('Generate report coming soon')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Generate PDF Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
