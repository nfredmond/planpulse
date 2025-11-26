'use client';

import { useDemo } from '@/lib/hooks/useDemo';
import { DEMO_TRANSIT_METRICS, DEMO_CRASH_DATA } from '@/lib/demo-data';
import Link from 'next/link';
import { 
  Train, 
  AlertTriangle, 
  Users, 
  Scale,
  ArrowRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

export default function DataPage() {
  const { isDemo } = useDemo();

  const dataModules = [
    {
      title: 'Transit Analytics',
      description: 'Ridership, cost efficiency, on-time performance',
      icon: Train,
      href: '/dashboard/data/transit',
      color: 'emerald',
      stats: isDemo ? {
        label: 'Routes Tracked',
        value: DEMO_TRANSIT_METRICS.length,
      } : null,
    },
    {
      title: 'Safety Data',
      description: 'Collision analysis and high-injury network',
      icon: AlertTriangle,
      href: '/dashboard/data/safety',
      color: 'red',
      stats: isDemo ? {
        label: 'Crashes (2024)',
        value: DEMO_CRASH_DATA.length,
      } : null,
    },
    {
      title: 'Demographics',
      description: 'Census data and community profiles',
      icon: Users,
      href: '/dashboard/data/demographics',
      color: 'blue',
      stats: null,
    },
    {
      title: 'Equity Analysis',
      description: 'Title VI, EJ, and disadvantaged communities',
      icon: Scale,
      href: '/dashboard/data/equity',
      color: 'purple',
      stats: null,
    },
  ];

  const colorClasses: Record<string, string> = {
    emerald: 'bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/30',
    red: 'bg-red-500/20 text-red-400 group-hover:bg-red-500/30',
    blue: 'bg-blue-500/20 text-blue-400 group-hover:bg-blue-500/30',
    purple: 'bg-purple-500/20 text-purple-400 group-hover:bg-purple-500/30',
  };

  // Calculate some demo stats
  const transitStats = isDemo ? {
    totalRidership: DEMO_TRANSIT_METRICS.reduce((sum, r) => sum + r.ridership, 0),
    avgCostPerPassenger: (DEMO_TRANSIT_METRICS.reduce((sum, r) => sum + r.cost_per_passenger, 0) / DEMO_TRANSIT_METRICS.length).toFixed(2),
    avgOTP: (DEMO_TRANSIT_METRICS.reduce((sum, r) => sum + r.on_time_performance, 0) / DEMO_TRANSIT_METRICS.length * 100).toFixed(0),
  } : null;

  const safetyStats = isDemo ? {
    totalCrashes: DEMO_CRASH_DATA.length,
    pedestrianInvolved: DEMO_CRASH_DATA.filter(c => c.pedestrian).length,
    bicycleInvolved: DEMO_CRASH_DATA.filter(c => c.bicycle).length,
    fatal: DEMO_CRASH_DATA.filter(c => c.severity === 'fatal').length,
  } : null;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Data Analytics</h1>
        <p className="text-slate-400 mt-1">
          Analyze transit, safety, demographic, and equity data
        </p>
      </div>

      {/* Data modules grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dataModules.map((module) => (
          <Link
            key={module.title}
            href={module.href}
            className="group bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${colorClasses[module.color]} flex items-center justify-center transition-colors`}>
                <module.icon className="w-6 h-6" />
              </div>
              <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-400 transition-colors" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-emerald-400 transition-colors">
              {module.title}
            </h3>
            <p className="text-sm text-slate-400 mb-4">{module.description}</p>
            {module.stats && (
              <div className="text-sm">
                <span className="text-slate-500">{module.stats.label}:</span>{' '}
                <span className="text-white font-medium">{module.stats.value}</span>
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* Quick stats */}
      {isDemo && (
        <>
          {/* Transit quick view */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Transit Overview</h2>
              <Link 
                href="/dashboard/data/transit"
                className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                View details <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Total Monthly Ridership</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {transitStats?.totalRidership.toLocaleString()}
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Avg Cost/Passenger</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">
                  ${transitStats?.avgCostPerPassenger}
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Avg On-Time Performance</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {transitStats?.avgOTP}%
                </p>
              </div>
            </div>

            {/* Route performance table */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-slate-400 border-b border-slate-800">
                    <th className="pb-3 font-medium">Route</th>
                    <th className="pb-3 font-medium text-right">Ridership</th>
                    <th className="pb-3 font-medium text-right">Cost/Pass</th>
                    <th className="pb-3 font-medium text-right">OTP</th>
                  </tr>
                </thead>
                <tbody>
                  {DEMO_TRANSIT_METRICS.slice(0, 5).map((route) => (
                    <tr key={route.route_id} className="border-b border-slate-800/50">
                      <td className="py-3 text-white">{route.route_name}</td>
                      <td className="py-3 text-right text-slate-300">{route.ridership.toLocaleString()}</td>
                      <td className="py-3 text-right">
                        <span className={route.cost_per_passenger < 5.5 ? 'text-emerald-400' : 'text-amber-400'}>
                          ${route.cost_per_passenger.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <span className={route.on_time_performance >= 0.85 ? 'text-emerald-400' : 'text-amber-400'}>
                          {(route.on_time_performance * 100).toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Safety quick view */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Safety Summary (2024)</h2>
              <Link 
                href="/dashboard/data/safety"
                className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                View map <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Total Crashes</p>
                <p className="text-2xl font-bold text-white mt-1">{safetyStats?.totalCrashes}</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Fatal</p>
                <p className="text-2xl font-bold text-red-400 mt-1">{safetyStats?.fatal}</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Pedestrian Involved</p>
                <p className="text-2xl font-bold text-amber-400 mt-1">{safetyStats?.pedestrianInvolved}</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Bicycle Involved</p>
                <p className="text-2xl font-bold text-blue-400 mt-1">{safetyStats?.bicycleInvolved}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

