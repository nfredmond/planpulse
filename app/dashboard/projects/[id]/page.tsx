'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useDemo } from '@/lib/hooks/useDemo';
import { DEMO_PROJECTS, DEMO_PROJECT_TASKS } from '@/lib/demo-data';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  Users, 
  MapPin,
  CheckCircle,
  Circle,
  Clock,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  type: string;
  discipline?: string;
  status: string;
  description: string | null;
  client_name: string | null;
  budget: number | null;
  spent: number | null;
  start_date: string | null;
  end_date: string | null;
}

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  due_date?: string | null;
  assigned_to?: string | null;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const { isDemo, mounted } = useDemo();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mounted) return;

    async function loadProject() {
      if (isDemo) {
        const demoProject = DEMO_PROJECTS.find(p => p.id === params.id);
        setProject(demoProject as Project || null);
        setTasks(DEMO_PROJECT_TASKS?.filter(t => t.project_id === params.id) || []);
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const [{ data: proj }, { data: taskData }] = await Promise.all([
        supabase.from('projects').select('*').eq('id', params.id).single(),
        supabase.from('project_tasks').select('*').eq('project_id', params.id).order('due_date'),
      ]);

      setProject(proj);
      setTasks(taskData || []);
      setLoading(false);
    }

    loadProject();
  }, [mounted, isDemo, params.id]);

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
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      planning: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      on_hold: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      completed: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      todo: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      done: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    };
    return colors[status] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  const getTaskIcon = (status: string) => {
    switch (status) {
      case 'done': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-400" />;
      default: return <Circle className="w-4 h-4 text-slate-500" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-800 rounded w-48 animate-pulse" />
        <div className="h-64 bg-slate-800 rounded animate-pulse" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-white mb-2">Project not found</h2>
        <Link href="/dashboard/projects" className="text-emerald-400 hover:text-emerald-300">
          ← Back to Projects
        </Link>
      </div>
    );
  }

  const budgetProgress = project.budget ? ((project.spent || 0) / project.budget) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/projects"
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">{project.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-slate-400">{project.type?.replace('_', ' ')}</span>
              {project.discipline && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">{project.discipline}</span>
                </>
              )}
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                {project.status?.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            disabled={isDemo}
          >
            <Edit className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Project details grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          {project.description && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <h2 className="font-semibold text-white mb-3">Description</h2>
              <p className="text-slate-400">{project.description}</p>
            </div>
          )}

          {/* Tasks */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white">Tasks</h2>
              <button 
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                disabled={isDemo}
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </div>
            {tasks.length > 0 ? (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div 
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
                  >
                    {getTaskIcon(task.status)}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${task.status === 'done' ? 'text-slate-500 line-through' : 'text-white'}`}>
                        {task.title}
                      </p>
                      {task.due_date && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          Due: {formatDate(task.due_date)}
                        </p>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(task.status)}`}>
                      {task.status?.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">No tasks yet</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Budget */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Budget
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Budget</span>
                <span className="text-white font-medium">{formatCurrency(project.budget)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Spent</span>
                <span className="text-white font-medium">{formatCurrency(project.spent)}</span>
              </div>
              {project.budget && (
                <>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${budgetProgress > 90 ? 'bg-red-500' : budgetProgress > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(budgetProgress, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 text-right">{budgetProgress.toFixed(0)}% used</p>
                </>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Timeline
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Start Date</span>
                <span className="text-white">{formatDate(project.start_date)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">End Date</span>
                <span className="text-white">{formatDate(project.end_date)}</span>
              </div>
            </div>
          </div>

          {/* Client */}
          {project.client_name && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                Client
              </h3>
              <p className="text-white">{project.client_name}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

