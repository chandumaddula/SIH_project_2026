export type ComplianceStatus = 'PASS' | 'REVIEW' | 'POTENTIAL_ISSUE';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ExtractedField {
  key: string;
  value: string;
  confidence: number;
  boundingBox?: BoundingBox;
}

export interface InspectionSession {
  id: string;
  officerId: string;
  timestamp: string;
  productName?: string;
  category?: string;
  imageUrls: string[];
  extractedFields: ExtractedField[];
  complianceStatus: ComplianceStatus;
  violations: RuleViolation[];
}

export interface RuleViolation {
  ruleId: string;
  ruleName: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  description: string;
  legalReference: string;
  foundValue?: string;
  expectedValue?: string;
}
