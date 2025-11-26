// lib/data-helpers.ts
// Action Center and data aggregation helpers
// Based on project_manager patterns

import { differenceInCalendarDays, format, parseISO } from 'date-fns';

// ============================================
// Action Item Types
// ============================================

export type ActionItemType = 'caltrans' | 'grant' | 'project' | 'meeting' | 'community';
export type ActionSeverity = 'overdue' | 'soon' | 'normal';

export interface ActionItem {
  id: string;
  type: ActionItemType;
  title: string;
  description: string;
  dueDate?: string;
  severity: ActionSeverity;
  href: string;
  metadata?: Record<string, unknown>;
}

// ============================================
// Labels and Styling
// ============================================

export const ACTION_TYPE_LABELS: Record<ActionItemType, string> = {
  caltrans: 'Caltrans LAPM',
  grant: 'Grant',
  project: 'Project',
  meeting: 'Meeting',
  community: 'Community Input',
};

export const ACTION_TYPE_ICONS: Record<ActionItemType, string> = {
  caltrans: 'FileCheck',
  grant: 'DollarSign',
  project: 'FolderKanban',
  meeting: 'Calendar',
  community: 'Users',
};

export const ACTION_SEVERITY_META: Record<ActionSeverity, { 
  label: string; 
  variant: 'destructive' | 'warning' | 'default';
  className: string;
}> = {
  overdue: { 
    label: 'Overdue', 
    variant: 'destructive',
    className: 'bg-red-500/20 text-red-400 border-red-500/30'
  },
  soon: { 
    label: 'Due soon', 
    variant: 'warning',
    className: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
  },
  normal: { 
    label: 'Planned', 
    variant: 'default',
    className: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
  },
};

// ============================================
// Severity Calculation
// ============================================

/**
 * Determine severity based on due date
 * - Overdue: Past due
 * - Soon: Within 14 days
 * - Normal: More than 14 days out
 */
export function determineSeverity(dueDate?: string | null): ActionSeverity {
  if (!dueDate) return 'normal';
  
  try {
    const parsed = parseISO(dueDate);
    if (isNaN(parsed.getTime())) return 'normal';
    
    const days = differenceInCalendarDays(parsed, new Date());
    
    if (days < 0) return 'overdue';
    if (days <= 14) return 'soon';
    return 'normal';
  } catch {
    return 'normal';
  }
}

/**
 * Get days until due date
 */
export function getDaysUntilDue(dueDate?: string | null): number | null {
  if (!dueDate) return null;
  
  try {
    const parsed = parseISO(dueDate);
    if (isNaN(parsed.getTime())) return null;
    return differenceInCalendarDays(parsed, new Date());
  } catch {
    return null;
  }
}

/**
 * Format due date for display
 */
export function formatDueDate(dueDate?: string | null): string {
  if (!dueDate) return 'No deadline';
  
  try {
    const parsed = parseISO(dueDate);
    if (isNaN(parsed.getTime())) return 'Invalid date';
    
    const days = differenceInCalendarDays(parsed, new Date());
    
    if (days < 0) {
      return `${Math.abs(days)} days overdue`;
    } else if (days === 0) {
      return 'Due today';
    } else if (days === 1) {
      return 'Due tomorrow';
    } else if (days <= 7) {
      return `Due in ${days} days`;
    } else {
      return format(parsed, 'MMM d, yyyy');
    }
  } catch {
    return dueDate;
  }
}

// ============================================
// Action Item Builders
// ============================================

export interface Project {
  id: string;
  name: string;
  status?: string;
  end_date?: string;
}

export interface Grant {
  id: string;
  name: string;
  deadline?: string;
  status?: string;
  summary?: string;
}

export interface CaltransPhase {
  id: string;
  project_id?: string;
  phase: string;
  ped_due_date?: string;
  status?: string;
}

export interface Meeting {
  id: string;
  title: string;
  meeting_date?: string;
  location?: string;
}

export interface CommunityInput {
  id: string;
  engagement_id?: string;
  moderation_status?: string;
  created_at?: string;
}

interface BuildActionItemsArgs {
  projects?: Project[];
  grants?: Grant[];
  caltransPhases?: CaltransPhase[];
  meetings?: Meeting[];
  pendingModeration?: number;
}

/**
 * Build sorted action items from various data sources
 */
export function buildActionItems({
  projects = [],
  grants = [],
  caltransPhases = [],
  meetings = [],
  pendingModeration = 0
}: BuildActionItemsArgs): ActionItem[] {
  const items: ActionItem[] = [];

  // Helper to get project name by ID
  const getProjectName = (projectId?: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name ?? 'Project';
  };

  // Caltrans phases with PED deadlines
  caltransPhases.forEach((phase) => {
    if (phase.ped_due_date) {
      items.push({
        id: phase.id,
        type: 'caltrans',
        title: `${getProjectName(phase.project_id)} - ${phase.phase} Phase`,
        description: 'Project End Date approaching - ensure invoicing within 120 days',
        dueDate: phase.ped_due_date,
        href: '/dashboard/caltrans',
        severity: determineSeverity(phase.ped_due_date),
      });
    }
  });

  // Grant deadlines
  grants.forEach((grant) => {
    if (grant.deadline && grant.status !== 'awarded' && grant.status !== 'denied') {
      items.push({
        id: grant.id,
        type: 'grant',
        title: grant.name,
        description: grant.summary ?? 'Review deadline and application status',
        dueDate: grant.deadline,
        href: '/dashboard/grants',
        severity: determineSeverity(grant.deadline),
      });
    }
  });

  // Project end dates
  projects.forEach((project) => {
    if (project.end_date && project.status === 'active') {
      items.push({
        id: project.id,
        type: 'project',
        title: project.name,
        description: 'Project completion deadline approaching',
        dueDate: project.end_date,
        href: `/dashboard/projects/${project.id}`,
        severity: determineSeverity(project.end_date),
      });
    }
  });

  // Meetings
  meetings.forEach((meeting) => {
    if (meeting.meeting_date) {
      items.push({
        id: meeting.id,
        type: 'meeting',
        title: meeting.title,
        description: meeting.location ?? 'Finalize agenda and publish materials',
        dueDate: meeting.meeting_date,
        href: '/dashboard/meetings',
        severity: determineSeverity(meeting.meeting_date),
      });
    }
  });

  // Community moderation queue
  if (pendingModeration > 0) {
    items.push({
      id: 'community-moderation',
      type: 'community',
      title: `${pendingModeration} inputs pending review`,
      description: 'Review and moderate community submissions',
      href: '/dashboard/community',
      severity: pendingModeration > 10 ? 'soon' : 'normal',
    });
  }

  return sortActionItems(items);
}

/**
 * Sort action items by severity then due date
 */
function sortActionItems(items: ActionItem[]): ActionItem[] {
  const severityWeight: Record<ActionSeverity, number> = {
    overdue: 0,
    soon: 1,
    normal: 2,
  };

  return items.sort((a, b) => {
    // First sort by severity
    if (severityWeight[a.severity] !== severityWeight[b.severity]) {
      return severityWeight[a.severity] - severityWeight[b.severity];
    }
    
    // Then by due date
    const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY;
    const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY;
    return aTime - bTime;
  });
}

// ============================================
// Budget Helpers
// ============================================

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  percentSpent: number;
  remaining: number;
}

export function summarizeBudget(projects: { budget?: number; spent?: number }[]): BudgetSummary {
  const result = projects.reduce(
    (acc, project) => {
      acc.totalBudget += Number(project.budget ?? 0);
      acc.totalSpent += Number(project.spent ?? 0);
      return acc;
    },
    { totalBudget: 0, totalSpent: 0 }
  );

  return {
    ...result,
    percentSpent: result.totalBudget > 0 
      ? Math.round((result.totalSpent / result.totalBudget) * 100) 
      : 0,
    remaining: result.totalBudget - result.totalSpent
  };
}

// ============================================
// Formatting Helpers
// ============================================

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString();
}

