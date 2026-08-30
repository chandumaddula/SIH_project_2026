/* ==========================================================================
   Analysis Service
   Mock package image analysis for the Employee inspection workflow.
   Replace with real OCR/API calls when backend is available.

   IMPORTANT: All analysis is simulated. No real OCR, AI, or computer
   vision is performed. Results are clearly labeled as demo/mock.
   ========================================================================== */

/* ---- Types ---- */

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
  type: 'mrp' | 'net_quantity' | 'manufacturer' | 'batch_number' | 'best_before' | 'ingredients' | 'marketed_by' | 'country' | 'other';
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
  received: 300,
  quality_check: 500,
  preprocessing: 600,
  perspective_correction: 700,
  text_detection: 800,
  ocr: 1000,
  text_normalization: 600,
  declaration_extraction: 800,
  product_classification: 600,
  applicability_check: 700,
  compliance_screening: 900,
};

/* ---- Mock data ---- */

const MOCK_DECLARATIONS: DeclarationInfo[] = [
  {
    type: 'mrp',
    label: 'Maximum Retail Price (MRP)',
    value: '₹50.00',
    confidence: 96,
    rawText: 'MRP ₹50.00',
  },
  {
    type: 'net_quantity',
    label: 'Net Quantity',
    value: '500 g',
    confidence: 94,
    rawText: 'Net Qty 500 g',
  },
  {
    type: 'manufacturer',
    label: 'Manufacturer',
    value: 'ABC Foods Pvt. Ltd.',
    confidence: 91,
    rawText: 'Manufactured by ABC Foods Pvt. Ltd.',
  },
  {
    type: 'batch_number',
    label: 'Batch Number',
    value: 'BN-2026-08-A',
    confidence: 88,
    rawText: 'Batch No. BN-2026-08-A',
  },
  {
    type: 'best_before',
    label: 'Best Before',
    value: '31 Mar 2027',
    confidence: 93,
    rawText: 'Best Before 31 Mar 2027',
  },
  {
    type: 'marketed_by',
    label: 'Marketed By',
    value: 'ABC Foods Pvt. Ltd., Mumbai',
    confidence: 85,
    rawText: 'Marketed By: ABC Foods Pvt. Ltd., Mumbai',
  },
  {
    type: 'country',
    label: 'Country of Origin',
    value: 'India',
    confidence: 97,
    rawText: 'Country of Origin: India',
  },
  {
    type: 'ingredients',
    label: 'Ingredients / Composition',
    value: 'Wheat Flour, Sugar, Palm Oil, Salt, Baking Soda',
    confidence: 82,
    rawText: 'Ingredients: Wheat Flour, Sugar, Palm Oil...',
  },
];

const MOCK_DETECTED_TEXTS: DetectedText[] = [
  { text: 'ABC Biscuits Premium Pack', confidence: 98, region: { x: 15, y: 8, width: 70, height: 12 } },
  { text: 'Net Qty 500 g', confidence: 94, region: { x: 10, y: 25, width: 30, height: 6 } },
  { text: 'MRP ₹50.00', confidence: 96, region: { x: 60, y: 25, width: 25, height: 6 } },
  { text: 'ABC Foods Pvt. Ltd.', confidence: 91, region: { x: 10, y: 38, width: 45, height: 6 } },
  { text: 'BN-2026-08-A', confidence: 88, region: { x: 60, y: 38, width: 25, height: 5 } },
  { text: 'Best Before 31 Mar 2027', confidence: 93, region: { x: 10, y: 50, width: 35, height: 5 } },
  { text: 'Country of Origin: India', confidence: 97, region: { x: 10, y: 62, width: 35, height: 5 } },
  { text: 'Marketed By: ABC Foods Pvt. Ltd., Mumbai', confidence: 85, region: { x: 10, y: 70, width: 55, height: 5 } },
  { text: 'FSSAI License No. 11234567890123', confidence: 89, region: { x: 10, y: 80, width: 50, height: 5 } },
  { text: 'Toll Free: 1800-123-4567', confidence: 87, region: { x: 60, y: 80, width: 30, height: 4 } },
  { text: '₹', confidence: 99, region: { x: 60, y: 25, width: 5, height: 6 } },
  { text: '500 g', confidence: 95, region: { x: 30, y: 25, width: 15, height: 6 } },
];

const MOCK_REGION_HIGHLIGHTS = [
  { x: 15, y: 8, width: 70, height: 12, label: 'Product Name' },
  { x: 10, y: 25, width: 30, height: 6, label: 'Net Quantity' },
  { x: 60, y: 25, width: 25, height: 6, label: 'MRP' },
  { x: 10, y: 38, width: 45, height: 6, label: 'Manufacturer' },
  { x: 60, y: 38, width: 25, height: 5, label: 'Batch No.' },
  { x: 10, y: 50, width: 35, height: 5, label: 'Best Before' },
];

/* ---- Core analysis function ---- */

/**
 * Simulate a multi-stage analysis pipeline with progress callbacks.
 * Each stage completes after a configurable delay.
 * Results are deterministic mocks based on input data.
 */
export const analyzePackageImages = (
  images: Array<{ imageData: string; id: string; type: string }>,
  inspectionId: string,
  onProgress: (stageIndex: number, stages: StageProgress[]) => void
): Promise<AnalysisResult> => {
  return new Promise((resolve) => {
    const stages = ANALYSIS_STAGES.map(s => ({ ...s }));
    const totalImages = images.length;

    // Quality check: if any image quality overall is 'review_required', flag it
    const hasQualityWarning = images.length > 0;

    let currentIndex = 0;

    const processNextStage = () => {
      if (currentIndex >= stages.length) {
        // All stages complete — build final result
        const result = buildMockResult(totalImages, hasQualityWarning, inspectionId);
        resolve(result);
        return;
      }

      const stage = stages[currentIndex];

      // Mark as processing
      stages[currentIndex] = { ...stage, status: 'processing' };
      onProgress(currentIndex, [...stages]);

      // Advance after duration
      setTimeout(() => {
        // Mark as completed (or warning if quality check on poor-quality image)
        let finalStatus: StageStatus = 'completed';
        if (stage.stage === 'quality_check' && hasQualityWarning) {
          finalStatus = 'warning';
        }

        stages[currentIndex] = { ...stage, status: finalStatus };
        onProgress(currentIndex, [...stages]);

        currentIndex++;
        processNextStage();
      }, STAGE_DURATIONS[stage.stage]);
    };

    processNextStage();
  });
};

const buildMockResult = (
  totalImages: number,
  hasQualityWarning: boolean,
  inspectionId: string
): AnalysisResult => {
  // Randomly decide if analysis succeeds (90% success)
  const success = Math.random() > 0.1;

  if (!success) {
    return {
      success: false,
      errorMessage: 'Image analysis could not be completed. Please try again or review the images.',
      ocrResult: null,
      summary: null,
      inspectionId,
    };
  }

  // Build mock OCR result
  const qualityWarning = hasQualityWarning
    ? 'Image quality may affect text extraction accuracy. Review flagged declarations before finalising.'
    : null;

  const ocrResult: MockOCRResult = {
    success: true,
    detectedTexts: MOCK_DETECTED_TEXTS,
    declarations: MOCK_DECLARATIONS,
    productName: 'ABC Biscuits Premium Pack',
    category: 'Packaged Food',
    overallConfidence: 92,
    textDetectionConfidence: 96,
    ocrConfidence: 94,
    declarationDetectionConfidence: 91,
    qualityWarning,
    regionHighlights: MOCK_REGION_HIGHLIGHTS,
  };

  const summary: AnalysisSummary = {
    imagesProcessed: totalImages || 3,
    textRegionsDetected: MOCK_DETECTED_TEXTS.length,
    declarationsDetected: MOCK_DECLARATIONS.length,
    potentialReviewItems: hasQualityWarning ? 2 : 1,
  };

  return {
    success: true,
    errorMessage: null,
    ocrResult,
    summary,
    inspectionId,
  };
};

/* ---- Error simulation helper (for testing error state) ---- */
export const simulateAnalysisError = (
  _images: unknown[],
  inspectionId: string,
  onProgress: (stageIndex: number, stages: StageProgress[]) => void
): Promise<AnalysisResult> => {
  return new Promise((resolve) => {
    const stages = ANALYSIS_STAGES.map(s => ({ ...s }));

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
