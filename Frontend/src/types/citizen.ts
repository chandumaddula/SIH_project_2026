/* ==========================================================================
   Citizen Types - Preliminary automating screening, complaint tracking
   ========================================================================== */

export type PreliminaryResult = 'no_issue' | 'review_recommended' | 'potential_issue';
export type ScanStatus = 'analyzing' | 'complete';

export interface ImageQuality {
  quality_status?: 'GOOD' | 'POOR';
  usable?: boolean;
  quality_score?: number;
  defects?: string[];
  feedback?: string;
}

export interface OCRBox {
  text: string;
  box: { x: number; y: number; w: number; h: number };
  confidence: number;
  ocr_engine?: string;
}

export interface RuleViolation {
  rule_id: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  legal_reference?: string;
}

export interface PreliminaryScreening {
  result: PreliminaryResult | null;
  explanation: string;
  confidence: number;
  flags: string[];
  suggestedNextStep: string;
}

export interface DetectedInformation {
  productName?: string;
  genericName?: string;
  mrp?: string;
  netQuantity?: string;
  manufacturer?: string;
  packer?: string;
  importer?: string;
  address?: string;
  countryOfOrigin?: string;
  dateInformation?: {
    mfgDate?: string;
    expDate?: string;
    batchNumber?: string;
    lotNumber?: string;
  };
  consumerCare?: string;
  otherDetected?: string;
  licenseNumber?: string;
  barcode?: string;
  mfgDate?: string;
  expDate?: string;
  batchNumber?: string;
}

/**
 * Real scan result from the AI pipeline backend.
 * Includes: OCR boxes, extracted fields, rule violations.
 */
export interface CitizenScan {
  id: string;
  scan_id?: string;
  citizenId?: string;
  images: string[];  // Image URLs/paths from backend
  detected: DetectedInformation;
  screening: PreliminaryScreening;
  createdAt: string;
  // Real AI pipeline fields
  quality?: ImageQuality;
  ocrBoxes?: OCRBox[];
  violations?: RuleViolation[];
  labelRegion?: { x: number; y: number; width: number; height: number };
}

export interface CitizenComplaint {
  id: string;
  citizenId: string;
  product: string;
  issue: string;
  placeOfPurchase: string;
  date: string;
  description: string;
  packageImages: string[];
  supportingDocuments: string[];
  billEvidence?: string;
  status: CitizenComplaintStatus;
  submittedAt: string;
  timeline: CitizenTimelineEvent[];
  summary: string;
}

export type CitizenComplaintStatus =
  | 'Submitted'
  | 'Received'
  | 'Assigned'
  | 'Inspection'
  | 'Verification'
  | 'Resolved'
  | 'Closed';

export interface CitizenTimelineEvent {
  id: string;
  status: CitizenComplaintStatus;
  timestamp: string;
  note: string;
  updatedBy?: string;
}

export interface CitizenNotification {
  id: string;
  citizenId: string;
  type: 'complaint_received' | 'complaint_assigned' | 'inspection_initiated' | 'evidence_requested' | 'status_updated' | 'complaint_resolved';
  title: string;
  message: string;
  complaintId?: string;
  createdAt: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
}