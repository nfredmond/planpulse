'use client';

import { useDemo } from '@/lib/hooks/useDemo';
import { DEMO_CRASH_DATA } from '@/lib/demo-data';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, Users, Bike, Car, MapPin } from 'lucide-react';

export default function SafetyDataPage() {
  const { isDemo } = useDemo();
  
  const crashes = isDemo ? DEMO_CRASH_DATA : [];
  
  // Calculate stats
  const totalCrashes = crashes.length;
  const fatalCrashes = crashes.filter(c => c.severity === 'fatal').length;
  const seriousCrashes = crashes.filter(c => c.severity === 'serious_injury').length;
  const pedestrianCrashes = crashes.filter(c => c.pedestrian).length;
  const bicycleCrashes = crashes.filter(c => c.bicycle).length;

  // Group by severity
  const severityCounts = crashes.reduce((acc, c) => {
    acc[c.severity] = (acc[c.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const severityLabels: Record<string, { label: string; color: string }> = {
    fatal: { label: 'Fatal', color: 'text-red-500 bg-red-500/20' },
    serious_injury: { label: 'Serious Injury', color: 'text-orange-500 bg-orange-500/20' },
    minor_injury: { label: 'Minor Injury', color: 'text-amber-500 bg-amber-500/20' },
    pdo: { label: 'Property Damage Only', color: 'text-slate-400 bg-slate-500/20' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/data"
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Safety Data</h1>
          <p className="text-slate-400 mt-1">
            Collision analysis and high-injury network identification
          </p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">Total Crashes</span>
          </div>
          <p className="text-2xl font-bold text-white">{totalCrashes}</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-red-400 mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">Fatal</span>
          </div>
          <p className="text-2xl font-bold text-red-400">{fatalCrashes}</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-orange-400 mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">Serious Injury</span>
          </div>
          <p className="text-2xl font-bold text-orange-400">{seriousCrashes}</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-amber-400 mb-2">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">Pedestrian</span>
          </div>
          <p className="text-2xl font-bold text-amber-400">{pedestrianCrashes}</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <Bike className="w-4 h-4" />
            <span className="text-sm font-medium">Bicycle</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">{bicycleCrashes}</p>
        </div>
      </div>

      {/* Severity breakdown */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <h2 className="font-semibold text-white mb-4">Severity Breakdown</h2>
        <div className="space-y-3">
          {Object.entries(severityLabels).map(([key, { label, color }]) => {
            const count = severityCounts[key] || 0;
            const percentage = totalCrashes > 0 ? (count / totalCrashes) * 100 : 0;
            return (
              <div key={key} className="flex items-center gap-3">
                <div className="w-32 text-sm text-slate-400">{label}</div>
                <div className="flex-1 h-6 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${color.split(' ')[1]} transition-all`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-16 text-right">
                  <span className={`text-sm font-medium ${color.split(' ')[0]}`}>{count}</span>
                  <span className="text-xs text-slate-500 ml-1">({percentage.toFixed(0)}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Crash list */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h2 className="font-semibold text-white">Recent Crashes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-slate-400 border-b border-slate-800 bg-slate-800/30">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Severity</th>
                <th className="px-4 py-3 font-medium text-center">Ped</th>
                <th className="px-4 py-3 font-medium text-center">Bike</th>
                <th className="px-4 py-3 font-medium">Primary Factor</th>
              </tr>
            </thead>
            <tbody>
              {crashes.slice(0, 15).map((crash, index) => (
                <tr 
                  key={crash.id}
                  className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${
                    index % 2 === 0 ? '' : 'bg-slate-800/10'
                  }`}
                >
                  <td className="px-4 py-3 text-slate-300">
                    {new Date(crash.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-300">{crash.location}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityLabels[crash.severity]?.color || 'text-slate-400 bg-slate-500/20'}`}>
                      {severityLabels[crash.severity]?.label || crash.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {crash.pedestrian && <Users className="w-4 h-4 text-amber-400 inline" />}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {crash.bicycle && <Bike className="w-4 h-4 text-blue-400 inline" />}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-sm">
                    {crash.primary_factor}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!isDemo && crashes.length === 0 && (
        <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-xl">
          <AlertTriangle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No crash data available</h3>
          <p className="text-slate-400">
            Connect your SWITRS or local crash data source to view safety metrics
          </p>
        </div>
      )}
    </div>
  );
}

