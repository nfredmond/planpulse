'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useDemo } from '@/lib/hooks/useDemo';
import { DEMO_PROJECTS } from '@/lib/demo-data';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Calendar,
  DollarSign,
  ChevronRight,
  FolderKanban
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  type: string;
  status: string;
  description: string | null;
  client_name: string | null;
  budget: number | null;
  spent: number | null;
  start_date: string | null;
  end_date: string | null;
  updated_at: string;
}

const PROJECT_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'general_plan', label: 'General Plan' },
  { value: 'rtp', label: 'RTP' },
  { value: 'atpp', label: 'ATP Plan' },
  { value: 'complete_streets', label: 'Complete Streets' },
  { value: 'transit_plan', label: 'Transit Plan' },
  { value: 'trail_plan', label: 'Trail Plan' },
  { value: 'safety_plan', label: 'Safety Plan' },
  { value: 'climate_action', label: 'Climate Action' },
  { value: 'corridor_study', label: 'Corridor Study' },
  { value: 'srts', label: 'SRTS' },
  { value: 'lrsp', label: 'LRSP' },
  { value: 'program', label: 'Program' },
  { value: 'other', label: 'Other' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

export default function ProjectsPage() {
  const { isDemo, mounted } = useDemo();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!mounted) return;

    async function loadProjects() {
      if (isDemo) {
        setProjects(DEMO_PROJECTS as Project[]);
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const { data } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

      setProjects(data || []);
      setLoading(false);
    }

    loadProjects();
  }, [mounted, isDemo]);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.client_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || project.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatProjectType = (type: string) => {
    const found = PROJECT_TYPES.find(t => t.value === type);
    return found ? found.label : type;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      planning: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      on_hold: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      completed: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      archived: 'bg-slate-600/20 text-slate-500 border-slate-600/30',
    };
    return colors[status] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  const getBudgetProgress = (spent: number | null, budget: number | null) => {
    if (!budget || budget === 0) return 0;
    return Math.min(((spent || 0) / budget) * 100, 100);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-slate-400 mt-1">
            Manage your transportation plans, programs, and studies
          </p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Project
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
          >
            {PROJECT_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
          >
            {STATUS_OPTIONS.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 animate-pulse">
              <div className="h-5 bg-slate-800 rounded w-3/4 mb-3" />
              <div className="h-4 bg-slate-800 rounded w-1/2 mb-4" />
              <div className="h-16 bg-slate-800 rounded mb-4" />
              <div className="h-4 bg-slate-800 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="group bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate group-hover:text-emerald-400 transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-sm text-slate-400 mt-0.5">
                    {formatProjectType(project.type)}
                  </p>
                </div>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                  {project.status.replace('_', ' ')}
                </span>
              </div>

              {project.description && (
                <p className="text-sm text-slate-400 line-clamp-2 mb-4">
                  {project.description}
                </p>
              )}

              {/* Budget progress */}
              {project.budget && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-400">Budget</span>
                    <span className="text-white">
                      {formatCurrency(project.spent)} / {formatCurrency(project.budget)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${getBudgetProgress(project.spent, project.budget)}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(project.start_date)} - {formatDate(project.end_date)}
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-xl">
          <FolderKanban className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No projects found</h3>
          <p className="text-slate-400 mb-6">
            {searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by creating your first project'}
          </p>
          {!searchQuery && typeFilter === 'all' && statusFilter === 'all' && (
            <Link
              href="/dashboard/projects/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Project
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

