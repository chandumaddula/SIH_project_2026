/* ==========================================================================
   Inspection Report Service
   Task M — Inspection Reports

   Generates and manages inspection reports. Each report aggregates data from
   existing services (inspection, compliance, verification, evidence,
   readability, extractedInfo).

   IMPORTANT:
   - This is a frontend DEMO. No real PDF generation.
   - No real legal certification. Reports are mock documents for review.
   - Final compliance determination is made by the authorized officer
     (see OfficerVerification workflow).
   ========================================================================== */

import { InspectionReport, ReportFilter, ReportSummary, ReportStatus } from '../types/report';
import {
  getInspections,
  getInspectionById,
  InspectionRecord,
} from './inspection.service';
import { mockEmployees } from './mockData/employees';

/* ---- Status display ---- */

export const REPORT_STATUS_CONFIG: Record<ReportStatus, {
  label: string;
  badge: 'warning' | 'info' | 'accent' | 'success' | 'neutral';
  color: string;
}> = {
  DRAFT: { label: 'DRAFT', badge: 'neutral', color: '#757575' },
  GENERATED: { label: 'GENERATED', badge: 'info', color: '#1976d2' },
  REVIEW_REQUIRED: { label: 'REVIEW REQUIRED', badge: 'accent', color: '#7b1fa2' },
  COMPLETED: { label: 'COMPLETED', badge: 'success', color: '#2e7d32' },
};

/* ---- In-memory report store ---- */

const reportStore = new Map<string, InspectionReport>();

/* ---- Pre-seed some mock reports ---- */

const seedReports = (): void => {
  const seedData: Array<{
    id: string;
    inspectionId: string;
    status: ReportStatus;
    generatedAt: string | null;
    generatedBy: string | null;
    officerObservations: string[];
  }> = [
    {
      id: 'RPT-2026-001',
      inspectionId: 'insp-001',
      status: 'COMPLETED',
      generatedAt: '2026-03-15T16:00:00Z',
      generatedBy: 'John Martinez',
      officerObservations: ['Package meets all regulatory requirements. Label clearly visible.'],
    },
    {
      id: 'RPT-2026-002',
      inspectionId: 'insp-002',
      status: 'COMPLETED',
      generatedAt: '2026-03-14T17:00:00Z',
      generatedBy: 'John Martinez',
      officerObservations: ['Seal compromised. Store manager notified.'],
    },
    {
      id: 'RPT-2026-003',
      inspectionId: 'insp-003',
      status: 'REVIEW_REQUIRED',
      generatedAt: '2026-03-13T14:00:00Z',
      generatedBy: 'Sarah Johnson',
      officerObservations: ['Weight discrepancy exceeds tolerance. Follow-up required.'],
    },
    {
      id: 'RPT-2026-004',
      inspectionId: 'insp-004',
      status: 'GENERATED',
      generatedAt: '2026-03-12T11:00:00Z',
      generatedBy: 'John Martinez',
      officerObservations: [],
    },
    {
      id: 'RPT-2026-005',
      inspectionId: 'insp-005',
      status: 'GENERATED',
      generatedAt: '2026-03-11T15:00:00Z',
      generatedBy: 'John Martinez',
      officerObservations: ['Seal damage confirmed. Temperature control issue noted.'],
    },
    {
      id: 'RPT-2026-006',
      inspectionId: 'insp-006',
      status: 'DRAFT',
      generatedAt: null,
      generatedBy: null,
      officerObservations: [],
    },
    {
      id: 'RPT-2026-007',
      inspectionId: 'comp-003',
      status: 'COMPLETED',
      generatedAt: '2026-03-13T10:00:00Z',
      generatedBy: 'Sarah Johnson',
      officerObservations: ['Physical inspection completed. Calibrated reference scale used.'],
    },
    {
      id: 'RPT-2026-008',
      inspectionId: 'comp-002',
      status: 'GENERATED',
      generatedAt: '2026-03-10T09:00:00Z',
      generatedBy: 'John Martinez',
      officerObservations: [],
    },
    {
      id: 'RPT-2026-009',
      inspectionId: 'comp-004',
      status: 'COMPLETED',
      generatedAt: '2026-03-12T16:30:00Z',
      generatedBy: 'John Martinez',
      officerObservations: ['Vendor replaced non-compliant products. Labels corrected.'],
    },
    {
      id: 'RPT-2026-010',
      inspectionId: 'comp-006',
      status: 'COMPLETED',
      generatedAt: '2026-03-05T10:00:00Z',
      generatedBy: 'John Martinez',
      officerObservations: ['MRP difference explained by in-store promotional pricing. No violation.'],
    },
  ];

  for (const seed of seedData) {
    const insp = getInspectionById(seed.inspectionId);
    if (!insp) continue;

    const officer = mockEmployees.find(e => e.id === insp.inspectorId);

    const report: InspectionReport = {
      id: seed.id,
      inspectionId: seed.inspectionId,
      productName: insp.product ?? seed.inspectionId,
      productManufacturer: 'Manufacturer recorded in product data',
      productCategory: insp.category ?? 'Other',
      productPackageType: insp.packageType,
      inspectionDate: insp.date,
      inspectionTime: insp.time,
      inspectionLocation: insp.location,
      inspectionStatus: insp.status,
      verificationStatus: insp.verificationStatus,
      officerName: officer?.name ?? insp.inspectorId,
      office: officer?.office ?? 'Regional Metrology Office',
      status: seed.status,
      generatedAt: seed.generatedAt,
      generatedBy: seed.generatedBy,
      updatedAt: seed.generatedAt ?? new Date().toISOString(),
      overallCompliance: insp.complianceStatus,
      extractedDeclarations: [
        { label: 'Product Name', value: insp.product ?? '', source: 'OCR — Front Label' },
        { label: 'Batch / Lot Number', value: 'Extracted from label', source: 'OCR — Front Label' },
        { label: 'Net Quantity', value: 'As declared on packaging', source: 'OCR — Front Label' },
      ],
      applicableRequirements: [],
      complianceFindings: [],
      packageImages: [],
      measurements: [],
      officerObservations: seed.officerObservations.map((obs, i) => ({
        id: `obs-${i}`,
        officerName: officer?.name ?? 'Officer',
        timestamp: seed.generatedAt ?? new Date().toISOString(),
        observation: obs,
      })),
      notes: '',
    };

    reportStore.set(report.id, report);
  }
};

seedReports();

/* ---- Helpers ---- */

const generateReportId = (): string => {
  const year = new Date().getFullYear();
  const existing = Array.from(reportStore.values())
    .filter(r => r.id.startsWith(`RPT-${year}`))
    .map(r => parseInt(r.id.split('-')[2] ?? '0', 10));
  const next = existing.length > 0 ? Math.max(...existing) + 1 : 1;
  return `RPT-${year}-${String(next).padStart(3, '0')}`;
};

const getOfficerName = (officerId: string): string =>
  mockEmployees.find(e => e.id === officerId)?.name ?? officerId;

const getOfficerOffice = (officerId: string): string =>
  mockEmployees.find(e => e.id === officerId)?.office ?? 'Regional Metrology Office';

/* ---- Build a full report from an inspection record ---- */

const buildReportFromInspection = (
  insp: InspectionRecord,
  officerId: string
): InspectionReport => {
  const officerName = getOfficerName(officerId);
  const officerOffice = getOfficerOffice(officerId);

  return {
    id: generateReportId(),
    inspectionId: insp.id,
    productName: insp.product ?? 'Unknown Product',
    productManufacturer: 'Manufacturer recorded in product data',
    productCategory: insp.category ?? 'Other',
    productPackageType: insp.packageType,
    inspectionDate: insp.date,
    inspectionTime: insp.time,
    inspectionLocation: insp.location,
    inspectionStatus: insp.status,
    verificationStatus: insp.verificationStatus,
    officerName,
    office: officerOffice,
    status: 'DRAFT',
    generatedAt: null,
    generatedBy: null,
    updatedAt: new Date().toISOString(),
    overallCompliance: insp.complianceStatus,
    extractedDeclarations: [
      { label: 'Product Name', value: insp.product ?? '', source: 'OCR — Front Label' },
      { label: 'Batch / Lot Number', value: 'Extracted from label', source: 'OCR — Front Label' },
      { label: 'Net Quantity', value: 'As declared on packaging', source: 'OCR — Front Label' },
    ],
    applicableRequirements: [],
    complianceFindings: [],
    packageImages: [],
    measurements: [],
    officerObservations: [],
    notes: '',
  };
};

/* ---- Public API ---- */

export const getReports = (filter?: ReportFilter): InspectionReport[] => {
  let results = Array.from(reportStore.values());

  if (!filter) return results;

  if (filter.search) {
    const q = filter.search.toLowerCase();
    results = results.filter(r =>
      r.id.toLowerCase().includes(q) ||
      r.inspectionId.toLowerCase().includes(q) ||
      r.productName.toLowerCase().includes(q) ||
      r.inspectionLocation.toLowerCase().includes(q)
    );
  }

  if (filter.status && filter.status !== 'all') {
    results = results.filter(r => r.status === filter.status);
  }

  if (filter.officer && filter.officer !== 'all') {
    results = results.filter(r => r.officerName.toLowerCase().includes(filter.officer!.toLowerCase()));
  }

  if (filter.dateFrom) {
    results = results.filter(r => r.inspectionDate >= filter.dateFrom!);
  }

  if (filter.dateTo) {
    results = results.filter(r => r.inspectionDate <= filter.dateTo!);
  }

  return results;
};

export const getReportById = (id: string): InspectionReport | null =>
  reportStore.get(id) ?? null;

export const getReportsByInspection = (inspectionId: string): InspectionReport[] =>
  Array.from(reportStore.values()).filter(r => r.inspectionId === inspectionId);

export const generateReport = (inspectionId: string, officerId?: string): InspectionReport | null => {
  // Check if a report already exists for this inspection
  const existing = getReportsByInspection(inspectionId);
  if (existing.length > 0) {
    // Update existing report
    const report = existing[0];
    const now = new Date().toISOString();
    const newStatus: ReportStatus = report.status === 'DRAFT' ? 'GENERATED' : report.status;
    const updated: InspectionReport = {
      ...report,
      status: newStatus,
      generatedAt: report.generatedAt ?? now,
      generatedBy: getOfficerName(officerId ?? 'emp-001'),
      updatedAt: now,
    };
    reportStore.set(report.id, updated);
    return updated;
  }

  // Build new report from inspection
  const insp = getInspectionById(inspectionId);
  if (!insp) {
    // Try to find in inspection records
    const all = getInspections();
    const fallback = all.find(r => r.id === inspectionId);
    if (!fallback) return null;
    const report = buildReportFromInspection(fallback, officerId ?? fallback.inspectorId);
    reportStore.set(report.id, report);
    return report;
  }

  const report = buildReportFromInspection(insp, officerId ?? insp.inspectorId);
  reportStore.set(report.id, report);
  return report;
};

export const updateReportStatus = (
  id: string,
  status: ReportStatus,
  updatedBy?: string
): InspectionReport | null => {
  const report = reportStore.get(id);
  if (!report) return null;
  const updated: InspectionReport = {
    ...report,
    status,
    updatedAt: new Date().toISOString(),
    ...(updatedBy ? { generatedBy: updatedBy } : {}),
  };
  reportStore.set(id, updated);
  return updated;
};

export const addOfficerObservation = (
  reportId: string,
  officerName: string,
  observation: string
): InspectionReport | null => {
  const report = reportStore.get(reportId);
  if (!report) return null;
  const updated: InspectionReport = {
    ...report,
    officerObservations: [
      ...report.officerObservations,
      {
        id: `obs-${Date.now()}`,
        officerName,
        timestamp: new Date().toISOString(),
        observation,
      },
    ],
    updatedAt: new Date().toISOString(),
  };
  reportStore.set(reportId, updated);
  return updated;
};

export const getReportSummary = (): ReportSummary => {
  const all = Array.from(reportStore.values());
  return {
    total: all.length,
    draft: all.filter(r => r.status === 'DRAFT').length,
    generated: all.filter(r => r.status === 'GENERATED').length,
    reviewRequired: all.filter(r => r.status === 'REVIEW_REQUIRED').length,
    completed: all.filter(r => r.status === 'COMPLETED').length,
  };
};

export const getUniqueReportOfficers = (): string[] =>
  Array.from(new Set(Array.from(reportStore.values()).map(r => r.officerName)));

export const getUniqueReportCategories = (): string[] =>
  Array.from(new Set(Array.from(reportStore.values()).map(r => r.productCategory)));
