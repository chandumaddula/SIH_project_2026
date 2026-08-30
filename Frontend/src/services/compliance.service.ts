/* ==========================================================================
   Compliance Service
   Mock compliance screening for the Employee inspection workflow.

   Evaluates extracted product information against the applicable
   configured requirements.

   IMPORTANT:
   - This is a frontend DEMO. No real legal rules engine.
   - All rule references are DEMO-* identifiers, not real legislation.
   - Final compliance determination is made by the authorized officer.
   - Statuses: PASS | REVIEW REQUIRED | POTENTIAL ISSUE
   - Never reports "LEGAL VIOLATION CONFIRMED" or any final legal decision.

   Replace with a real rules engine / backend when available.
   ========================================================================== */

import { ExtractedInformation, ExtractedField } from './extractedInfo.service';
import { ApplicabilityResult } from './applicability.service';

/* ---- Types ---- */

export type ComplianceStatus = 'pass' | 'review_required' | 'potential_issue' | 'not_applicable';

export interface ComplianceEvidence {
  sourceImageType: string; // e.g., "Back Label Image"
  hasSource: boolean; // false if no real evidence is attached
}

export interface RuleTraceStep {
  step: string;
  value: string;
  status: 'pass' | 'pending' | 'fail';
}

export interface RuleTrace {
  requirementName: string;
  steps: RuleTraceStep[];
  finalResult: ComplianceStatus;
}

export interface ComplianceCheck {
  id: string;
  requirementId: string;
  requirementName: string;
  extractedValue: string;
  expectedCondition: string;
  status: ComplianceStatus;
  confidence: number;
  confidenceLevel: 'high' | 'medium' | 'low';
  ruleReference: string; // DEMO-RULE-*
  evidence: ComplianceEvidence;
  explanation: string;
  recommendedAction: string;
  ruleTrace: RuleTrace;
}

export interface ComplianceSummary {
  totalChecks: number;
  passCount: number;
  reviewRequiredCount: number;
  potentialIssueCount: number;
  notApplicableCount: number;
}

export interface ComplianceResult {
  success: boolean;
  errorMessage: string | null;
  overallStatus: ComplianceStatus; // worst-case of all checks
  overallLabel: string;
  overallMessage: string;
  checks: ComplianceCheck[];
  summary: ComplianceSummary;
  inspectionId: string;
}

/* ---- Helpers ---- */

const getConfidenceLevel = (confidence: number): 'high' | 'medium' | 'low' => {
  if (confidence >= 90) return 'high';
  if (confidence >= 70) return 'medium';
  return 'low';
};

const getFieldByType = (
  fields: ExtractedField[],
  type: string
): ExtractedField | undefined => fields.find(f => f.declarationType === type);

/* ---- Rule reference helpers (all DEMO identifiers) ---- */

const getRuleReference = (requirementId: string): string => {
  const map: Record<string, string> = {
    'req-mrp': 'DEMO-RULE-MRP-001',
    'req-net-quantity': 'DEMO-RULE-QTY-001',
    'req-manufacturer': 'DEMO-RULE-MFG-001',
    'req-batch': 'DEMO-RULE-BATCH-001',
    'req-best-before': 'DEMO-RULE-EXPIRY-001',
    'req-country-origin': 'DEMO-RULE-COUNTRY-001',
    'req-consumer-care': 'DEMO-RULE-CARE-001',
    'req-usp': 'DEMO-RULE-USP-001',
  };
  return map[requirementId] ?? `DEMO-RULE-${requirementId.toUpperCase()}`;
};

const getExpectedCondition = (requirementId: string, _extractedValue: string): string => {
  switch (requirementId) {
    case 'req-mrp':
      return 'MRP must be declared on the package (demo configured).';
    case 'req-net-quantity':
      return 'Net quantity must be declared (demo configured).';
    case 'req-manufacturer':
      return 'Manufacturer name and address must be declared (demo configured).';
    case 'req-batch':
      return 'Batch/lot number must be declared for traceability (demo configured).';
    case 'req-best-before':
      return 'Best before / expiry date must be declared (demo configured).';
    case 'req-country-origin':
      return 'Country of origin must be declared (demo configured).';
    case 'req-consumer-care':
      return 'Consumer care details must be present (demo configured).';
    case 'req-usp':
      return 'Unit sale price required for packages < 1 kg / 1 L (demo configured).';
    default:
      return 'Configured demo condition';
  }
};

const getRecommendedAction = (status: ComplianceStatus): string => {
  switch (status) {
    case 'pass':
      return 'No action required at this stage.';
    case 'review_required':
      return 'Officer verification required.';
    case 'potential_issue':
      return 'Officer verification required — configured check identified a potential issue.';
    case 'not_applicable':
      return 'Not applicable for this package.';
  }
};

/* ---- Build rule trace ---- */

const buildRuleTrace = (
  check: { requirementName: string; extractedValue: string; status: ComplianceStatus; evidence: ComplianceEvidence }
): RuleTrace => {
  const hasValue = check.extractedValue && check.extractedValue !== 'Not detected' && check.extractedValue !== 'Not clearly detected';
  const statusToTrace = (s: 'pass' | 'pending' | 'fail') => s;

  return {
    requirementName: check.requirementName,
    steps: [
      {
        step: 'Extracted Information',
        value: check.extractedValue || '(none detected)',
        status: hasValue ? statusToTrace('pass') : statusToTrace('pending'),
      },
      {
        step: 'Applicable Requirement',
        value: check.requirementName,
        status: 'pass',
      },
      {
        step: 'Configured Check',
        value: 'Demo configured rule',
        status: 'pass',
      },
      {
        step: 'Result',
        value: check.status.toUpperCase().replace('_', ' '),
        status: check.status === 'pass' ? statusToTrace('pass') : check.status === 'review_required' ? statusToTrace('pending') : statusToTrace('fail'),
      },
      {
        step: 'Evidence',
        value: check.evidence.sourceImageType,
        status: check.evidence.hasSource ? statusToTrace('pass') : statusToTrace('pending'),
      },
    ],
    finalResult: check.status,
  };
};

/* ---- Core service ---- */

/**
 * Run mock compliance checks against the applicable requirements.
 * Returns a ComplianceResult with per-check status, confidence, evidence,
 * explanation, recommended action, and rule trace.
 */
export const runComplianceChecks = (
  extractedInfo: ExtractedInformation,
  applicability: ApplicabilityResult
): ComplianceResult => {
  const checks: ComplianceCheck[] = [];

  // Evaluate each applicable requirement
  for (const req of applicability.requirements) {
    // Skip not-applicable requirements (per spec: not treated as failed)
    if (req.applicabilityStatus === 'not_applicable') {
      checks.push({
        id: `check-${req.id}`,
        requirementId: req.id,
        requirementName: req.name,
        extractedValue: '',
        expectedCondition: 'Requirement not applicable for this package.',
        status: 'not_applicable',
        confidence: 0,
        confidenceLevel: 'high',
        ruleReference: getRuleReference(req.id),
        evidence: { sourceImageType: '—', hasSource: false },
        explanation: 'This requirement was not selected as applicable for this package in the configured demo rules.',
        recommendedAction: 'No action required.',
        ruleTrace: buildRuleTrace({
          requirementName: req.name,
          extractedValue: '',
          status: 'not_applicable',
          evidence: { sourceImageType: '—', hasSource: false },
        }),
      });
      continue;
    }

    // Look up the extracted value for this requirement
    let field: ExtractedField | undefined;
    switch (req.id) {
      case 'req-mrp': field = getFieldByType(extractedInfo.fields, 'mrp'); break;
      case 'req-net-quantity': field = getFieldByType(extractedInfo.fields, 'net_quantity'); break;
      case 'req-manufacturer': field = getFieldByType(extractedInfo.fields, 'manufacturer'); break;
      case 'req-batch': field = getFieldByType(extractedInfo.fields, 'batch_number'); break;
      case 'req-best-before': field = getFieldByType(extractedInfo.fields, 'best_before'); break;
      case 'req-country-origin': field = getFieldByType(extractedInfo.fields, 'country'); break;
      case 'req-consumer-care': field = getFieldByType(extractedInfo.fields, 'marketed_by'); break;
      case 'req-usp': field = getFieldByType(extractedInfo.fields, 'mrp'); break;
    }

    const extractedValue = field?.currentValue || '';
    const fieldConfidence = field?.confidence ?? 0;

    // Determine status based on extracted data + confidence + applic context
    let status: ComplianceStatus = 'pass';
    let explanation = '';
    let confidence = fieldConfidence;

    if (req.applicabilityStatus === 'review_required' || !extractedValue || extractedValue === 'Not detected') {
      status = 'review_required';
      confidence = fieldConfidence || 61; // demo low confidence
      explanation = !extractedValue
        ? 'The configured demo check could not identify the required declaration. Officer verification required.'
        : 'The configured demo check flagged this declaration for officer review due to insufficient confidence.';
    } else if (fieldConfidence < 70) {
      status = 'review_required';
      explanation = 'The extracted value is below the configured demo confidence threshold. Officer verification required.';
    } else if (fieldConfidence >= 90) {
      status = 'pass';
      explanation = 'The extracted value matches the configured demo check. No potential issue identified at this stage.';
    } else {
      // 70-89: medium confidence
      status = 'pass';
      explanation = 'The extracted value matches the configured demo check. Medium demo confidence — still pass.';
    }

    // Special case: simulate one potential issue for demo
    if (req.id === 'req-usp') {
      // USP always demo'd as potential issue
      status = 'potential_issue';
      confidence = 87;
      explanation = 'The configured demo check could not confirm the unit sale price declaration on the package. This is a demo potential-issue scenario — officer verification required.';
    }

    const sourceImageType = field?.sourceImageType ?? 'Label Image';

    const check: ComplianceCheck = {
      id: `check-${req.id}`,
      requirementId: req.id,
      requirementName: req.name,
      extractedValue: extractedValue || 'Not clearly detected',
      expectedCondition: getExpectedCondition(req.id, extractedValue),
      status,
      confidence,
      confidenceLevel: getConfidenceLevel(confidence),
      ruleReference: getRuleReference(req.id),
      evidence: { sourceImageType, hasSource: !!field },
      explanation,
      recommendedAction: getRecommendedAction(status),
      ruleTrace: buildRuleTrace({
        requirementName: req.name,
        extractedValue,
        status,
        evidence: { sourceImageType, hasSource: !!field },
      }),
    };

    checks.push(check);
  }

  // Build summary
  const summary: ComplianceSummary = {
    totalChecks: checks.length,
    passCount: checks.filter(c => c.status === 'pass').length,
    reviewRequiredCount: checks.filter(c => c.status === 'review_required').length,
    potentialIssueCount: checks.filter(c => c.status === 'potential_issue').length,
    notApplicableCount: checks.filter(c => c.status === 'not_applicable').length,
  };

  // Overall status = worst case (most severe)
  let overallStatus: ComplianceStatus = 'pass';
  if (summary.potentialIssueCount > 0) overallStatus = 'potential_issue';
  else if (summary.reviewRequiredCount > 0) overallStatus = 'review_required';

  const overallLabel =
    overallStatus === 'pass' ? 'PASS' :
    overallStatus === 'review_required' ? 'REVIEW REQUIRED' :
    overallStatus === 'potential_issue' ? 'POTENTIAL ISSUE' : 'PASS';

  const overallMessage =
    overallStatus === 'pass'
      ? 'No potential issue was detected by the configured mock check.'
      : overallStatus === 'review_required'
        ? 'Some configured checks require officer review.'
        : 'A configured check identified a potential issue that requires officer review.';

  return {
    success: true,
    errorMessage: null,
    overallStatus,
    overallLabel,
    overallMessage,
    checks,
    summary,
    inspectionId: extractedInfo.inspectionId,
  };
};
