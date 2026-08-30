/* ==========================================================================
   Inspection Service
   Mock inspection data management for the Employee workflow.

   Provides two related areas:
   1. Inspection draft creation (used by StartNewInspection flow)
      - generateInspectionId, assessImageQuality, saveDraft,
        PackageImage, ImageQualityStatus, InspectionDraft,
        getQualityDescription
   2. Inspection record management (used by Inspections/Map/History)
      - getInspections, getInspectionById, getInspectionSummary,
        InspectionRecord, InspectionFilter, InspectionSummary

   Reuses mock data from mockData.ts.
   ========================================================================== */

import { Inspection } from '../types/inspection';
import { mockInspections } from './mockData';
import { VerificationStatus } from './verification.service';

/* ==========================================================================
   Part 1: Inspection Draft (Image Capture / New Inspection)
   ========================================================================== */

export type ImageQualityStatus = 'good' | 'warning' | 'review_required';

export interface PackageImage {
  id: string;
  type: 'front' | 'back' | 'side' | 'label' | 'evidence';
  imageData: string;
  quality: {
    overall: ImageQualityStatus;
    lighting: ImageQualityStatus;
    blur: ImageQualityStatus;
    visibility: ImageQualityStatus;
  };
  capturedAt: string;
}

export interface InspectionDraft {
  id: string;
  inspectionId?: string;
  officerId: string;
  officerName: string;
  office: string;
  createdAt: string;
  updatedAt: string;
  productName: string;
  productCategory: string;
  manufacturer: string;
  retailer: string;
  location: string;
  packageType: string;
  barcode: string;
  images: PackageImage[];
  status: 'draft' | 'in_progress' | 'completed';
  notes?: string;
  savedAt?: string;
}

const QUALITY_DESCRIPTIONS: Record<string, Record<ImageQualityStatus, string>> = {
  overall: {
    good: 'Image quality is suitable for inspection.',
    warning: 'Image quality is acceptable but with minor concerns.',
    review_required: 'Image quality is below the recommended threshold. Officer review required.',
  },
  lighting: {
    good: 'Lighting is adequate for label review.',
    warning: 'Lighting is uneven; some areas may be difficult to read.',
    review_required: 'Lighting is too low or harsh for reliable inspection.',
  },
  blur: {
    good: 'Image is in focus across the package label.',
    warning: 'Some regions show mild blur.',
    review_required: 'Significant blur detected. Officer verification recommended.',
  },
  visibility: {
    good: 'Text and graphics are clearly visible.',
    warning: 'Some text or graphics may be partially obscured.',
    review_required: 'Text and graphics are difficult to read. Officer verification required.',
  },
};

export const generateInspectionId = (): string => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `INSP-${ts}-${rand}`;
};

export const getQualityDescription = (
  status: ImageQualityStatus,
  dimension: 'overall' | 'lighting' | 'blur' | 'visibility'
): string => {
  return QUALITY_DESCRIPTIONS[dimension]?.[status] ?? 'No description available.';
};

export const assessImageQuality = (imageData: string): PackageImage['quality'] => {
  // Mock assessment — derived from data size as a simple heuristic for demo
  // Larger images are typically higher quality
  const sizeKB = Math.round(imageData.length / 1024);
  const lighting: ImageQualityStatus = sizeKB > 30 ? 'good' : sizeKB > 15 ? 'warning' : 'review_required';
  const blur: ImageQualityStatus = sizeKB > 25 ? 'good' : sizeKB > 12 ? 'warning' : 'review_required';
  const visibility: ImageQualityStatus = sizeKB > 28 ? 'good' : sizeKB > 14 ? 'warning' : 'review_required';

  const statuses: ImageQualityStatus[] = [lighting, blur, visibility];
  const overall: ImageQualityStatus = statuses.includes('review_required')
    ? 'review_required'
    : statuses.includes('warning')
    ? 'warning'
    : 'good';

  return { overall, lighting, blur, visibility };
};

const draftStore = new Map<string, InspectionDraft>();

export const saveDraft = (draft: InspectionDraft): void => {
  draftStore.set(draft.inspectionId, draft);
};

export const getDraft = (inspectionId: string): InspectionDraft | null => {
  return draftStore.get(inspectionId) ?? null;
};

export const listDrafts = (): InspectionDraft[] => {
  return Array.from(draftStore.values());
};

/* ==========================================================================
   Part 2: Inspection Record Management (Inspections / Map / History)
   ========================================================================== */

export type ComplianceResultStatus = 'pass' | 'review_required' | 'potential_issue';

export interface InspectionRecord extends Inspection {
  complianceStatus: ComplianceResultStatus;
  verificationStatus: VerificationStatus;
  evidenceCount: number;
  measurementsCount: number;
  category?: string;
  manufacturer?: string;
  packageType?: string;
}

export interface InspectionFilter {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: 'all' | 'scheduled' | 'in_progress' | 'completed' | 'flagged';
  complianceStatus?: 'all' | 'pass' | 'review_required' | 'potential_issue';
  verificationStatus?: 'all' | VerificationStatus;
  category?: string;
  location?: string;
  officer?: string;
}

export interface InspectionSummary {
  total: number;
  scheduled: number;
  inProgress: number;
  completed: number;
  flagged: number;
  passCount: number;
  reviewRequiredCount: number;
  potentialIssueCount: number;
  pendingVerification: number;
  verified: number;
  partiallyVerified: number;
  reviewRequested: number;
}

/* ---- Build enriched inspection records ---- */

const enrichInspection = (
  insp: Inspection,
  complianceMap: Record<string, ComplianceResultStatus>,
  verificationMap: Record<string, VerificationStatus>
): InspectionRecord => ({
  ...insp,
  complianceStatus: complianceMap[insp.id] ?? 'pass',
  verificationStatus: verificationMap[insp.id] ?? 'pending',
  evidenceCount: 0,
  measurementsCount: 0,
});

/* ---- Mock compliance mapping (derived from mock data) ---- */

const MOCK_COMPLIANCE_MAP: Record<string, ComplianceResultStatus> = {
  'insp-001': 'pass',
  'insp-002': 'potential_issue',
  'insp-003': 'potential_issue',
  'insp-004': 'review_required',
  'insp-005': 'potential_issue',
  'insp-006': 'pass',
};

const MOCK_VERIFICATION_MAP: Record<string, VerificationStatus> = {
  'insp-001': 'verified',
  'insp-002': 'verified',
  'insp-003': 'partially_verified',
  'insp-004': 'pending',
  'insp-005': 'verified',
  'insp-006': 'pending',
};

/* ---- CRUD (mock) ---- */

export const getInspections = (filter?: InspectionFilter): InspectionRecord[] => {
  let results = mockInspections.map(insp => enrichInspection(insp, MOCK_COMPLIANCE_MAP, MOCK_VERIFICATION_MAP));

  if (!filter) return results;

  if (filter.search) {
    const q = filter.search.toLowerCase();
    results = results.filter(insp =>
      insp.id.toLowerCase().includes(q) ||
      insp.product?.toLowerCase().includes(q) ||
      insp.location.toLowerCase().includes(q) ||
      insp.inspectorId.toLowerCase().includes(q)
    );
  }

  if (filter.status && filter.status !== 'all') {
    results = results.filter(insp => insp.status === filter.status);
  }

  if (filter.complianceStatus && filter.complianceStatus !== 'all') {
    results = results.filter(insp => insp.complianceStatus === filter.complianceStatus);
  }

  if (filter.verificationStatus && filter.verificationStatus !== 'all') {
    results = results.filter(insp => insp.verificationStatus === filter.verificationStatus);
  }

  if (filter.dateFrom) {
    results = results.filter(insp => insp.date >= filter.dateFrom!);
  }

  if (filter.dateTo) {
    results = results.filter(insp => insp.date <= filter.dateTo!);
  }

  if (filter.location) {
    results = results.filter(insp => insp.location.toLowerCase().includes(filter.location!.toLowerCase()));
  }

  if (filter.officer) {
    results = results.filter(insp => insp.inspectorId.toLowerCase().includes(filter.officer!.toLowerCase()));
  }

  return results;
};

export const getInspectionById = (id: string): InspectionRecord | null => {
  const insp = mockInspections.find(i => i.id === id);
  if (!insp) return null;
  return enrichInspection(insp, MOCK_COMPLIANCE_MAP, MOCK_VERIFICATION_MAP);
};

export const getInspectionSummary = (): InspectionSummary => {
  const all = mockInspections.map(insp => enrichInspection(insp, MOCK_COMPLIANCE_MAP, MOCK_VERIFICATION_MAP));

  return {
    total: all.length,
    scheduled: all.filter(i => i.status === 'scheduled').length,
    inProgress: all.filter(i => i.status === 'in_progress').length,
    completed: all.filter(i => i.status === 'completed').length,
    flagged: all.filter(i => i.status === 'flagged').length,
    passCount: all.filter(i => i.complianceStatus === 'pass').length,
    reviewRequiredCount: all.filter(i => i.complianceStatus === 'review_required').length,
    potentialIssueCount: all.filter(i => i.complianceStatus === 'potential_issue').length,
    pendingVerification: all.filter(i => i.verificationStatus === 'pending').length,
    verified: all.filter(i => i.verificationStatus === 'verified').length,
    partiallyVerified: all.filter(i => i.verificationStatus === 'partially_verified').length,
    reviewRequested: all.filter(i => i.verificationStatus === 'review_requested').length,
  };
};

/* ---- Status display helpers ---- */

export const COMPLIANCE_STATUS_CONFIG: Record<ComplianceResultStatus, { label: string; badge: 'success' | 'warning' | 'error'; color: string; icon: string }> = {
  pass: { label: 'PASS', badge: 'success', color: '#2e7d32', icon: '✓' },
  review_required: { label: 'REVIEW REQUIRED', badge: 'warning', color: '#f57c00', icon: '⚠' },
  potential_issue: { label: 'POTENTIAL ISSUE', badge: 'error', color: '#d32f2f', icon: '✕' },
};

export const VERIFICATION_STATUS_CONFIG: Record<VerificationStatus, { label: string; badge: 'success' | 'warning' | 'error' | 'neutral'; color: string; icon: string }> = {
  pending: { label: 'PENDING', badge: 'neutral', color: '#757575', icon: '○' },
  partially_verified: { label: 'PARTIALLY VERIFIED', badge: 'warning', color: '#f57c00', icon: '◐' },
  verified: { label: 'VERIFIED', badge: 'success', color: '#2e7d32', icon: '✓' },
  review_requested: { label: 'REVIEW REQUESTED', badge: 'error', color: '#d32f2f', icon: '!' },
};

export const INSPECTION_STATUS_CONFIG: Record<string, { label: string; badge: 'success' | 'warning' | 'info' | 'neutral' | 'error' }> = {
  scheduled: { label: 'Scheduled', badge: 'info' },
  in_progress: { label: 'In Progress', badge: 'warning' },
  completed: { label: 'Completed', badge: 'success' },
  flagged: { label: 'Flagged', badge: 'error' },
};
