// lib/calculations/index.ts
// Main export for all calculation modules

export * from './vmt';
export * from './ghg';
export * from './tdm';

import { calculateVMT, type DevelopmentScenario, type VMTResults } from './vmt';
import { calculateGHG, getSustainabilityRating, type GHGResults } from './ghg';
import { calculateTDMImpact, type TDMProgram, type BuildingCharacteristics } from './tdm';

export interface DevelopmentImpact {
  vmt: VMTResults;
  ghg: GHGResults;
  scenario: DevelopmentScenario;
  building?: BuildingCharacteristics;
  tdmPrograms?: TDMProgram[];
  summary: {
    population: number;
    annualVMTSaved: number;
    annualGHGSaved: number;
    sustainabilityRating: ReturnType<typeof getSustainabilityRating>;
  };
}

/**
 * Calculate complete development impact including VMT, GHG, and TDM
 */
export function calculateDevelopmentImpact(
  scenario: DevelopmentScenario,
  building?: BuildingCharacteristics,
  enabledTDMPrograms?: TDMProgram[]
): DevelopmentImpact {
  // Base VMT calculation
  let vmtResults = calculateVMT(scenario);
  
  // Apply TDM programs if provided
  if (enabledTDMPrograms && enabledTDMPrograms.length > 0) {
    const tdmImpact = calculateTDMImpact(
      vmtResults.annualVMTTotal,
      enabledTDMPrograms,
      scenario.walkabilityScore,
      scenario.bikeabilityScore
    );
    
    // Recalculate VMT with TDM
    const adjustedDailyVMT = Math.round(tdmImpact.adjustedVMT / 365);
    const population = scenario.units * 2.5;
    
    vmtResults = {
      ...vmtResults,
      annualVMTTotal: tdmImpact.adjustedVMT,
      dailyVMTTotal: adjustedDailyVMT,
      dailyVMTPerCapita: Math.round((adjustedDailyVMT / population) * 10) / 10,
      vmtReduction: Math.round((1 - tdmImpact.adjustedVMT / vmtResults.baseline.annualVMTTotal) * 100)
    };
  }
  
  // Calculate GHG from adjusted VMT
  const ghgResults = calculateGHG(vmtResults);
  
  // Get sustainability rating
  const sustainabilityRating = getSustainabilityRating(vmtResults.vmtReduction);
  
  return {
    vmt: vmtResults,
    ghg: ghgResults,
    scenario,
    building,
    tdmPrograms: enabledTDMPrograms,
    summary: {
      population: scenario.units * 2.5,
      annualVMTSaved: vmtResults.baseline.annualVMTTotal - vmtResults.annualVMTTotal,
      annualGHGSaved: ghgResults.baseline.annualGHG - ghgResults.annualGHG,
      sustainabilityRating
    }
  };
}

