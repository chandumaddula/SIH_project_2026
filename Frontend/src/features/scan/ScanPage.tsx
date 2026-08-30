import React, { useState } from 'react';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Badge } from '../../components/Badge';
import { useUserStore } from '../../store';
import { ScanResult } from '../../types/scan';
import { mockScanResults } from '../../services/mockData';
import { CameraView } from './CameraView';
import { EmptyState } from '../../components/EmptyState';

export const ScanPage: React.FC = () => {
  const { user } = useUserStore();
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Recent scans from mock data
  const recentScans = mockScanResults;

  // Handle camera capture
  const handleCapture = (imageData: string) => {
    setLoading(true);

    // Mock OCR analysis - simulate detecting fields based on image
    // In real implementation, this would call an OCR service
    setTimeout(() => {
      const mockDetection = {
        productName: 'Sample Product ' + Math.floor(Math.random() * 1000),
        mfgDate: Math.random() > 0.4 ? '2024-01-15' : undefined,
        expDate: Math.random() > 0.4 ? '2025-01-15' : undefined,
        batchNumber: Math.random() > 0.3 ? `BATCH-${2024}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}` : undefined,
        licenseNumber: Math.random() > 0.6 ? `LIC-2024-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}` : undefined,
        weight: Math.random() > 0.5 ? `${Math.floor(Math.random() * 10)}kg` : undefined,
        ingredients: Math.random() > 0.6 ? ['Water', 'Sugar', 'Salt'] : undefined
      };

      // Determine missing fields based on what we "detected"
      const requiredFields: string[] = [];
      if (!mockDetection.mfgDate) requiredFields.push('Manufacturing Date');
      if (!mockDetection.expDate) requiredFields.push('Expiry Date');
      if (!mockDetection.batchNumber) requiredFields.push('Batch Number');
      if (!mockDetection.licenseNumber) requiredFields.push('License Number');
      if (!mockDetection.weight) requiredFields.push('Weight');
      if (!mockDetection.ingredients || mockDetection.ingredients.length === 0) {
        requiredFields.push('Ingredients');
      }

      const isCompliant = requiredFields.length === 0;

      const result: ScanResult = {
        id: 'scan-' + Date.now(),
        imageUrl: imageData,
        capturedAt: new Date().toISOString(),
        detected: mockDetection,
        missing: requiredFields,
        isCompliant,
        inspectorId: user?.id || 'emp-001'
      };

      setScanResult(result);
      setLoading(false);
    }, 1500);
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
        // Process the uploaded image (mock analysis)
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
  };

  return (
    <div className="page">
      <h1 className="page-title">Scan / Upload Image</h1>

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
          {loading ? 'Processing...' : 'Open Camera'}
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
            <CardTitle>Scan Results</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="scan__results-image">
              <img
                src={scanResult.imageUrl}
                alt="Scanned image"
                className="scan__results-image-img"
                style={{ maxWidth: '100%', borderRadius: 'var(--radius-md)' }}
              />
            </div>

            <div className="scan__results-details">
              <div className="scan__results-status">
                <h3>Inspection Status</h3>
                <div className="scan__status-badge">
                  {scanResult.isCompliant ? (
                    <Badge variant="success">COMPLIANT</Badge>
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
                <h4>Detected Information</h4>
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
                    <dt>Weight</dt>
                    <dd>{scanResult.detected.weight || 'Not detected'}</dd>
                  </div>
                  <div>
                    <dt>License Number</dt>
                    <dd>{scanResult.detected.licenseNumber || 'Not detected'}</dd>
                  </div>
                  <div>
                    <dt>Ingredients</dt>
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
                  Scan Another
                </Button>
                <Button
                  variant="accent"
                  size="lg"
                  fullWidth={true}
                  onClick={() => {
                    // In full implementation: open complaint form with pre-filled data
                    alert(
                      `Raise Complaint: "${scanResult.detected.productName || 'Unknown Product'}" ` +
                      `has missing information: ${scanResult.missing.join(', ')}. ` +
                      `Would you like to file a complaint?`
                    );
                    handleReset();
                  }}
                  disabled={scanResult.missing.length === 0}
                >
                  Raise Complaint
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
    </div>
  );
};

export default ScanPage;