import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Badge } from '../../components/Badge';
import { useUserStore } from '../../store';
import { ScanResult } from '../../types/scan';
import { CameraView } from './CameraView';
import { EmptyState } from '../../components/EmptyState';
import { citizenScanService } from '../../services/citizenScan.service';
import { CitizenScan } from '../../types/citizen';

type PipelineStep = 'idle' | 'image_processing' | 'ocr' | 'ai_extraction' | 'structured_data' | 'rule_engine' | 'complete';

const pipelineStepsConfig: { id: PipelineStep; title: string; desc: string }[] = [
  { id: 'image_processing', title: '1. Image Processing', desc: 'Quality score, perspective correction & label ROI detection' },
  { id: 'ocr', title: '2. OCR Engine', desc: 'Raw text extraction & bounding boxes [x, y, w, h]' },
  { id: 'ai_extraction', title: '3. AI Detection', desc: 'MRP, Net Qty, Manufacturer, Dates, Consumer Care' },
  { id: 'structured_data', title: '4. Structured Data', desc: 'Synthesizing validated product attributes' },
  { id: 'rule_engine', title: '5. Rule Engine', desc: 'PCR 2011 Legal Metrology Compliance Check' }
];

export const ScanPage: React.FC = () => {
  const { user } = useUserStore();
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<PipelineStep>('idle');
  const [apiError, setApiError] = useState<string | null>(null);
  const [recentScans, setRecentScans] = useState<CitizenScan[]>([]);

  // Load recent scans from real backend
  useEffect(() => {
    const citizenId = user?.id || 'citizen-anon';
    citizenScanService.getScans(citizenId)
      .then(setRecentScans)
      .catch((err) => {
        console.error('Failed to load recent scans:', err);
        setRecentScans([]);
      });
  }, [user]);

  /**
   * Execute the real AI pipeline via backend.
   * Sends the actual captured/uploaded image to the backend which runs:
   * real OCR → real field extraction → real Rule Engine.
   */
  const handleCapture = async (imageData: string) => {
    setLoading(true);
    setCurrentStep('image_processing');
    setApiError(null);

    // Animate through stages while the actual backend call runs in parallel
    setTimeout(() => setCurrentStep('ocr'), 400);
    setTimeout(() => setCurrentStep('ai_extraction'), 800);
    setTimeout(() => setCurrentStep('structured_data'), 1200);
    setTimeout(() => setCurrentStep('rule_engine'), 1600);

    try {
      // Convert data URL to File
      const blob = await (await fetch(imageData)).blob();
      const file = new File([blob], 'captured.jpg', { type: blob.type || 'image/jpeg' });

      const citizenId = user?.id || 'citizen-anon';

      // Call the REAL backend with the REAL image
      const result = await citizenScanService.createScan(citizenId, [file]);

      setCurrentStep('complete');

      // Map backend result to ScanResult
      const detected = result.detected || {};
      const detectedTyped = detected as Record<string, any>;
      const result_mapped: ScanResult = {
        id: result.id || result.scan_id || ('scan-' + Date.now()),
        imageUrl: imageData,
        capturedAt: result.createdAt || new Date().toISOString(),
        detected: {
          productName: detectedTyped.productName || detectedTyped.product_name,
          mrp: detectedTyped.mrp,
          netQuantity: detectedTyped.netQuantity || detectedTyped.net_quantity,
          manufacturer: detectedTyped.manufacturer,
          packer: detectedTyped.packer,
          importer: detectedTyped.importer,
          address: detectedTyped.address,
          countryOfOrigin: detectedTyped.countryOfOrigin || detectedTyped.country_of_origin,
          mfgDate: detectedTyped.mfgDate || detectedTyped.manufacturing_date,
          expDate: detectedTyped.expDate || detectedTyped.expiry_date,
          batchNumber: detectedTyped.batchNumber,
          consumerCare: detectedTyped.consumerCare,
          weight: detectedTyped.netQuantity || detectedTyped.net_quantity,
          ingredients: []
        },
        missing: (result.screening?.flags || []) as string[],
        isCompliant: result.screening?.result === 'no_issue',
        inspectorId: user?.id || 'emp-001',
        // Include real OCR data and rule engine results
        ocrBoxes: (result as any).ocrBoxes,
        violations: (result as any).violations,
        screening: result.screening,
        imagePath: (result as any).image_path
      };

      setScanResult(result_mapped);

      // Refresh recent scans
      citizenScanService.getScans(citizenId).then(setRecentScans).catch(() => {});
    } catch (err: any) {
      setApiError(err?.message || 'Failed to analyze package. Please try again.');
      setCurrentStep('complete');
      console.error('Scan failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        setSelectedImage(imageData);
        setShowUpload(false);
        handleCapture(imageData);
      };
      reader.onerror = () => {
        setShowUpload(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setScanResult(null);
    setShowUpload(false);
    setIsCameraOpen(false);
    setCurrentStep('idle');
  };

  return (
    <div className="page">
      <h1 className="page-title">Scan / Upload Package</h1>

      {/* Warning banner for camera usage */}
      <div className="scan__warning">
        <span className="scan__warning-icon">⚠️</span>
        <span className="scan__warning-text">
          Camera access requires a secure context (HTTPS) in production.
          For development on localhost, camera access may be available depending
          on browser settings. File upload is always available.
        </span>
      </div>

      {/* Action Buttons */}
      <div className="scan__actions">
        <Button
          variant="primary"
          size="lg"
          fullWidth={true}
          onClick={() => setIsCameraOpen(true)}
          disabled={loading}
        >
          {loading ? 'Analyzing Package Pipeline...' : 'Open Camera'}
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
                const stepOrder = ['image_processing', 'ocr', 'ai_extraction', 'structured_data', 'rule_engine', 'complete'];
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
        <div className="scan__modal-backdrop" onClick={() => setIsCameraOpen(false)}>
          <div className="scan__modal">
            <div className="scan__modal-header">
              <h2 className="scan__modal-title">Camera Scanner</h2>
              <button
                className="scan__modal-close"
                onClick={() => setIsCameraOpen(false)}
                aria-label="Close camera"
              >
                ✕
              </button>
            </div>
            <div className="scan__modal-body">
              <CameraView
                onCapture={handleCapture}
                onClose={() => setIsCameraOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* File Upload */}
      {showUpload && (
        <div className="scan__upload">
          <div className="scan__upload-header">
            <h2>Upload Image</h2>
            <button className="scan__upload-close" onClick={() => setShowUpload(false)}>
              ✕
            </button>
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
              <Button variant="secondary" onClick={() => setShowUpload(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleReset} disabled={!selectedImage}>
                Reset
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Scan Results */}
      {scanResult && (
        <Card className="scan__results-card">
          <CardHeader>
            <CardTitle>Legal Metrology Package Analysis Results</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="scan__results-image">
              <img
                src={scanResult.imageUrl}
                alt="Scanned package label"
                className="scan__results-image-img"
                style={{ maxWidth: '100%', borderRadius: 'var(--radius-md)' }}
              />
            </div>

            <div className="scan__results-details">
              <div className="scan__results-status">
                <h3>Inspection Status</h3>
                <div className="scan__status-badge">
                  {scanResult.isCompliant ? (
                    <Badge variant="success">COMPLIANT (PCR 2011)</Badge>
                  ) : (
                    <Badge variant="error">NON-COMPLIANT</Badge>
                  )}
                </div>
                <p>
                  Inspected by: {user?.name || 'Employee'} •{' '}
                  {new Date(scanResult.capturedAt).toLocaleString()}
                </p>
              </div>

              <div className="scan__results-detected">
                <h4>Structured Declarations (AI Extracted)</h4>
                <dl>
                  <div>
                    <dt>Product Name</dt>
                    <dd>{scanResult.detected.productName || 'Not detected'}</dd>
                  </div>
                  <div>
                    <dt>Batch Number</dt>
                    <dd>{scanResult.detected.batchNumber || 'Not detected'}</dd>
                  </div>
                  <div>
                    <dt>Manufacturing Date</dt>
                    <dd>{scanResult.detected.mfgDate || 'Not detected'}</dd>
                  </div>
                  <div>
                    <dt>Expiry Date</dt>
                    <dd>{scanResult.detected.expDate || 'Not detected'}</dd>
                  </div>
                  <div>
                    <dt>Net Quantity / Weight</dt>
                    <dd>{scanResult.detected.weight || 'Not detected'}</dd>
                  </div>
                  <div>
                    <dt>License / FSSAI Number</dt>
                    <dd>{scanResult.detected.licenseNumber || 'Not detected'}</dd>
                  </div>
                  <div>
                    <dt>Ingredients / Composition</dt>
                    <dd>
                      {scanResult.detected.ingredients
                        ? scanResult.detected.ingredients.join(', ')
                        : 'Not detected'}
                    </dd>
                  </div>
                </dl>
              </div>

              {scanResult.missing.length > 0 && (
                <div className="scan__results-missing">
                  <h4>Missing Required Information</h4>
                  <ul>
                    {scanResult.missing.map((field) => (
                      <li key={field}>
                        <Badge variant="error">{field}</Badge>
                      </li>
                    ))}
                  </ul>
                  <p className="scan__missing-help">
                    To be compliant, the above information must be present on
                    the product/package label.
                  </p>
                </div>
              )}

              <div className="scan__results-actions">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth={true}
                  onClick={handleReset}
                >
                  Scan Another Package
                </Button>
                <Button
                  variant="accent"
                  size="lg"
                  fullWidth={true}
                  onClick={() => {
                    alert(
                      `Raise Complaint: "${scanResult.detected.productName || 'Unknown Product'}" ` +
                      `has missing information: ${scanResult.missing.join(', ')}.`
                    );
                    handleReset();
                  }}
                  disabled={scanResult.missing.length === 0}
                >
                  Raise Non-Compliance Notice
                </Button>
              </div>
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
                    {scan.detected?.productName || 'Unknown Product'}
                  </div>
                  <div className="scan__history-date">
                    {scan.createdAt ? new Date(scan.createdAt).toLocaleDateString() : ''}
                  </div>
                </div>
                <div className="scan__history-status">
                  {scan.screening?.result === 'no_issue' ? (
                    <Badge variant="success">Compliant</Badge>
                  ) : (
                    <Badge variant="error">Review Required</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`
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
          background: var(--color-success-50, #f0fdf4);
          border-color: var(--color-success-600, #16a34a);
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
        }
        .pipeline__step--active .pipeline__step-indicator {
          background: var(--color-navy-600);
        }
        .pipeline__step--done .pipeline__step-indicator {
          background: var(--color-success-600, #16a34a);
        }
        .pipeline__step-title {
          font-weight: 600;
          color: var(--color-navy-900);
          font-size: var(--font-size-sm);
        }
        .pipeline__step-desc {
          font-size: var(--font-size-xs);
          color: var(--color-gray-600);
        }
      `}</style>
    </div>
  );
};

export default ScanPage;