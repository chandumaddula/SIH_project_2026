/* ==========================================================================
   Complaint Service (Employee-side)
   Task L — Complaint Management

   Provides:
   - getComplaints, getComplaintById, getComplaintSummary
   - filter/search/assign/update/resolve/close
   - addOfficerNote
   - createInspectionLink

   Uses the mock complaints from mockData/complaints.ts.
   ========================================================================== */

import {
  CitizenComplaint,
  ComplaintFilter,
  ComplaintStatus,
  ComplaintSummary,
  ComplaintOfficerNote,
  ComplaintTimelineEvent,
  ComplaintInspectionLink,
  OfficersList,
} from '../types/complaint';
import { mockComplaints } from './mockData/complaints';
import { mockEmployees } from './mockData/employees';

/* ---- Status display helpers ---- */

export type StatusDisplay = {
  label: string;
  badge: 'warning' | 'info' | 'success' | 'neutral' | 'accent' | 'error';
  color: string;
};

export const COMPLAINT_STATUS_CONFIG: Record<ComplaintStatus, StatusDisplay> = {
  NEW: { label: 'NEW', badge: 'warning', color: '#f57c00' },
  ASSIGNED: { label: 'ASSIGNED', badge: 'info', color: '#1976d2' },
  UNDER_INSPECTION: { label: 'UNDER INSPECTION', badge: 'accent', color: '#7b1fa2' },
  RESOLVED: { label: 'RESOLVED', badge: 'success', color: '#2e7d32' },
  CLOSED: { label: 'CLOSED', badge: 'neutral', color: '#757575' },
};

export const COMPLAINT_PRIORITY_CONFIG: Record<string, StatusDisplay> = {
  HIGH: { label: 'HIGH', badge: 'error', color: '#d32f2f' },
  MEDIUM: { label: 'MEDIUM', badge: 'warning', color: '#f57c00' },
  NORMAL: { label: 'NORMAL', badge: 'info', color: '#1976d2' },
};

/* ---- Valid transitions ---- */

const VALID_TRANSITIONS: Record<ComplaintStatus, ComplaintStatus[]> = {
  NEW: ['ASSIGNED'],
  ASSIGNED: ['UNDER_INSPECTION', 'NEW'],
  UNDER_INSPECTION: ['RESOLVED', 'NEW', 'ASSIGNED'],
  RESOLVED: ['CLOSED', 'UNDER_INSPECTION'],
  CLOSED: ['RESOLVED'],
};

export const canTransition = (from: ComplaintStatus, to: ComplaintStatus): boolean =>
  VALID_TRANSITIONS[from]?.includes(to) ?? false;

export const getAvailableTransitions = (current: ComplaintStatus): ComplaintStatus[] =>
  VALID_TRANSITIONS[current] ?? [];

/* ---- In-memory store (mutations persist per session) ---- */

const complaintStore = new Map<string, CitizenComplaint>(
  mockComplaints.map(c => [c.id, { ...c }])
);

let noteCounter = 1;
let timelineCounter = 1;

/* ---- CRUD ---- */

export const getComplaints = (filter?: ComplaintFilter): CitizenComplaint[] => {
  let results = Array.from(complaintStore.values());

  if (!filter) return results;

  if (filter.search) {
    const q = filter.search.toLowerCase();
    results = results.filter(c =>
      c.id.toLowerCase().includes(q) ||
      c.product.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q) ||
      c.issue.toLowerCase().includes(q) ||
      c.reporterName.toLowerCase().includes(q)
    );
  }

  if (filter.status && filter.status !== 'all') {
    results = results.filter(c => c.status === filter.status);
  }

  if (filter.priority && filter.priority !== 'all') {
    results = results.filter(c => c.priority === filter.priority);
  }

  if (filter.dateFrom) {
    results = results.filter(c => c.submittedAt.split('T')[0] >= filter.dateFrom!);
  }

  if (filter.dateTo) {
    results = results.filter(c => c.submittedAt.split('T')[0] <= filter.dateTo!);
  }

  if (filter.location) {
    results = results.filter(c => c.location.toLowerCase().includes(filter.location!.toLowerCase()));
  }

  if (filter.category) {
    results = results.filter(c =>
      c.productCategory?.toLowerCase().includes(filter.category!.toLowerCase())
    );
  }

  return results;
};

export const getComplaintById = (id: string): CitizenComplaint | null => {
  return complaintStore.get(id) ?? null;
};

export const getComplaintSummary = (): ComplaintSummary => {
  const all = Array.from(complaintStore.values());
  return {
    total: all.length,
    newCount: all.filter(c => c.status === 'NEW').length,
    assignedCount: all.filter(c => c.status === 'ASSIGNED').length,
    underInspectionCount: all.filter(c => c.status === 'UNDER_INSPECTION').length,
    resolvedCount: all.filter(c => c.status === 'RESOLVED').length,
    closedCount: all.filter(c => c.status === 'CLOSED').length,
    highPriorityCount: all.filter(c => c.priority === 'HIGH').length,
  };
};

export const getAvailableOfficers = (): OfficersList => mockEmployees;

/* ---- Mutations ---- */

export const assignComplaint = (
  id: string,
  officerId: string,
  note?: string
): CitizenComplaint | null => {
  const complaint = complaintStore.get(id);
  if (!complaint) return null;

  const officer = mockEmployees.find(e => e.id === officerId);
  if (!officer) return null;

  complaint.status = 'ASSIGNED';
  complaint.assignedTo = officerId;
  complaint.assignment = {
    officerId,
    officerName: officer.name,
    assignedAt: new Date().toISOString(),
    assignmentNote: note,
  };

  const event: ComplaintTimelineEvent = {
    id: `tl-auto-${timelineCounter++}`,
    status: 'ASSIGNED',
    timestamp: new Date().toISOString(),
    note: note ?? `Assigned to ${officer.name}`,
    updatedBy: officer.name,
  };
  complaint.timeline = [...complaint.timeline, event];

  return { ...complaint };
};

export const updateComplaintStatus = (
  id: string,
  newStatus: ComplaintStatus,
  note?: string,
  updatedBy?: string
): CitizenComplaint | null => {
  const complaint = complaintStore.get(id);
  if (!complaint) return null;

  if (!canTransition(complaint.status, newStatus)) return null;

  complaint.status = newStatus;

  const event: ComplaintTimelineEvent = {
    id: `tl-auto-${timelineCounter++}`,
    status: newStatus,
    timestamp: new Date().toISOString(),
    note: note ?? `Status updated to ${newStatus.replace('_', ' ')}`,
    updatedBy,
  };
  complaint.timeline = [...complaint.timeline, event];

  return { ...complaint };
};

export const addOfficerNote = (
  id: string,
  officerId: string,
  officerName: string,
  note: string
): CitizenComplaint | null => {
  const complaint = complaintStore.get(id);
  if (!complaint) return null;

  const officerNote: ComplaintOfficerNote = {
    id: `note-auto-${noteCounter++}`,
    officerId,
    officerName,
    note,
    createdAt: new Date().toISOString(),
  };
  complaint.notes = [...complaint.notes, officerNote];

  return { ...complaint };
};

export const resolveComplaint = (
  id: string,
  resolvedBy: string,
  summary: string,
  officerObservation: string
): CitizenComplaint | null => {
  const complaint = complaintStore.get(id);
  if (!complaint) return null;

  complaint.status = 'RESOLVED';
  complaint.resolution = {
    resolvedAt: new Date().toISOString(),
    resolvedBy,
    summary,
    officerObservation,
  };

  const event: ComplaintTimelineEvent = {
    id: `tl-auto-${timelineCounter++}`,
    status: 'RESOLVED',
    timestamp: new Date().toISOString(),
    note: summary,
    updatedBy: resolvedBy,
  };
  complaint.timeline = [...complaint.timeline, event];

  return { ...complaint };
};

export const closeComplaint = (
  id: string,
  closedBy: string,
  note?: string
): CitizenComplaint | null => {
  const complaint = complaintStore.get(id);
  if (!complaint) return null;

  complaint.status = 'CLOSED';

  const event: ComplaintTimelineEvent = {
    id: `tl-auto-${timelineCounter++}`,
    status: 'CLOSED',
    timestamp: new Date().toISOString(),
    note: note ?? 'Complaint closed after officer review',
    updatedBy: closedBy,
  };
  complaint.timeline = [...complaint.timeline, event];

  return { ...complaint };
};

export const createInspectionLink = (
  id: string,
  inspectionId: string
): CitizenComplaint | null => {
  const complaint = complaintStore.get(id);
  if (!complaint) return null;

  const link: ComplaintInspectionLink = {
    inspectionId,
    product: complaint.product,
    location: complaint.location,
    date: new Date().toISOString().split('T')[0],
    status: 'scheduled',
    verification: 'pending',
  };
  complaint.relatedInspection = link;

  const event: ComplaintTimelineEvent = {
    id: `tl-auto-${timelineCounter++}`,
    status: complaint.status,
    timestamp: new Date().toISOString(),
    note: `Inspection ${inspectionId} created from this complaint`,
    updatedBy: 'System',
  };
  complaint.timeline = [...complaint.timeline, event];

  return { ...complaint };
};

export const getNextComplaintId = (): string => {
  const all = Array.from(complaintStore.values());
  const nums = all
    .map(c => {
      const m = c.id.match(/CMP-\d+-(\d+)/);
      return m ? parseInt(m[1], 10) : 0;
    })
    .filter(n => !isNaN(n));
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  const year = new Date().getFullYear();
  return `CMP-${year}-${String(max + 1).padStart(3, '0')}`;
};
