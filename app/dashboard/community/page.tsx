'use client';

import { useEffect, useState } from 'react';
import { useDemo } from '@/lib/hooks/useDemo';
import { DEMO_ENGAGEMENT_PROJECTS, DEMO_COMMUNITY_INPUTS } from '@/lib/demo-data';
import Link from 'next/link';
import { 
  Plus, 
  MapPin,
  MessageSquare,
  ThumbsUp,
  Calendar,
  ChevronRight,
  Users,
  Eye,
  Edit
} from 'lucide-react';

interface EngagementProject {
  id: string;
  name: string;
  description: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  input_count: number;
}

export default function CommunityPage() {
  const { isDemo, mounted } = useDemo();
  const [engagements, setEngagements] = useState<EngagementProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mounted) return;

    if (isDemo) {
      setEngagements(DEMO_ENGAGEMENT_PROJECTS as EngagementProject[]);
      setLoading(false);
      return;
    }

    // Real data loading would go here
    setLoading(false);
  }, [mounted, isDemo]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      closed: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      archived: 'bg-slate-600/20 text-slate-500 border-slate-600/30',
    };
    return colors[status] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  // Calculate stats from demo data
  const stats = {
    totalEngagements: engagements.length,
    activeEngagements: engagements.filter(e => e.status === 'active').length,
    totalInputs: isDemo ? DEMO_COMMUNITY_INPUTS.length : 0,
    totalUpvotes: isDemo ? DEMO_COMMUNITY_INPUTS.reduce((sum, i) => sum + i.upvotes, 0) : 0,
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Community Engagement</h1>
          <p className="text-slate-400 mt-1">
            Collect and analyze public input with interactive maps
          </p>
        </div>
        <Link
          href="/dashboard/community/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Engagement
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Projects</p>
              <p className="text-xl font-bold text-white">{stats.totalEngagements}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Eye className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Active</p>
              <p className="text-xl font-bold text-emerald-400">{stats.activeEngagements}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Inputs</p>
              <p className="text-xl font-bold text-white">{stats.totalInputs}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <ThumbsUp className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Upvotes</p>
              <p className="text-xl font-bold text-white">{stats.totalUpvotes}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Engagement projects */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 animate-pulse">
              <div className="h-5 bg-slate-800 rounded w-1/3 mb-3" />
              <div className="h-4 bg-slate-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : engagements.length > 0 ? (
        <div className="space-y-4">
          {engagements.map((engagement) => (
            <div
              key={engagement.id}
              className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-white truncate">
                      {engagement.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(engagement.status)}`}>
                      {engagement.status}
                    </span>
                  </div>
                  {engagement.description && (
                    <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                      {engagement.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {formatDate(engagement.start_date)} - {formatDate(engagement.end_date)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {engagement.input_count} inputs collected
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {engagement.status === 'active' && (
                    <Link
                      href={`/dashboard/community/${engagement.id}/public`}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                      title="View public map"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  )}
                  <Link
                    href={`/dashboard/community/${engagement.id}`}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    title="Manage engagement"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/dashboard/community/${engagement.id}`}
                    className="p-2 rounded-lg hover:bg-slate-800 text-slate-600 hover:text-emerald-400 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-xl">
          <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No engagement projects yet</h3>
          <p className="text-slate-400 mb-6">
            Create interactive maps to collect community input
          </p>
          <Link
            href="/dashboard/community/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Engagement Project
          </Link>
        </div>
      )}

      {/* Recent inputs preview */}
      {isDemo && DEMO_COMMUNITY_INPUTS.length > 0 && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Community Inputs</h2>
          <div className="space-y-3">
            {DEMO_COMMUNITY_INPUTS.slice(0, 5).map((input) => (
              <div
                key={input.id}
                className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        input.sentiment === 'positive' ? 'bg-emerald-500/20 text-emerald-400' :
                        input.sentiment === 'negative' ? 'bg-red-500/20 text-red-400' :
                        input.sentiment === 'suggestion' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        {input.category}
                      </span>
                    </div>
                    <h4 className="font-medium text-white">{input.title}</h4>
                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">{input.content}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 ml-4">
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-sm">{input.upvotes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

