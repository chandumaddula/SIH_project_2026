export interface ScanDetectedFields {
  productName?: string;
  mfgDate?: string;
  expDate?: string;
  batchNumber?: string;
  licenseNumber?: string;
  weight?: string;
  mrp?: string;
  manufacturer?: string;
  countryOfOrigin?: string;
  consumerCare?: string;
  packer?: string;
  importer?: string;
  address?: string;
  barcode?: string;
  fssaiLicense?: string;
  genericName?: string;
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

// Image Quality Assessment
export interface AIImageQuality {
  quality_status: 'EXCELLENT' | 'GOOD' | 'ACCEPTABLE' | 'POOR' | 'ERROR' | 'UNKNOWN';
  usable: boolean;
  quality_score: number;  // 0.0 to 1.0
  defects: string[];  // e.g., ['LOW_RESOLUTION', 'EXCESSIVE_BLUR', 'POOR_LIGHTING']
  warnings?: string[];
  dimensions?: { width: number; height: number };
}

// Package Detection Result
export interface AIPackageDetection {
  detected: boolean;
  confidence: number;  // 0.0 to 1.0
  bounding_box?: number[] | null;  // [x1, y1, x2, y2]
  warnings?: string[];
  note?: string | null;
}

// Individual OCR Result
export interface OCRExtractedText {
  text: string;
  confidence: number;  // 0.0 to 1.0
  bbox: number[];  // [x1, y1, x2, y2]
}

// Field Evidence from AI extraction
export interface AIFieldEvidence {
  field: string;
  value: string | number | null;
  confidence: number;  // 0.0 to 1.0
  bbox?: number[] | null;
  source_text?: string | null;
}

// Violation detected by rule engine
export interface AIViolation {
  rule_id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  description: string;
  legal_reference?: string;
}

// Rule Engine Compliance Screening Result
export interface AIRuleEngineScreening {
  result: 'no_issue' | 'review_recommended' | 'potential_violation';
  compliance_status: 'COMPLIANT' | 'NEEDS_REVIEW' | 'NON_COMPLIANT';
  explanation: string;
  confidence: number;  // 0.0 to 1.0
  flags: string[];
  violations: AIViolation[];
  suggestedNextStep: string;
}

// Complete Scan Response from backend
export interface AIScanResponse {
  status: 'SUCCESS' | 'QUALITY_REJECTED';
  scan_id: string;
  image_path: string;
  image_quality: AIImageQuality;
  package_detection: AIPackageDetection;
  extracted_declarations: Record<string, string | number | null>;
  ocr_text?: OCRExtractedText[];
  raw_text: string;
  field_evidences: AIFieldEvidence[];
  rule_engine_screening: AIRuleEngineScreening;
  warnings: string[];
  errors: string[];
}

/* ==========================================================================
   Legal Metrology Declaration Types
   Based on Legal Metrology (Packaged Commodities) Rules, 2011
   ========================================================================== */

// Mandatory declarations under Legal Metrology
export const MANDATORY_DECLARATIONS = [
  { field: 'productName', label: 'Product Name', required: true, rule: 'Rule 6(1)' },
  { field: 'mrp', label: 'Maximum Retail Price (MRP)', required: true, rule: 'Rule 6(2)' },
  { field: 'netQuantity', label: 'Net Quantity', required: true, rule: 'Rule 6(3)' },
  { field: 'manufacturer', label: 'Manufacturer Details', required: true, rule: 'Rule 6(4)(a)' },
  { field: 'mfgDate', label: 'Manufacturing Date', required: true, rule: 'Rule 6(4)(b)' },
  { field: 'expDate', label: 'Expiry/Best Before Date', required: true, rule: 'Rule 6(4)(c)' },
  { field: 'batchNumber', label: 'Batch Number/Code', required: true, rule: 'Rule 6(4)(d)' },
  { field: 'countryOfOrigin', label: 'Country of Origin', required: true, rule: 'Rule 6(5)' },
  { field: 'consumerCare', label: 'Consumer Care Details', required: true, rule: 'Rule 6(6)' },
  { field: 'packer', label: 'Packer Details', required: false, rule: 'Rule 6(4)(a)' },
  { field: 'importer', label: 'Importer Details', required: false, rule: 'Rule 6(4)(a)' },
  { field: 'fssaiLicense', label: 'FSSAI License No.', required: false, rule: 'FSSAI Act' },
  { field: 'barcode', label: 'Barcode', required: false, rule: 'Rule 6(7)' },
] as const;

// Field category mapping for display
export interface FieldCategory {
  name: string;
  fields: string[];
  order: number;
}

export const FIELD_CATEGORIES: FieldCategory[] = [
  { name: 'Basic Information', fields: ['productName', 'genericName'], order: 1 },
  { name: 'Pricing', fields: ['mrp'], order: 2 },
  { name: 'Quantity', fields: ['netQuantity'], order: 3 },
  { name: 'Manufacturer', fields: ['manufacturer', 'packer', 'importer', 'address'], order: 4 },
  { name: 'Date Information', fields: ['mfgDate', 'expDate', 'batchNumber'], order: 5 },
  { name: 'Compliance', fields: ['countryOfOrigin', 'consumerCare', 'fssaiLicense'], order: 6 },
  { name: 'Identification', fields: ['barcode'], order: 7 },
];

// Image quality defect descriptions
export const QUALITY_DEFECT_LABELS: Record<string, string> = {
  'LOW_RESOLUTION': 'Image resolution too low for accurate OCR',
  'PACKAGE_TOO_FAR': 'Package appears too far from camera',
  'POOR_LIGHTING_UNDEREXPOSED': 'Image is too dark',
  'POOR_LIGHTING_OVEREXPOSED': 'Image is too bright',
  'EXCESSIVE_BLUR': 'Image is blurry',
  'EXCESSIVE_GLARE': 'Excessive glare detected',
  'LOW_CONTRAST': 'Low text contrast',
  'VERY_LOW_CONTRAST': 'Very low contrast - text unreadable',
  'CORRUPT_OR_UNREADABLE_IMAGE': 'Image file is corrupt or unreadable',
};

// Violation severity colors
export const VIOLATION_SEVERITY_STYLES: Record<string, { bg: string; border: string; label: string }> = {
  'CRITICAL': { bg: '#ffebee', border: '#d32f2f', label: 'Critical' },
  'HIGH': { bg: '#fff3e0', border: '#f57c00', label: 'High' },
  'MEDIUM': { bg: '#fff8e1', border: '#fbc02d', label: 'Medium' },
  'LOW': { bg: '#e3f2fd', border: '#1976d2', label: 'Low' },
  'INFO': { bg: '#f5f5f5', border: '#9e9e9e', label: 'Info' },
};
