/* ==========================================================================
   Citizen Types - Preliminary automating screening, complaint tracking
   ========================================================================== */

export type PreliminaryResult = 'no_issue' | 'review_recommended' | 'potential_issue';
export type ScanStatus = 'analyzing' | 'complete';

export interface PackageImage {
  id: string;
  type: 'front' | 'back' | 'side' | 'label' | 'other';
  dataUrl: string;
  uploadedAt: string;
  quality: {
    blur: 'low' | 'medium' | 'high';
    lighting: 'poor' | 'fair' | 'good';
  };
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
}

export interface PreliminaryScreening {
  result: PreliminaryResult;
  explanation: string;
  confidence: number;
  flags: string[];
  suggestedNextStep: string;
  detectedAt: string;
}

export interface CitizenScan {
  id: string;
  citizenId: string;
  images: PackageImage[];
  detected: DetectedInformation;
  screening: PreliminaryScreening;
  createdAt: string;
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