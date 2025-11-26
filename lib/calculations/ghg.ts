// lib/calculations/ghg.ts
// Greenhouse Gas (GHG) Emissions Calculations
// Based on California Air Resources Board (CARB) methodology

import type { VMTResults } from './vmt';

export interface GHGResults {
  dailyGHG: number; // kg CO2e per day
  annualGHG: number; // metric tons CO2e per year
  ghgReduction: number; // Percentage reduction from baseline
  baseline: {
    dailyGHG: number;
    annualGHG: number;
  };
  equivalents: {
    carsOffRoad: number;
    treesPlanted: number;
    homesPowered: number;
    gallonsGas: number;
  };
}

// GHG conversion factor (lbs CO2e per mile for average vehicle)
export const GHG_PER_MILE = 0.89; // lbs CO2e

// Pounds to kg conversion
export const LBS_TO_KG = 0.453592;

// Average car emits ~4.6 metric tons CO2e per year
export const ANNUAL_CAR_EMISSIONS = 4.6;

// One tree absorbs ~48 lbs CO2 per year
export const TREE_ABSORPTION = 48;

// Average home uses ~7.5 metric tons CO2e per year (electricity)
export const HOME_EMISSIONS = 7.5;

// CO2 per gallon of gasoline: ~8.89 kg
export const CO2_PER_GALLON = 8.89;

/**
 * Calculate GHG emissions from VMT results
 */
export function calculateGHG(vmtResults: VMTResults): GHGResults {
  // Daily GHG from vehicle travel (in kg CO2e)
  const dailyGHG = vmtResults.dailyVMTTotal * GHG_PER_MILE * LBS_TO_KG;
  
  // Annual GHG (in metric tons CO2e)
  const annualGHG = (dailyGHG * 365) / 1000;
  
  // Baseline GHG
  const baselineDailyGHG = vmtResults.baseline.dailyVMTTotal * GHG_PER_MILE * LBS_TO_KG;
  const baselineAnnualGHG = (baselineDailyGHG * 365) / 1000;
  
  // Reduction percentage
  const ghgReduction = vmtResults.vmtReduction; // Same as VMT reduction
  
  // Annual savings
  const annualSavings = baselineAnnualGHG - annualGHG;
  
  // Equivalents
  const carsOffRoad = Math.round(annualSavings / ANNUAL_CAR_EMISSIONS * 10) / 10;
  const treesPlanted = Math.round((annualSavings * 1000 * 2.20462) / TREE_ABSORPTION);
  const homesPowered = Math.round(annualSavings / HOME_EMISSIONS * 10) / 10;
  const gallonsGas = Math.round((annualSavings * 1000) / CO2_PER_GALLON);
  
  return {
    dailyGHG: Math.round(dailyGHG * 10) / 10,
    annualGHG: Math.round(annualGHG * 100) / 100,
    ghgReduction,
    baseline: {
      dailyGHG: Math.round(baselineDailyGHG * 10) / 10,
      annualGHG: Math.round(baselineAnnualGHG * 100) / 100
    },
    equivalents: {
      carsOffRoad,
      treesPlanted,
      homesPowered,
      gallonsGas
    }
  };
}

/**
 * Get sustainability rating based on VMT reduction
 */
export function getSustainabilityRating(vmtReduction: number): {
  rating: string;
  color: string;
  description: string;
} {
  if (vmtReduction >= 40) {
    return {
      rating: 'Excellent',
      color: 'text-emerald-400',
      description: 'Climate Leader - Exceptional multimodal access'
    };
  }
  if (vmtReduction >= 25) {
    return {
      rating: 'Very Good',
      color: 'text-green-400',
      description: 'Low Carbon - Strong sustainable transportation options'
    };
  }
  if (vmtReduction >= 15) {
    return {
      rating: 'Good',
      color: 'text-lime-400',
      description: 'Below Average - Meaningful VMT reduction achieved'
    };
  }
  if (vmtReduction >= 5) {
    return {
      rating: 'Fair',
      color: 'text-yellow-400',
      description: 'Slight Reduction - Some multimodal options available'
    };
  }
  return {
    rating: 'Baseline',
    color: 'text-slate-400',
    description: 'No Reduction - Standard auto-dependent development'
  };
}

/**
 * Format GHG value for display
 */
export function formatGHG(value: number, unit: 'kg' | 'tons' = 'tons'): string {
  if (unit === 'kg') {
    return `${value.toLocaleString()} kg CO₂e`;
  }
  return `${value.toFixed(2)} metric tons CO₂e`;
}

