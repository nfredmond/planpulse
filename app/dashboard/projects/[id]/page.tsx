'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useDemo } from '@/lib/hooks/useDemo';
import { DEMO_PROJECTS, DEMO_PROJECT_TASKS } from '@/lib/demo-data';
import Link from 'next/link';
import { toast } from 'sonner';
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
  Plus,
  Save,
  X,
  ExternalLink
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
  caltrans_project_number?: string | null;
  federal_aid_number?: string | null;
  funding_source?: string | null;
}

interface Task {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  due_date?: string | null;
  assignee_id?: string | null;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isDemo, mounted } = useDemo();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [editForm, setEditForm] = useState<Partial<Project>>({});

  useEffect(() => {
    if (!mounted) return;

    async function loadProject() {
      if (isDemo) {
        const demoProject = DEMO_PROJECTS.find(p => p.id === params.id);
        setProject(demoProject as Project || null);
        // Map demo task fields
        const demoTasks = DEMO_PROJECT_TASKS?.filter(t => t.project_id === params.id).map(t => ({
          id: t.id,
          name: t.title,
          description: t.description,
          status: t.status,
          due_date: t.due_date,
          assignee_id: null,
        })) || [];
        setTasks(demoTasks);
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
      case 'done': 
      case 'completed': 
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-400" />;
      default: return <Circle className="w-4 h-4 text-slate-500" />;
    }
  };

  const handleSaveProject = async () => {
    if (isDemo) {
      toast.info('Demo mode: Changes are not saved');
      setEditing(false);
      return;
    }

    try {
      const response = await fetch(`/api/projects/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) throw new Error('Failed to save');

      const updated = await response.json();
      setProject(updated);
      setEditing(false);
      toast.success('Project updated');
    } catch (error) {
      toast.error('Failed to save changes');
    }
  };

  const handleDeleteProject = async () => {
    if (isDemo) {
      toast.info('Demo mode: Project cannot be deleted');
      return;
    }

    if (!confirm('Are you sure you want to delete this project? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      toast.success('Project deleted');
      router.push('/dashboard/projects');
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const handleAddTask = async () => {
    if (!newTaskName.trim()) {
      toast.error('Please enter a task name');
      return;
    }

    if (isDemo) {
      const newTask: Task = {
        id: `task-${Date.now()}`,
        name: newTaskName,
        status: 'todo',
        due_date: newTaskDueDate || null,
      };
      setTasks([...tasks, newTask]);
      setNewTaskName('');
      setNewTaskDueDate('');
      setShowNewTask(false);
      toast.success('Task added (Demo mode)');
      return;
    }

    try {
      const response = await fetch(`/api/projects/${params.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTaskName,
          due_date: newTaskDueDate || null,
          status: 'todo',
        }),
      });

      if (!response.ok) throw new Error('Failed to add task');

      const newTask = await response.json();
      setTasks([...tasks, newTask]);
      setNewTaskName('');
      setNewTaskDueDate('');
      setShowNewTask(false);
      toast.success('Task added');
    } catch (error) {
      toast.error('Failed to add task');
    }
  };

  const handleToggleTaskStatus = async (task: Task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    
    if (isDemo) {
      setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
      toast.success(`Task marked as ${newStatus}`);
      return;
    }

    try {
      // In a real app, you'd call the API here
      setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
      toast.success(`Task marked as ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const startEditing = () => {
    setEditForm({
      name: project?.name,
      description: project?.description,
      status: project?.status,
      budget: project?.budget,
      spent: project?.spent,
      start_date: project?.start_date,
      end_date: project?.end_date,
    });
    setEditing(true);
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
            {editing ? (
              <input
                type="text"
                value={editForm.name || ''}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="text-2xl font-bold text-white bg-transparent border-b border-emerald-500 focus:outline-none"
              />
            ) : (
              <h1 className="text-2xl font-bold text-white">{project.name}</h1>
            )}
            <div className="flex items-center gap-3 mt-1">
              <span className="text-slate-400 capitalize">{project.type?.replace(/_/g, ' ')}</span>
              {project.discipline && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400 capitalize">{project.discipline}</span>
                </>
              )}
              {editing ? (
                <select
                  value={editForm.status || ''}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="px-2 py-0.5 rounded text-xs bg-slate-800 text-white border border-slate-700"
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              ) : (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                  {project.status?.replace('_', ' ')}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button 
                onClick={() => setEditing(false)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <button 
                onClick={handleSaveProject}
                className="p-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
              >
                <Save className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={startEditing}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button 
                onClick={handleDeleteProject}
                className="p-2 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Project details grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h2 className="font-semibold text-white mb-3">Description</h2>
            {editing ? (
              <textarea
                value={editForm.description || ''}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            ) : (
              <p className="text-slate-400">
                {project.description || 'No description provided.'}
              </p>
            )}
          </div>

          {/* Caltrans info if applicable */}
          {(project.caltrans_project_number || project.federal_aid_number || project.funding_source) && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <h2 className="font-semibold text-white mb-3">Funding Details</h2>
              <div className="grid grid-cols-2 gap-4">
                {project.caltrans_project_number && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Caltrans Project #</p>
                    <p className="text-white font-mono">{project.caltrans_project_number}</p>
                  </div>
                )}
                {project.federal_aid_number && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Federal Aid #</p>
                    <p className="text-white font-mono">{project.federal_aid_number}</p>
                  </div>
                )}
                {project.funding_source && (
                  <div className="col-span-2">
                    <p className="text-xs text-slate-500 mb-1">Funding Source</p>
                    <p className="text-white">{project.funding_source}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tasks */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white">Tasks</h2>
              <button 
                onClick={() => setShowNewTask(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </div>

            {/* New task form */}
            {showNewTask && (
              <div className="mb-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Task name..."
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    autoFocus
                  />
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                  <button
                    onClick={handleAddTask}
                    className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowNewTask(false);
                      setNewTaskName('');
                      setNewTaskDueDate('');
                    }}
                    className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {tasks.length > 0 ? (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div 
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer"
                    onClick={() => handleToggleTaskStatus(task)}
                  >
                    {getTaskIcon(task.status)}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${task.status === 'done' ? 'text-slate-500 line-through' : 'text-white'}`}>
                        {task.name}
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
              <p className="text-slate-500 text-center py-8">No tasks yet. Add one to get started!</p>
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
                {editing ? (
                  <input
                    type="number"
                    value={editForm.budget || ''}
                    onChange={(e) => setEditForm({ ...editForm, budget: parseFloat(e.target.value) || null })}
                    className="w-24 px-2 py-1 text-right bg-slate-800 border border-slate-700 rounded text-white"
                  />
                ) : (
                  <span className="text-white font-medium">{formatCurrency(project.budget)}</span>
                )}
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Spent</span>
                {editing ? (
                  <input
                    type="number"
                    value={editForm.spent || ''}
                    onChange={(e) => setEditForm({ ...editForm, spent: parseFloat(e.target.value) || null })}
                    className="w-24 px-2 py-1 text-right bg-slate-800 border border-slate-700 rounded text-white"
                  />
                ) : (
                  <span className="text-white font-medium">{formatCurrency(project.spent)}</span>
                )}
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
                {editing ? (
                  <input
                    type="date"
                    value={editForm.start_date || ''}
                    onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
                    className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white"
                  />
                ) : (
                  <span className="text-white">{formatDate(project.start_date)}</span>
                )}
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">End Date</span>
                {editing ? (
                  <input
                    type="date"
                    value={editForm.end_date || ''}
                    onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
                    className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white"
                  />
                ) : (
                  <span className="text-white">{formatDate(project.end_date)}</span>
                )}
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

          {/* Quick actions */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href={`/dashboard/community?project=${project.id}`}
                className="w-full flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm"
              >
                <Users className="w-4 h-4" />
                Create Engagement
              </Link>
              <Link
                href={`/dashboard/maps?project=${project.id}`}
                className="w-full flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm"
              >
                <MapPin className="w-4 h-4" />
                View on Map
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
