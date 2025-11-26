'use client';

import { useDemo } from '@/lib/hooks/useDemo';
import Link from 'next/link';
import { ArrowLeft, Scale, AlertCircle, Users, MapPin, Shield } from 'lucide-react';

// Demo equity data
const DEMO_EQUITY_DATA = {
  ejScreenIndicators: [
    { name: 'Traffic Proximity', percentile: 78, description: 'Count of vehicles per day at major roads within 500m' },
    { name: 'Air Toxics Cancer Risk', percentile: 65, description: 'Lifetime cancer risk from air toxics' },
    { name: 'PM2.5', percentile: 72, description: 'Particulate Matter 2.5 concentration' },
    { name: 'Ozone', percentile: 68, description: 'Ozone summer seasonal average' },
    { name: 'Diesel PM', percentile: 81, description: 'Diesel particulate matter level' },
    { name: 'Toxic Releases to Air', percentile: 45, description: 'Toxicity-weighted air releases' },
  ],
  disadvantagedCommunities: [
    { 
      name: 'Del Paso Heights', 
      census_tract: '06067002301',
      calenviroscreen_percentile: 92,
      population: 12450,
      indicators: ['Traffic', 'Air Quality', 'Low Income'] 
    },
    { 
      name: 'Meadowview', 
      census_tract: '06067004301',
      calenviroscreen_percentile: 88,
      population: 18200,
      indicators: ['Traffic', 'Housing Burden', 'Low Income'] 
    },
    { 
      name: 'Oak Park', 
      census_tract: '06067002502',
      calenviroscreen_percentile: 85,
      population: 9800,
      indicators: ['Air Quality', 'Low Income', 'Education'] 
    },
    { 
      name: 'South Sacramento', 
      census_tract: '06067004102',
      calenviroscreen_percentile: 79,
      population: 22100,
      indicators: ['Traffic', 'Low Income'] 
    },
  ],
  titleVIStats: {
    minorityPopulation: 66.0,
    lowIncomePopulation: 21.4,
    limtedEnglish: 12.8,
    zeroVehicleHouseholds: 8.2,
    transitDependentPop: 18.5,
  },
};

export default function EquityPage() {
  const { isDemo } = useDemo();
  
  const data = isDemo ? DEMO_EQUITY_DATA : null;

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 80) return 'text-red-400 bg-red-500/20';
    if (percentile >= 60) return 'text-amber-400 bg-amber-500/20';
    if (percentile >= 40) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-emerald-400 bg-emerald-500/20';
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
          <h1 className="text-2xl font-bold text-white">Equity Analysis</h1>
          <p className="text-slate-400 mt-1">
            Title VI, Environmental Justice, and disadvantaged communities
          </p>
        </div>
      </div>

      {data ? (
        <>
          {/* Title VI stats */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Scale className="w-5 h-5 text-emerald-400" />
              <h2 className="font-semibold text-white">Title VI Demographics</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                <p className="text-xs text-slate-500 mb-1">Minority Population</p>
                <p className="text-xl font-bold text-white">{data.titleVIStats.minorityPopulation}%</p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                <p className="text-xs text-slate-500 mb-1">Low Income</p>
                <p className="text-xl font-bold text-amber-400">{data.titleVIStats.lowIncomePopulation}%</p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                <p className="text-xs text-slate-500 mb-1">Limited English</p>
                <p className="text-xl font-bold text-white">{data.titleVIStats.limtedEnglish}%</p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                <p className="text-xs text-slate-500 mb-1">Zero Vehicle HH</p>
                <p className="text-xl font-bold text-blue-400">{data.titleVIStats.zeroVehicleHouseholds}%</p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                <p className="text-xs text-slate-500 mb-1">Transit Dependent</p>
                <p className="text-xl font-bold text-purple-400">{data.titleVIStats.transitDependentPop}%</p>
              </div>
            </div>
          </div>

          {/* EJScreen Indicators */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <h2 className="font-semibold text-white">EJScreen Environmental Indicators</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {data.ejScreenIndicators.map((indicator) => (
                <div 
                  key={indicator.name}
                  className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-white">{indicator.name}</p>
                      <p className="text-xs text-slate-500">{indicator.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-sm font-bold ${getPercentileColor(indicator.percentile)}`}>
                      {indicator.percentile}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        indicator.percentile >= 80 ? 'bg-red-500' :
                        indicator.percentile >= 60 ? 'bg-amber-500' :
                        indicator.percentile >= 40 ? 'bg-yellow-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${indicator.percentile}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-4">
              * Percentiles compare to national averages. Higher percentiles indicate higher burden.
            </p>
          </div>

          {/* Disadvantaged Communities */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-purple-400" />
              <h2 className="font-semibold text-white">SB 535 Disadvantaged Communities</h2>
            </div>
            <div className="space-y-3">
              {data.disadvantagedCommunities.map((community) => (
                <div 
                  key={community.census_tract}
                  className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/20">
                        <MapPin className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{community.name}</p>
                        <p className="text-xs text-slate-500">Census Tract: {community.census_tract}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Users className="w-3 h-3 text-slate-500" />
                          <span className="text-xs text-slate-400">{community.population.toLocaleString()} residents</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`px-2 py-1 rounded text-sm font-bold ${getPercentileColor(community.calenviroscreen_percentile)}`}>
                        CES: {community.calenviroscreen_percentile}%
                      </div>
                      <p className="text-xs text-slate-500 mt-1">CalEnviroScreen</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {community.indicators.map((indicator) => (
                      <span 
                        key={indicator}
                        className="px-2 py-0.5 rounded text-xs bg-slate-700 text-slate-300"
                      >
                        {indicator}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info box */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-400 mb-1">About Equity Screening</p>
                <p className="text-slate-400">
                  This data combines EPA&apos;s EJScreen with California&apos;s CalEnviroScreen to identify 
                  communities that may be disproportionately burdened by pollution and other environmental 
                  factors. Projects in these areas may qualify for additional state funding through 
                  programs like GGRF, ATP, and TIRCP.
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-xl">
          <Scale className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No equity data available</h3>
          <p className="text-slate-400">
            Connect to EJScreen and CalEnviroScreen APIs to view equity metrics
          </p>
        </div>
      )}
    </div>
  );
}

