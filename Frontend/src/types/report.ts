/* ==========================================================================
   Inspection Report Types
   Task M — Inspection Reports

   Reports aggregate data from existing services:
   - inspection.service (inspection details)
   - compliance.service (compliance findings)
   - verification.service (officer verification)
   - evidence.service (package images & evidence)
   - readability.service (physical measurements)
   - extractedInfo.service (extracted declarations)

   IMPORTANT:
   - This is a frontend DEMO. No real PDF generation, no real legal
     certification. Reports are mock documents for review/preview only.
   - Final compliance determination is made by the authorized officer
     (see OfficerVerification workflow).
   ========================================================================== */

export type ReportStatus = 'DRAFT' | 'GENERATED' | 'REVIEW_REQUIRED' | 'COMPLETED';

export interface ReportExtractedDeclaration {
  label: string;
  value: string;
  confidence?: number;
  source?: string;
}

export interface ReportComplianceFinding {
  id: string;
  requirementName: string;
  extractedValue: string;
  status: 'pass' | 'review_required' | 'potential_issue' | 'not_applicable';
  confidence: number;
  evidence: string;
  officerVerification: {
    decision: 'pending' | 'confirmed' | 'rejected' | 'review_requested';
    officerName?: string;
    reason?: string;
    timestamp?: string;
  };
}

export interface ReportApplicableRequirement {
  id: string;
  requirementName: string;
  applicability: 'applicable' | 'not_applicable' | 'conditional';
  result: 'pass' | 'review_required' | 'potential_issue' | 'not_applicable';
  evidence: string;
}

export interface ReportPackageImage {
  id: string;
  type: 'front' | 'back' | 'side' | 'label' | 'evidence';
  description: string;
  fileName?: string;
  capturedAt: string;
}

export interface ReportMeasurement {
  id: string;
  type: string;
  value: string;
  unit: string;
  location: string;
  officerName: string;
  timestamp: string;
  evidence: string;
}

export interface ReportOfficerObservation {
  id: string;
  officerName: string;
  timestamp: string;
  observation: string;
}

export interface InspectionReport {
  id: string;
  inspectionId: string;
  productName: string;
  productManufacturer: string;
  productCategory: string;
  productPackageType?: string;
  productBarcode?: string;
  productPacker?: string;
  productImporter?: string;
  productGenericDescription?: string;
  inspectionDate: string;
  inspectionTime: string;
  inspectionLocation: string;
  inspectionStatus: string;
  verificationStatus: string;
  officerName: string;
  office: string;
  status: ReportStatus;
  generatedAt: string | null;
  generatedBy: string | null;
  updatedAt: string;
  overallCompliance: 'pass' | 'review_required' | 'potential_issue' | 'not_applicable';
  extractedDeclarations: ReportExtractedDeclaration[];
  applicableRequirements: ReportApplicableRequirement[];
  complianceFindings: ReportComplianceFinding[];
  packageImages: ReportPackageImage[];
  measurements: ReportMeasurement[];
  officerObservations: ReportOfficerObservation[];
  notes: string;
}

export interface ReportFilter {
  search?: string;
  status?: ReportStatus | 'all';
  category?: string;
  officer?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ReportSummary {
  total: number;
  draft: number;
  generated: number;
  reviewRequired: number;
  completed: number;
}
