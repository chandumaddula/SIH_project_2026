/* ==========================================================================
   Analysis Service
   Real package image analysis via the FastAPI backend (/api/v1/ai/scan).
   ========================================================================== */

import { AIScanResponse } from '../types/scan';

/* ---- In-memory cache for the most recent API response ---- */
/* Used by InspectionAnalysis to hand off the real API result to ExtractedInformation */
let _lastApiResult: AIScanResponse | null = null;

export const getLastApiResult = (): AIScanResponse | null => _lastApiResult;
export const setLastApiResult = (result: AIScanResponse | null) => {
  _lastApiResult = result;
};
export const clearLastApiResult = () => {
  _lastApiResult = null;
};

/* ---- Types (unchanged — same shape as before) ---- */

export type AnalysisStage =
  | 'received'
  | 'quality_check'
  | 'preprocessing'
  | 'perspective_correction'
  | 'text_detection'
  | 'ocr'
  | 'text_normalization'
  | 'declaration_extraction'
  | 'product_classification'
  | 'applicability_check'
  | 'compliance_screening';

export type StageStatus = 'pending' | 'processing' | 'completed' | 'warning' | 'error';

export interface StageProgress {
  stage: AnalysisStage;
  label: string;
  status: StageStatus;
  description: string;
}

export interface DetectedText {
  text: string;
  confidence: number; // 0-100
  region: { x: number; y: number; width: number; height: number };
}

export interface DeclarationInfo {
  type: 'mrp' | 'net_quantity' | 'manufacturer' | 'batch_number' | 'best_before' | 'ingredients' | 'marketed_by' | 'country' | 'product_name' | 'consumer_care' | 'mfg_date' | 'exp_date' | 'barcode' | 'fssai_license' | 'packer' | 'importer' | 'address' | 'other';
  label: string;
  value: string;
  confidence: number; // 0-100
  rawText: string;
}

export interface MockOCRResult {
  success: boolean;
  detectedTexts: DetectedText[];
  declarations: DeclarationInfo[];
  productName: string;
  category: string;
  overallConfidence: number;
  textDetectionConfidence: number;
  ocrConfidence: number;
  declarationDetectionConfidence: number;
  qualityWarning: string | null;
  regionHighlights: { x: number; y: number; width: number; height: number; label: string }[];
}

export interface AnalysisSummary {
  imagesProcessed: number;
  textRegionsDetected: number;
  declarationsDetected: number;
  potentialReviewItems: number;
}

export interface AnalysisResult {
  success: boolean;
  errorMessage: string | null;
  ocrResult: MockOCRResult | null;
  summary: AnalysisSummary | null;
  inspectionId: string;
}

/* ---- Stage definitions ---- */

export const ANALYSIS_STAGES: StageProgress[] = [
  { stage: 'received', label: 'Image Received', status: 'pending', description: 'Package image data loaded' },
  { stage: 'quality_check', label: 'Image Quality Check', status: 'pending', description: 'Assessing lighting, blur, and label visibility' },
  { stage: 'preprocessing', label: 'Preprocessing', status: 'pending', description: 'Adjusting contrast and colour normalisation' },
  { stage: 'perspective_correction', label: 'Perspective Correction', status: 'pending', description: 'Rectifying skewed label angles' },
  { stage: 'text_detection', label: 'Text Detection', status: 'pending', description: 'Locating text regions in the image' },
  { stage: 'ocr', label: 'OCR', status: 'pending', description: 'Extracting text from detected regions' },
  { stage: 'text_normalization', label: 'Text Normalization', status: 'pending', description: 'Cleaning and standardising detected text' },
  { stage: 'declaration_extraction', label: 'Declaration Extraction', status: 'pending', description: 'Identifying mandatory declarations (MRP, quantity, etc.)' },
  { stage: 'product_classification', label: 'Product Classification', status: 'pending', description: 'Classifying product category and type' },
  { stage: 'applicability_check', label: 'Applicability Check', status: 'pending', description: 'Determining applicable legal metrology rules' },
  { stage: 'compliance_screening', label: 'Compliance Screening', status: 'pending', description: 'Screening against declared requirements' },
];

/* ---- Helpers ---- */

const STAGE_DURATIONS: Record<AnalysisStage, number> = {
  received: 250,
  quality_check: 400,
  preprocessing: 500,
  perspective_correction: 600,
  text_detection: 700,
  ocr: 800,
  text_normalization: 500,
  declaration_extraction: 700,
  product_classification: 500,
  applicability_check: 600,
  compliance_screening: 800,
};

/**
 * Convert a data URL (e.g. "data:image/jpeg;base64,...") to a File object.
 */
const dataUrlToFile = (dataUrl: string, filename: string): File => {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], filename, { type: mime });
};

/**
 * Map raw backend field names → frontend declaration types.
 */
const FIELD_TYPE_MAP: Record<string, DeclarationInfo['type']> = {
  mrp: 'mrp',
  net_quantity: 'net_quantity',
  product_name: 'product_name',
  manufacturer: 'manufacturer',
  packer: 'packer',
  importer: 'importer',
  consumer_care: 'consumer_care',
  country_of_origin: 'country',
  address: 'other',
  manufacturing_date: 'mfg_date',
  expiry_date: 'exp_date',
  batch_number: 'batch_number',
  barcode: 'barcode',
  fssai_license: 'fssai_license',
  generic_name: 'product_name',
};

const FIELD_LABEL_MAP: Record<string, string> = {
  mrp: 'Maximum Retail Price (MRP)',
  net_quantity: 'Net Quantity',
  product_name: 'Product Name',
  manufacturer: 'Manufacturer',
  packer: 'Packer',
  importer: 'Importer',
  consumer_care: 'Consumer Care',
  country_of_origin: 'Country of Origin',
  address: 'Address',
  manufacturing_date: 'Manufacturing Date',
  expiry_date: 'Expiry Date',
  batch_number: 'Batch Number',
  barcode: 'Barcode',
  fssai_license: 'FSSAI License',
  generic_name: 'Generic Name',
};

/**
 * Convert the real AIScanResponse into the legacy MockOCRResult shape
 * so the existing ExtractedInformation UI can render it.
 */
const mapApiToOCRResult = (api: AIScanResponse): MockOCRResult => {
  // 1. Build declarations list from field_evidences
  const declarations: DeclarationInfo[] = (api.field_evidences || []).map((f) => {
    const ftype = f.field;
    const value = f.value !== null && f.value !== undefined ? String(f.value) : '';
    return {
      type: FIELD_TYPE_MAP[ftype] ?? 'other',
      label: FIELD_LABEL_MAP[ftype] ?? ftype.replace(/_/g, ' '),
      value,
      confidence: Math.round((f.confidence || 0) * 100),
      rawText: f.source_text || value,
    };
  });

  // 2. Build detected texts list from ocr_text or raw_text
  const detectedTexts: DetectedText[] = (api.ocr_text || []).map((t) => ({
    text: t.text,
    confidence: Math.round((t.confidence || 0) * 100),
    region: {
      x: t.bbox?.[0] || 0,
      y: t.bbox?.[1] || 0,
      width: t.bbox?.[2] || 100,
      height: t.bbox?.[3] || 20,
    },
  }));

  // If no ocr_text items, fall back to splitting raw_text
  if (detectedTexts.length === 0 && api.raw_text) {
    const parts = api.raw_text.split(/[|\n]/).filter((s) => s.trim());
    parts.forEach((p) => {
      detectedTexts.push({
        text: p.trim(),
        confidence: 90,
        region: { x: 0, y: 0, width: 100, height: 20 },
      });
    });
  }

  // 3. Extract product name and category
  const productNameField = declarations.find((d) => d.type === 'product_name');
  const productName = productNameField?.value || api.extracted_declarations?.productName as string || 'Unknown Product';
  const category = 'Packaged Food';

  // 4. Quality warning
  const qualityWarning = api.image_quality?.usable === false
    ? api.warnings?.[0] || 'Image quality may affect text extraction accuracy. Review flagged declarations before finalising.'
    : null;

  // 5. Region highlights — from field_evidences with bbox
  const regionHighlights: MockOCRResult['regionHighlights'] = (api.field_evidences || [])
    .filter((f) => f.bbox && Array.isArray(f.bbox) && f.bbox.length >= 4)
    .map((f) => ({
      x: f.bbox![0],
      y: f.bbox![1],
      width: f.bbox![2],
      height: f.bbox![3],
      label: FIELD_LABEL_MAP[f.field] || f.field,
    }));

  // 6. Confidence numbers
  const overallConfidence = Math.round((api.rule_engine_screening?.confidence || 0) * 100);
  const declarationDetectionConfidence = declarations.length > 0
    ? Math.round(declarations.reduce((sum, d) => sum + d.confidence, 0) / declarations.length)
    : 0;
  const textDetectionConfidence = detectedTexts.length > 0
    ? Math.round(detectedTexts.reduce((sum, t) => sum + t.confidence, 0) / detectedTexts.length)
    : 0;

  return {
    success: true,
    detectedTexts,
    declarations,
    productName,
    category,
    overallConfidence: overallConfidence || declarationDetectionConfidence,
    textDetectionConfidence,
    ocrConfidence: textDetectionConfidence,
    declarationDetectionConfidence,
    qualityWarning,
    regionHighlights,
  };
};

/* ---- Core analysis function (now real) ---- */

/**
 * Run the real AI pipeline on the uploaded images.
 * - Stages are simulated to keep the visual progress UX (real AI runs as one call).
 * - The actual call to /api/v1/ai/scan happens at the OCR stage.
 */
export const analyzePackageImages = (
  images: Array<{ imageData: string; id: string; type: string }>,
  inspectionId: string,
  onProgress: (stageIndex: number, stages: StageProgress[]) => void
): Promise<AnalysisResult> => {
  return new Promise(async (resolve) => {
    const stages = ANALYSIS_STAGES.map((s) => ({ ...s }));
    const totalImages = images.length;

    if (!images || images.length === 0) {
      resolve({
        success: false,
        errorMessage: 'No images were provided for analysis. Please return to the previous step and capture or upload package images.',
        ocrResult: null,
        summary: null,
        inspectionId,
      });
      return;
    }

    let currentIndex = 0;
    let apiResult: AIScanResponse | null = null;
    let errorMessage: string | null = null;

    const processNextStage = async () => {
      if (currentIndex >= stages.length) {
        // All stages complete — build final result from real API response
        if (apiResult) {
          const ocrResult = mapApiToOCRResult(apiResult);
          const summary: AnalysisSummary = {
            imagesProcessed: totalImages,
            textRegionsDetected: ocrResult.detectedTexts.length,
            declarationsDetected: ocrResult.declarations.length,
            potentialReviewItems: ocrResult.declarations.filter(
              (d) => d.confidence < 70 || !d.value
            ).length,
          };
          resolve({
            success: true,
            errorMessage: null,
            ocrResult,
            summary,
            inspectionId,
          });
        } else {
          resolve({
            success: false,
            errorMessage: errorMessage || 'Image analysis failed.',
            ocrResult: null,
            summary: null,
            inspectionId,
          });
        }
        return;
      }

      const stage = stages[currentIndex];
      stages[currentIndex] = { ...stage, status: 'processing' };
      onProgress(currentIndex, [...stages]);

      // At the OCR stage (index 5), make the real API call
      if (stage.stage === 'ocr') {
        try {
          // Use the first image (most common case)
          const file = dataUrlToFile(images[0].imageData, 'package.jpg');
          const response = await fetch('/api/v1/ai/scan', {
            method: 'POST',
            body: (() => {
              const fd = new FormData();
              fd.append('file', file);
              fd.append('image', file);
              return fd;
            })(),
          });
          if (!response.ok) {
            const err = await response.json().catch(() => ({ detail: 'AI scan failed' }));
            throw new Error(err.detail || `HTTP ${response.status}`);
          }
          apiResult = await response.json();
        } catch (e: any) {
          errorMessage = e?.message || 'AI scan failed. Is the backend running on port 8000?';
          stages[currentIndex] = { ...stage, status: 'error' };
          onProgress(currentIndex, [...stages]);
          // Skip remaining stages
          currentIndex = stages.length;
          processNextStage();
          return;
        }
      }

      // Wait the stage duration, then mark complete
      setTimeout(() => {
        // Quality check stage: warn if API says image is poor
        if (stage.stage === 'quality_check' && apiResult && !apiResult.image_quality?.usable) {
          stages[currentIndex] = { ...stage, status: 'warning' };
        } else {
          stages[currentIndex] = { ...stage, status: 'completed' };
        }
        onProgress(currentIndex, [...stages]);
        currentIndex++;
        processNextStage();
      }, STAGE_DURATIONS[stage.stage]);
    };

    processNextStage();
  });
};

/* ---- Error simulation helper ---- */
export const simulateAnalysisError = (
  _images: unknown[],
  inspectionId: string,
  onProgress: (stageIndex: number, stages: StageProgress[]) => void
): Promise<AnalysisResult> => {
  return new Promise((resolve) => {
    const stages = ANALYSIS_STAGES.map((s) => ({ ...s }));

    let currentIndex = 0;

    const processNextStage = () => {
      if (currentIndex >= stages.length) {
        resolve({
          success: false,
          errorMessage: 'Image analysis could not be completed due to a processing error. Please try again.',
          ocrResult: null,
          summary: null,
          inspectionId,
        });
        return;
      }

      const stage = stages[currentIndex];
      stages[currentIndex] = { ...stage, status: 'processing' };
      onProgress(currentIndex, [...stages]);

      setTimeout(() => {
        stages[currentIndex] = { ...stage, status: 'error' };
        onProgress(currentIndex, [...stages]);
        currentIndex++;
        processNextStage();
      }, 400);
    };

    processNextStage();
  });
};
