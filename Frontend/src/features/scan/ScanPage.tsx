import React, { useState } from 'react';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Badge } from '../../components/Badge';
import { useUserStore } from '../../store';
import { ScanResult } from '../../types/scan';
import { AIScanResponse } from '../../types/scan';
import { mockScanResults } from '../../services/mockData';
import { scanService } from '../../services/api';
import { CameraView } from './CameraView';
import { EmptyState } from '../../components/EmptyState';

type PipelineStep = 'idle' | 'image_processing' | 'ocr' | 'ai_extraction' | 'structured_data' | 'rule_engine' | 'complete';

const pipelineStepsConfig: { id: PipelineStep; title: string; desc: string }[] = [
  { id: 'image_processing', title: '1. Image Processing', desc: 'Quality score, perspective correction & label ROI detection' },
  { id: 'ocr', title: '2. OCR Engine', desc: 'Raw text extraction & bounding boxes [x, y, w, h]' },
  { id: 'ai_extraction', title: '3. AI Detection', desc: 'MRP, Net Qty, Manufacturer, Dates, Consumer Care' },
  { id: 'structured_data', title: '4. Structured Data', desc: 'Synthesizing validated product attributes' },
  { id: 'rule_engine', title: '5. Rule Engine', desc: 'PCR 2011 Legal Metrology Compliance Check' }
];

// -----------------------------------------------------------------------
// Helper: format snake_case field names to readable labels
// -----------------------------------------------------------------------
function formatFieldName(name: string): string {
  const map: Record<string, string> = {
    mrp: 'MRP',
    net_quantity: 'Net Quantity',
    product_name: 'Product Name',
    manufacturer: 'Manufacturer',
    packer: 'Packer',
    importer: 'Importer',
    consumer_care: 'Consumer Care',
    country_of_origin: 'Country of Origin',
    address: 'Address',
    mfg_date: 'Manufacturing Date',
    exp_date: 'Expiry Date',
    batch_number: 'Batch Number',
    barcode: 'Barcode',
    fssai_license: 'FSSAI License',
    generic_name: 'Generic Name',
  };
  if (map[name]) return map[name];
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

// -----------------------------------------------------------------------
// Compliance Banner
// -----------------------------------------------------------------------
function ComplianceBanner({ screening }: { screening: AIScanResponse['rule_engine_screening'] }) {
  const resultClass = screening.result;
  const icons: Record<string, string> = {
    no_issue: '✅',
    review_recommended: '⚠️',
    potential_violation: '❌',
  };
  const variantMap: Record<string, 'success' | 'warning' | 'error'> = {
    no_issue: 'success',
    review_recommended: 'warning',
    potential_violation: 'error',
  };

  return (
    <div className={`scan__compliance scan__compliance--${resultClass}`}>
      <div className="scan__compliance-icon">{icons[resultClass] || '❓'}</div>
      <div className="scan__compliance-text">
        <strong>{screening.compliance_status.replace('_', ' ')}</strong>
        <span>{screening.explanation}</span>
      </div>
      <div className="scan__compliance-right">
        <Badge variant={variantMap[resultClass] || 'neutral'}>
          {Math.round(screening.confidence * 100)}% confidence
        </Badge>
        {screening.flags.length > 0 && (
          <div className="scan__compliance-flags">
            {screening.flags.slice(0, 3).map((flag, i) => (
              <Badge key={i} variant="warning" size="sm">{flag}</Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
// Field Evidence Card
// -----------------------------------------------------------------------
function FieldEvidenceCard({ field }: { field: AIScanResponse['field_evidences'][0] }) {
  const pct = Math.round(field.confidence * 100);
  const barColor = pct >= 80 ? '#4caf50' : pct >= 60 ? '#ff9800' : '#f44336';

  return (
    <div className="scan__field-card">
      <div className="scan__field-header">
        <span className="scan__field-label">{formatFieldName(field.field)}</span>
        <span className="scan__field-conf">{pct}%</span>
      </div>
      <div className="scan__field-value">
        {field.value !== null && field.value !== undefined && String(field.value).trim()
          ? String(field.value)
          : <span className="scan__field-empty">Not detected</span>}
      </div>
      <div className="scan__field-bar">
        <div
          className="scan__field-bar-fill"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
      {field.source_text && (
        <div className="scan__field-source">
          Source: &ldquo;{field.source_text}&rdquo;
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------
// Violations Panel
// -----------------------------------------------------------------------
function ViolationsPanel({ violations }: { violations: AIScanResponse['rule_engine_screening']['violations'] }) {
  if (!violations || violations.length === 0) return null;
  return (
    <div className="scan__violations">
      <h4 className="scan__section-title">⚠️ Detected Violations</h4>
      {violations.map((v, i) => (
        <div key={i} className="scan__violation-item">
          <Badge variant="error" size="sm">{v.severity}</Badge>
          <span className="scan__violation-desc">{v.description}</span>
          {v.rule_id && <code className="scan__violation-rule">{v.rule_id}</code>}
        </div>
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------
// Main ScanPage
// -----------------------------------------------------------------------
export const ScanPage: React.FC = () => {
  const { user } = useUserStore();
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [apiResult, setApiResult] = useState<AIScanResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<PipelineStep>('idle');
  const [error, setError] = useState<string | null>(null);

  const recentScans = mockScanResults;

  // -----------------------------------------------------------------------
  // handleCapture — calls the real backend API
  // -----------------------------------------------------------------------
  const handleCapture = async (imageData: string) => {
    setLoading(true);
    setError(null);
    setCurrentStep('image_processing');

    try {
      // Convert data URL to File
      const imgResponse = await fetch(imageData);
      const blob = await imgResponse.blob();
      const file = new File([blob], 'capture.jpg', {
        type: blob.type || 'image/jpeg',
      });

      // Advance through pipeline steps to show visual feedback
      await new Promise(r => setTimeout(r, 150));
      setCurrentStep('ocr');

      // Call real AI pipeline on the backend
      setCurrentStep('ai_extraction');
      const result = await scanService.scanPackage(file);

      await new Promise(r => setTimeout(r, 150));
      setCurrentStep('structured_data');

      await new Promise(r => setTimeout(r, 150));
      setCurrentStep('rule_engine');

      await new Promise(r => setTimeout(r, 150));
      setCurrentStep('complete');

      // Store real API result
      setApiResult(result);

      // Map to existing ScanResult shape for compatibility
      const mapped: ScanResult = {
        id: result.scan_id,
        imageUrl: imageData,
        capturedAt: new Date().toISOString(),
        detected: {
          productName: result.extracted_declarations?.productName as string || undefined,
          mfgDate: result.extracted_declarations?.mfgDate as string || undefined,
          expDate: result.extracted_declarations?.expDate as string || undefined,
          batchNumber: result.extracted_declarations?.batchNumber as string || undefined,
          licenseNumber: result.extracted_declarations?.fssaiLicense as string || undefined,
          weight: result.extracted_declarations?.netQuantity as string || undefined,
          mrp: result.extracted_declarations?.mrp as string || undefined,
          manufacturer: result.extracted_declarations?.manufacturer as string || undefined,
          countryOfOrigin: result.extracted_declarations?.countryOfOrigin as string || undefined,
          consumerCare: result.extracted_declarations?.consumerCare as string || undefined,
        },
        missing: result.field_evidences
          .filter(f => !f.value || String(f.value).trim() === '')
          .map(f => formatFieldName(f.field)),
        isCompliant: result.rule_engine_screening?.result === 'no_issue',
        inspectorId: user?.id || 'emp-001',
      };
      setScanResult(mapped);
    } catch (err: any) {
      setError(err.message || 'Scan failed. Please check that the backend is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------------------------------
  // handleFileChange
  // -----------------------------------------------------------------------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      setSelectedImage(imageData);
      setShowUpload(false);
      handleCapture(imageData);
    };
    reader.onerror = () => setShowUpload(false);
    reader.readAsDataURL(file);
  };

  // -----------------------------------------------------------------------
  // handleReset
  // -----------------------------------------------------------------------
  const handleReset = () => {
    setSelectedImage(null);
    setScanResult(null);
    setApiResult(null);
    setShowUpload(false);
    setIsCameraOpen(false);
    setCurrentStep('idle');
    setError(null);
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className="page">
      <h1 className="page-title">Scan / Upload Package</h1>

      {/* Warning banner */}
      <div className="scan__warning">
        <span className="scan__warning-icon">⚠️</span>
        <span className="scan__warning-text">
          Camera access requires a secure context (HTTPS) in production.
          For development on localhost, camera access may be available depending
          on browser settings. File upload is always available.
        </span>
      </div>

      {/* Error banner */}
      {error && (
        <div className="scan__error">
          <div className="scan__error-msg">
            <strong>❌ Error:</strong> {error}
          </div>
          <Button variant="ghost" size="sm" onClick={() => setError(null)}>Dismiss</Button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="scan__actions">
        <Button
          variant="primary"
          size="lg"
          fullWidth={true}
          onClick={() => setIsCameraOpen(true)}
          disabled={loading}
        >
          {loading ? 'Analyzing Package...' : 'Open Camera'}
        </Button>
        <Button
          variant="secondary"
          size="lg"
          fullWidth={true}
          onClick={() => setShowUpload(true)}
          disabled={loading}
        >
          Upload Image
        </Button>
      </div>

      {/* Pipeline Stepper Visualizer */}
      {loading && (
        <Card className="pipeline__card">
          <CardHeader>
            <CardTitle>⚡ AI / OCR Package Analysis Pipeline</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="pipeline__steps">
              {pipelineStepsConfig.map((step, idx) => {
                const stepOrder: PipelineStep[] = ['image_processing', 'ocr', 'ai_extraction', 'structured_data', 'rule_engine', 'complete'];
                const currentIdx = stepOrder.indexOf(currentStep);
                const isDone = currentIdx > idx;
                const isCurrent = currentStep === step.id;

                return (
                  <div key={step.id} className={`pipeline__step ${isDone ? 'pipeline__step--done' : ''} ${isCurrent ? 'pipeline__step--active' : ''}`}>
                    <div className="pipeline__step-indicator">
                      {isDone ? '✓' : idx + 1}
                    </div>
                    <div className="pipeline__step-info">
                      <div className="pipeline__step-title">{step.title}</div>
                      <div className="pipeline__step-desc">{step.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Camera Modal */}
      {isCameraOpen && (
        <div className="scan__modal-backdrop" onClick={() => !loading && setIsCameraOpen(false)}>
          <div className="scan__modal">
            <div className="scan__modal-header">
              <h2 className="scan__modal-title">Camera Scanner</h2>
              <button className="scan__modal-close" onClick={() => setIsCameraOpen(false)} aria-label="Close camera">✕</button>
            </div>
            <div className="scan__modal-body">
              <CameraView onCapture={handleCapture} onClose={() => setIsCameraOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* File Upload */}
      {showUpload && (
        <div className="scan__upload">
          <div className="scan__upload-header">
            <h2>Upload Image</h2>
            <button className="scan__upload-close" onClick={() => setShowUpload(false)}>✕</button>
          </div>
          <div className="scan__upload-body">
            <p>Select an image file to scan</p>
            <Input
              type="file"
              id="fileUpload"
              accept="image/*"
              onChange={handleFileChange}
              fullWidth={true}
            />
            <p className="scan__upload-note">
              Supported formats: JPG, PNG, GIF, WebP (max 10MB)
            </p>
            <div className="scan__upload-actions">
              <Button variant="secondary" onClick={() => setShowUpload(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleReset} disabled={!selectedImage}>Reset</Button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────
         Real API Results
         ────────────────────────────────────────────────────────────── */}
      {scanResult && apiResult && (
        <Card className="scan__results-card">
          <CardHeader>
            <CardTitle>📋 Real AI/OCR Package Analysis Results</CardTitle>
            <Badge variant="info" size="sm">Live Data</Badge>
          </CardHeader>
          <CardBody>

            {/* 1. Compliance Banner */}
            <ComplianceBanner screening={apiResult.rule_engine_screening} />

            {/* 2. Image + Metadata Grid */}
            <div className="scan__results-top">
              <div className="scan__results-image-wrap">
                <img
                  src={scanResult.imageUrl}
                  alt="Scanned package label"
                  className="scan__results-image-img"
                />
              </div>
              <div className="scan__results-meta">
                <div className="scan__meta-row">
                  <span className="scan__meta-label">Scan ID</span>
                  <code className="scan__meta-value">{apiResult.scan_id}</code>
                </div>
                <div className="scan__meta-row">
                  <span className="scan__meta-label">Image Quality</span>
                  <Badge variant={apiResult.image_quality.usable ? 'success' : 'error'} size="sm">
                    {apiResult.image_quality.quality_status}
                  </Badge>
                  <span className="scan__meta-score">{Math.round(apiResult.image_quality.quality_score * 100)}%</span>
                </div>
                <div className="scan__meta-row">
                  <span className="scan__meta-label">Package Detected</span>
                  <Badge variant={apiResult.package_detection.detected ? 'success' : 'warning'} size="sm">
                    {apiResult.package_detection.detected ? 'Yes' : 'No'}
                  </Badge>
                  {apiResult.package_detection.confidence > 0 && (
                    <span className="scan__meta-score">{Math.round(apiResult.package_detection.confidence * 100)}% confidence</span>
                  )}
                </div>
                {apiResult.image_quality.defects?.length > 0 && (
                  <div className="scan__meta-row">
                    <span className="scan__meta-label">Defects</span>
                    <div className="scan__meta-defects">
                      {apiResult.image_quality.defects.map((d, i) => (
                        <Badge key={i} variant="warning" size="sm">{d}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="scan__meta-row">
                  <span className="scan__meta-label">Timestamp</span>
                  <span className="scan__meta-value">{new Date(scanResult.capturedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* 3. Extracted Fields Grid */}
            <h4 className="scan__section-title">
              Extracted Declarations
              <Badge variant="info" size="sm">{apiResult.field_evidences.length} fields</Badge>
            </h4>
            <div className="scan__fields-grid">
              {apiResult.field_evidences.map((field) => (
                <FieldEvidenceCard key={field.field} field={field} />
              ))}
            </div>

            {/* 4. Violations */}
            <ViolationsPanel violations={apiResult.rule_engine_screening.violations} />

            {/* 5. Missing Fields */}
            {scanResult.missing.length > 0 && (
              <div className="scan__missing">
                <h4 className="scan__section-title">Missing Required Information</h4>
                <div className="scan__missing-list">
                  {scanResult.missing.map((field) => (
                    <Badge key={field} variant="error" size="sm">{field}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Raw OCR Text (collapsible) */}
            {apiResult.raw_text && (
              <details className="scan__raw-text">
                <summary>📝 Raw OCR Text (click to expand)</summary>
                <pre>{apiResult.raw_text}</pre>
              </details>
            )}

            {/* 7. Suggested Next Step */}
            {apiResult.rule_engine_screening.suggestedNextStep && (
              <div className="scan__next-step">
                <strong>📌 Suggested Next Step:</strong> {apiResult.rule_engine_screening.suggestedNextStep}
              </div>
            )}

            {/* 8. Action Buttons */}
            <div className="scan__results-actions">
              <Button variant="primary" size="lg" fullWidth={true} onClick={handleReset}>
                Scan Another Package
              </Button>
              {apiResult.rule_engine_screening.result !== 'no_issue' && (
                <Button
                  variant="accent"
                  size="lg"
                  fullWidth={true}
                  onClick={() => alert(`Non-compliance notice raised for scan ${apiResult.scan_id}`)}
                >
                  Raise Non-Compliance Notice
                </Button>
              )}
            </div>

          </CardBody>
        </Card>
      )}

      {/* Recent Scans */}
      <div className="scan__history">
        <h2>Recent Scans</h2>
        {recentScans.length === 0 ? (
          <EmptyState
            title="No scans yet"
            description="Your scan history will appear here after scanning products."
          />
        ) : (
          <div className="scan__history-list">
            {recentScans.slice(0, 5).map((scan) => (
              <div key={scan.id} className="scan__history-item">
                <div className="scan__history-info">
                  <div className="scan__history-product">
                    {scan.detected.productName || 'Unknown Product'}
                  </div>
                  <div className="scan__history-date">
                    {new Date(scan.capturedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="scan__history-status">
                  {scan.isCompliant ? (
                    <Badge variant="success">Compliant</Badge>
                  ) : (
                    <Badge variant="error">Non-Compliant</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        /* ── Pipeline stepper (existing) ─────────────────────────────── */
        .pipeline__card {
          margin-bottom: var(--space-6);
          border: 1px solid var(--color-navy-200);
        }
        .pipeline__steps {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        .pipeline__step {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-md);
          background: var(--color-gray-50);
          border: 1px solid var(--color-gray-200);
          transition: all 0.3s ease;
        }
        .pipeline__step--active {
          background: var(--color-navy-50);
          border-color: var(--color-navy-500);
        }
        .pipeline__step--done {
          background: #f0fdf4;
          border-color: #16a34a;
        }
        .pipeline__step-indicator {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--color-gray-300);
          color: var(--color-white);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
          flex-shrink: 0;
        }
        .pipeline__step--active .pipeline__step-indicator { background: var(--color-navy-600); }
        .pipeline__step--done .pipeline__step-indicator { background: #16a34a; }
        .pipeline__step-title {
          font-weight: 600;
          color: var(--color-navy-900);
          font-size: var(--font-size-sm);
        }
        .pipeline__step-desc {
          font-size: var(--font-size-xs);
          color: var(--color-gray-600);
        }

        /* ── Warning / Error banners ─────────────────────────────────── */
        .scan__warning {
          display: flex;
          align-items: flex-start;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-4);
          background: #fff3e0;
          border-left: 4px solid #ff9800;
          border-radius: var(--radius-md);
          margin-bottom: var(--space-4);
          font-size: var(--font-size-sm);
        }
        .scan__warning-icon { font-size: 1.1rem; flex-shrink: 0; }
        .scan__error {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          background: #ffebee;
          border-left: 4px solid #f44336;
          border-radius: var(--radius-md);
          margin-bottom: var(--space-4);
          color: #c62828;
          font-size: var(--font-size-sm);
        }
        .scan__error-msg { flex: 1; }

        /* ── Compliance Banner ───────────────────────────────────────── */
        .scan__compliance {
          display: flex;
          align-items: flex-start;
          gap: var(--space-4);
          padding: var(--space-4) var(--space-5);
          border-radius: var(--radius-lg);
          margin-bottom: var(--space-5);
          border-left: 5px solid;
        }
        .scan__compliance--no_issue { background: #e8f5e9; border-color: #4caf50; }
        .scan__compliance--review_recommended { background: #fff3e0; border-color: #ff9800; }
        .scan__compliance--potential_violation { background: #ffebee; border-color: #f44336; }
        .scan__compliance-icon { font-size: 2rem; flex-shrink: 0; line-height: 1; }
        .scan__compliance-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
          font-size: var(--font-size-sm);
        }
        .scan__compliance-right { display: flex; flex-direction: column; align-items: flex-end; gap: var(--space-2); flex-shrink: 0; }
        .scan__compliance-flags { display: flex; flex-direction: column; align-items: flex-end; gap: var(--space-1); }

        /* ── Results top grid ───────────────────────────────────────── */
        .scan__results-top {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: var(--space-5);
          margin-bottom: var(--space-5);
          align-items: flex-start;
        }
        @media (max-width: 768px) {
          .scan__results-top { grid-template-columns: 1fr; }
        }
        .scan__results-image-wrap {
          border-radius: var(--radius-md);
          overflow: hidden;
          border: 1px solid var(--color-gray-200);
        }
        .scan__results-image-img { width: 100%; display: block; }
        .scan__results-meta { display: flex; flex-direction: column; gap: var(--space-2); }
        .scan__meta-row {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-2) var(--space-3);
          background: var(--color-gray-50);
          border-radius: var(--radius-md);
          font-size: var(--font-size-sm);
          flex-wrap: wrap;
        }
        .scan__meta-label {
          font-size: var(--font-size-xs);
          text-transform: uppercase;
          color: var(--color-gray-500);
          min-width: 100px;
          font-weight: 600;
        }
        .scan__meta-value { font-weight: 600; color: var(--color-navy-900); }
        .scan__meta-score { font-size: var(--font-size-xs); color: var(--color-gray-600); margin-left: auto; }
        .scan__meta-defects { display: flex; flex-wrap: wrap; gap: var(--space-1); }

        /* ── Section titles ─────────────────────────────────────────── */
        .scan__section-title {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          color: var(--color-navy-900);
          margin: var(--space-4) 0 var(--space-3);
        }

        /* ── Extracted Fields Grid ──────────────────────────────────── */
        .scan__fields-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: var(--space-3);
          margin-bottom: var(--space-5);
        }
        .scan__field-card {
          background: var(--color-white);
          border: 1px solid var(--color-gray-200);
          border-radius: var(--radius-md);
          padding: var(--space-3) var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .scan__field-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .scan__field-label {
          font-size: var(--font-size-xs);
          text-transform: uppercase;
          color: var(--color-gray-500);
          font-weight: 700;
          letter-spacing: 0.3px;
        }
        .scan__field-conf {
          font-size: var(--font-size-xs);
          color: var(--color-navy-700);
          font-weight: 600;
        }
        .scan__field-value {
          font-size: var(--font-size-base);
          font-weight: 600;
          color: var(--color-navy-900);
          word-break: break-word;
          line-height: 1.4;
        }
        .scan__field-empty { color: var(--color-gray-400); font-style: italic; font-weight: 400; }
        .scan__field-bar {
          height: 4px;
          background: var(--color-gray-200);
          border-radius: 2px;
          overflow: hidden;
        }
        .scan__field-bar-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.5s ease;
        }
        .scan__field-source {
          font-size: 10px;
          color: var(--color-gray-500);
          font-style: italic;
          line-height: 1.3;
        }

        /* ── Violations ─────────────────────────────────────────────── */
        .scan__violations {
          background: #ffebee;
          padding: var(--space-4);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-4);
          border: 1px solid #ffcdd2;
        }
        .scan__violation-item {
          display: flex;
          align-items: flex-start;
          gap: var(--space-2);
          margin-top: var(--space-2);
          font-size: var(--font-size-sm);
        }
        .scan__violation-desc { flex: 1; color: var(--color-gray-800); }
        .scan__violation-rule { font-size: 11px; color: var(--color-gray-500); }

        /* ── Missing ───────────────────────────────────────────────── */
        .scan__missing { margin-bottom: var(--space-4); }
        .scan__missing-list { display: flex; flex-wrap: wrap; gap: var(--space-2); }

        /* ── Raw text ───────────────────────────────────────────────── */
        .scan__raw-text { margin-bottom: var(--space-4); }
        .scan__raw-text summary {
          cursor: pointer;
          font-size: var(--font-size-sm);
          color: var(--color-navy-700);
          padding: var(--space-2) 0;
          user-select: none;
        }
        .scan__raw-text pre {
          background: var(--color-gray-100);
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-md);
          white-space: pre-wrap;
          word-break: break-all;
          font-family: var(--font-family-mono, monospace);
          font-size: var(--font-size-sm);
          color: var(--color-navy-900);
          margin-top: var(--space-2);
          border: 1px solid var(--color-gray-200);
        }

        /* ── Next step ──────────────────────────────────────────────── */
        .scan__next-step {
          background: var(--color-navy-50);
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-4);
          font-size: var(--font-size-sm);
          color: var(--color-navy-900);
          border-left: 4px solid var(--color-navy-500);
        }

        /* ── Actions ────────────────────────────────────────────────── */
        .scan__results-actions {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          margin-top: var(--space-4);
        }

        /* ── Scan actions ───────────────────────────────────────────── */
        .scan__actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-3);
          margin-bottom: var(--space-4);
        }
        @media (max-width: 480px) {
          .scan__actions { grid-template-columns: 1fr; }
        }

        /* ── Modal ──────────────────────────────────────────────────── */
        .scan__modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: var(--space-4);
        }
        .scan__modal {
          background: var(--color-white);
          border-radius: var(--radius-lg);
          max-width: 640px;
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .scan__modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4) var(--space-5);
          border-bottom: 1px solid var(--color-gray-200);
          background: var(--color-navy-50);
        }
        .scan__modal-title { font-size: var(--font-size-lg); font-weight: var(--font-weight-semibold); margin: 0; }
        .scan__modal-close { background: none; border: none; cursor: pointer; font-size: 1.2rem; color: var(--color-gray-600); padding: var(--space-1); }
        .scan__modal-body { overflow: auto; flex: 1; }

        /* ── Upload ─────────────────────────────────────────────────── */
        .scan__upload {
          background: var(--color-white);
          border: 2px dashed var(--color-navy-300);
          border-radius: var(--radius-lg);
          padding: var(--space-6);
          margin-bottom: var(--space-4);
          text-align: center;
        }
        .scan__upload-header { margin-bottom: var(--space-4); }
        .scan__upload-close { background: none; border: none; cursor: pointer; color: var(--color-gray-600); font-size: 1.2rem; }
        .scan__upload-note { font-size: var(--font-size-xs); color: var(--color-gray-500); margin-top: var(--space-2); }
        .scan__upload-actions { display: flex; gap: var(--space-3); justify-content: center; margin-top: var(--space-4); }

        /* ── History ────────────────────────────────────────────────── */
        .scan__history { margin-top: var(--space-8); }
        .scan__history-list { display: flex; flex-direction: column; gap: var(--space-2); margin-top: var(--space-4); }
        .scan__history-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-3) var(--space-4);
          background: var(--color-white);
          border: 1px solid var(--color-gray-200);
          border-radius: var(--radius-md);
        }
        .scan__history-product { font-weight: 600; color: var(--color-navy-900); font-size: var(--font-size-sm); }
        .scan__history-date { font-size: var(--font-size-xs); color: var(--color-gray-500); margin-top: 2px; }
        .scan__history-info { display: flex; flex-direction: column; }
      `}</style>
    </div>
  );
};

export default ScanPage;
