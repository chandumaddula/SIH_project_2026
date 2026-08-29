export type ScanStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type ComplianceStatus = 'COMPLIANT' | 'NON_COMPLIANT' | 'WARNING' | 'PENDING';

export interface ScanRecord {
  id: number;
  userId?: string;
  imagePath: string;
  originalFilename: string;
  fileType: string;
  fileSize: number;
  status: ScanStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BoundingBox {
  x: number;          // Percent 0-100 or px offset
  y: number;          // Percent 0-100 or px offset
  width: number;      // Percent 0-100 or px width
  height: number;     // Percent 0-100 or px height
  label: string;      // e.g. "MRP", "Net Quantity", "Date of Mfg", "Manufacturer"
  text: string;       // Extracted text content
  confidence: number; // 0.0 - 1.0 confidence score
  isCompliant: boolean;
}

export interface InspectionEvidence {
  id: number;
  sessionId: string;
  imageUrl: string;
  boundingBoxJson: BoundingBox[];
  extractedText: string;
}

export interface RuleViolation {
  id: number;
  sessionId: string;
  ruleId: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  legalReference: string;
}

export interface InspectionSession {
  id: string;
  officerId?: string;
  scanId?: number;
  productName: string;
  category: string;
  complianceStatus: ComplianceStatus;
  createdAt: string;
  scan?: ScanRecord;
  evidence?: InspectionEvidence[];
  violations?: RuleViolation[];
}

export interface ScanResultResponse {
  scan?: ScanRecord;
  session: InspectionSession;
  evidence: InspectionEvidence;
  violations: RuleViolation[];
}
