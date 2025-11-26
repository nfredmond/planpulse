'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useDemo } from '@/lib/hooks/useDemo';
import { DEMO_ENGAGEMENT_PROJECTS, DEMO_COMMUNITY_INPUTS } from '@/lib/demo-data';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin,
  ThumbsUp,
  Eye,
  Edit,
  ExternalLink,
  Users,
  MessageSquare
} from 'lucide-react';

interface EngagementProject {
  id: string;
  name: string;
  description: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  input_count?: number;
}

interface CommunityInput {
  id: string;
  title: string;
  content: string;
  category: string;
  sentiment: string;
  upvotes: number;
  location?: { lat: number; lng: number };
  created_at: string;
}

export default function EngagementDetailPage() {
  const params = useParams();
  const { isDemo, mounted } = useDemo();
  const [engagement, setEngagement] = useState<EngagementProject | null>(null);
  const [inputs, setInputs] = useState<CommunityInput[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mounted) return;

    async function loadData() {
      if (isDemo) {
        const demoEngagement = DEMO_ENGAGEMENT_PROJECTS.find(e => e.id === params.id);
        setEngagement(demoEngagement as EngagementProject || null);
        setInputs(DEMO_COMMUNITY_INPUTS.filter(i => i.engagement_id === params.id) as CommunityInput[]);
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const [{ data: eng }, { data: inputData }] = await Promise.all([
        supabase.from('engagement_projects').select('*').eq('id', params.id).single(),
        supabase.from('community_inputs').select('*').eq('engagement_id', params.id).order('created_at', { ascending: false }),
      ]);

      setEngagement(eng);
      setInputs(inputData || []);
      setLoading(false);
    }

    loadData();
  }, [mounted, isDemo, params.id]);

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

  const getSentimentColor = (sentiment: string) => {
    const colors: Record<string, string> = {
      positive: 'bg-emerald-500/20 text-emerald-400',
      negative: 'bg-red-500/20 text-red-400',
      suggestion: 'bg-blue-500/20 text-blue-400',
      neutral: 'bg-slate-500/20 text-slate-400',
    };
    return colors[sentiment] || 'bg-slate-500/20 text-slate-400';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-800 rounded w-48 animate-pulse" />
        <div className="h-64 bg-slate-800 rounded animate-pulse" />
      </div>
    );
  }

  if (!engagement) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-white mb-2">Engagement project not found</h2>
        <Link href="/dashboard/community" className="text-emerald-400 hover:text-emerald-300">
          ← Back to Community
        </Link>
      </div>
    );
  }

  const totalUpvotes = inputs.reduce((sum, i) => sum + i.upvotes, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/community"
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">{engagement.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(engagement.status)}`}>
                {engagement.status}
              </span>
              <span className="text-slate-400 text-sm">
                {formatDate(engagement.start_date)} - {formatDate(engagement.end_date)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {engagement.status === 'active' && (
            <Link
              href={`/dashboard/community/${engagement.id}/public`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View Public Map
            </Link>
          )}
          <button 
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            disabled={isDemo}
          >
            <Edit className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-purple-400 mb-2">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">Total Inputs</span>
          </div>
          <p className="text-2xl font-bold text-white">{inputs.length}</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-amber-400 mb-2">
            <ThumbsUp className="w-4 h-4" />
            <span className="text-sm font-medium">Total Upvotes</span>
          </div>
          <p className="text-2xl font-bold text-white">{totalUpvotes}</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">Participants</span>
          </div>
          <p className="text-2xl font-bold text-white">{Math.ceil(inputs.length * 0.8)}</p>
        </div>
      </div>

      {/* Description */}
      {engagement.description && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h2 className="font-semibold text-white mb-3">Description</h2>
          <p className="text-slate-400">{engagement.description}</p>
        </div>
      )}

      {/* Inputs */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            Community Inputs
          </h2>
        </div>

        {inputs.length > 0 ? (
          <div className="space-y-3">
            {inputs.map((input) => (
              <div
                key={input.id}
                className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSentimentColor(input.sentiment)}`}>
                        {input.category}
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatDate(input.created_at)}
                      </span>
                    </div>
                    <h4 className="font-medium text-white">{input.title}</h4>
                    <p className="text-sm text-slate-400 mt-1">{input.content}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 ml-4">
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-sm font-medium">{input.upvotes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No community inputs yet</p>
            {engagement.status === 'active' && (
              <p className="text-sm text-slate-500 mt-1">
                Share the public map link to start collecting feedback
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

