import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { MultiAngleScanner } from '../../components/scanner/MultiAngleScanner';
import { ImagePreview } from '../../components/scanner/ImagePreview';
import { ScanStatusBadge } from '../../components/scanner/ScanStatusBadge';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { InspectionSession } from '../../types/scan';
import { CheckCircle2, AlertOctagon, RotateCcw, FileText, History, ShieldAlert } from 'lucide-react';

export const OfficerScan: React.FC = () => {
  const navigate = useNavigate();

  const [productName, setProductName] = useState('Commodity Sample Item');
  const [category, setCategory] = useState('Packaged Foods');
  const [sessionResult, setSessionResult] = useState<InspectionSession | null>(null);

  const handleAuditComplete = (session: InspectionSession) => {
    setSessionResult(session);
  };

  const handleReset = () => {
    setSessionResult(null);
  };

  return (
    <PageContainer
      title="Official Enforcement Package Inspection"
      subtitle="Officer workflow for multi-angle package capture, OCR declaration extraction, and PCR 2011 compliance rule verification."
      action={
        <Button variant="secondary" leftIcon={<History size={16} />} onClick={() => navigate('/dashboard/officer/history')}>
          View Inspection History
        </Button>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
        {!sessionResult ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Commodity Metadata Configuration Card */}
            <div
              style={{
                padding: '24px',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '16px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
              }}
            >
              <Input
                label="Sample / Commodity Name"
                placeholder="e.g. Premium Sunflower Oil 1L"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1' }}>
                  Commodity Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    padding: '10px 14px',
                    backgroundColor: '#0f172a',
                    color: '#f8fafc',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    outline: 'none',
                  }}
                >
                  <option value="Packaged Foods">Packaged Foods & Confectionery</option>
                  <option value="Dairy Products">Dairy Products & Milk</option>
                  <option value="Edible Oils">Edible Oils & Fats</option>
                  <option value="Grains & Pulses">Grains, Flour & Cereals</option>
                  <option value="Cosmetics & Personal Care">Cosmetics & Personal Care</option>
                  <option value="Household Goods">Household Goods & Cleaners</option>
                </select>
              </div>
            </div>

            {/* Official Multi-Angle Camera Scanner */}
            <MultiAngleScanner
              productName={productName}
              category={category}
              onComplete={handleAuditComplete}
            />
          </div>
        ) : (
          /* Official Inspection Result & Violation Notice Card */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Verdict Header Banner */}
            <div
              style={{
                padding: '24px 32px',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              <div>
                <span style={{ fontSize: '0.8rem', color: '#6366f1', fontWeight: 700, textTransform: 'uppercase' }}>
                  Official Session ID: {sessionResult.id}
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>
                  {sessionResult.productName}
                </h2>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  Category: {sessionResult.category} • Inspected on {new Date(sessionResult.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <ScanStatusBadge status={sessionResult.complianceStatus} size="lg" />
                <Button variant="secondary" leftIcon={<RotateCcw size={16} />} onClick={handleReset}>
                  New Inspection
                </Button>
              </div>
            </div>

            {/* Multi-angle evidence preview */}
            {sessionResult.evidence?.[0] && (
              <ImagePreview
                imageUrl={sessionResult.evidence[0].imageUrl}
                boundingBoxes={sessionResult.evidence[0].boundingBoxJson}
                showBoundingBoxes={true}
              />
            )}

            {/* Rule Violation Notice Breakdown */}
            <div
              style={{
                padding: '24px',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} color="#6366f1" /> Legal Metrology Rule Verdict (PCR 2011)
              </h3>

              {!sessionResult.violations || sessionResult.violations.length === 0 ? (
                <div
                  style={{
                    padding: '20px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <CheckCircle2 size={24} />
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Full Legal Metrology Compliance Confirmed</h4>
                    <p style={{ fontSize: '0.85rem', marginTop: '2px', color: '#cbd5e1' }}>
                      All mandatory declarations (MRP formatting, Net Qty, Date of Mfg, Manufacturer/Packer identity & Customer Helpline) strictly adhere to PCR 2011 Rule 6.
                    </p>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ padding: '12px 16px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#ef4444', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldAlert size={18} /> Official Legal Violations Found - Action Required
                  </div>

                  {sessionResult.violations.map((v) => (
                    <div
                      key={v.id}
                      style={{
                        padding: '16px 20px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(239, 68, 68, 0.12)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <AlertOctagon size={16} /> [{v.severity}] Rule Violation: {v.ruleId}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                          {v.legalReference}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: '#f8fafc', fontWeight: 500 }}>
                        {v.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};
