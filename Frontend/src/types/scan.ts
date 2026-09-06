export interface ScanDetectedFields {
  productName?: string;
  mfgDate?: string;
  expDate?: string;
  batchNumber?: string;
  licenseNumber?: string;
  weight?: string;
  ingredients?: string[];
  mrp?: string;
  manufacturer?: string;
  countryOfOrigin?: string;
  consumerCare?: string;
}

export interface ScanResult {
  id: string;
  imageUrl: string;
  capturedAt: string;
  detected: ScanDetectedFields;
  missing: string[];
  isCompliant: boolean;
  inspectorId: string;
}

/* ==========================================================================
   Real Backend Response Types (matches /api/v1/ai/scan in backend/app/api/v1/ai.py)
   ========================================================================== */

export interface AIImageQuality {
  quality_status: string;
  usable: boolean;
  quality_score: number;
  defects: string[];
  warnings?: string[];
  dimensions?: { width: number; height: number };
}

export interface AIPackageDetection {
  detected: boolean;
  confidence: number;
  bounding_box?: number[] | null;
  warnings?: string[];
  note?: string | null;
}

export interface AIFieldEvidence {
  field: string;
  value: string | number | null;
  confidence: number;
  bbox?: number[] | null;
  source_text?: string | null;
}

export interface AIViolation {
  rule_id: string;
  severity: string;
  description: string;
  legal_reference?: string;
}

export interface AIRuleEngineScreening {
  result: 'no_issue' | 'review_recommended' | 'potential_violation';
  compliance_status: string;
  explanation: string;
  confidence: number;
  flags: string[];
  violations: AIViolation[];
  suggestedNextStep: string;
}

export interface AIScanResponse {
  status: 'SUCCESS' | 'QUALITY_REJECTED';
  scan_id: string;
  image_path: string;
  image_quality: AIImageQuality;
  package_detection: AIPackageDetection;
  extracted_declarations: Record<string, string | number | null>;
  ocr_text?: Array<{ text: string; confidence: number; bbox: number[] }>;
  raw_text: string;
  field_evidences: AIFieldEvidence[];
  rule_engine_screening: AIRuleEngineScreening;
  warnings: string[];
  errors: string[];
}
