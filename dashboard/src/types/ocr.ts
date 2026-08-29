export interface OCRBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  text: string;
  confidence: number;
  isCompliant: boolean;
}

export interface OCRTextResult {
  id: string;
  extractedText: string;
  boundingBoxes: OCRBoundingBox[];
  confidenceScore: number;
  createdAt: string;
}

export interface ExtractedField {
  key: string;
  label: string;
  value: string;
  confidence: number;
  isCompliant: boolean;
}
