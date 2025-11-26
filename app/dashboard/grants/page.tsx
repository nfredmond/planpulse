'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useDemo } from '@/lib/hooks/useDemo';
import { DEMO_GRANT_APPLICATIONS, DEMO_GRANT_PROGRAMS } from '@/lib/demo-data';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Calendar,
  DollarSign,
  ChevronRight,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Send,
  ExternalLink
} from 'lucide-react';

interface GrantApplication {
  id: string;
  name: string;
  description: string | null;
  amount_requested: number | null;
  match_amount: number | null;
  status: string;
  deadline: string | null;
  grant_program: string;
  amount_awarded: number | null;
}

interface GrantProgram {
  id: string;
  name: string;
  agency: string;
  description: string;
  typical_range_min: number;
  typical_range_max: number;
  match_required: number;
  url: string | null;
}

const STATUS_TABS = [
  { value: 'all', label: 'All Applications' },
  { value: 'drafting', label: 'Drafting' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'awarded', label: 'Awarded' },
  { value: 'denied', label: 'Denied' },
];

export default function GrantsPage() {
  const { isDemo, mounted } = useDemo();
  const [applications, setApplications] = useState<GrantApplication[]>([]);
  const [programs, setPrograms] = useState<GrantProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showPrograms, setShowPrograms] = useState(false);

  useEffect(() => {
    if (!mounted) return;

    async function loadData() {
      if (isDemo) {
        setApplications(DEMO_GRANT_APPLICATIONS as GrantApplication[]);
        setPrograms(DEMO_GRANT_PROGRAMS as GrantProgram[]);
        setLoading(false);
        return;
      }

      const supabase = createClient();
      
      const { data: apps } = await supabase
        .from('grant_applications')
        .select('*')
        .order('deadline', { ascending: true });

      const { data: progs } = await supabase
        .from('grant_programs')
        .select('*')
        .eq('is_active', true);

      setApplications(apps || []);
      setPrograms(progs || []);
      setLoading(false);
    }

    loadData();
  }, [mounted, isDemo]);

  const filteredApplications = applications.filter(app => 
    activeTab === 'all' || app.status === activeTab
  );

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No deadline';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'drafting': return <FileText className="w-4 h-4" />;
      case 'submitted': return <Send className="w-4 h-4" />;
      case 'under_review': return <Clock className="w-4 h-4" />;
      case 'awarded': return <CheckCircle className="w-4 h-4" />;
      case 'denied': return <XCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      drafting: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      submitted: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      under_review: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      awarded: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      denied: 'bg-red-500/20 text-red-400 border-red-500/30',
      withdrawn: 'bg-slate-600/20 text-slate-500 border-slate-600/30',
    };
    return colors[status] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  const getDaysUntilDeadline = (deadline: string | null) => {
    if (!deadline) return null;
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  // Calculate stats
  const stats = {
    total: applications.length,
    pending: applications.filter(a => ['drafting', 'submitted', 'under_review'].includes(a.status)).length,
    awarded: applications.filter(a => a.status === 'awarded').length,
    totalAwarded: applications.filter(a => a.status === 'awarded').reduce((sum, a) => sum + (a.amount_awarded || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Grant Tracker</h1>
          <p className="text-slate-400 mt-1">
            Track applications and discover funding opportunities
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowPrograms(!showPrograms)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors border border-slate-700"
          >
            <DollarSign className="w-4 h-4" />
            {showPrograms ? 'Show Applications' : 'Find Programs'}
          </button>
          <Link
            href="/dashboard/grants/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Application
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Total Applications</p>
          <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Pending</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Awarded</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.awarded}</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Total Funding Won</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{formatCurrency(stats.totalAwarded)}</p>
        </div>
      </div>

      {showPrograms ? (
        /* Grant Programs List */
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Available Grant Programs</h2>
          <div className="grid gap-4">
            {programs.map((program) => (
              <div
                key={program.id}
                className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-white">{program.name}</h3>
                      <span className="px-2 py-0.5 bg-slate-800 rounded text-xs text-slate-400">
                        {program.agency}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{program.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">Typical Range:</span>{' '}
                        <span className="text-white">
                          {formatCurrency(program.typical_range_min)} - {formatCurrency(program.typical_range_max)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Match Required:</span>{' '}
                        <span className="text-white">{program.match_required}%</span>
                      </div>
                    </div>
                  </div>
                  {program.url && (
                    <a
                      href={program.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Applications List */
        <>
          {/* Status tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.value
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Applications */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 animate-pulse">
                  <div className="h-5 bg-slate-800 rounded w-1/3 mb-3" />
                  <div className="h-4 bg-slate-800 rounded w-1/2 mb-4" />
                  <div className="h-4 bg-slate-800 rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : filteredApplications.length > 0 ? (
            <div className="space-y-4">
              {filteredApplications.map((app) => {
                const daysUntil = getDaysUntilDeadline(app.deadline);
                const isUrgent = daysUntil !== null && daysUntil <= 14 && daysUntil > 0;
                const isPast = daysUntil !== null && daysUntil < 0;

                return (
                  <Link
                    key={app.id}
                    href={`/dashboard/grants/${app.id}`}
                    className="block bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors truncate">
                            {app.name}
                          </h3>
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(app.status)}`}>
                            {getStatusIcon(app.status)}
                            {app.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 mb-3">{app.grant_program}</p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <DollarSign className="w-4 h-4" />
                            <span>Requested: <span className="text-white">{formatCurrency(app.amount_requested)}</span></span>
                          </div>
                          {app.match_amount && (
                            <div className="text-slate-400">
                              Match: <span className="text-white">{formatCurrency(app.match_amount)}</span>
                            </div>
                          )}
                          {app.status === 'awarded' && app.amount_awarded && (
                            <div className="text-emerald-400">
                              Awarded: <span className="font-semibold">{formatCurrency(app.amount_awarded)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {app.deadline && (
                          <div className={`text-right ${isUrgent ? 'text-amber-400' : isPast ? 'text-slate-500' : 'text-slate-400'}`}>
                            <div className="flex items-center gap-1.5 text-sm">
                              <Calendar className="w-4 h-4" />
                              {formatDate(app.deadline)}
                            </div>
                            {daysUntil !== null && daysUntil > 0 && (
                              <p className="text-xs mt-0.5">
                                {daysUntil} day{daysUntil !== 1 ? 's' : ''} left
                              </p>
                            )}
                          </div>
                        )}
                        <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-xl">
              <DollarSign className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No applications found</h3>
              <p className="text-slate-400 mb-6">
                {activeTab !== 'all'
                  ? `No applications with status "${activeTab.replace('_', ' ')}"`
                  : 'Start tracking your grant applications'}
              </p>
              <Link
                href="/dashboard/grants/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Application
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}

