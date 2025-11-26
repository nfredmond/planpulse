// lib/calculations/vmt.ts
// Vehicle Miles Traveled (VMT) Calculations
// Based on California Air Resources Board (CARB) methodology

export interface DevelopmentScenario {
  units: number;
  buildingType: 'residential' | 'mixed-use' | 'commercial';
  walkabilityScore: number;
  bikeabilityScore: number;
  transitScore: number;
  parkingSpaces?: number;
}

export interface VMTResults {
  dailyVMTPerCapita: number;
  dailyVMTTotal: number;
  annualVMTTotal: number;
  vmtReduction: number; // Percentage reduction from baseline
  baseline: {
    dailyVMTPerCapita: number;
    dailyVMTTotal: number;
    annualVMTTotal: number;
  };
}

// California statewide average VMT per capita (source: CARB)
export const CA_BASELINE_VMT_PER_CAPITA = 20.8; // miles per day

// Average household size in California
export const AVG_HOUSEHOLD_SIZE = 2.5;

/**
 * Calculate VMT for a development scenario
 * Higher walkability/bikeability/transit scores = lower VMT
 */
export function calculateVMT(scenario: DevelopmentScenario): VMTResults {
  const population = scenario.units * AVG_HOUSEHOLD_SIZE;
  
  // Calculate VMT reduction based on multimodal access
  // Higher scores = more walking/biking/transit = less driving
  const walkFactor = scenario.walkabilityScore / 100;
  const bikeFactor = scenario.bikeabilityScore / 100;
  const transitFactor = scenario.transitScore / 100;
  
  // Weighted reduction factors (based on CARB studies)
  // - High walkability can reduce VMT by up to 30%
  // - Good bike infrastructure can reduce by up to 15%
  // - Transit access can reduce by up to 25%
  const walkReduction = walkFactor * 0.30;
  const bikeReduction = bikeFactor * 0.15;
  const transitReduction = transitFactor * 0.25;
  
  // Combined reduction (not simply additive, diminishing returns)
  const totalReduction = 1 - (1 - walkReduction) * (1 - bikeReduction) * (1 - transitReduction);
  
  // Calculate adjusted VMT per capita
  const adjustedVMTPerCapita = CA_BASELINE_VMT_PER_CAPITA * (1 - totalReduction);
  
  // Total daily VMT
  const dailyVMTTotal = adjustedVMTPerCapita * population;
  
  // Annual VMT
  const annualVMTTotal = dailyVMTTotal * 365;
  
  // Baseline (if development had no multimodal access)
  const baselineDailyTotal = CA_BASELINE_VMT_PER_CAPITA * population;
  
  return {
    dailyVMTPerCapita: Math.round(adjustedVMTPerCapita * 10) / 10,
    dailyVMTTotal: Math.round(dailyVMTTotal),
    annualVMTTotal: Math.round(annualVMTTotal),
    vmtReduction: Math.round(totalReduction * 100),
    baseline: {
      dailyVMTPerCapita: CA_BASELINE_VMT_PER_CAPITA,
      dailyVMTTotal: Math.round(baselineDailyTotal),
      annualVMTTotal: Math.round(baselineDailyTotal * 365)
    }
  };
}

/**
 * Format VMT for display
 */
export function formatVMT(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toLocaleString();
}

