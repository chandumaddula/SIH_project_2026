export interface ProductDeclaration {
  mrp?: number;
  netQuantity?: string;
  mfgDate?: string;
  manufacturerName?: string;
  manufacturerAddress?: string;
  consumerCare?: string;
}

export interface ProductData {
  id?: number | string;
  productName: string;
  category: string;
  brandName?: string;
  declarations: ProductDeclaration;
}

export interface ProductVerificationResult {
  productId?: string;
  productName: string;
  isCompliant: boolean;
  complianceScore: number;
  declarations: ProductDeclaration;
  violations: Array<{
    ruleId: string;
    description: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
}
