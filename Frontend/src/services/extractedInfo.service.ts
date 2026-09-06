/* ==========================================================================
   Extracted Information Service
   Transforms real OCR results from the AI pipeline into editable extracted fields
   for the inspection workflow. Works with the real /api/v1/ai/scan response.
   ========================================================================== */

import { MockOCRResult, DeclarationInfo } from './analysis.service';
import { AIScanResponse } from '../types/scan';

/* ---- Types ---- */

export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type FieldStatus = 'extracted' | 'edited' | 'not_detected' | 'review_required';

export interface ExtractedField {
  id: string;
  declarationType: DeclarationInfo['type'];
  label: string;
  originalValue: string;
  currentValue: string;
  confidence: number; // 0-100
  confidenceLevel: ConfidenceLevel;
  status: FieldStatus;
  sourceImageType: string; // e.g., "Front Label Image", "Back Label Image"
  rawText: string;
  isEdited: boolean;
}

export interface ProductSummary {
  productName: string;
  genericDescription: string;
  productCategory: string;
  packageType: string;
  manufacturer: string;
  packer: string;
  importer: string;
  retailer: string;
  countryOfOrigin: string;
}

export interface ExtractionQualitySummary {
  fieldsDetected: number;
  highConfidence: number;
  mediumConfidence: number;
  lowConfidence: number;
  notDetected: number;
  reviewRecommended: number;
}

export interface ExtractedInformation {
  inspectionId: string;
  productSummary: ProductSummary;
  fields: ExtractedField[];
  rawText: string;
  qualitySummary: ExtractionQualitySummary;
  officerNotes: string;
}

/* ---- Helpers ---- */

export const getConfidenceLevel = (confidence: number): ConfidenceLevel => {
  if (confidence >= 90) return 'high';
  if (confidence >= 70) return 'medium';
  return 'low';
};

export const getFieldStatus = (
  confidence: number,
  value: string
): FieldStatus => {
  if (!value || value.trim() === '' || value.toLowerCase() === 'not detected') {
    return 'not_detected';
  }
  if (confidence < 70) return 'review_required';
  return 'extracted';
};

/* ---- Build extracted fields from mock OCR result ---- */

export const buildExtractedFields = (
  ocrResult: MockOCRResult
): ExtractedField[] => {
  const { declarations } = ocrResult;

  const fieldMap: Record<string, { label: string; defaultSource: string }> = {
    mrp: { label: 'Maximum Retail Price (MRP)', defaultSource: 'Back Label Image' },
    net_quantity: { label: 'Net Quantity', defaultSource: 'Front Label Image' },
    manufacturer: { label: 'Manufacturer', defaultSource: 'Back Label Image' },
    batch_number: { label: 'Batch Number', defaultSource: 'Back Label Image' },
    best_before: { label: 'Best Before / Expiry Date', defaultSource: 'Back Label Image' },
    marketed_by: { label: 'Marketed By', defaultSource: 'Back Label Image' },
    country: { label: 'Country of Origin', defaultSource: 'Back Label Image' },
    ingredients: { label: 'Ingredients / Composition', defaultSource: 'Side Label Image' },
  };

  // Build fields from detected declarations
  const fields: ExtractedField[] = declarations.map((decl: DeclarationInfo) => {
    const config = fieldMap[decl.type] ?? {
      label: decl.label,
      defaultSource: 'Label Image',
    };
    const confidenceLevel = getConfidenceLevel(decl.confidence);
    const status = getFieldStatus(decl.confidence, decl.value);

    return {
      id: `field-${decl.type}`,
      declarationType: decl.type,
      label: config.label,
      originalValue: decl.value,
      currentValue: decl.value,
      confidence: decl.confidence,
      confidenceLevel,
      status,
      sourceImageType: config.defaultSource,
      rawText: decl.rawText,
      isEdited: false,
    };
  });

  // Add fields that were NOT detected
  const detectedTypes = new Set(declarations.map((d: DeclarationInfo) => d.type));
  const missingTypes = (Object.keys(fieldMap) as DeclarationInfo['type'][]).filter(
    (t) => !detectedTypes.has(t)
  );

  for (const type of missingTypes) {
    const config = fieldMap[type];
    fields.push({
      id: `field-${type}`,
      declarationType: type,
      label: config.label,
      originalValue: '',
      currentValue: '',
      confidence: 0,
      confidenceLevel: 'low',
      status: 'not_detected',
      sourceImageType: config.defaultSource,
      rawText: '',
      isEdited: false,
    });
  }

  return fields;
};

/* ---- Build product summary ---- */

export const buildProductSummary = (
  ocrResult: MockOCRResult,
  packageType?: string,
  retailer?: string
): ProductSummary => {
  const manufacturerField = ocrResult.declarations.find(
    (d: DeclarationInfo) => d.type === 'manufacturer'
  );
  const countryField = ocrResult.declarations.find(
    (d: DeclarationInfo) => d.type === 'country'
  );

  return {
    productName: ocrResult.productName,
    genericDescription: `${ocrResult.productName} — pre-packaged food product`,
    productCategory: ocrResult.category,
    packageType: packageType ?? 'Not specified',
    manufacturer: manufacturerField?.value ?? 'Not detected',
    packer: 'Not detected',
    importer: 'Not applicable',
    retailer: retailer ?? 'Not recorded',
    countryOfOrigin: countryField?.value ?? 'Not detected',
  };
};

/* ---- Build quality summary ---- */

export const buildQualitySummary = (fields: ExtractedField[]): ExtractionQualitySummary => {
  const detected = fields.filter(f => f.status !== 'not_detected');
  return {
    fieldsDetected: detected.length,
    highConfidence: detected.filter(f => f.confidenceLevel === 'high').length,
    mediumConfidence: detected.filter(f => f.confidenceLevel === 'medium').length,
    lowConfidence: detected.filter(f => f.confidenceLevel === 'low').length,
    notDetected: fields.filter(f => f.status === 'not_detected').length,
    reviewRecommended: fields.filter(f => f.confidence < 70).length,
  };
};

/* ---- Build full extracted information ---- */

export const buildExtractedInformation = (
  ocrResult: MockOCRResult,
  inspectionId: string,
  options?: { packageType?: string; retailer?: string }
): ExtractedInformation => {
  const fields = buildExtractedFields(ocrResult);
  const productSummary = buildProductSummary(ocrResult, options?.packageType, options?.retailer);
  const qualitySummary = buildQualitySummary(fields);

  const rawText = ocrResult.declarations
    .map((d: DeclarationInfo) => d.rawText)
    .join('\n');

  return {
    inspectionId,
    productSummary,
    fields,
    rawText,
    qualitySummary,
    officerNotes: '',
  };
};

/* ---- Apply an officer's field edit ---- */

export const applyFieldEdit = (
  info: ExtractedInformation,
  fieldId: string,
  newValue: string
): ExtractedInformation => {
  const updatedFields = info.fields.map((field) => {
    if (field.id !== fieldId) return field;
    return {
      ...field,
      currentValue: newValue,
      isEdited: newValue !== field.originalValue,
      status: newValue ? 'edited' : 'not_detected',
    } as ExtractedField;
  });

  return {
    ...info,
    fields: updatedFields,
    qualitySummary: buildQualitySummary(updatedFields),
  };
};

/* ---- Apply officer notes ---- */

export const applyOfficerNotes = (
  info: ExtractedInformation,
  notes: string
): ExtractedInformation => {
  return { ...info, officerNotes: notes };
};

/* ==========================================================================
   Real API integration — convert AIScanResponse → ExtractedInformation
   ========================================================================== */

const API_FIELD_LABEL_MAP: Record<string, string> = {
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
  expiry_date: 'Expiry Date / Best Before',
  batch_number: 'Batch Number',
  barcode: 'Barcode',
  fssai_license: 'FSSAI License',
  generic_name: 'Generic Name',
};

const API_FIELD_TYPE_MAP: Record<string, DeclarationInfo['type']> = {
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
  expiry_date: 'best_before',
  batch_number: 'batch_number',
  barcode: 'barcode',
  fssai_license: 'fssai_license',
  generic_name: 'product_name',
};

/**
 * Build a full ExtractedInformation from a real AIScanResponse.
 * This is the canonical entry point used by the inspection workflow
 * after the image analysis has completed.
 */
export const buildExtractedInformationFromAPI = (
  api: AIScanResponse,
  inspectionId: string,
  options?: { packageType?: string; retailer?: string }
): ExtractedInformation => {
  const fields: ExtractedField[] = (api.field_evidences || []).map((f) => {
    const value = f.value !== null && f.value !== undefined ? String(f.value) : '';
    const confidencePct = Math.round((f.confidence || 0) * 100);
    return {
      id: `field-${f.field}`,
      declarationType: API_FIELD_TYPE_MAP[f.field] ?? 'other',
      label: API_FIELD_LABEL_MAP[f.field] ?? f.field.replace(/_/g, ' '),
      originalValue: value,
      currentValue: value,
      confidence: confidencePct,
      confidenceLevel: getConfidenceLevel(confidencePct),
      status: getFieldStatus(confidencePct, value),
      sourceImageType: 'Package Image',
      rawText: f.source_text || value,
      isEdited: false,
    };
  });

  // Pull product summary fields from declarations
  const declarations = api.extracted_declarations || {};
  const productSummary: ProductSummary = {
    productName: (declarations.productName as string) || (declarations.product_name as string) || 'Unknown Product',
    genericDescription: ((declarations.productName as string) || 'Unknown Product') + ' — pre-packaged commodity',
    productCategory: 'Packaged Food',
    packageType: options?.packageType ?? 'Not specified',
    manufacturer: (declarations.manufacturer as string) || 'Not detected',
    packer: (declarations.packer as string) || 'Not detected',
    importer: (declarations.importer as string) || 'Not applicable',
    retailer: options?.retailer ?? 'Not recorded',
    countryOfOrigin: (declarations.countryOfOrigin as string) || (declarations.country_of_origin as string) || 'Not detected',
  };

  const qualitySummary = buildQualitySummary(fields);

  // Raw text — use the real raw_text from the API
  const rawText = api.raw_text || '';

  return {
    inspectionId,
    productSummary,
    fields,
    rawText,
    qualitySummary,
    officerNotes: '',
  };
};
