// lib/reports/pdf-generator.ts
// Professional PDF Report Generator for PlanPulse
// Based on Planning App patterns with jsPDF

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import type { DevelopmentImpact } from '../calculations';

// Extend jsPDF type for autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}

// Colors
const COLORS = {
  primary: [16, 185, 129] as [number, number, number], // Emerald
  secondary: [30, 41, 59] as [number, number, number], // Slate 800
  accent: [45, 212, 191] as [number, number, number], // Teal
  text: [51, 65, 85] as [number, number, number], // Slate 700
  lightText: [148, 163, 184] as [number, number, number], // Slate 400
  white: [255, 255, 255] as [number, number, number],
  success: [34, 197, 94] as [number, number, number], // Green
  warning: [251, 191, 36] as [number, number, number], // Amber
  error: [239, 68, 68] as [number, number, number], // Red
};

interface ReportOptions {
  title: string;
  subtitle?: string;
  generatedBy?: string;
  organizationName?: string;
}

/**
 * Create a new PDF document with PlanPulse branding
 */
function createDocument(options: ReportOptions): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header background
  doc.setFillColor(...COLORS.secondary);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Accent stripe
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 40, pageWidth, 4, 'F');
  
  // Title
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(options.title, 20, 22);
  
  // Subtitle
  if (options.subtitle) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(options.subtitle, 20, 32);
  }
  
  // Logo text (right side)
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PlanPulse', pageWidth - 20, 18, { align: 'right' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 200);
  doc.text('Transportation & Urban Planning Platform', pageWidth - 20, 24, { align: 'right' });
  
  // Generation info
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.lightText);
  const dateStr = format(new Date(), 'MMMM d, yyyy');
  doc.text(`Generated on ${dateStr}`, pageWidth - 20, 32, { align: 'right' });
  
  return doc;
}

/**
 * Add footer to all pages
 */
function addFooter(doc: jsPDF, organizationName?: string): void {
  const pageCount = doc.internal.pages.length - 1;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Footer line
    doc.setDrawColor(...COLORS.lightText);
    doc.line(20, pageHeight - 15, pageWidth - 20, pageHeight - 15);
    
    // Footer text
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.lightText);
    doc.text('PlanPulse - Transportation & Urban Planning Platform', 20, pageHeight - 10);
    
    if (organizationName) {
      doc.text(organizationName, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }
    
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
  }
}

/**
 * Draw a progress bar
 */
function drawProgressBar(
  doc: jsPDF, 
  x: number, 
  y: number, 
  width: number, 
  height: number, 
  value: number, 
  color: [number, number, number]
): void {
  // Background
  doc.setFillColor(229, 231, 235);
  doc.roundedRect(x, y, width, height, 2, 2, 'F');
  
  // Progress
  const progressWidth = (width * Math.min(value, 100)) / 100;
  if (progressWidth > 0) {
    doc.setFillColor(...color);
    doc.roundedRect(x, y, progressWidth, height, 2, 2, 'F');
  }
}

// ============================================
// Report Types
// ============================================

export interface ProjectReportData {
  project: {
    name: string;
    type: string;
    status: string;
    description: string;
    client_name: string;
    budget: number;
    spent: number;
    start_date: string;
    end_date: string;
  };
  grants?: Array<{
    name: string;
    amount_requested: number;
    status: string;
    deadline?: string;
  }>;
  phases?: Array<{
    phase: string;
    status: string;
    e76_number?: string;
    ped_due_date?: string;
  }>;
  communityInputs?: {
    total: number;
    positive: number;
    negative: number;
    suggestions: number;
  };
}

/**
 * Generate a Project Report PDF
 */
export function generateProjectReport(data: ProjectReportData, options?: Partial<ReportOptions>): void {
  const doc = createDocument({
    title: data.project.name,
    subtitle: `${data.project.type} | ${data.project.client_name}`,
    ...options,
  });
  
  let y = 55;
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Project Overview Section
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, y, pageWidth - 30, 45, 3, 3, 'F');
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.text);
  doc.text('Project Overview', 20, y + 10);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const descLines = doc.splitTextToSize(data.project.description, pageWidth - 50);
  doc.text(descLines, 20, y + 20);
  
  // Dates
  doc.text(`Timeline: ${format(new Date(data.project.start_date), 'MMM yyyy')} - ${format(new Date(data.project.end_date), 'MMM yyyy')}`, 20, y + 38);
  doc.text(`Status: ${data.project.status.toUpperCase()}`, pageWidth - 60, y + 38);
  
  y += 55;
  
  // Budget Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Budget Status', 20, y);
  
  y += 8;
  
  const budgetPercent = Math.round((data.project.spent / data.project.budget) * 100);
  const budgetColor = budgetPercent > 90 ? COLORS.error : budgetPercent > 70 ? COLORS.warning : COLORS.success;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Budget: $${data.project.budget.toLocaleString()}`, 20, y);
  doc.text(`Spent: $${data.project.spent.toLocaleString()} (${budgetPercent}%)`, 20, y + 7);
  doc.text(`Remaining: $${(data.project.budget - data.project.spent).toLocaleString()}`, 20, y + 14);
  
  drawProgressBar(doc, 100, y + 3, 80, 6, budgetPercent, budgetColor);
  
  y += 25;
  
  // Grants Section
  if (data.grants && data.grants.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Grant Applications', 20, y);
    
    y += 5;
    
    doc.autoTable({
      startY: y,
      head: [['Grant Name', 'Amount', 'Status', 'Deadline']],
      body: data.grants.map(g => [
        g.name,
        `$${g.amount_requested.toLocaleString()}`,
        g.status.replace('_', ' ').toUpperCase(),
        g.deadline ? format(new Date(g.deadline), 'MMM d, yyyy') : '-'
      ]),
      theme: 'grid',
      headStyles: { fillColor: COLORS.primary, textColor: COLORS.white, fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 9, textColor: COLORS.text },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 20, right: 20 },
    });
    
    y = doc.lastAutoTable.finalY + 15;
  }
  
  // Caltrans Phases Section
  if (data.phases && data.phases.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Caltrans LAPM Phases', 20, y);
    
    y += 5;
    
    doc.autoTable({
      startY: y,
      head: [['Phase', 'E-76 Number', 'Status', 'PED Due Date']],
      body: data.phases.map(p => [
        p.phase,
        p.e76_number || '-',
        p.status.replace('_', ' ').toUpperCase(),
        p.ped_due_date ? format(new Date(p.ped_due_date), 'MMM d, yyyy') : '-'
      ]),
      theme: 'grid',
      headStyles: { fillColor: COLORS.secondary, textColor: COLORS.white, fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 9, textColor: COLORS.text },
      margin: { left: 20, right: 20 },
    });
    
    y = doc.lastAutoTable.finalY + 15;
  }
  
  // Community Input Summary
  if (data.communityInputs && data.communityInputs.total > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Community Engagement', 20, y);
    
    y += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Inputs: ${data.communityInputs.total}`, 20, y);
    
    y += 5;
    
    // Sentiment breakdown
    const sentimentData = [
      { label: 'Positive', value: data.communityInputs.positive, color: COLORS.success },
      { label: 'Negative', value: data.communityInputs.negative, color: COLORS.error },
      { label: 'Suggestions', value: data.communityInputs.suggestions, color: COLORS.warning },
    ];
    
    sentimentData.forEach((item, i) => {
      const percent = Math.round((item.value / data.communityInputs!.total) * 100);
      doc.text(`${item.label}: ${item.value} (${percent}%)`, 20 + (i * 55), y + 7);
    });
  }
  
  addFooter(doc, options?.organizationName);
  
  // Save
  const filename = `${data.project.name.replace(/[^a-z0-9]/gi, '_')}_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(filename);
}

/**
 * Generate Environmental Impact Report PDF
 */
export function generateEnvironmentalReport(impact: DevelopmentImpact, options?: Partial<ReportOptions>): void {
  const doc = createDocument({
    title: 'Environmental Impact Analysis',
    subtitle: 'VMT & GHG Emissions Assessment',
    ...options,
  });
  
  let y = 55;
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Summary Section
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, y, pageWidth - 30, 35, 3, 3, 'F');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.text);
  doc.text('Analysis Summary', 20, y + 10);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Population: ${impact.summary.population.toLocaleString()} residents`, 20, y + 20);
  doc.text(`Sustainability Rating: ${impact.summary.sustainabilityRating.rating}`, 20, y + 28);
  
  // Rating color indicator
  const ratingColor = impact.summary.sustainabilityRating.rating === 'Excellent' ? COLORS.success :
    impact.summary.sustainabilityRating.rating === 'Very Good' ? COLORS.success :
    impact.summary.sustainabilityRating.rating === 'Good' ? COLORS.warning : COLORS.lightText;
  doc.setFillColor(...ratingColor);
  doc.circle(130, y + 25, 3, 'F');
  
  y += 45;
  
  // VMT Analysis
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Vehicle Miles Traveled (VMT)', 20, y);
  
  y += 8;
  
  doc.autoTable({
    startY: y,
    head: [['Metric', 'Baseline', 'With Mitigation', 'Reduction']],
    body: [
      [
        'Daily VMT per Capita',
        `${impact.vmt.baseline.dailyVMTPerCapita} miles`,
        `${impact.vmt.dailyVMTPerCapita} miles`,
        `-${impact.vmt.vmtReduction}%`
      ],
      [
        'Annual VMT Total',
        `${(impact.vmt.baseline.annualVMTTotal / 1000).toFixed(1)}K miles`,
        `${(impact.vmt.annualVMTTotal / 1000).toFixed(1)}K miles`,
        `${((impact.vmt.baseline.annualVMTTotal - impact.vmt.annualVMTTotal) / 1000).toFixed(1)}K saved`
      ],
    ],
    theme: 'grid',
    headStyles: { fillColor: COLORS.secondary, textColor: COLORS.white, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: COLORS.text },
    margin: { left: 20, right: 20 },
  });
  
  y = doc.lastAutoTable.finalY + 15;
  
  // GHG Analysis
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Greenhouse Gas Emissions', 20, y);
  
  y += 8;
  
  doc.autoTable({
    startY: y,
    head: [['Metric', 'Baseline', 'With Mitigation', 'Reduction']],
    body: [
      [
        'Annual GHG Emissions',
        `${impact.ghg.baseline.annualGHG.toFixed(2)} tons CO₂e`,
        `${impact.ghg.annualGHG.toFixed(2)} tons CO₂e`,
        `-${impact.ghg.ghgReduction}%`
      ],
    ],
    theme: 'grid',
    headStyles: { fillColor: COLORS.success, textColor: COLORS.white, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: COLORS.text },
    margin: { left: 20, right: 20 },
  });
  
  y = doc.lastAutoTable.finalY + 15;
  
  // Climate Equivalents
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Climate Impact Equivalents', 20, y);
  
  y += 10;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Equivalent to removing ${impact.ghg.equivalents.carsOffRoad} cars from the road`, 20, y);
  doc.text(`Same as planting ${impact.ghg.equivalents.treesPlanted.toLocaleString()} trees`, 20, y + 7);
  doc.text(`Powers ${impact.ghg.equivalents.homesPowered} homes for a year`, 20, y + 14);
  doc.text(`Saves ${impact.ghg.equivalents.gallonsGas.toLocaleString()} gallons of gasoline`, 20, y + 21);
  
  y += 35;
  
  // TDM Programs (if applicable)
  if (impact.tdmPrograms && impact.tdmPrograms.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Applied TDM Programs', 20, y);
    
    y += 8;
    
    doc.autoTable({
      startY: y,
      head: [['Program', 'Category', 'VMT Reduction']],
      body: impact.tdmPrograms.map(p => [
        p.name,
        p.category.charAt(0).toUpperCase() + p.category.slice(1),
        `-${p.vmtReduction}%`
      ]),
      theme: 'grid',
      headStyles: { fillColor: COLORS.warning, textColor: COLORS.secondary, fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 9, textColor: COLORS.text },
      margin: { left: 20, right: 20 },
    });
  }
  
  // Methodology note
  doc.addPage();
  y = 20;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.text);
  doc.text('Methodology', 20, y);
  
  y += 8;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const methodologyText = `
VMT and GHG calculations are based on California Air Resources Board (CARB) guidelines:
• California statewide baseline VMT: 20.8 miles per capita per day
• GHG conversion factor: 0.89 lbs CO₂e per vehicle mile
• Average household size: 2.5 persons

Reduction factors based on multimodal access:
• High walkability can reduce VMT by up to 30%
• Good bike infrastructure can reduce VMT by up to 15%  
• Transit access can reduce VMT by up to 25%
• TDM programs provide additional reductions (capped at 60% total)

Climate equivalents:
• Average car emits 4.6 metric tons CO₂e per year
• One tree absorbs 48 lbs CO₂ per year
• Average home uses 7.5 metric tons CO₂e per year
  `.trim();
  
  const methodLines = doc.splitTextToSize(methodologyText, pageWidth - 40);
  doc.text(methodLines, 20, y);
  
  addFooter(doc, options?.organizationName);
  
  const filename = `Environmental_Impact_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(filename);
}

/**
 * Generate Grant Application Report PDF
 */
export interface GrantReportData {
  grant: {
    name: string;
    program: string;
    amount_requested: number;
    match_amount: number;
    deadline?: string;
    status: string;
  };
  project: {
    name: string;
    description: string;
  };
  narrative?: {
    needs_statement?: string;
    project_description?: string;
    benefits?: string;
  };
}

export function generateGrantReport(data: GrantReportData, options?: Partial<ReportOptions>): void {
  const doc = createDocument({
    title: data.grant.name,
    subtitle: data.grant.program,
    ...options,
  });
  
  let y = 55;
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Grant Summary
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, y, pageWidth - 30, 40, 3, 3, 'F');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.text);
  doc.text('Application Summary', 20, y + 10);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Amount Requested: $${data.grant.amount_requested.toLocaleString()}`, 20, y + 20);
  doc.text(`Local Match: $${data.grant.match_amount.toLocaleString()}`, 20, y + 27);
  doc.text(`Status: ${data.grant.status.replace('_', ' ').toUpperCase()}`, 20, y + 34);
  
  if (data.grant.deadline) {
    doc.text(`Deadline: ${format(new Date(data.grant.deadline), 'MMMM d, yyyy')}`, pageWidth - 80, y + 20);
  }
  
  y += 50;
  
  // Project Info
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Project Information', 20, y);
  
  y += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Project: ${data.project.name}`, 20, y);
  
  y += 7;
  
  const descLines = doc.splitTextToSize(data.project.description, pageWidth - 40);
  doc.text(descLines, 20, y);
  
  y += descLines.length * 5 + 15;
  
  // Narrative Sections
  if (data.narrative) {
    if (data.narrative.needs_statement) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Needs Statement', 20, y);
      
      y += 8;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const needsLines = doc.splitTextToSize(data.narrative.needs_statement, pageWidth - 40);
      doc.text(needsLines, 20, y);
      
      y += needsLines.length * 5 + 15;
    }
    
    if (data.narrative.project_description) {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Project Description', 20, y);
      
      y += 8;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const projLines = doc.splitTextToSize(data.narrative.project_description, pageWidth - 40);
      doc.text(projLines, 20, y);
      
      y += projLines.length * 5 + 15;
    }
    
    if (data.narrative.benefits) {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Project Benefits', 20, y);
      
      y += 8;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const benefitLines = doc.splitTextToSize(data.narrative.benefits, pageWidth - 40);
      doc.text(benefitLines, 20, y);
    }
  }
  
  addFooter(doc, options?.organizationName);
  
  const filename = `${data.grant.name.replace(/[^a-z0-9]/gi, '_')}_Application_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(filename);
}

