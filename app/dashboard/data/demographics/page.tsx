'use client';

import { useDemo } from '@/lib/hooks/useDemo';
import Link from 'next/link';
import { ArrowLeft, Users, Home, GraduationCap, Briefcase, DollarSign } from 'lucide-react';

// Demo demographic data for Sacramento
const DEMO_DEMOGRAPHICS = {
  population: 524943,
  households: 200115,
  medianIncome: 72712,
  medianAge: 35.2,
  raceEthnicity: [
    { label: 'White', percentage: 34.0, count: 178481 },
    { label: 'Hispanic/Latino', percentage: 29.5, count: 154858 },
    { label: 'Asian', percentage: 18.5, count: 97114 },
    { label: 'Black/African American', percentage: 12.5, count: 65618 },
    { label: 'Two or More Races', percentage: 4.2, count: 22048 },
    { label: 'Other', percentage: 1.3, count: 6824 },
  ],
  education: [
    { label: "Bachelor's or higher", percentage: 35.2 },
    { label: 'Some college', percentage: 28.4 },
    { label: 'High school', percentage: 23.1 },
    { label: 'Less than high school', percentage: 13.3 },
  ],
  employment: {
    laborForce: 283000,
    employed: 268000,
    unemploymentRate: 5.3,
  },
  housing: {
    ownerOccupied: 48.2,
    renterOccupied: 51.8,
    medianHomeValue: 475000,
    medianRent: 1650,
  },
};

export default function DemographicsPage() {
  const { isDemo } = useDemo();
  
  const data = isDemo ? DEMO_DEMOGRAPHICS : null;

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
          <h1 className="text-2xl font-bold text-white">Demographics</h1>
          <p className="text-slate-400 mt-1">
            Census data and community profiles
          </p>
        </div>
      </div>

      {data ? (
        <>
          {/* Key stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Population</span>
              </div>
              <p className="text-2xl font-bold text-white">{data.population.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">2023 estimate</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <Home className="w-4 h-4" />
                <span className="text-sm font-medium">Households</span>
              </div>
              <p className="text-2xl font-bold text-white">{data.households.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">Total households</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-amber-400 mb-2">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm font-medium">Median Income</span>
              </div>
              <p className="text-2xl font-bold text-white">${data.medianIncome.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">Per household</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-purple-400 mb-2">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Median Age</span>
              </div>
              <p className="text-2xl font-bold text-white">{data.medianAge}</p>
              <p className="text-xs text-slate-500 mt-1">Years</p>
            </div>
          </div>

          {/* Race/Ethnicity breakdown */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h2 className="font-semibold text-white mb-4">Race & Ethnicity</h2>
            <div className="space-y-3">
              {data.raceEthnicity.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-48 text-sm text-slate-400">{item.label}</div>
                  <div className="flex-1 h-6 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500/50 transition-all"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <div className="w-24 text-right">
                    <span className="text-sm font-medium text-white">{item.percentage}%</span>
                    <span className="text-xs text-slate-500 ml-1">({item.count.toLocaleString()})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Education */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="w-5 h-5 text-blue-400" />
                <h2 className="font-semibold text-white">Education Attainment</h2>
              </div>
              <div className="space-y-3">
                {data.education.map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">{item.label}</span>
                      <span className="text-white font-medium">{item.percentage}%</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500/50"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Housing */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Home className="w-5 h-5 text-amber-400" />
                <h2 className="font-semibold text-white">Housing</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-slate-500">Owner Occupied</p>
                  <p className="text-lg font-bold text-white">{data.housing.ownerOccupied}%</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-slate-500">Renter Occupied</p>
                  <p className="text-lg font-bold text-white">{data.housing.renterOccupied}%</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-slate-500">Median Home Value</p>
                  <p className="text-lg font-bold text-emerald-400">${data.housing.medianHomeValue.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-slate-500">Median Rent</p>
                  <p className="text-lg font-bold text-emerald-400">${data.housing.medianRent.toLocaleString()}/mo</p>
                </div>
              </div>
            </div>
          </div>

          {/* Employment */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-purple-400" />
              <h2 className="font-semibold text-white">Employment</h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-slate-800/50 rounded-lg text-center">
                <p className="text-xs text-slate-500 mb-1">Labor Force</p>
                <p className="text-2xl font-bold text-white">{data.employment.laborForce.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg text-center">
                <p className="text-xs text-slate-500 mb-1">Employed</p>
                <p className="text-2xl font-bold text-emerald-400">{data.employment.employed.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg text-center">
                <p className="text-xs text-slate-500 mb-1">Unemployment Rate</p>
                <p className="text-2xl font-bold text-amber-400">{data.employment.unemploymentRate}%</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-xl">
          <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No demographic data available</h3>
          <p className="text-slate-400">
            Connect to Census API to view demographic data
          </p>
        </div>
      )}
    </div>
  );
}

