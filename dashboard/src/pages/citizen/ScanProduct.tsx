import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { ImageUploader } from '../../components/scanner/ImageUploader';
import { UploadProgress } from '../../components/scanner/UploadProgress';
import { ImagePreview } from '../../components/scanner/ImagePreview';
import { ScanStatusBadge } from '../../components/scanner/ScanStatusBadge';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { scanService } from '../../services/scanService';
import { ScanRecord, InspectionSession, InspectionEvidence, RuleViolation } from '../../types/scan';
import { parseUploadError } from '../../utils/errorUtils';
import { CheckCircle2, AlertOctagon, RotateCcw, FileText, History, XCircle } from 'lucide-react';

export const ScanProduct: React.FC = () => {
  const navigate = useNavigate();

  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('Packaged Foods');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [scanStage, setScanStage] = useState<number>(1);
  const [createdScan, setCreatedScan] = useState<ScanRecord | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const [scanResult, setScanResult] = useState<{
    session: InspectionSession;
    evidence: InspectionEvidence;
    violations: RuleViolation[];
  } | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setCreatedScan(null);
    setScanResult(null);
    setScanError(null);
  };

  const handleStartScan = async () => {
    if (!selectedFile) return;

    setIsScanning(true);
    setScanStage(1);
    setScanError(null);

    // 1. Create Scan Record via Axios -> POST /api/scans -> FastAPI
    try {
      const scanData = await scanService.createScan(selectedFile, productName, category);
      setCreatedScan(scanData);
    } catch (err) {
      const userErr = parseUploadError(err);
      setScanError(userErr);
      setIsScanning(false);
      return;
    }

    // 2. Simulate pipeline stage transitions for complete inspection verdict
    setTimeout(() => setScanStage(2), 700);
    setTimeout(() => setScanStage(3), 1500);

    setTimeout(async () => {
      try {
        const res = await scanService.uploadAndScan(selectedFile, productName, category);
        setScanResult({
          session: res.session,
          evidence: res.evidence || res.session.evidence?.[0],
          violations: res.violations || res.session.violations || [],
        });
      } catch (err) {
        setScanError(parseUploadError(err));
      } finally {
        setIsScanning(false);
      }
    }, 2200);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setCreatedScan(null);
    setScanResult(null);
    setScanError(null);
    setIsScanning(false);
  };

  return (
    <PageContainer
      title="Commodity Label Compliance Scanner"
      subtitle="Scan packaged commodity labels to evaluate mandatory declarations against Legal Metrology Rules, 2011."
      action={
        <Button variant="secondary" leftIcon={<History size={16} />} onClick={() => navigate('/dashboard/citizen/history')}>
          View Scan History
        </Button>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
        {/* Upload Form Card */}
        {!scanResult && (
          <div
            style={{
              padding: '28px',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <Input
                label="Product Name (Optional)"
                placeholder="e.g. Brand Almond Milk 1L"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                disabled={isScanning}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1' }}>
                  Commodity Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={isScanning}
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

            {/* Error Banner */}
            {scanError && (
              <div
                style={{
                  padding: '18px 22px',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: '14px',
                  color: '#f87171',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <XCircle size={24} color="#ef4444" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{scanError}</span>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setScanError(null)}>
                  Dismiss
                </Button>
              </div>
            )}

            {/* Created Scan Status Banner */}
            {createdScan && !scanError && (
              <div
                style={{
                  padding: '20px 24px',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CheckCircle2 size={28} color="#10b981" />
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#10b981' }}>✅ Scan Created</h4>
                    <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '2px' }}>
                      FastAPI DB record created for <strong style={{ color: '#f8fafc' }}>{createdScan.originalFilename}</strong>
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Scan ID</span>
                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#6366f1' }}>#{createdScan.id}</div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Status</span>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f59e0b' }}>{createdScan.status}</div>
                  </div>
                </div>
              </div>
            )}

            {!previewUrl ? (
              <ImageUploader onImageSelected={handleFileSelect} disabled={isScanning} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <ImagePreview
                  imageUrl={previewUrl}
                  file={selectedFile}
                  showBoundingBoxes={false}
                  onStartScan={handleStartScan}
                  onChangeImage={handleReset}
                  isScanning={isScanning}
                />
              </div>
            )}

            {isScanning && <UploadProgress currentStage={scanStage} />}
          </div>
        )}

        {/* Scan Results View */}
        {scanResult && (
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
              }}
            >
              <div>
                <span style={{ fontSize: '0.8rem', color: '#6366f1', fontWeight: 700, textTransform: 'uppercase' }}>
                  Session ID: {scanResult.session.id}
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>
                  {scanResult.session.productName}
                </h2>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  Category: {scanResult.session.category} • Scanned on {new Date(scanResult.session.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <ScanStatusBadge status={scanResult.session.complianceStatus} size="lg" />
                <Button variant="secondary" leftIcon={<RotateCcw size={16} />} onClick={handleReset}>
                  Scan Another Label
                </Button>
              </div>
            </div>

            {/* Bounding Box Image Preview + Extracted Fields Grid */}
            <ImagePreview
              imageUrl={scanResult.evidence.imageUrl}
              boundingBoxes={scanResult.evidence.boundingBoxJson}
              showBoundingBoxes={true}
            />

            {/* Legal Metrology Violations Breakdown */}
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
                <FileText size={20} color="#6366f1" /> Legal Rule Evaluation (PCR 2011)
              </h3>

              {scanResult.violations.length === 0 ? (
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {scanResult.violations.map((v) => (
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
