/* ==========================================================================
   Readability & Measurement Service
   Mock readability assessment + physical measurement recording.

   IMPORTANT:
   - This is a frontend DEMO. No real computer-vision measurement.
   - Photographic images may NOT provide reliable physical scale.
   - Physical measurements must be recorded by the authorized officer.
   - Statuses: GOOD | WARNING | REVIEW REQUIRED | NOT DETERMINED
   - Never claims "LEGAL VIOLATION CONFIRMED" or final legal decision.

   Replace with a real CV/measurement backend when available.
   ========================================================================== */

import { ExtractedInformation, ExtractedField } from './extractedInfo.service';

/* ---- Types ---- */

export type ReadabilityStatus = 'good' | 'warning' | 'review_required' | 'not_determined';
export type CheckSource = 'automated' | 'officer' | 'physical';
export type MeasurementType = 'character_height' | 'label_dimension' | 'package_dimension' | 'other';

export interface ReadabilityCheck {
  id: string;
  name: string;
  source: CheckSource;
  status: ReadabilityStatus;
  description: string;
}

export interface TextRegion {
  id: string;
  name: string;
  source: string;
  detectionStatus: 'detected' | 'review_required' | 'not_detected';
  confidence: number;
}

export interface ReadabilityAssessment {
  success: boolean;
  errorMessage: string | null;
  checks: ReadabilityCheck[];
  textRegions: TextRegion[];
  overall: ReadabilityStatus;
  overallLabel: string;
  overallMessage: string;
  physicalScaleAvailable: boolean;
  physicalScaleNote: string;
  inspectionId: string;
}

/* ---- Helpers ---- */

const getFieldByType = (
  fields: ExtractedField[],
  type: string
): ExtractedField | undefined => fields.find(f => f.declarationType === type);

/* ---- Mock readability analysis ---- */

export const analyzeReadability = (
  extractedInfo: ExtractedInformation | null,
  inspectionId: string,
  hasImages: boolean
): ReadabilityAssessment => {
  if (!hasImages) {
    return {
      success: false,
      errorMessage: 'No package images are available for readability analysis. Please return to the image capture step.',
      checks: [],
      textRegions: [],
      overall: 'not_determined',
      overallLabel: 'NOT DETERMINED',
      overallMessage: 'No images available.',
      physicalScaleAvailable: false,
      physicalScaleNote: 'No images provided.',
      inspectionId,
    };
  }

  // Determine mock status based on extracted info
  const fields = extractedInfo?.fields ?? [];
  const mrpField = getFieldByType(fields, 'mrp');
  const qtyField = getFieldByType(fields, 'net_quantity');
  const mfgField = getFieldByType(fields, 'manufacturer');
  const careField = getFieldByType(fields, 'marketed_by');

  const mrpConf = mrpField?.confidence ?? 0;
  const qtyConf = qtyField?.confidence ?? 0;
  const mfgConf = mfgField?.confidence ?? 0;
  const careConf = careField?.confidence ?? 0;

  // Average confidence determines automated checks
  const avgConf = (mrpConf + qtyConf + mfgConf + careConf) / 4;
  const textRegionsDetected = (mrpConf > 0 ? 1 : 0) + (qtyConf > 0 ? 1 : 0) + (mfgConf > 0 ? 1 : 0) + (careConf > 0 ? 1 : 0);

  // Build automated checks
  const checks: ReadabilityCheck[] = [
    {
      id: 'check-visibility',
      name: 'Text Visibility',
      source: 'automated',
      status: avgConf >= 70 ? 'good' : 'review_required',
      description: avgConf >= 70
        ? 'Text is visually distinguishable in the captured image.'
        : 'Some text may not be clearly visible. Officer verification recommended.',
    },
    {
      id: 'check-contrast',
      name: 'Contrast',
      source: 'automated',
      status: avgConf >= 85 ? 'good' : avgConf >= 70 ? 'warning' : 'review_required',
      description: avgConf >= 85
        ? 'Sufficient contrast between text and background for label reading.'
        : 'Contrast is acceptable but not ideal in some regions.',
    },
    {
      id: 'check-blur',
      name: 'Blur',
      source: 'automated',
      status: avgConf >= 85 ? 'good' : avgConf >= 70 ? 'warning' : 'review_required',
      description: avgConf >= 85
        ? 'Image is in focus across the package label.'
        : 'Some regions show mild blur. Officer verification recommended.',
    },
    {
      id: 'check-lighting',
      name: 'Lighting',
      source: 'automated',
      status: avgConf >= 70 ? 'good' : 'warning',
      description: 'Lighting conditions are generally adequate for label review.',
    },
    {
      id: 'check-regions',
      name: 'Text Region Detection',
      source: 'automated',
      status: textRegionsDetected >= 4 ? 'good' : textRegionsDetected >= 2 ? 'warning' : 'review_required',
      description: textRegionsDetected >= 4
        ? `Detected ${textRegionsDetected} text regions in the package label.`
        : `Detected ${textRegionsDetected} of 4 expected text regions. Officer verification recommended.`,
    },
    {
      id: 'check-overall',
      name: 'Overall Readability',
      source: 'automated',
      status: avgConf >= 90 ? 'good' : avgConf >= 70 ? 'warning' : 'review_required',
      description: avgConf >= 90
        ? 'Label readability is adequate for analysis.'
        : 'Overall readability requires officer verification.',
    },
    {
      id: 'check-physical-scale',
      name: 'Physical Scale',
      source: 'physical',
      status: 'not_determined',
      description: 'Photographic scale is insufficient for reliable physical measurement. Physical measurement by the authorized officer is required.',
    },
  ];

  // Text regions
  const textRegions: TextRegion[] = [
    { id: 'r-mrp', name: 'MRP', source: 'Back Label Image', detectionStatus: mrpConf > 0 ? 'detected' : 'not_detected', confidence: mrpConf || 0 },
    { id: 'r-qty', name: 'Net Quantity', source: 'Front Label Image', detectionStatus: qtyConf > 0 ? 'detected' : 'not_detected', confidence: qtyConf || 0 },
    { id: 'r-mfg', name: 'Manufacturer', source: 'Back Label Image', detectionStatus: mfgConf > 0 ? 'detected' : 'not_detected', confidence: mfgConf || 0 },
    { id: 'r-care', name: 'Consumer Care', source: 'Back Label Image', detectionStatus: careConf >= 70 ? 'detected' : careConf > 0 ? 'review_required' : 'not_detected', confidence: careConf || 0 },
  ];

  // Overall status
  const automatedStatuses = checks.filter(c => c.source === 'automated').map(c => c.status);
  const hasReview = automatedStatuses.includes('review_required');
  const hasWarning = automatedStatuses.includes('warning');
  const overall: ReadabilityStatus = hasReview ? 'review_required' : hasWarning ? 'warning' : 'good';
  const overallLabel = overall === 'good' ? 'GOOD' : overall === 'warning' ? 'WARNING' : 'REVIEW REQUIRED';
  const overallMessage = overall === 'good'
    ? 'Automated checks indicate adequate readability. Officer may proceed with physical review.'
    : overall === 'warning'
      ? 'Some automated checks warrant officer attention.'
      : 'Automated checks require officer review.';

  return {
    success: true,
    errorMessage: null,
    checks,
    textRegions,
    overall,
    overallLabel,
    overallMessage,
    physicalScaleAvailable: false,
    physicalScaleNote: 'Photographic scale is insufficient for reliable physical measurement. Use approved physical measurement methods.',
    inspectionId,
  };
};

/* ---- Physical Measurement ---- */

export interface PhysicalMeasurement {
  id: string;
  measurementType: MeasurementType;
  measurementTypeLabel: string;
  value: number | null;
  unit: string;
  location: string;
  observation: string;
  evidenceImageData: string | null;
  recordedBy: string;
  recordedAt: string;
}

export interface PhysicalMeasurementInput {
  measurementType: MeasurementType;
  value: number | null;
  unit: string;
  location: string;
  observation: string;
  evidenceImageData: string | null;
}

export const MEASUREMENT_TYPE_LABELS: Record<MeasurementType, string> = {
  character_height: 'Character Height',
  label_dimension: 'Label Dimension',
  package_dimension: 'Package Dimension',
  other: 'Other',
};

export const MEASUREMENT_UNITS: Record<MeasurementType, string[]> = {
  character_height: ['mm', 'cm'],
  label_dimension: ['mm', 'cm'],
  package_dimension: ['cm', 'mm', 'm'],
  other: ['mm', 'cm', 'm', 'g', 'kg', 'ml', 'L', 'unit'],
};

const measurementStore = new Map<string, PhysicalMeasurement[]>();

export const savePhysicalMeasurement = (
  inspectionId: string,
  input: PhysicalMeasurementInput,
  officerName: string
): PhysicalMeasurement => {
  const measurement: PhysicalMeasurement = {
    id: `meas-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    measurementType: input.measurementType,
    measurementTypeLabel: MEASUREMENT_TYPE_LABELS[input.measurementType],
    value: input.value,
    unit: input.unit,
    location: input.location,
    observation: input.observation,
    evidenceImageData: input.evidenceImageData,
    recordedBy: officerName,
    recordedAt: new Date().toISOString(),
  };

  const existing = measurementStore.get(inspectionId) ?? [];
  measurementStore.set(inspectionId, [...existing, measurement]);
  return measurement;
};

export const getMeasurements = (inspectionId: string): PhysicalMeasurement[] => {
  return measurementStore.get(inspectionId) ?? [];
};

export const deleteMeasurement = (inspectionId: string, measurementId: string): void => {
  const existing = measurementStore.get(inspectionId) ?? [];
  measurementStore.set(inspectionId, existing.filter(m => m.id !== measurementId));
};
