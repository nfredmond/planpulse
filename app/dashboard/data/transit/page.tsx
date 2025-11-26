'use client';

import { useDemo } from '@/lib/hooks/useDemo';
import { DEMO_TRANSIT_METRICS } from '@/lib/demo-data';
import Link from 'next/link';
import { ArrowLeft, Train, TrendingUp, TrendingDown, DollarSign, Clock } from 'lucide-react';

export default function TransitDataPage() {
  const { isDemo } = useDemo();
  
  const metrics = isDemo ? DEMO_TRANSIT_METRICS : [];
  
  // Calculate aggregates
  const totalRidership = metrics.reduce((sum, r) => sum + r.ridership, 0);
  const avgCostPerPassenger = metrics.length > 0 
    ? metrics.reduce((sum, r) => sum + r.cost_per_passenger, 0) / metrics.length 
    : 0;
  const avgOTP = metrics.length > 0
    ? metrics.reduce((sum, r) => sum + r.on_time_performance, 0) / metrics.length
    : 0;
  const totalCost = metrics.reduce((sum, r) => sum + r.operating_cost, 0);

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
          <h1 className="text-2xl font-bold text-white">Transit Analytics</h1>
          <p className="text-slate-400 mt-1">
            Ridership, cost efficiency, and on-time performance
          </p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-emerald-400 mb-2">
            <Train className="w-4 h-4" />
            <span className="text-sm font-medium">Total Ridership</span>
          </div>
          <p className="text-2xl font-bold text-white">{totalRidership.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">Monthly passengers</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm font-medium">Avg Cost/Passenger</span>
          </div>
          <p className="text-2xl font-bold text-white">${avgCostPerPassenger.toFixed(2)}</p>
          <p className="text-xs text-slate-500 mt-1">Per boarding</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-purple-400 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">On-Time Performance</span>
          </div>
          <p className="text-2xl font-bold text-white">{(avgOTP * 100).toFixed(1)}%</p>
          <p className="text-xs text-slate-500 mt-1">System average</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-amber-400 mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm font-medium">Total Operating Cost</span>
          </div>
          <p className="text-2xl font-bold text-white">${(totalCost / 1000000).toFixed(1)}M</p>
          <p className="text-xs text-slate-500 mt-1">Monthly</p>
        </div>
      </div>

      {/* Routes table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h2 className="font-semibold text-white">Route Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-slate-400 border-b border-slate-800 bg-slate-800/30">
                <th className="px-4 py-3 font-medium">Route</th>
                <th className="px-4 py-3 font-medium text-right">Ridership</th>
                <th className="px-4 py-3 font-medium text-right">Operating Cost</th>
                <th className="px-4 py-3 font-medium text-right">Cost/Passenger</th>
                <th className="px-4 py-3 font-medium text-right">On-Time %</th>
                <th className="px-4 py-3 font-medium text-right">Trend</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((route, index) => (
                <tr 
                  key={route.route_id} 
                  className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${
                    index % 2 === 0 ? '' : 'bg-slate-800/10'
                  }`}
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-white font-medium">{route.route_name}</p>
                      <p className="text-xs text-slate-500">ID: {route.route_id}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-300">
                    {route.ridership.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-300">
                    ${route.operating_cost.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={route.cost_per_passenger < 5.5 ? 'text-emerald-400' : route.cost_per_passenger < 7 ? 'text-amber-400' : 'text-red-400'}>
                      ${route.cost_per_passenger.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={route.on_time_performance >= 0.85 ? 'text-emerald-400' : route.on_time_performance >= 0.75 ? 'text-amber-400' : 'text-red-400'}>
                      {(route.on_time_performance * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {route.ridership > totalRidership / metrics.length ? (
                      <TrendingUp className="w-4 h-4 text-emerald-400 inline" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-amber-400 inline" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!isDemo && metrics.length === 0 && (
        <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-xl">
          <Train className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No transit data available</h3>
          <p className="text-slate-400">
            Connect your transit agency data source to view metrics
          </p>
        </div>
      )}
    </div>
  );
}

