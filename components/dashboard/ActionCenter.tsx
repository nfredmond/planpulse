'use client';

import Link from 'next/link';
import { 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  DollarSign, 
  FolderKanban, 
  Calendar, 
  Users,
  FileCheck,
  ChevronRight
} from 'lucide-react';
import { 
  type ActionItem, 
  ACTION_TYPE_LABELS, 
  ACTION_SEVERITY_META,
  formatDueDate 
} from '@/lib/data-helpers';

interface ActionCenterProps {
  items: ActionItem[];
  maxItems?: number;
}

const TYPE_ICONS = {
  caltrans: FileCheck,
  grant: DollarSign,
  project: FolderKanban,
  meeting: Calendar,
  community: Users,
};

export default function ActionCenter({ items, maxItems = 6 }: ActionCenterProps) {
  const displayItems = items.slice(0, maxItems);
  const hasMore = items.length > maxItems;

  // Count by severity
  const overdueCount = items.filter(i => i.severity === 'overdue').length;
  const soonCount = items.filter(i => i.severity === 'soon').length;

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Action Center</h3>
            <p className="text-sm text-slate-400">Upcoming deadlines & tasks</p>
          </div>
        </div>
        
        {/* Quick stats */}
        <div className="flex items-center gap-3">
          {overdueCount > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/30">
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
              <span className="text-xs font-medium text-red-400">{overdueCount} overdue</span>
            </div>
          )}
          {soonCount > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-medium text-amber-400">{soonCount} due soon</span>
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="divide-y divide-slate-800">
        {displayItems.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <p className="text-slate-400">All caught up! No pending items.</p>
          </div>
        ) : (
          displayItems.map((item) => {
            const Icon = TYPE_ICONS[item.type];
            const severityMeta = ACTION_SEVERITY_META[item.severity];
            
            return (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-center gap-4 p-4 hover:bg-slate-800/50 transition-colors group"
              >
                {/* Type Icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  item.severity === 'overdue' ? 'bg-red-500/20' :
                  item.severity === 'soon' ? 'bg-amber-500/20' : 'bg-slate-700'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    item.severity === 'overdue' ? 'text-red-400' :
                    item.severity === 'soon' ? 'text-amber-400' : 'text-slate-400'
                  }`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-white truncate">{item.title}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs border ${severityMeta.className}`}>
                      {severityMeta.label}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 truncate mt-0.5">{item.description}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-500">{ACTION_TYPE_LABELS[item.type]}</span>
                    {item.dueDate && (
                      <span className={`text-xs ${
                        item.severity === 'overdue' ? 'text-red-400' :
                        item.severity === 'soon' ? 'text-amber-400' : 'text-slate-500'
                      }`}>
                        {formatDueDate(item.dueDate)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </Link>
            );
          })
        )}
      </div>

      {/* Footer */}
      {hasMore && (
        <div className="p-3 border-t border-slate-800 bg-slate-900/30">
          <Link
            href="/dashboard"
            className="block text-center text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            View all {items.length} items
          </Link>
        </div>
      )}
    </div>
  );
}

