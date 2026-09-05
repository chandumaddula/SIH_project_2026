export interface OCRBox {
  text: string;
  box: { x: number; y: number; w: number; h: number };
  confidence: number;
  ocr_engine?: string;
}

export interface ScanViolation {
  rule_id: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  legal_reference?: string;
}

export interface ScanScreening {
  result?: 'no_issue' | 'review_recommended' | 'potential_issue' | null;
  explanation?: string | null;
  confidence?: number | null;
  flags?: string[];
  suggestedNextStep?: string | null;
}

export interface ScanDetectedFields {
  productName?: string;
  mfgDate?: string;
  expDate?: string;
  batchNumber?: string;
  licenseNumber?: string;
  weight?: string;
  netQuantity?: string;
  manufacturer?: string;
  packer?: string;
  importer?: string;
  address?: string;
  countryOfOrigin?: string;
  consumerCare?: string;
  ingredients?: string[];
}

export interface ScanResult {
  id: string;
  imageUrl: string;
  capturedAt: string;
  detected: ScanDetectedFields;
  missing: string[];
  isCompliant: boolean;
  inspectorId: string;
  // Real data from AI pipeline
  ocrBoxes?: OCRBox[];
  violations?: ScanViolation[];
  screening?: ScanScreening;
  imagePath?: string;
}