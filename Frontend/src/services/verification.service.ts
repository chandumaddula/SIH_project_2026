/* ==========================================================================
   Officer Verification Service
   Mock verification workflow for the Employee inspection workflow.

   Provides:
   - confirmFinding / rejectFinding / requestReview
   - getVerificationHistory(inspectionId)
   - getVerificationStatus(inspectionId)

   Officers explicitly verify/reject AI-suggested findings.
   The system never makes final legal decisions.

   IMPORTANT:
   - This is a frontend DEMO. No real rules engine.
   - AI findings are advisory only.
   - Final compliance determination is made by the authorized officer.
   - Never reports "LEGAL VIOLATION CONFIRMED" or "FINAL DECISION".

   ========================================================================== */

import { PhysicalMeasurement } from './readability.service';

/* ---- Types ---- */

export type VerificationDecision = 'confirmed' | 'rejected' | 'review_requested';
export type VerificationStatus = 'pending' | 'partially_verified' | 'verified' | 'review_requested';

export interface OfficerDecision {
  id: string;
  inspectionId: string;
  findingId: string;
  findingLabel: string;
  findingType: 'compliance_check' | 'measurement' | 'observation';
  aiResult: string;
  aiStatus: string;
  decision: VerificationDecision;
  reason: string;
  officerName: string;
  timestamp: string;
}

export interface VerificationFinding {
  id: string;
  findingId: string;
  label: string;
  type: 'compliance_check' | 'measurement' | 'observation';
  aiResult: string;
  aiStatus: 'pass' | 'review_required' | 'potential_issue';
  confidence: number;
  applicableRequirement: string;
  explanation: string;
  evidenceCount: number;
  attachedEvidenceIds: string[];
  officerDecision: OfficerDecision | null;
}

export interface VerificationResult {
  findings: VerificationFinding[];
  overallStatus: VerificationStatus;
  pendingCount: number;
  confirmedCount: number;
  rejectedCount: number;
  reviewRequestedCount: number;
}

/* ---- Storage ---- */

const verificationHistory = new Map<string, OfficerDecision[]>();

/* ---- Build findings from compliance + measurements ---- */

export const buildVerificationFindings = (
  complianceResult: import('./compliance.service').ComplianceResult | null,
  measurements: PhysicalMeasurement[],
  evidenceMap: Record<string, string[]>, // findingId → evidenceIds
  history: OfficerDecision[]
): VerificationFinding[] => {
  const findings: VerificationFinding[] = [];
  const historyMap = new Map<string, OfficerDecision>();
  for (const h of history) {
    historyMap.set(h.findingId, h);
  }

  // Compliance checks → findings
  if (complianceResult?.checks) {
    for (const check of complianceResult.checks) {
      if (check.status === 'not_applicable') continue;
      const historyEntry = historyMap.get(check.id);
      const evidenceIds = evidenceMap[check.id] ?? [];

      findings.push({
        id: `finding-${check.id}`,
        findingId: check.id,
        label: check.requirementName,
        type: 'compliance_check',
        aiResult: check.status === 'pass' ? 'PASS' : check.status === 'review_required' ? 'REVIEW REQUIRED' : 'POTENTIAL ISSUE',
        aiStatus: check.status === 'pass' ? 'pass' : check.status === 'review_required' ? 'review_required' : 'potential_issue',
        confidence: check.confidence,
        applicableRequirement: check.ruleReference,
        explanation: check.explanation,
        evidenceCount: evidenceIds.length,
        attachedEvidenceIds: evidenceIds,
        officerDecision: historyEntry ?? null,
      });
    }
  }

  // Measurements → findings (only those with a recorded value)
  for (const meas of measurements) {
    if (meas.value === null) continue;
    const historyEntry = historyMap.get(meas.id);
    const evidenceIds = evidenceMap[meas.id] ?? [];

    findings.push({
      id: `finding-meas-${meas.id}`,
      findingId: meas.id,
      label: `${meas.measurementTypeLabel} — ${meas.value} ${meas.unit}`,
      type: 'measurement',
      aiResult: 'REVIEW REQUIRED',
      aiStatus: 'review_required',
      confidence: 0,
      applicableRequirement: 'Physical Verification Required',
      explanation: `Measurement recorded at ${meas.location}: ${meas.value} ${meas.unit}. Officer verification required.`,
      evidenceCount: evidenceIds.length,
      attachedEvidenceIds: evidenceIds,
      officerDecision: historyEntry ?? null,
    });
  }

  return findings;
};

/* ---- Compute overall status ---- */

export const computeVerificationStatus = (findings: VerificationFinding[]): VerificationStatus => {
  if (findings.length === 0) return 'pending';
  const allDecided = findings.every(f => f.officerDecision !== null);
  if (allDecided) return 'verified';
  const anyDecided = findings.some(f => f.officerDecision !== null);
  const anyReview = findings.some(f => f.officerDecision?.decision === 'review_requested');
  if (anyReview) return 'review_requested';
  if (anyDecided) return 'partially_verified';
  return 'pending';
};

/* ---- Verification Result ---- */

export const getVerificationResult = (
  inspectionId: string,
  complianceResult: import('./compliance.service').ComplianceResult | null,
  measurements: PhysicalMeasurement[],
  evidenceMap: Record<string, string[]>
): VerificationResult => {
  const history = verificationHistory.get(inspectionId) ?? [];
  const findings = buildVerificationFindings(complianceResult, measurements, evidenceMap, history);
  const overallStatus = computeVerificationStatus(findings);

  return {
    findings,
    overallStatus,
    pendingCount: findings.filter(f => f.officerDecision === null).length,
    confirmedCount: findings.filter(f => f.officerDecision?.decision === 'confirmed').length,
    rejectedCount: findings.filter(f => f.officerDecision?.decision === 'rejected').length,
    reviewRequestedCount: findings.filter(f => f.officerDecision?.decision === 'review_requested').length,
  };
};

/* ---- Officer Decisions ---- */

export const confirmFinding = (
  inspectionId: string,
  findingId: string,
  findingLabel: string,
  findingType: 'compliance_check' | 'measurement' | 'observation',
  aiResult: string,
  aiStatus: string,
  officerName: string
): OfficerDecision => {
  const decision: OfficerDecision = {
    id: `dec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`.toUpperCase(),
    inspectionId,
    findingId,
    findingLabel,
    findingType,
    aiResult,
    aiStatus,
    decision: 'confirmed',
    reason: '',
    officerName,
    timestamp: new Date().toISOString(),
  };

  const existing = verificationHistory.get(inspectionId) ?? [];
  const filtered = existing.filter(d => d.findingId !== findingId);
  verificationHistory.set(inspectionId, [...filtered, decision]);
  return decision;
};

export const rejectFinding = (
  inspectionId: string,
  findingId: string,
  findingLabel: string,
  findingType: 'compliance_check' | 'measurement' | 'observation',
  aiResult: string,
  aiStatus: string,
  reason: string,
  officerName: string
): OfficerDecision => {
  const decision: OfficerDecision = {
    id: `dec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`.toUpperCase(),
    inspectionId,
    findingId,
    findingLabel,
    findingType,
    aiResult,
    aiStatus,
    decision: 'rejected',
    reason,
    officerName,
    timestamp: new Date().toISOString(),
  };

  const existing = verificationHistory.get(inspectionId) ?? [];
  const filtered = existing.filter(d => d.findingId !== findingId);
  verificationHistory.set(inspectionId, [...filtered, decision]);
  return decision;
};

export const requestReview = (
  inspectionId: string,
  findingId: string,
  findingLabel: string,
  findingType: 'compliance_check' | 'measurement' | 'observation',
  aiResult: string,
  aiStatus: string,
  reason: string,
  officerName: string
): OfficerDecision => {
  const decision: OfficerDecision = {
    id: `dec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`.toUpperCase(),
    inspectionId,
    findingId,
    findingLabel,
    findingType,
    aiResult,
    aiStatus,
    decision: 'review_requested',
    reason,
    officerName,
    timestamp: new Date().toISOString(),
  };

  const existing = verificationHistory.get(inspectionId) ?? [];
  const filtered = existing.filter(d => d.findingId !== findingId);
  verificationHistory.set(inspectionId, [...filtered, decision]);
  return decision;
};

export const getVerificationHistory = (inspectionId: string): OfficerDecision[] => {
  return verificationHistory.get(inspectionId) ?? [];
};

export const getVerificationStatusLabel = (status: VerificationStatus): string => {
  switch (status) {
    case 'pending': return 'PENDING VERIFICATION';
    case 'partially_verified': return 'PARTIALLY VERIFIED';
    case 'verified': return 'VERIFIED';
    case 'review_requested': return 'REVIEW REQUESTED';
  }
};

export const VERIFICATION_STATUS_CONFIG: Record<VerificationStatus, {
  label: string;
  badge: 'success' | 'warning' | 'error' | 'neutral';
  color: string;
  bgColor: string;
  icon: string;
}> = {
  pending: { label: 'PENDING VERIFICATION', badge: 'neutral', color: '#757575', bgColor: '#f5f5f5', icon: '○' },
  partially_verified: { label: 'PARTIALLY VERIFIED', badge: 'warning', color: '#f57c00', bgColor: '#fff3e0', icon: '◐' },
  verified: { label: 'VERIFIED', badge: 'success', color: '#2e7d32', bgColor: '#e8f5e9', icon: '✓' },
  review_requested: { label: 'REVIEW REQUESTED', badge: 'error', color: '#d32f2f', bgColor: '#ffebee', icon: '!' },
};
