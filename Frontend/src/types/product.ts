/* ==========================================================================
   Product Types
   Task M — Product Repository

   The product repository is a derived view of existing inspections.
   It groups inspections by product name and enriches with manufacturer,
   category, barcode, packer/importer where available in the existing
   data set.

   IMPORTANT:
   - No real product database; values come from the existing mock data
     (inspections, extracted information, complaints).
   - Do not invent legal or product information.
   ========================================================================== */

import { ComplianceResultStatus } from '../services/inspection.service';
import { VerificationStatus } from '../services/verification.service';

export type ProductCategory =
  | 'Food & Beverages'
  | 'Pharmaceuticals'
  | 'Home & Kitchen'
  | 'Health & Supplements'
  | 'Personal Care'
  | 'Electronics'
  | 'Other';

export interface Product {
  id: string;
  name: string;
  genericDescription?: string;
  manufacturer: string;
  packer?: string;
  importer?: string;
  category: ProductCategory;
  packageType?: string;
  barcode?: string;
  countryOfOrigin?: string;
  inspectionIds: string[];
  lastInspectionDate?: string;
  lastInspectionId?: string;
  inspectionCount: number;
  complianceStatus: ComplianceResultStatus;
  verificationStatus: VerificationStatus;
  passCount: number;
  reviewRequiredCount: number;
  potentialIssueCount: number;
}

export interface ProductFilter {
  search?: string;
  category?: ProductCategory | 'all';
  complianceStatus?: ComplianceResultStatus | 'all';
  manufacturer?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ProductSummary {
  total: number;
  inspected: number;
  requiresReview: number;
  potentialIssues: number;
}
