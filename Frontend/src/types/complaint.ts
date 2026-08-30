/* ==========================================================================
   Complaint Types
   ========================================================================== */

import { Employee } from './user';

/* ---- Status / Priority enums ---- */

export type ComplaintStatus =
  | 'NEW'
  | 'ASSIGNED'
  | 'UNDER_INSPECTION'
  | 'RESOLVED'
  | 'CLOSED';

export type ComplaintPriority = 'HIGH' | 'MEDIUM' | 'NORMAL';

/* ---- Evidence / Notes / Timeline / Resolution ---- */

export interface ComplaintEvidence {
  id: string;
  type: 'image' | 'document' | 'receipt' | 'other';
  description: string;
  fileName?: string;
  submittedAt: string;
}

export interface ComplaintTimelineEvent {
  id: string;
  status: ComplaintStatus;
  timestamp: string;
  note?: string;
  updatedBy?: string;
}

export interface ComplaintAssignment {
  officerId: string;
  officerName: string;
  assignedAt: string;
  assignmentNote?: string;
}

export interface ComplaintResolution {
  resolvedAt: string;
  resolvedBy: string;
  summary: string;
  officerObservation: string;
}

export interface ComplaintOfficerNote {
  id: string;
  officerId: string;
  officerName: string;
  note: string;
  createdAt: string;
}

/* ---- Related inspection link ---- */

export interface ComplaintInspectionLink {
  inspectionId: string;
  product: string;
  location: string;
  date: string;
  status: string;
  verification: string;
}

/* ---- Citizen complaint (used by both Citizen and Employee) ---- */

export interface CitizenComplaint {
  id: string;
  reporterId: string;
  reporterName: string;
  product: string;
  packageLabel?: string;
  productCategory?: string;
  manufacturer?: string;
  issue: string;
  description?: string;
  status: ComplaintStatus;
  location: string;
  contactEmail?: string;
  contactPhone?: string;
  submittedAt: string;
  priority: ComplaintPriority;
  evidence: ComplaintEvidence[];
  timeline: ComplaintTimelineEvent[];
  assignment?: ComplaintAssignment;
  notes: ComplaintOfficerNote[];
  resolution?: ComplaintResolution;
  relatedInspection?: ComplaintInspectionLink;
  assignedTo?: string;
}

export interface CreateComplaintDTO {
  reporterId: string;
  reporterName?: string;
  product: string;
  packageLabel?: string;
  issue: string;
  location: string;
  contactEmail?: string;
  contactPhone?: string;
}

/* ---- Filters ---- */

export interface ComplaintFilter {
  search?: string;
  status?: ComplaintStatus | 'all';
  priority?: ComplaintPriority | 'all';
  dateFrom?: string;
  dateTo?: string;
  category?: string;
  location?: string;
}

/* ---- Summary / Aggregation ---- */

export interface ComplaintSummary {
  total: number;
  newCount: number;
  assignedCount: number;
  underInspectionCount: number;
  resolvedCount: number;
  closedCount: number;
  highPriorityCount: number;
}

/* ---- Officers (for assignment dropdown) ---- */

export type OfficersList = Employee[];
