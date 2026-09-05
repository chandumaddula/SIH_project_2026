import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store';
import { Button } from '../../components/Button';
import { citizenScanService } from '../../services/citizenScan.service';
import { CitizenScan } from '../../types/citizen';
import { CameraView } from '../scan/CameraView';

/* ==========================================================================
   Types
   ========================================================================== */
type ImageType = 'front' | 'back' | 'side' | 'label' | 'other';

interface CapturedImage {
  id: string;
  type: ImageType;
  dataUrl: string;
  quality: { blur: 'low' | 'medium' | 'high'; lighting: 'poor' | 'fair' | 'good' };
}

type ScanStep = 'capture' | 'preview' | 'analyzing' | 'results';

const IMAGE_TYPE_LABELS: Record<ImageType, string> = {
  front: 'Front',
  back: 'Back',
  side: 'Side',
  label: 'Label',
  other: 'Other',
};

/* ==========================================================================
   Icon components
   ========================================================================== */
const IconCamera = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const IconUpload = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const IconCheck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconClose = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconSpinner = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cit-scan__spinner">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

/* ==========================================================================
   Citizen Scan Page
   ========================================================================== */
export const CitizenScanPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step management
  const [step, setStep] = useState<ScanStep>('capture');
  const [showCamera, setShowCamera] = useState(false);

  // Image state
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);
  const [selectedImageType, setSelectedImageType] = useState<ImageType>('front');

  // Analysis result
  const [scanResult, setScanResult] = useState<CitizenScan | null>(null);

  // Error state
  const [error, setError] = useState<string | null>(null);

  const citizenId = user?.id || 'cit-001';

  /* ---- Camera handlers ---- */
  const handleOpenCamera = useCallback(() => {
    setShowCamera(true);
  }, []);

  const handleCloseCamera = useCallback(() => {
    setShowCamera(false);
  }, []);

  const handleCapture = useCallback((imageData: string) => {
    const newImage: CapturedImage = {
      id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: selectedImageType,
      dataUrl: imageData,
      quality: {
        blur: 'low',
        lighting: 'good',
      },
    };
    setCapturedImages(prev => [...prev, newImage]);
    setShowCamera(false);
  }, [selectedImageType]);

  /* ---- File upload handler ---- */
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const newImage: CapturedImage = {
          id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: selectedImageType,
          dataUrl,
          quality: {
            blur: 'medium',
            lighting: 'fair',
          },
        };
        setCapturedImages(prev => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [selectedImageType]);

  /* ---- Remove image ---- */
  const handleRemoveImage = useCallback((id: string) => {
    setCapturedImages(prev => prev.filter(img => img.id !== id));
  }, []);

  /* ---- Update image type ---- */
  const handleUpdateImageType = useCallback((id: string, type: ImageType) => {
    setCapturedImages(prev =>
      prev.map(img => img.id === id ? { ...img, type } : img)
    );
  }, []);

  /* ---- Start analysis ---- */
  const handleAnalyze = useCallback(async () => {
    if (capturedImages.length === 0) {
      setError('Please capture at least one image before analyzing.');
      return;
    }

    setError(null);
    setStep('analyzing');

    try {
      const result = await citizenScanService.createScan(citizenId, []);
      setScanResult(result);
      setStep('results');
    } catch (err) {
      setError('Analysis failed. Please try again.');
      setStep('capture');
    }
  }, [capturedImages, citizenId]);

  /* ---- Reset scan ---- */
  const handleScanAnother = useCallback(() => {
    setCapturedImages([]);
    setScanResult(null);
    setError(null);
    setStep('capture');
  }, []);

  /* ---- Go home ---- */
  const handleGoHome = useCallback(() => {
    navigate('/citizen/home');
  }, [navigate]);

  /* ---- Go to scan details ---- */
  const handleViewDetails = useCallback(() => {
    if (scanResult) {
      navigate(`/citizen/scans/${scanResult.id}`);
    }
  }, [scanResult, navigate]);

  /* ---- Submit complaint ---- */
  const handleSubmitComplaint = useCallback(() => {
    navigate('/citizen/complaints/new');
  }, [navigate]);

  /* ---- Render based on step ---- */
  if (showCamera) {
    return (
      <div className="cit-scan">
        <div className="cit-scan__camera-wrapper">
          <CameraView
            onCapture={handleCapture}
            onClose={handleCloseCamera}
          />
          <div className="cit-scan__camera-actions">
            <p className="cit-scan__camera-hint">
              Capturing as: <strong>{IMAGE_TYPE_LABELS[selectedImageType]}</strong>
            </p>
            <div className="cit-scan__image-type-selector">
              <label>Image type:</label>
              <select
                value={selectedImageType}
                onChange={e => setSelectedImageType(e.target.value as ImageType)}
                className="cit-scan__select"
              >
                <option value="front">Front</option>
                <option value="back">Back</option>
                <option value="side">Side</option>
                <option value="label">Label</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'analyzing') {
    return <AnalyzingScreen onCancel={() => setStep('capture')} />;
  }

  if (step === 'results' && scanResult) {
    return (
      <ResultsScreen
        scan={scanResult}
        images={capturedImages}
        onScanAnother={handleScanAnother}
        onViewDetails={handleViewDetails}
        onSubmitComplaint={handleSubmitComplaint}
      />
    );
  }

  return (
    <CaptureScreen
      images={capturedImages}
      selectedType={selectedImageType}
      error={error}
      onSelectType={setSelectedImageType}
      onOpenCamera={handleOpenCamera}
      onFileChange={handleFileChange}
      onRemoveImage={handleRemoveImage}
      onUpdateType={handleUpdateImageType}
      onAnalyze={handleAnalyze}
      onCancel={handleGoHome}
      fileInputRef={fileInputRef}
    />
  );
};

/* ==========================================================================
   Capture Screen
   ========================================================================== */
interface CaptureScreenProps {
  images: CapturedImage[];
  selectedType: ImageType;
  error: string | null;
  onSelectType: (type: ImageType) => void;
  onOpenCamera: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (id: string) => void;
  onUpdateType: (id: string, type: ImageType) => void;
  onAnalyze: () => void;
  onCancel: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

const CaptureScreen: React.FC<CaptureScreenProps> = ({
  images,
  selectedType,
  error,
  onSelectType,
  onOpenCamera,
  onFileChange,
  onRemoveImage,
  onUpdateType,
  onAnalyze,
  onCancel,
  fileInputRef,
}) => {
  return (
    <div className="cit-scan">
      <div className="cit-scan__container">
        <header className="cit-scan__header">
          <h1 className="cit-scan__title">Scan Product</h1>
          <p className="cit-scan__subtitle">
            Capture or upload package images for preliminary compliance screening
          </p>
        </header>

        {/* Image type selector */}
        <div className="cit-scan__type-section">
          <label className="cit-scan__label">
            Next image type:
          </label>
          <div className="cit-scan__type-buttons">
            {(Object.keys(IMAGE_TYPE_LABELS) as ImageType[]).map(type => (
              <button
                key={type}
                className={`cit-scan__type-btn ${selectedType === type ? 'cit-scan__type-btn--active' : ''}`}
                onClick={() => onSelectType(type)}
              >
                {IMAGE_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>

        {/* Capture buttons */}
        <div className="cit-scan__capture-section">
          <button
            className="cit-scan__capture-btn cit-scan__capture-btn--camera"
            onClick={onOpenCamera}
          >
            <IconCamera />
            <span>Open Camera</span>
          </button>

          <div className="cit-scan__divider">
            <span>or</span>
          </div>

          <label className="cit-scan__capture-btn cit-scan__capture-btn--upload">
            <IconUpload />
            <span>Upload Image</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={onFileChange}
              className="cit-scan__file-input"
            />
          </label>
        </div>

        {/* Guidance */}
        <div className="cit-scan__guidance">
          <div className="cit-scan__guidance-item">
            <span className="cit-scan__guidance-icon">💡</span>
            <span>Ensure good lighting on the label</span>
          </div>
          <div className="cit-scan__guidance-item">
            <span className="cit-scan__guidance-icon">📷</span>
            <span>Keep the package steady while capturing</span>
          </div>
          <div className="cit-scan__guidance-item">
            <span className="cit-scan__guidance-icon">📋</span>
            <span>Include all sides with important information</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="cit-scan__error" role="alert">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Captured images */}
        {images.length > 0 && (
          <div className="cit-scan__images-section">
            <h2 className="cit-scan__section-title">
              Captured Images ({images.length})
            </h2>
            <div className="cit-scan__images-grid">
              {images.map(img => (
                <div key={img.id} className="cit-scan__image-card">
                  <img
                    src={img.dataUrl}
                    alt={`${IMAGE_TYPE_LABELS[img.type]} view`}
                    className="cit-scan__image-thumb"
                  />
                  <button
                    className="cit-scan__image-remove"
                    onClick={() => onRemoveImage(img.id)}
                    aria-label="Remove image"
                  >
                    <IconClose />
                  </button>
                  <select
                    value={img.type}
                    onChange={e => onUpdateType(img.id, e.target.value as ImageType)}
                    className="cit-scan__image-type-select"
                  >
                    {(Object.keys(IMAGE_TYPE_LABELS) as ImageType[]).map(type => (
                      <option key={type} value={type}>{IMAGE_TYPE_LABELS[type]}</option>
                    ))}
                  </select>
                  <div className="cit-scan__image-quality">
                    <span className={`cit-scan__quality-dot cit-scan__quality-dot--${img.quality.blur}`} />
                    <span className={`cit-scan__quality-dot cit-scan__quality-dot--${img.quality.lighting}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="cit-scan__actions">
          <Button
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={onAnalyze}
            disabled={images.length === 0}
          >
            Analyze Package
            {images.length > 0 && ` (${images.length} image${images.length > 1 ? 's' : ''})`}
          </Button>
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   Analyzing Screen
   ========================================================================== */
const AnalyzingScreen: React.FC<{ onCancel: () => void }> = ({ onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);

  React.useEffect(() => {
    const timers = [
      setTimeout(() => setCurrentStep(1), 800),
      setTimeout(() => setCurrentStep(2), 1600),
      setTimeout(() => setCurrentStep(3), 2400),
      setTimeout(() => setCurrentStep(4), 3200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const steps = [
    { label: 'Image received', done: currentStep >= 1 },
    { label: 'Image quality checked', done: currentStep >= 2 },
    { label: 'Text detected', done: currentStep >= 3 },
    { label: 'Declarations extracted', done: currentStep >= 4 },
    { label: 'Screening package information', done: false },
  ];

  return (
    <div className="cit-scan cit-scan--analyzing">
      <div className="cit-scan__analyzing-content">
        <div className="cit-scan__analyzing-icon">
          <IconSpinner />
        </div>
        <h2 className="cit-scan__analyzing-title">Analyzing Package</h2>
        <p className="cit-scan__analyzing-subtitle">
          This is a preliminary automated screening. Results are not a legal determination.
        </p>

        <div className="cit-scan__analyzing-steps">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`cit-scan__analyzing-step ${step.done ? 'cit-scan__analyzing-step--done' : ''} ${index === currentStep ? 'cit-scan__analyzing-step--active' : ''}`}
            >
              <div className="cit-scan__analyzing-step-icon">
                {step.done ? <IconCheck /> : <span className="cit-scan__analyzing-step-dot" />}
              </div>
              <span className="cit-scan__analyzing-step-label">
                {step.label}
                {index === currentStep && !step.done && '...'}
              </span>
            </div>
          ))}
        </div>

        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

/* ==========================================================================
   Results Screen
   ========================================================================== */
interface ResultsScreenProps {
  scan: CitizenScan;
  images: CapturedImage[];
  onScanAnother: () => void;
  onViewDetails: () => void;
  onSubmitComplaint: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({
  scan,
  images,
  onScanAnother,
  onViewDetails,
  onSubmitComplaint,
}) => {
  const { result, explanation, confidence, flags, suggestedNextStep } = scan.screening;
  const detected = scan.detected;

  const resultConfig = {
    no_issue: {
      label: 'No Potential Issue Detected',
      color: 'success',
      icon: '🟢',
    },
    review_recommended: {
      label: 'Review Recommended',
      color: 'warning',
      icon: '🟡',
    },
    potential_issue: {
      label: 'Potential Issue Detected',
      color: 'danger',
      icon: '🔴',
    },
  };

  const config = resultConfig[result];

  return (
    <div className="cit-scan cit-scan--results">
      <div className="cit-scan__results-container">
        {/* Disclaimer */}
        <div className="cit-scan__disclaimer">
          <span className="cit-scan__disclaimer-icon">ℹ️</span>
          <p className="cit-scan__disclaimer-text">
            This is a preliminary automated screening result.
            Final verification is performed through the authorized
            inspection process.
          </p>
        </div>

        {/* Result banner */}
        <div className={`cit-scan__result-banner cit-scan__result-banner--${config.color}`}>
          <span className="cit-scan__result-icon">{config.icon}</span>
          <div className="cit-scan__result-content">
            <h1 className="cit-scan__result-title">{config.label}</h1>
            <p className="cit-scan__result-confidence">
              Confidence: {Math.round(confidence * 100)}%
            </p>
          </div>
        </div>

        {/* Explanation */}
        <div className="cit-scan__result-explanation">
          <h2 className="cit-scan__section-title">What this means</h2>
          <p>{explanation}</p>
        </div>

        {/* Flags if any */}
        {flags.length > 0 && (
          <div className="cit-scan__result-flags">
            <h2 className="cit-scan__section-title">Areas of concern</h2>
            <ul className="cit-scan__flags-list">
              {flags.map((flag, index) => (
                <li key={index} className="cit-scan__flag-item">
                  <span className="cit-scan__flag-bullet">•</span>
                  {flag}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Package image preview */}
        {images.length > 0 && (
          <div className="cit-scan__result-image">
            <h2 className="cit-scan__section-title">Package Image</h2>
            <div className="cit-scan__result-image-container">
              <img
                src={images[0].dataUrl}
                alt="Captured package"
                className="cit-scan__result-image-preview"
              />
            </div>
          </div>
        )}

        {/* Detected Information */}
        <div className="cit-scan__detected-info">
          <h2 className="cit-scan__section-title">Detected Information</h2>
          <p className="cit-scan__detected-note">
            This information was automatically detected from the package image and may not be complete or accurate.
          </p>
          <div className="cit-scan__info-grid">
            <InfoRow label="Product Name" value={detected.productName} />
            <InfoRow label="Generic Name" value={detected.genericName} />
            <InfoRow label="MRP" value={detected.mrp} />
            <InfoRow label="Net Quantity" value={detected.netQuantity} />
            <InfoRow label="Manufacturer" value={detected.manufacturer} />
            <InfoRow label="Packer" value={detected.packer} />
            <InfoRow label="Importer" value={detected.importer} />
            <InfoRow label="Address" value={detected.address} />
            <InfoRow label="Country of Origin" value={detected.countryOfOrigin} />
            {detected.dateInformation && (
              <>
                <InfoRow label="Mfg. Date" value={detected.dateInformation.mfgDate} />
                <InfoRow label="Exp. Date" value={detected.dateInformation.expDate} />
                <InfoRow label="Batch Number" value={detected.dateInformation.batchNumber} />
              </>
            )}
            <InfoRow label="Consumer Care" value={detected.consumerCare} />
            <InfoRow label="Other Detected" value={detected.otherDetected} />
          </div>
        </div>

        {/* Suggested next step */}
        <div className="cit-scan__next-step">
          <h2 className="cit-scan__section-title">Suggested Next Step</h2>
          <p>{suggestedNextStep}</p>
        </div>

        {/* Action buttons */}
        <div className="cit-scan__result-actions">
          {result === 'no_issue' ? (
            <>
              <Button variant="secondary" onClick={onViewDetails}>
                View Details
              </Button>
              <Button variant="primary" onClick={onScanAnother}>
                Scan Another Product
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={onViewDetails}>
                View Details
              </Button>
              <Button variant="primary" onClick={onSubmitComplaint}>
                Submit Complaint
              </Button>
              <Button variant="outline" onClick={onScanAnother}>
                Scan Another
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   Info Row Component
   ========================================================================== */
const InfoRow: React.FC<{ label: string; value?: string }> = ({ label, value }) => {
  if (!value) return null;

  return (
    <div className="cit-scan__info-row">
      <span className="cit-scan__info-label">{label}</span>
      <span className="cit-scan__info-value">{value}</span>
    </div>
  );
};

/* ==========================================================================
   Styles
   ========================================================================== */
const styles = `
  .cit-scan {
    min-height: calc(100vh - var(--header-height));
    background-color: var(--color-gray-50);
    padding: var(--space-6);
  }

  .cit-scan--results {
    padding-bottom: var(--space-12);
  }

  .cit-scan__container {
    max-width: 720px;
    margin: 0 auto;
  }

  .cit-scan__results-container {
    max-width: 720px;
    margin: 0 auto;
  }

  .cit-scan__header {
    text-align: center;
    margin-bottom: var(--space-8);
  }

  .cit-scan__title {
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-navy-900);
    margin: 0 0 var(--space-2) 0;
  }

  .cit-scan__subtitle {
    font-size: var(--font-size-base);
    color: var(--color-gray-600);
    margin: 0;
  }

  /* Type selector */
  .cit-scan__type-section {
    margin-bottom: var(--space-6);
  }

  .cit-scan__label {
    display: block;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--color-gray-700);
    margin-bottom: var(--space-2);
  }

  .cit-scan__type-buttons {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .cit-scan__type-btn {
    padding: var(--space-2) var(--space-4);
    background: var(--color-white);
    border: 1px solid var(--color-gray-300);
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
    color: var(--color-gray-700);
    cursor: pointer;
    font-family: inherit;
    transition: all var(--transition-fast);
  }

  .cit-scan__type-btn:hover {
    border-color: var(--color-navy-500);
    color: var(--color-navy-700);
  }

  .cit-scan__type-btn--active {
    background: var(--color-navy-700);
    border-color: var(--color-navy-700);
    color: var(--color-white);
  }

  /* Capture buttons */
  .cit-scan__capture-section {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-4);
    margin-bottom: var(--space-6);
  }

  .cit-scan__capture-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-6);
    background: var(--color-white);
    border: 2px solid var(--color-gray-200);
    border-radius: var(--radius-xl);
    color: var(--color-gray-700);
    cursor: pointer;
    font-family: inherit;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    transition: all var(--transition-base);
    min-width: 160px;
    text-align: center;
  }

  .cit-scan__capture-btn:hover {
    border-color: var(--color-navy-500);
    color: var(--color-navy-700);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  .cit-scan__capture-btn--camera {
    color: var(--color-navy-700);
  }

  .cit-scan__capture-btn--upload {
    color: var(--color-gray-700);
    position: relative;
  }

  .cit-scan__file-input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }

  .cit-scan__divider {
    color: var(--color-gray-400);
    font-size: var(--font-size-sm);
  }

  /* Guidance */
  .cit-scan__guidance {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    margin-bottom: var(--space-6);
    padding: var(--space-4);
    background: var(--color-navy-50);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-navy-100);
  }

  .cit-scan__guidance-item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    font-size: var(--font-size-sm);
    color: var(--color-navy-700);
  }

  .cit-scan__guidance-icon {
    font-size: var(--font-size-base);
  }

  /* Error */
  .cit-scan__error {
    background: var(--color-error-100);
    border: 1px solid var(--color-error-600);
    color: var(--color-error-600);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
    margin-bottom: var(--space-6);
  }

  /* Images section */
  .cit-scan__images-section {
    margin-bottom: var(--space-6);
  }

  .cit-scan__section-title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--color-navy-900);
    margin: 0 0 var(--space-4) 0;
  }

  .cit-scan__images-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: var(--space-3);
  }

  .cit-scan__image-card {
    position: relative;
    background: var(--color-white);
    border: 1px solid var(--color-gray-200);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }

  .cit-scan__image-thumb {
    width: 100%;
    aspect-ratio: 4/3;
    object-fit: cover;
    display: block;
  }

  .cit-scan__image-remove {
    position: absolute;
    top: var(--space-1);
    right: var(--space-1);
    width: 24px;
    height: 24px;
    background: rgba(0, 0, 0, 0.6);
    border: none;
    border-radius: var(--radius-full);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }

  .cit-scan__image-type-select {
    width: 100%;
    padding: var(--space-1) var(--space-2);
    font-size: 11px;
    border: none;
    border-top: 1px solid var(--color-gray-200);
    background: var(--color-gray-50);
    color: var(--color-gray-700);
    cursor: pointer;
    text-align: center;
  }

  .cit-scan__image-quality {
    position: absolute;
    bottom: var(--space-6);
    left: var(--space-1);
    display: flex;
    gap: 2px;
  }

  .cit-scan__quality-dot {
    width: 8px;
    height: 8px;
    border-radius: var(--radius-full);
    display: inline-block;
  }

  .cit-scan__quality-dot--low { background: var(--color-success-600); }
  .cit-scan__quality-dot--medium { background: var(--color-warning-600); }
  .cit-scan__quality-dot--high { background: var(--color-error-600); }
  .cit-scan__quality-dot--good { background: var(--color-success-600); }
  .cit-scan__quality-dot--fair { background: var(--color-warning-600); }
  .cit-scan__quality-dot--poor { background: var(--color-error-600); }

  /* Actions */
  .cit-scan__actions {
    display: flex;
    justify-content: center;
    gap: var(--space-4);
    padding-top: var(--space-4);
    border-top: 1px solid var(--color-gray-200);
  }

  /* Camera wrapper */
  .cit-scan__camera-wrapper {
    max-width: 480px;
    margin: 0 auto;
  }

  .cit-scan__camera-actions {
    margin-top: var(--space-4);
    text-align: center;
  }

  .cit-scan__camera-hint {
    font-size: var(--font-size-sm);
    color: var(--color-gray-600);
    margin: 0 0 var(--space-3) 0;
  }

  .cit-scan__image-type-selector {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    font-size: var(--font-size-sm);
    color: var(--color-gray-700);
  }

  .cit-scan__select {
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-gray-300);
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
    background: var(--color-white);
    color: var(--color-gray-800);
    cursor: pointer;
  }

  /* Analyzing screen */
  .cit-scan--analyzing {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - var(--header-height));
  }

  .cit-scan__analyzing-content {
    text-align: center;
    max-width: 400px;
    padding: var(--space-8);
  }

  .cit-scan__analyzing-icon {
    color: var(--color-navy-500);
    margin-bottom: var(--space-6);
    animation: spin 1.2s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .cit-scan__analyzing-title {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-navy-900);
    margin: 0 0 var(--space-2) 0;
  }

  .cit-scan__analyzing-subtitle {
    font-size: var(--font-size-sm);
    color: var(--color-gray-600);
    margin: 0 0 var(--space-8) 0;
    font-style: italic;
  }

  .cit-scan__analyzing-steps {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    margin-bottom: var(--space-8);
    text-align: left;
  }

  .cit-scan__analyzing-step {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3);
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
    color: var(--color-gray-500);
    transition: all var(--transition-base);
  }

  .cit-scan__analyzing-step--active {
    background: var(--color-navy-50);
    color: var(--color-navy-700);
    font-weight: var(--font-weight-medium);
  }

  .cit-scan__analyzing-step--done {
    color: var(--color-success-600);
  }

  .cit-scan__analyzing-step-icon {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .cit-scan__analyzing-step-dot {
    width: 8px;
    height: 8px;
    border-radius: var(--radius-full);
    background: currentColor;
    animation: pulse 1s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.4; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1.2); }
  }

  /* Results */
  .cit-scan__disclaimer {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    padding: var(--space-4);
    background: var(--color-navy-50);
    border: 1px solid var(--color-navy-100);
    border-radius: var(--radius-lg);
    margin-bottom: var(--space-6);
  }

  .cit-scan__disclaimer-icon {
    font-size: var(--font-size-xl);
    flex-shrink: 0;
  }

  .cit-scan__disclaimer-text {
    font-size: var(--font-size-sm);
    color: var(--color-navy-700);
    margin: 0;
    line-height: 1.6;
  }

  .cit-scan__result-banner {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-6);
    border-radius: var(--radius-xl);
    margin-bottom: var(--space-6);
  }

  .cit-scan__result-banner--success {
    background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
    border: 1px solid #a5d6a7;
  }

  .cit-scan__result-banner--warning {
    background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
    border: 1px solid #ffe082;
  }

  .cit-scan__result-banner--danger {
    background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
    border: 1px solid #ef9a9a;
  }

  .cit-scan__result-icon {
    font-size: 3rem;
    line-height: 1;
  }

  .cit-scan__result-content {
    flex: 1;
  }

  .cit-scan__result-title {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-bold);
    margin: 0 0 var(--space-1) 0;
    color: var(--color-navy-900);
  }

  .cit-scan__result-confidence {
    font-size: var(--font-size-sm);
    color: var(--color-gray-600);
    margin: 0;
  }

  .cit-scan__result-explanation,
  .cit-scan__result-flags,
  .cit-scan__detected-info,
  .cit-scan__next-step {
    background: var(--color-white);
    border: 1px solid var(--color-gray-200);
    border-radius: var(--radius-lg);
    padding: var(--space-5);
    margin-bottom: var(--space-4);
  }

  .cit-scan__result-explanation p,
  .cit-scan__next-step p {
    font-size: var(--font-size-sm);
    color: var(--color-gray-700);
    line-height: 1.7;
    margin: 0;
  }

  .cit-scan__flags-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .cit-scan__flag-item {
    display: flex;
    align-items: flex-start;
    gap: var(--space-2);
    font-size: var(--font-size-sm);
    color: var(--color-error-600);
    font-weight: var(--font-weight-medium);
  }

  .cit-scan__flag-bullet {
    color: var(--color-error-600);
    font-size: var(--font-size-lg);
    line-height: 1.3;
  }

  .cit-scan__result-image {
    margin-bottom: var(--space-4);
  }

  .cit-scan__result-image-container {
    border-radius: var(--radius-lg);
    overflow: hidden;
    border: 1px solid var(--color-gray-200);
  }

  .cit-scan__result-image-preview {
    width: 100%;
    max-height: 300px;
    object-fit: contain;
    background: var(--color-gray-100);
    display: block;
  }

  .cit-scan__detected-note {
    font-size: var(--font-size-xs);
    color: var(--color-gray-500);
    margin: 0 0 var(--space-4) 0;
    font-style: italic;
  }

  .cit-scan__info-grid {
    display: grid;
    gap: var(--space-2);
  }

  .cit-scan__info-row {
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: var(--space-3);
    padding: var(--space-2) 0;
    border-bottom: 1px solid var(--color-gray-100);
    font-size: var(--font-size-sm);
  }

  .cit-scan__info-row:last-child {
    border-bottom: none;
  }

  .cit-scan__info-label {
    font-weight: var(--font-weight-semibold);
    color: var(--color-gray-600);
  }

  .cit-scan__info-value {
    color: var(--color-gray-900);
  }

  .cit-scan__result-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-3);
    padding-top: var(--space-4);
  }

  .cit-scan__spinner {
    animation: spin 1s linear infinite;
  }

  /* Mobile */
  @media (max-width: 768px) {
    .cit-scan {
      padding: var(--space-4);
    }

    .cit-scan__capture-section {
      flex-direction: column;
    }

    .cit-scan__divider {
      margin: 0;
    }

    .cit-scan__actions {
      flex-direction: column;
    }

    .cit-scan__actions button {
      width: 100%;
    }

    .cit-scan__info-row {
      grid-template-columns: 120px 1fr;
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleId = 'citizen-scan-styles';
  if (!document.getElementById(styleId)) {
    const styleEl = document.createElement('style');
    styleEl.id = styleId;
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
  }
}

export default CitizenScanPage;