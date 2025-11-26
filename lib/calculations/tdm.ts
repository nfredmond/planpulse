// lib/calculations/tdm.ts
// Transportation Demand Management (TDM) Calculations
// Based on California TDM best practices and CARB guidelines

export interface TDMProgram {
  id: string;
  name: string;
  description: string;
  vmtReduction: number; // Percentage reduction
  category: 'infrastructure' | 'pricing' | 'programs' | 'policy';
  enabled: boolean;
}

export interface BuildingCharacteristics {
  floors: number;
  totalSqFt: number;
  units: number;
  parkingSpaces: number;
  buildingType: 'residential' | 'mixed-use' | 'commercial';
  affordableHousingPercent: number;
}

export interface TDMImpactResult {
  adjustedVMT: number;
  totalReduction: number;
  programReduction: number;
  siteContextBonus: number;
}

/**
 * All 14 TDM Programs with evidence-based VMT reduction factors
 */
export const TDM_PROGRAMS: TDMProgram[] = [
  // Infrastructure Programs (4)
  {
    id: 'bike-parking',
    name: 'Secure Bike Parking & Lockers',
    description: 'Covered, secure bike parking with showers/lockers',
    vmtReduction: 3.5,
    category: 'infrastructure',
    enabled: false
  },
  {
    id: 'bike-share',
    name: 'On-Site Bike Share Station',
    description: 'Subsidized bike share membership for residents',
    vmtReduction: 2.5,
    category: 'infrastructure',
    enabled: false
  },
  {
    id: 'ev-charging',
    name: 'EV Charging Stations',
    description: 'Level 2 EV charging for 20% of parking spaces',
    vmtReduction: 1.0,
    category: 'infrastructure',
    enabled: false
  },
  {
    id: 'car-share',
    name: 'Car Share Program',
    description: 'On-site car share spaces (Zipcar, Gig, etc.)',
    vmtReduction: 4.0,
    category: 'infrastructure',
    enabled: false
  },
  
  // Pricing Programs (3)
  {
    id: 'unbundled-parking',
    name: 'Unbundled Parking',
    description: 'Parking sold/rented separately from units',
    vmtReduction: 5.0,
    category: 'pricing',
    enabled: false
  },
  {
    id: 'transit-subsidy',
    name: 'Transit Pass Subsidy',
    description: 'Free or subsidized transit passes for residents',
    vmtReduction: 6.5,
    category: 'pricing',
    enabled: false
  },
  {
    id: 'parking-cashout',
    name: 'Parking Cash-Out',
    description: 'Cash payment option instead of parking space',
    vmtReduction: 4.5,
    category: 'pricing',
    enabled: false
  },
  
  // Programs (4)
  {
    id: 'carpool-program',
    name: 'Carpool/Vanpool Program',
    description: 'Ridematching and preferential parking',
    vmtReduction: 3.0,
    category: 'programs',
    enabled: false
  },
  {
    id: 'telecommute',
    name: 'Telecommute Support',
    description: 'Encourage 1-2 days/week remote work',
    vmtReduction: 4.0,
    category: 'programs',
    enabled: false
  },
  {
    id: 'guaranteed-ride',
    name: 'Guaranteed Ride Home',
    description: 'Emergency rides for transit/bike commuters',
    vmtReduction: 2.0,
    category: 'programs',
    enabled: false
  },
  {
    id: 'flexible-hours',
    name: 'Flexible Work Hours',
    description: 'Staggered schedules to avoid peak traffic',
    vmtReduction: 2.5,
    category: 'programs',
    enabled: false
  },
  
  // Policy Programs (3)
  {
    id: 'reduced-parking',
    name: 'Reduced Parking Ratio',
    description: '0.5-0.75 spaces per unit (below code minimum)',
    vmtReduction: 7.0,
    category: 'policy',
    enabled: false
  },
  {
    id: 'transit-oriented',
    name: 'Transit-Oriented Design',
    description: 'Ground-floor retail, pedestrian-friendly design',
    vmtReduction: 5.5,
    category: 'policy',
    enabled: false
  },
  {
    id: 'complete-streets',
    name: 'Complete Streets Features',
    description: 'Sidewalks, crosswalks, bike lanes in development',
    vmtReduction: 3.5,
    category: 'policy',
    enabled: false
  }
];

/**
 * Calculate the impact of TDM programs on VMT
 */
export function calculateTDMImpact(
  baseVMT: number,
  enabledPrograms: TDMProgram[],
  walkabilityScore: number,
  bikeabilityScore: number
): TDMImpactResult {
  // Calculate TDM program reduction
  const programReduction = enabledPrograms.reduce((total, program) => {
    return total + program.vmtReduction;
  }, 0);
  
  // Site context bonus: high walk/bike scores amplify TDM effectiveness
  // Sites with better infrastructure see greater TDM program success
  const avgScore = (walkabilityScore + bikeabilityScore) / 200; // 0-1 scale
  const siteContextBonus = programReduction * avgScore * 0.25; // Up to 25% bonus
  
  // Combined reduction (capped at 60% total reduction - realistic ceiling)
  const totalReduction = Math.min(60, programReduction + siteContextBonus);
  
  // Adjusted VMT
  const adjustedVMT = baseVMT * (1 - totalReduction / 100);
  
  return {
    adjustedVMT: Math.round(adjustedVMT),
    totalReduction: Math.round(totalReduction * 10) / 10,
    programReduction: Math.round(programReduction * 10) / 10,
    siteContextBonus: Math.round(siteContextBonus * 10) / 10
  };
}

/**
 * Calculate building metrics from characteristics
 */
export function calculateBuildingMetrics(characteristics: BuildingCharacteristics) {
  const avgUnitSize = characteristics.totalSqFt / characteristics.units;
  const floorArea = characteristics.totalSqFt / characteristics.floors;
  const parkingRatio = characteristics.parkingSpaces / characteristics.units;
  const estimatedPopulation = characteristics.units * 2.5;
  
  return {
    avgUnitSize: Math.round(avgUnitSize),
    floorArea: Math.round(floorArea),
    parkingRatio: Math.round(parkingRatio * 100) / 100,
    estimatedPopulation: Math.round(estimatedPopulation),
    description: `${characteristics.floors}-story ${characteristics.buildingType} with ${characteristics.units} units`
  };
}

/**
 * Get TDM recommendations based on site scores
 */
export function getTDMRecommendations(
  walkabilityScore: number,
  bikeabilityScore: number,
  transitScore: number
): string[] {
  const recommendations: string[] = [];
  
  // High walkability/bike scores
  if (walkabilityScore >= 70 || bikeabilityScore >= 70) {
    recommendations.push('Consider reduced parking ratios (0.5-0.75 spaces/unit)');
    recommendations.push('Implement unbundled parking to reduce car ownership');
  }
  
  // High transit access
  if (transitScore >= 60) {
    recommendations.push('Offer subsidized transit passes to all residents');
    recommendations.push('Transit-oriented design with ground-floor retail');
  }
  
  // Good bike infrastructure
  if (bikeabilityScore >= 60) {
    recommendations.push('Provide secure bike parking and repair station');
    recommendations.push('Partner with local bike share program');
  }
  
  // Lower scores - need more TDM
  if (walkabilityScore < 50 && transitScore < 50) {
    recommendations.push('Implement robust TDM program including car share');
    recommendations.push('Provide guaranteed ride home program');
    recommendations.push('Encourage telecommute options for residents');
  }
  
  // Always recommend
  recommendations.push('Install EV charging infrastructure for future-proofing');
  
  return recommendations;
}

/**
 * Get programs by category
 */
export function getProgramsByCategory(category: TDMProgram['category']): TDMProgram[] {
  return TDM_PROGRAMS.filter(p => p.category === category);
}

/**
 * Get category label
 */
export function getCategoryLabel(category: TDMProgram['category']): string {
  const labels: Record<TDMProgram['category'], string> = {
    infrastructure: 'Infrastructure',
    pricing: 'Pricing & Incentives',
    programs: 'Programs & Services',
    policy: 'Policy & Design'
  };
  return labels[category];
}

/**
 * Get category color
 */
export function getCategoryColor(category: TDMProgram['category']): string {
  const colors: Record<TDMProgram['category'], string> = {
    infrastructure: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    pricing: 'bg-green-500/20 text-green-400 border-green-500/30',
    programs: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    policy: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
  };
  return colors[category];
}

