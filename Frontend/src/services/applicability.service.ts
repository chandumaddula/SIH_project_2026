/* ==========================================================================
   Applicability Service
   Mock applicability evaluation for the Employee inspection workflow.

   Evaluates which configured requirements apply to a package based on:
   - Product category
   - Package type
   - Quantity / import status
   - Other configured conditions

   IMPORTANT: All data is demo/configured. No real legal database is used.
   Do not represent mock rules as actual legislation.
   Replace with real backend/rules service when available.
   ========================================================================== */

import { ExtractedInformation, ExtractedField } from './extractedInfo.service';

/* ---- Types ---- */

export type ApplicabilityStatus = 'applicable' | 'not_applicable' | 'review_required';
export type RequirementCategory = 'declaration' | 'label' | 'price' | 'quantity' | 'country' | 'consumer' | 'other';

export interface ApplicabilityCondition {
  id: string;
  name: string;
  value: string;
  source: string; // which extracted field or config provides this
}

export interface Requirement {
  id: string;
  name: string;
  description: string;
  category: RequirementCategory;
  applicabilityStatus: ApplicabilityStatus;
  applicabilityReason: string;
  ruleReference: string; // clearly labeled DEMO-*
  conditionsConsidered: string[];
  reviewFlag: boolean;
  reviewReason?: string;
}

export interface ExceptionItem {
  id: string;
  name: string;
  condition: string;
  result: 'triggered' | 'not_triggered';
  explanation: string;
}

export interface ApplicabilitySummary {
  applicableCount: number;
  notApplicableCount: number;
  reviewRequiredCount: number;
  conditionsEvaluatedCount: number;
}

export interface ApplicabilityResult {
  success: boolean;
  errorMessage: string | null;
  productCategory: string;
  packageType: string;
  conditions: ApplicabilityCondition[];
  requirements: Requirement[];
  exceptions: ExceptionItem[];
  summary: ApplicabilitySummary;
  inspectionId: string;
}

/* ---- Mock applicability evaluation ---- */

const getFieldValue = (
  fields: ExtractedField[],
  type: string
): string => {
  const field = fields.find(f => f.declarationType === type);
  return field?.currentValue ?? '';
};

/**
 * Evaluate which configured demo requirements apply to the package.
 * Results are deterministic based on product category and available data.
 */
export const evaluateApplicability = (
  extractedInfo: ExtractedInformation
): ApplicabilityResult => {
  const { productSummary, fields, inspectionId } = extractedInfo;
  const category = productSummary.productCategory || 'Packaged Food';
  const packageType = productSummary.packageType || 'Pre-packaged commodity';

  // Build applicability conditions from product data
  const conditions: ApplicabilityCondition[] = [
    {
      id: 'cond-category',
      name: 'Product Category',
      value: category,
      source: 'Extracted Product Information',
    },
    {
      id: 'cond-package',
      name: 'Package Type',
      value: packageType,
      source: 'Extracted Product Information',
    },
    {
      id: 'cond-quantity',
      name: 'Quantity',
      value: getFieldValue(fields, 'net_quantity') || '500 g (assumed)',
      source: 'Net Quantity declaration',
    },
    {
      id: 'cond-mrp',
      name: 'MRP Present',
      value: getFieldValue(fields, 'mrp') ? 'Yes' : 'No',
      source: 'MRP declaration',
    },
    {
      id: 'cond-country',
      name: 'Country of Origin',
      value: productSummary.countryOfOrigin || 'India',
      source: 'Country of Origin declaration',
    },
    {
      id: 'cond-manufacturer',
      name: 'Manufacturer Details',
      value: productSummary.manufacturer || 'Not detected',
      source: 'Manufacturer declaration',
    },
  ];

  // Determine which requirements apply based on category
  const isDomestic = productSummary.countryOfOrigin?.toLowerCase().includes('india') ?? true;
  const hasMrp = !!getFieldValue(fields, 'mrp');
  const hasNetQty = !!getFieldValue(fields, 'net_quantity');
  const hasManufacturer = !!productSummary.manufacturer && productSummary.manufacturer !== 'Not detected';
  const hasBatchNo = !!getFieldValue(fields, 'batch_number');
  const hasBestBefore = !!getFieldValue(fields, 'best_before');
  const hasCountry = !!productSummary.countryOfOrigin && productSummary.countryOfOrigin !== 'Not detected';

  const requirements: Requirement[] = [
    // Always applicable for packaged commodities
    {
      id: 'req-mrp',
      name: 'MRP Declaration',
      description: 'Maximum Retail Price must be declared on the package.',
      category: 'price',
      applicabilityStatus: hasMrp ? 'applicable' : 'review_required',
      applicabilityReason: 'Selected because the package is classified as a pre-packaged commodity in the configured demo rules. MRP declaration is mandatory for all pre-packaged goods in India.',
      ruleReference: 'DEMO-RULE-MRP-001',
      conditionsConsidered: [
        `Product category: ${category}`,
        `Package type: ${packageType}`,
        'Mandatory for pre-packaged commodities',
      ],
      reviewFlag: !hasMrp,
      reviewReason: !hasMrp ? 'MRP value was not detected in the package images. Manual verification required.' : undefined,
    },
    {
      id: 'req-net-quantity',
      name: 'Net Quantity Declaration',
      description: 'Net quantity must be clearly declared on the package label.',
      category: 'quantity',
      applicabilityStatus: hasNetQty ? 'applicable' : 'review_required',
      applicabilityReason: 'Selected because the package is classified as a pre-packaged commodity. Net quantity declaration is mandatory.',
      ruleReference: 'DEMO-RULE-QTY-001',
      conditionsConsidered: [
        `Product category: ${category}`,
        'Mandatory for pre-packaged commodities',
      ],
      reviewFlag: !hasNetQty,
      reviewReason: !hasNetQty ? 'Net quantity was not clearly detected. Please verify from the package.' : undefined,
    },
    {
      id: 'req-manufacturer',
      name: 'Manufacturer Details',
      description: 'Name and address of manufacturer, packer, or importer must be declared.',
      category: 'declaration',
      applicabilityStatus: hasManufacturer ? 'applicable' : 'review_required',
      applicabilityReason: 'Selected because the package is a packaged commodity. Manufacturer/packer details are mandatory.',
      ruleReference: 'DEMO-RULE-MFG-001',
      conditionsConsidered: [
        `Product category: ${category}`,
        'Mandatory declaration for packaged goods',
      ],
      reviewFlag: !hasManufacturer,
      reviewReason: !hasManufacturer ? 'Manufacturer details were not clearly detected.' : undefined,
    },
    {
      id: 'req-batch',
      name: 'Batch / Lot Number',
      description: 'Batch number or lot number must be declared for traceability.',
      category: 'declaration',
      applicabilityStatus: hasBatchNo ? 'applicable' : 'not_applicable',
      applicabilityReason: hasBatchNo
        ? 'Selected because batch/lot number is a mandatory declaration for packaged food products.'
        : 'Not applicable — batch number declaration may not be required for all package types in this demo configuration.',
      ruleReference: 'DEMO-RULE-BATCH-001',
      conditionsConsidered: [
        `Product category: ${category}`,
        hasBatchNo ? 'Batch number detected in label' : 'Batch number not detected',
      ],
      reviewFlag: false,
    },
    {
      id: 'req-best-before',
      name: 'Best Before / Expiry Date',
      description: 'Date of minimum durability or expiry must be declared.',
      category: 'declaration',
      applicabilityStatus: hasBestBefore ? 'applicable' : 'review_required',
      applicabilityReason: 'Selected because this is a packaged food product. Best before or expiry date is mandatory.',
      ruleReference: 'DEMO-RULE-EXPIRY-001',
      conditionsConsidered: [
        `Product category: ${category}`,
        'Food product — expiry/best before mandatory',
      ],
      reviewFlag: !hasBestBefore,
      reviewReason: !hasBestBefore ? 'Expiry or best-before date was not clearly detected. Please verify.' : undefined,
    },
    {
      id: 'req-country-origin',
      name: 'Country of Origin',
      description: 'Country of origin must be declared.',
      category: 'country',
      applicabilityStatus: isDomestic ? 'not_applicable' : (hasCountry ? 'applicable' : 'review_required'),
      applicabilityReason: isDomestic
        ? 'Not applicable — the package is manufactured in India. Country of origin declaration is required for imported goods only in this demo configuration.'
        : 'Selected because the product is imported. Country of origin must be declared.',
      ruleReference: 'DEMO-RULE-COUNTRY-001',
      conditionsConsidered: [
        `Country of origin: ${productSummary.countryOfOrigin || 'Not detected'}`,
        isDomestic ? 'Domestic product — COO not mandatory per demo config' : 'Imported product — COO mandatory',
      ],
      reviewFlag: !isDomestic && !hasCountry,
      reviewReason: !isDomestic && !hasCountry ? 'Country of origin was not clearly detected for imported product.' : undefined,
    },
    {
      id: 'req-consumer-care',
      name: 'Consumer Care Details',
      description: 'Manufacturer or marketer address and consumer care contact must be declared.',
      category: 'consumer',
      applicabilityStatus: hasManufacturer ? 'applicable' : 'review_required',
      applicabilityReason: 'Selected because consumer care details are a mandatory declaration for packaged consumer goods.',
      ruleReference: 'DEMO-RULE-CONSUMER-001',
      conditionsConsidered: [
        'Mandatory for packaged consumer goods',
        hasManufacturer ? 'Manufacturer detected' : 'Manufacturer not detected',
      ],
      reviewFlag: !hasManufacturer,
      reviewReason: !hasManufacturer ? 'Consumer care details could not be verified from the label.' : undefined,
    },
    {
      id: 'req-usp',
      name: 'Unit Sale Price',
      description: 'Unit sale price per kg/litre must be declared where applicable.',
      category: 'price',
      applicabilityStatus: 'review_required',
      applicabilityReason: 'Selected because the package weight is 500 g. Unit sale price declaration is applicable for packages below 1 kg or 1 litre in the demo configuration.',
      ruleReference: 'DEMO-RULE-USP-001',
      conditionsConsidered: [
        `Net quantity: ${getFieldValue(fields, 'net_quantity') || 'Not detected'}`,
        'Unit sale price required for packages < 1 kg/1 L per demo config',
      ],
      reviewFlag: true,
      reviewReason: 'Unit sale price declaration could not be clearly verified. Manual review recommended.',
    },
  ];

  // Exceptions / exemptions considered
  const exceptions: ExceptionItem[] = [
    {
      id: 'exc-small-pack',
      name: 'Small Pack Exemption',
      condition: 'Package weight < 10 g',
      result: 'not_triggered',
      explanation: 'Not triggered — the declared quantity (500 g) exceeds the 10 g threshold for this exemption in the demo configuration.',
    },
    {
      id: 'exc-horeca',
      name: 'Horeca Exemption',
      condition: 'Hotel / Restaurant / Catering supply',
      result: 'not_triggered',
      explanation: 'Not triggered — the package is identified as a retail packaged product. This exemption applies only to bulk/horeca supplies.',
    },
    {
      id: 'exc-essential',
      name: 'Essential Commodities',
      condition: 'Essential commodity under price control',
      result: 'not_triggered',
      explanation: 'Not triggered — this product is not identified as an essential commodity under price control in the demo configuration.',
    },
  ];

  // Build summary
  const summary: ApplicabilitySummary = {
    applicableCount: requirements.filter(r => r.applicabilityStatus === 'applicable').length,
    notApplicableCount: requirements.filter(r => r.applicabilityStatus === 'not_applicable').length,
    reviewRequiredCount: requirements.filter(r => r.applicabilityStatus === 'review_required').length,
    conditionsEvaluatedCount: conditions.length,
  };

  return {
    success: true,
    errorMessage: null,
    productCategory: category,
    packageType,
    conditions,
    requirements,
    exceptions,
    summary,
    inspectionId,
  };
};

/* ---- Build summary from requirements ---- */

export const buildApplicabilitySummary = (requirements: Requirement[]): ApplicabilitySummary => ({
  applicableCount: requirements.filter(r => r.applicabilityStatus === 'applicable').length,
  notApplicableCount: requirements.filter(r => r.applicabilityStatus === 'not_applicable').length,
  reviewRequiredCount: requirements.filter(r => r.applicabilityStatus === 'review_required').length,
  conditionsEvaluatedCount: 0,
});
