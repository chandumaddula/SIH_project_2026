import React from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { VerificationPanel } from '../../components/scanner/VerificationPanel';
import { ProductField } from '../../components/scanner/ProductField';
import { ProductVerificationResult } from '../../types/product';
import { PackageCheck } from 'lucide-react';

export const VerifyProduct: React.FC = () => {
  const verificationData: ProductVerificationResult = {
    productId: 'PROD-8819',
    productName: 'Organic Whole Milk 1L',
    isCompliant: true,
    complianceScore: 0.96,
    declarations: {
      mrp: 68.0,
      netQuantity: '1 L',
      mfgDate: '25/08/2026',
      manufacturerName: 'Amul Dairy Anand Gujarat',
      consumerCare: '1800-258-3333',
    },
    violations: [],
  };

  return (
    <PageContainer
      title="Official Legal Metrology Product Verification"
      subtitle="Verify package label declarations against Legal Metrology Rules, 2011 (PCR 2011) compliance benchmarks."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <VerificationPanel result={verificationData} />

        <div style={{ padding: '24px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PackageCheck size={20} color="#6366f1" /> Label Declarations Breakdown
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            <ProductField label="MRP Declaration" value={`Rs ${verificationData.declarations.mrp?.toFixed(2)} (Incl. of all taxes)`} confidence={0.98} />
            <ProductField label="Net Quantity" value={verificationData.declarations.netQuantity || ''} confidence={0.96} />
            <ProductField label="Manufacturing Date" value={verificationData.declarations.mfgDate || ''} confidence={0.94} />
            <ProductField label="Manufacturer Details" value={verificationData.declarations.manufacturerName || ''} confidence={0.92} />
            <ProductField label="Consumer Helpline" value={verificationData.declarations.consumerCare || ''} confidence={0.95} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
