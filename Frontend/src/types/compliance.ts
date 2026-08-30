export interface ComplianceResult {
  id: string;
  scanId: string;
  product: string;
  compliant: boolean;
  missingInfo: string[];
  inspectedAt: string;
  inspector: string;
  notes?: string;
}