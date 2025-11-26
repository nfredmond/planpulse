'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useDemo } from '@/lib/hooks/useDemo';
import { 
  DEMO_PROJECTS, 
  DEMO_GRANT_APPLICATIONS, 
  DEMO_ENGAGEMENT_PROJECTS,
  DEMO_COMMUNITY_INPUTS,
  getDemoStats 
} from '@/lib/demo-data';
import { 
  FolderKanban, 
  DollarSign, 
  Users, 
  TrendingUp,
  CalendarDays,
  ArrowRight,
  Plus
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  activeProjects: number;
  pendingGrants: number;
  totalEngagements: number;
  totalInputs: number;
}

interface RecentProject {
  id: string;
  name: string;
  type: string;
  status: string;
  updated_at: string;
}

interface UpcomingDeadline {
  id: string;
  name: string;
  deadline: string;
  grant_program: string;
}

export default function DashboardPage() {
  const { isDemo, mounted } = useDemo();
  const [stats, setStats] = useState<DashboardStats>({
    activeProjects: 0,
    pendingGrants: 0,
    totalEngagements: 0,
    totalInputs: 0,
  });
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<UpcomingDeadline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mounted) return;

    async function loadDashboard() {
      // Use demo data if in demo mode
      if (isDemo) {
        setStats(getDemoStats());
        setRecentProjects(
          DEMO_PROJECTS
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
            .slice(0, 5)
        );
        setUpcomingDeadlines(
          DEMO_GRANT_APPLICATIONS
            .filter(g => g.deadline && new Date(g.deadline) >= new Date())
            .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
            .slice(0, 5)
            .map(g => ({
              id: g.id,
              name: g.name,
              deadline: g.deadline,
              grant_program: g.grant_program,
            }))
        );
        setLoading(false);
        return;
      }

      const supabase = createClient();
      
      // Get active projects count
      const { count: projectCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .in('status', ['planning', 'active']);

      // Get pending grants count
      const { count: grantCount } = await supabase
        .from('grant_applications')
        .select('*', { count: 'exact', head: true })
        .in('status', ['drafting', 'submitted', 'under_review']);

      // Get engagement projects count
      const { count: engagementCount } = await supabase
        .from('engagement_projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get community inputs count
      const { count: inputCount } = await supabase
        .from('community_inputs')
        .select('*', { count: 'exact', head: true });

      setStats({
        activeProjects: projectCount || 0,
        pendingGrants: grantCount || 0,
        totalEngagements: engagementCount || 0,
        totalInputs: inputCount || 0,
      });

      // Get recent projects
      const { data: projects } = await supabase
        .from('projects')
        .select('id, name, type, status, updated_at')
        .order('updated_at', { ascending: false })
        .limit(5);

      setRecentProjects(projects || []);

      // Get upcoming grant deadlines
      const { data: deadlines } = await supabase
        .from('grant_applications')
        .select('id, name, deadline, grant_program_id')
        .gte('deadline', new Date().toISOString().split('T')[0])
        .order('deadline', { ascending: true })
        .limit(5);

      setUpcomingDeadlines(deadlines?.map(d => ({
        id: d.id,
        name: d.name,
        deadline: d.deadline,
        grant_program: 'Grant Application',
      })) || []);

      setLoading(false);
    }

    loadDashboard();
  }, [mounted, isDemo]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatProjectType = (type: string) => {
    const typeMap: Record<string, string> = {
      general_plan: 'General Plan',
      rtp: 'RTP',
      atpp: 'ATP Plan',
      complete_streets: 'Complete Streets',
      transit_plan: 'Transit Plan',
      trail_plan: 'Trail Plan',
      safety_plan: 'Safety Plan',
      climate_action: 'Climate Action',
      corridor_study: 'Corridor Study',
      srts: 'SRTS',
      lrsp: 'LRSP',
      program: 'Program',
      other: 'Other',
    };
    return typeMap[type] || type;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      planning: 'bg-blue-500/20 text-blue-400',
      active: 'bg-emerald-500/20 text-emerald-400',
      on_hold: 'bg-amber-500/20 text-amber-400',
      completed: 'bg-slate-500/20 text-slate-400',
      archived: 'bg-slate-600/20 text-slate-500',
    };
    return colors[status] || 'bg-slate-500/20 text-slate-400';
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Overview of your planning activities</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/projects/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Project
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Projects"
          value={stats.activeProjects}
          icon={FolderKanban}
          color="emerald"
          href="/dashboard/projects"
        />
        <StatCard
          title="Pending Grants"
          value={stats.pendingGrants}
          icon={DollarSign}
          color="amber"
          href="/dashboard/grants"
        />
        <StatCard
          title="Active Engagements"
          value={stats.totalEngagements}
          icon={Users}
          color="blue"
          href="/dashboard/community"
        />
        <StatCard
          title="Community Inputs"
          value={stats.totalInputs}
          icon={TrendingUp}
          color="purple"
          href="/dashboard/community"
        />
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent projects */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Projects</h2>
            <Link 
              href="/dashboard/projects" 
              className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentProjects.length > 0 ? (
            <div className="space-y-3">
              {recentProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  className="block p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white">{project.name}</h3>
                      <p className="text-sm text-slate-400 mt-0.5">
                        {formatProjectType(project.type)} • Updated {formatDate(project.updated_at)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FolderKanban className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No projects yet</p>
              <Link
                href="/dashboard/projects/new"
                className="inline-flex items-center gap-2 mt-3 text-sm text-emerald-400 hover:text-emerald-300"
              >
                <Plus className="w-4 h-4" /> Create your first project
              </Link>
            </div>
          )}
        </div>

        {/* Upcoming deadlines */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Upcoming Deadlines</h2>
            <Link 
              href="/dashboard/grants/calendar" 
              className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              View calendar <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {upcomingDeadlines.length > 0 ? (
            <div className="space-y-3">
              {upcomingDeadlines.map((deadline) => (
                <Link
                  key={deadline.id}
                  href={`/dashboard/grants/${deadline.id}`}
                  className="block p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                      <CalendarDays className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate">{deadline.name}</h3>
                      <p className="text-sm text-slate-400">{deadline.grant_program}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-amber-400">
                        {formatDate(deadline.deadline)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarDays className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No upcoming deadlines</p>
              <Link
                href="/dashboard/grants"
                className="inline-flex items-center gap-2 mt-3 text-sm text-emerald-400 hover:text-emerald-300"
              >
                <Plus className="w-4 h-4" /> Track a grant application
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAction
            href="/dashboard/projects/new"
            icon={FolderKanban}
            label="New Project"
            color="emerald"
          />
          <QuickAction
            href="/dashboard/grants"
            icon={DollarSign}
            label="Find Grants"
            color="amber"
          />
          <QuickAction
            href="/dashboard/community"
            icon={Users}
            label="Community Input"
            color="blue"
          />
          <QuickAction
            href="/dashboard/ai-chat"
            icon={TrendingUp}
            label="AI Assistant"
            color="purple"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  href 
}: { 
  title: string; 
  value: number; 
  icon: React.ElementType; 
  color: 'emerald' | 'amber' | 'blue' | 'purple';
  href: string;
}) {
  const colorClasses = {
    emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400',
    amber: 'from-amber-500/20 to-amber-500/5 text-amber-400',
    blue: 'from-blue-500/20 to-blue-500/5 text-blue-400',
    purple: 'from-purple-500/20 to-purple-500/5 text-purple-400',
  };

  return (
    <Link
      href={href}
      className="block p-5 rounded-xl bg-gradient-to-br border border-slate-800 hover:border-slate-700 transition-all group"
      style={{ background: `linear-gradient(to bottom right, var(--tw-gradient-from), var(--tw-gradient-to))` }}
    >
      <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-5 border border-slate-800`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">{title}</p>
            <p className="text-3xl font-bold text-white mt-1">{value}</p>
          </div>
          <div className={`w-12 h-12 rounded-lg bg-slate-800/50 flex items-center justify-center ${colorClasses[color].split(' ')[1]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    </Link>
  );
}

function QuickAction({ 
  href, 
  icon: Icon, 
  label, 
  color 
}: { 
  href: string; 
  icon: React.ElementType; 
  label: string; 
  color: 'emerald' | 'amber' | 'blue' | 'purple';
}) {
  const colorClasses = {
    emerald: 'hover:border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-400',
    amber: 'hover:border-amber-500/50 hover:bg-amber-500/10 text-amber-400',
    blue: 'hover:border-blue-500/50 hover:bg-blue-500/10 text-blue-400',
    purple: 'hover:border-purple-500/50 hover:bg-purple-500/10 text-purple-400',
  };

  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-800 bg-slate-800/30 transition-all ${colorClasses[color]}`}
    >
      <Icon className="w-6 h-6" />
      <span className="text-sm font-medium text-slate-300">{label}</span>
    </Link>
  );
}

