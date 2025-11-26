'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useDemo } from '@/lib/hooks/useDemo';
import { DEMO_GRANT_APPLICATIONS, DEMO_GRANT_PROGRAMS } from '@/lib/demo-data';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  FileText,
  CheckCircle,
  Clock,
  Send,
  XCircle,
  Edit,
  ExternalLink,
  AlertCircle
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
  submitted_at?: string | null;
  notes?: string | null;
}

export default function GrantDetailPage() {
  const params = useParams();
  const { isDemo, mounted } = useDemo();
  const [application, setApplication] = useState<GrantApplication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mounted) return;

    async function loadApplication() {
      if (isDemo) {
        const demoApp = DEMO_GRANT_APPLICATIONS.find(a => a.id === params.id);
        setApplication(demoApp as GrantApplication || null);
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const { data } = await supabase
        .from('grant_applications')
        .select('*')
        .eq('id', params.id)
        .single();

      setApplication(data);
      setLoading(false);
    }

    loadApplication();
  }, [mounted, isDemo, params.id]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'drafting': return <FileText className="w-5 h-5" />;
      case 'submitted': return <Send className="w-5 h-5" />;
      case 'under_review': return <Clock className="w-5 h-5" />;
      case 'awarded': return <CheckCircle className="w-5 h-5" />;
      case 'denied': return <XCircle className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      drafting: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      submitted: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      under_review: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      awarded: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      denied: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[status] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  const getDaysUntilDeadline = (deadline: string | null) => {
    if (!deadline) return null;
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-800 rounded w-48 animate-pulse" />
        <div className="h-64 bg-slate-800 rounded animate-pulse" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-white mb-2">Grant application not found</h2>
        <Link href="/dashboard/grants" className="text-emerald-400 hover:text-emerald-300">
          ← Back to Grants
        </Link>
      </div>
    );
  }

  const daysUntil = getDaysUntilDeadline(application.deadline);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/grants"
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">{application.name}</h1>
            <p className="text-slate-400 mt-1">{application.grant_program}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(application.status)}`}>
            {getStatusIcon(application.status)}
            {application.status.replace('_', ' ')}
          </span>
          <button 
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            disabled={isDemo}
          >
            <Edit className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Deadline warning */}
      {daysUntil !== null && daysUntil > 0 && daysUntil <= 14 && (
        <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-200">
            Deadline approaching: {daysUntil} day{daysUntil !== 1 ? 's' : ''} until {formatDate(application.deadline)}
          </p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {application.description && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <h2 className="font-semibold text-white mb-3">Description</h2>
              <p className="text-slate-400">{application.description}</p>
            </div>
          )}

          {/* Financials */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h2 className="font-semibold text-white mb-4">Financials</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <p className="text-sm text-slate-400 mb-1">Amount Requested</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(application.amount_requested)}</p>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <p className="text-sm text-slate-400 mb-1">Match Amount</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(application.match_amount)}</p>
              </div>
              {application.status === 'awarded' && (
                <div className="col-span-2 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <p className="text-sm text-emerald-400 mb-1">Amount Awarded</p>
                  <p className="text-2xl font-bold text-emerald-400">{formatCurrency(application.amount_awarded)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h2 className="font-semibold text-white mb-3">Notes</h2>
            {application.notes ? (
              <p className="text-slate-400">{application.notes}</p>
            ) : (
              <p className="text-slate-500 italic">No notes yet</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Dates */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Important Dates
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Deadline</span>
                <span className={`font-medium ${daysUntil && daysUntil <= 14 ? 'text-amber-400' : 'text-white'}`}>
                  {formatDate(application.deadline)}
                </span>
              </div>
              {application.submitted_at && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Submitted</span>
                  <span className="text-white">{formatDate(application.submitted_at)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-4">Actions</h3>
            <div className="space-y-2">
              {application.status === 'drafting' && (
                <button 
                  className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  disabled={isDemo}
                >
                  <Send className="w-4 h-4" />
                  Mark as Submitted
                </button>
              )}
              <button 
                className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                disabled={isDemo}
              >
                <FileText className="w-4 h-4" />
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

