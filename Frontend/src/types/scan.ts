export interface ScanDetectedFields {
  productName?: string;
  mfgDate?: string;
  expDate?: string;
  batchNumber?: string;
  licenseNumber?: string;
  weight?: string;
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
}