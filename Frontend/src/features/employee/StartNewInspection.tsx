import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { useUserStore, useInspectionStore } from '../../store';
import { Employee } from '../../types/user';
import {
  generateInspectionId,
  assessImageQuality,
  saveDraft,
  getQualityDescription,
  PackageImage,
  ImageQualityStatus,
  InspectionDraft,
} from '../../services/inspection.service';
import { CameraView } from '../scan/CameraView';

/* ==========================================================================
   Helpers
   ========================================================================== */

const QUALITY_LABELS: Record<ImageQualityStatus, string> = {
  good: 'GOOD',
  warning: 'WARNING',
  review_required: 'REVIEW REQUIRED',
};

const QUALITY_VARIANT: Record<ImageQualityStatus, 'success' | 'warning' | 'error'> = {
  good: 'success',
  warning: 'warning',
  review_required: 'error',
};

const IMAGE_TYPE_LABELS: Record<PackageImage['type'], string> = {
  front: 'Front',
  back: 'Back',
  side: 'Side',
  label: 'Label',
  evidence: 'Additional Evidence',
};

const IMAGE_TYPE_OPTIONS: PackageImage['type'][] = ['front', 'back', 'side', 'label', 'evidence'];

const PRODUCT_CATEGORIES = [
  'Packaged Food',
  'Beverage',
  'Pharmaceutical',
  'Cosmetics',
  'Household Product',
  'Agricultural Input',
  'Electronic Goods',
  'Textile',
  'Other',
];

const PACKAGE_TYPES = [
  'Bottle',
  'Pouch',
  'Box / Carton',
  'Jar',
  'Sachet',
  'Can',
  'Pallet',
  'Other',
];

const getCurrentDate = () => {
  return new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getCurrentTime = () => {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

/* ==========================================================================
   Image Card
   ========================================================================== */

interface ImageCardProps {
  image: PackageImage;
  onRemove: (id: string) => void;
  onChangeType: (id: string, type: PackageImage['type']) => void;
  onView: (imageData: string) => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ image, onRemove, onChangeType, onView }) => {
  const { overall, lighting, blur, visibility } = image.quality;

  return (
    <div className="sni-image-card">
      <div className="sni-image-card__thumb" onClick={() => onView(image.imageData)}>
        <img src={image.imageData} alt={IMAGE_TYPE_LABELS[image.type]} />
        <div className={`sni-image-card__quality-strip sni-quality-strip-${overall}`}>
          {QUALITY_LABELS[overall]}
        </div>
        <div className="sni-image-card__thumb-overlay">
          <span>🔍</span>
        </div>
      </div>
      <div className="sni-image-card__body">
        <select
          className="sni-image-card__type"
          value={image.type}
          onChange={(e) => onChangeType(image.id, e.target.value as PackageImage['type'])}
          aria-label="Image type"
        >
          {IMAGE_TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>{IMAGE_TYPE_LABELS[t]}</option>
          ))}
        </select>
        <div className="sni-image-card__meta">
          <span className="sni-image-card__time">
            Captured {new Date(image.capturedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <Badge variant={QUALITY_VARIANT[overall]} size="sm">
            {QUALITY_LABELS[overall]}
          </Badge>
        </div>
        <div className="sni-image-card__quality">
          <span title={getQualityDescription(lighting, 'lighting')}>
            💡 <span className={`sni-quality-${lighting}`}>{QUALITY_LABELS[lighting]}</span>
          </span>
          <span title={getQualityDescription(blur, 'blur')}>
            🌫️ <span className={`sni-quality-${blur}`}>{QUALITY_LABELS[blur]}</span>
          </span>
          <span title={getQualityDescription(visibility, 'visibility')}>
            👁️ <span className={`sni-quality-${visibility}`}>{QUALITY_LABELS[visibility]}</span>
          </span>
        </div>
        {overall !== 'good' && (
          <p className="sni-image-card__hint" title={getQualityDescription(overall, 'overall')}>
            {overall === 'review_required' ? '⚠️ ' : 'ℹ️ '}
            {getQualityDescription(overall, 'overall')}
          </p>
        )}
        <div className="sni-image-card__actions">
          <Button variant="ghost" size="sm" onClick={() => onView(image.imageData)}>View</Button>
          <Button variant="ghost" size="sm" onClick={() => onRemove(image.id)}>Remove</Button>
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   Main component
   ========================================================================== */

export const StartNewInspection: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { setInspectionData } = useInspectionStore();

  // Header info
  const inspectionId = generateInspectionId();
  const [currentDate] = useState(getCurrentDate());
  const [currentTime] = useState(getCurrentTime());

  // Images
  const [images, setImages] = useState<PackageImage[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [pendingUpload, setPendingUpload] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Form fields
  const [form, setForm] = useState({
    productName: '',
    productCategory: '',
    manufacturer: '',
    retailer: '',
    location: '',
    packageType: '',
    barcode: '',
  });

  // Draft state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // File input ref for upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Employee info
  const employee = user?.role === 'employee' ? (user as Employee) : null;

  /* ---- Image handling ---- */

  const addImage = useCallback((imageData: string, type: PackageImage['type'] = 'front') => {
    const quality = assessImageQuality(imageData);
    const newImage: PackageImage = {
      id: `img-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      imageData,
      type,
      capturedAt: new Date().toISOString(),
      quality,
    };
    setImages((prev) => [...prev, newImage]);
    setIsCameraOpen(false);
    setIsUploadOpen(false);
    setPendingUpload(null);
    setValidationErrors([]);
  }, []);

  const handleCapture = useCallback((imageData: string) => {
    addImage(imageData, 'front');
  }, [addImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setValidationErrors(['Please select a supported image file (JPG, PNG, GIF, WebP).']);
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setValidationErrors(['File size exceeds 10 MB. Please select a smaller image.']);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPendingUpload(dataUrl);
    };
    reader.onerror = () => {
      setValidationErrors(['Failed to read the image file. Please try again.']);
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleUploadConfirm = () => {
    if (pendingUpload) {
      addImage(pendingUpload, 'front');
    }
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const changeImageType = (id: string, type: PackageImage['type']) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, type } : img))
    );
  };

  const openPreview = (imageData: string) => {
    setPreviewImage(imageData);
    setIsPreviewOpen(true);
  };

  /* ---- Form handling ---- */

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setValidationErrors([]);
  };

  /* ---- Validation ---- */

  const validate = (): boolean => {
    const errors: string[] = [];

    if (images.length === 0) {
      errors.push('Please upload at least one package image before continuing.');
    }

    if (!form.productName.trim()) {
      errors.push('Product name is required.');
    }

    if (!form.location.trim()) {
      errors.push('Location is required.');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  /* ---- Save Draft ---- */

  const handleSaveDraft = () => {
    setIsSaving(true);
    const draft: InspectionDraft = {
      id: inspectionId,
      officerId: employee?.id ?? 'emp-001',
      officerName: employee?.name ?? 'Officer',
      office: employee?.office ?? 'Regional Metrology Office',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      productName: form.productName,
      productCategory: form.productCategory,
      manufacturer: form.manufacturer,
      retailer: form.retailer,
      location: form.location,
      packageType: form.packageType,
      barcode: form.barcode,
      images,
      status: 'draft',
    };

    setTimeout(() => {
      saveDraft(draft);
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 600);
  };

  /* ---- Continue to Analysis ---- */

  const handleContinue = () => {
    if (!validate()) return;
    // Persist inspection draft into store for the analysis page
    setInspectionData({
      inspectionId,
      officerId: employee?.id ?? 'emp-001',
      officerName: employee?.name ?? 'Officer',
      office: employee?.office ?? 'Regional Metrology Office',
      images,
      form: { ...form },
    });
    navigate('/employee/inspection/analysis');
  };

  /* ---- Cancel ---- */

  const handleCancel = () => {
    navigate('/employee/home');
  };

  /* ---- Computed values ---- */

  const uploadedCount = images.length;
  const maxImages = 10;

  return (
    <div className="page sni-page">
      {/* Header */}
      <div className="sni-header">
        <div className="sni-header__left">
          <h1 className="page-title">Start New Inspection</h1>
          <p className="page-subtitle">Capture or upload package images for compliance screening.</p>
        </div>
        <div className="sni-header__meta">
          <div className="sni-meta-item">
            <span className="sni-meta-label">Inspection ID</span>
            <span className="sni-meta-value sni-meta-value--id">{inspectionId}</span>
          </div>
          <div className="sni-meta-item">
            <span className="sni-meta-label">Officer</span>
            <span className="sni-meta-value">{employee?.name ?? 'Officer'}</span>
          </div>
          <div className="sni-meta-item">
            <span className="sni-meta-label">Office</span>
            <span className="sni-meta-value">{employee?.office ?? 'Regional Metrology Office'}</span>
          </div>
          <div className="sni-meta-item">
            <span className="sni-meta-label">Date</span>
            <span className="sni-meta-value">{currentDate}</span>
          </div>
          <div className="sni-meta-item">
            <span className="sni-meta-label">Time</span>
            <span className="sni-meta-value">{currentTime}</span>
          </div>
        </div>
      </div>

      <div className="sni-body">
        {/* Left column: Images + Inspection Details */}
        <div className="sni-main">

          {/* === Image capture options === */}
          <Card className="sni-card">
            <CardHeader>
              <CardTitle>Package Images</CardTitle>
              <span className="sni-images-count">
                {uploadedCount} / {maxImages} images uploaded
              </span>
            </CardHeader>
            <CardBody>
              {validationErrors.length > 0 && (
                <div className="sni-alert sni-alert--error" role="alert">
                  {validationErrors.map((err, i) => (
                    <p key={i} className="sni-alert__text">⚠️ {err}</p>
                  ))}
                </div>
              )}

              <div className="sni-capture-options">
                {/* Capture */}
                <button
                  className="sni-capture-option"
                  onClick={() => setIsCameraOpen(true)}
                  disabled={uploadedCount >= maxImages}
                  aria-label="Capture package image"
                >
                  <div className="sni-capture-option__icon">📷</div>
                  <div className="sni-capture-option__label">Capture Package</div>
                  <div className="sni-capture-option__hint">Use device camera</div>
                </button>

                {/* Upload */}
                <button
                  className="sni-capture-option"
                  onClick={() => setIsUploadOpen(true)}
                  disabled={uploadedCount >= maxImages}
                  aria-label="Upload image"
                >
                  <div className="sni-capture-option__icon">🖼️</div>
                  <div className="sni-capture-option__label">Upload Images</div>
                  <div className="sni-capture-option__hint">JPG, PNG, WebP (max 10 MB)</div>
                </button>

                {/* QR/Barcode — optional */}
                <button
                  className="sni-capture-option sni-capture-option--optional"
                  onClick={() => setValidationErrors(prev => [...prev, 'QR/Barcode scanning is optional and not yet implemented.'])}
                  aria-label="Scan QR or barcode"
                >
                  <div className="sni-capture-option__icon">🔳</div>
                  <div className="sni-capture-option__label">Scan QR / Barcode</div>
                  <div className="sni-capture-option__hint sni-capture-option__hint--optional">Optional</div>
                </button>
              </div>

              {/* Image gallery */}
              {uploadedCount === 0 ? (
                <div className="sni-empty">
                  <p>No package images uploaded.</p>
                  <p className="sni-empty__sub">Use the options above to capture or upload images of the product label and packaging.</p>
                </div>
              ) : (
                <div className="sni-gallery">
                  {images.map((img) => (
                    <ImageCard
                      key={img.id}
                      image={img}
                      onRemove={removeImage}
                      onChangeType={changeImageType}
                      onView={openPreview}
                    />
                  ))}
                  {uploadedCount < maxImages && (
                    <button
                      className="sni-gallery__add"
                      onClick={() => setIsUploadOpen(true)}
                      aria-label="Add more images"
                    >
                      <span>+ Add Image</span>
                      <span className="sni-gallery__add-hint">{maxImages - uploadedCount} remaining</span>
                    </button>
                  )}
                </div>
              )}

              <p className="sni-capture-hint">
                <strong>Guidance:</strong> Capture the complete package label with all required declarations — MRP, net quantity, manufacturer details, batch number, and best-before date must be clearly visible.
              </p>
            </CardBody>
          </Card>

          {/* === Inspection Details === */}
          <Card className="sni-card">
            <CardHeader>
              <CardTitle>Inspection Details</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="sni-form-grid">
                <div className="sni-form-field">
                  <Input
                    label="Product Name"
                    placeholder="e.g., ABC Biscuits Premium Pack"
                    value={form.productName}
                    onChange={(e) => updateForm('productName', e.target.value)}
                    required
                  />
                </div>
                <div className="sni-form-field">
                  <label className="sni-form-label">Product Category</label>
                  <select
                    className="sni-form-select"
                    value={form.productCategory}
                    onChange={(e) => updateForm('productCategory', e.target.value)}
                  >
                    <option value="">Select category</option>
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="sni-form-field">
                  <Input
                    label="Manufacturer"
                    placeholder="e.g., ABC Foods Pvt Ltd"
                    value={form.manufacturer}
                    onChange={(e) => updateForm('manufacturer', e.target.value)}
                  />
                </div>
                <div className="sni-form-field">
                  <Input
                    label="Retailer / Market"
                    placeholder="e.g., ABC Supermarket"
                    value={form.retailer}
                    onChange={(e) => updateForm('retailer', e.target.value)}
                  />
                </div>
                <div className="sni-form-field sni-form-field--full">
                  <Input
                    label="Location"
                    placeholder="e.g., ABC Supermarket, MG Road, City"
                    value={form.location}
                    onChange={(e) => updateForm('location', e.target.value)}
                    required
                  />
                </div>
                <div className="sni-form-field">
                  <label className="sni-form-label">Package Type</label>
                  <select
                    className="sni-form-select"
                    value={form.packageType}
                    onChange={(e) => updateForm('packageType', e.target.value)}
                  >
                    <option value="">Select package type</option>
                    {PACKAGE_TYPES.map((pt) => (
                      <option key={pt} value={pt}>{pt}</option>
                    ))}
                  </select>
                </div>
                <div className="sni-form-field">
                  <Input
                    label="Barcode / QR Code"
                    placeholder="Optional"
                    value={form.barcode}
                    onChange={(e) => updateForm('barcode', e.target.value)}
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Actions */}
        <div className="sni-actions">
          {saveSuccess && (
            <div className="sni-alert sni-alert--success" role="status">
              <span>✓</span> Draft saved successfully.
            </div>
          )}

          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={handleSaveDraft}
            loading={isSaving}
          >
            Save Draft
          </Button>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleContinue}
          >
            Continue to Analysis
          </Button>
          <Button
            variant="ghost"
            size="lg"
            fullWidth
            onClick={handleCancel}
          >
            Cancel
          </Button>

          <p className="sni-actions__note">
            Analysis workflow will begin after continuing.
          </p>
        </div>
      </div>

      {/* Camera Modal */}
      {isCameraOpen && (
        <div className="sni-modal-backdrop" onClick={() => setIsCameraOpen(false)}>
          <div className="sni-modal sni-modal--camera" onClick={(e) => e.stopPropagation()}>
            <div className="sni-modal__header">
              <h2 className="sni-modal__title">Capture Package Image</h2>
              <button
                className="sni-modal__close"
                onClick={() => setIsCameraOpen(false)}
                aria-label="Close camera"
              >
                ✕
              </button>
            </div>
            <div className="sni-modal__body">
              {typeof navigator !== 'undefined' &&
              navigator.mediaDevices &&
              typeof navigator.mediaDevices.getUserMedia === 'function' ? (
                <CameraView
                  onCapture={handleCapture}
                  onClose={() => setIsCameraOpen(false)}
                />
              ) : (
                <div className="sni-camera-unsupported">
                  <div className="sni-camera-unsupported__icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18 10l-6-6M6 10l6-6" />
                    </svg>
                  </div>
                  <h3>Camera not available</h3>
                  <p>Your device or browser does not support camera access. You can upload package images instead.</p>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setIsCameraOpen(false);
                      setIsUploadOpen(true);
                    }}
                  >
                    Upload Image Instead
                  </Button>
                </div>
              )}
              <div className="sni-camera-footer">
                <p className="sni-camera-hint">
                  <strong>Tip:</strong> Capture the complete package label. Ensure MRP, net quantity, and manufacturer details are readable.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setIsCameraOpen(false);
                    setIsUploadOpen(true);
                  }}
                >
                  Upload Image Instead
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadOpen && (
        <Modal
          isOpen={isUploadOpen}
          onClose={() => {
            setIsUploadOpen(false);
            setPendingUpload(null);
          }}
          title="Upload Package Image"
          size="md"
          footer={
            <>
              <Button variant="ghost" onClick={() => {
                setIsUploadOpen(false);
                setPendingUpload(null);
              }}>
                Cancel
              </Button>
              {pendingUpload && (
                <Button variant="primary" onClick={handleUploadConfirm}>
                  Add Image
                </Button>
              )}
            </>
          }
        >
          <div className="sni-upload-modal">
            {pendingUpload ? (
              <div className="sni-upload-preview">
                <img src={pendingUpload} alt="Preview" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPendingUpload(null)}
                >
                  Change Image
                </Button>
              </div>
            ) : (
              <div
                className="sni-upload-zone"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const dataUrl = ev.target?.result as string;
                      setPendingUpload(dataUrl);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label="Click or drag to upload image"
              >
                <span className="sni-upload-zone__icon">📁</span>
                <p className="sni-upload-zone__text">
                  Click to select an image or drag and drop here
                </p>
                <p className="sni-upload-zone__sub">
                  Supported formats: JPG, PNG, GIF, WebP (max 10 MB)
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
        </Modal>
      )}

      {/* Image Preview Modal */}
      {isPreviewOpen && previewImage && (
        <Modal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          title="Image Preview"
          size="lg"
        >
          <div className="sni-preview-modal">
            <img src={previewImage} alt="Preview" className="sni-preview-modal__img" />
          </div>
        </Modal>
      )}

      <style>{`
        .sni-page {
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Header */
        .sni-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: var(--space-6);
          flex-wrap: wrap;
          margin-bottom: var(--space-6);
          padding-bottom: var(--space-6);
          border-bottom: 1px solid var(--color-gray-200);
        }
        .sni-header__left { flex: 1; }
        .sni-header__meta {
          display: flex;
          gap: var(--space-4);
          flex-wrap: wrap;
        }
        .sni-meta-item {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
        }
        .sni-meta-label {
          font-size: var(--font-size-xs);
          color: var(--color-gray-500);
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
        .sni-meta-value {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
          color: var(--color-navy-900);
        }
        .sni-meta-value--id {
          font-family: var(--font-family-mono);
          color: var(--color-navy-700);
          font-size: var(--font-size-xs);
          letter-spacing: 0.5px;
        }

        @media (max-width: 768px) {
          .sni-header { flex-direction: column; }
          .sni-header__meta { justify-content: flex-start; }
          .sni-meta-item { align-items: flex-start; }
        }

        /* Body layout */
        .sni-body {
          display: flex;
          gap: var(--space-6);
          align-items: flex-start;
        }
        .sni-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: var(--space-5); }
        .sni-actions {
          width: 260px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          position: sticky;
          top: calc(var(--header-height) + var(--space-6));
        }
        .sni-actions__note {
          font-size: var(--font-size-xs);
          color: var(--color-gray-500);
          text-align: center;
          margin: 0;
        }

        @media (max-width: 900px) {
          .sni-body { flex-direction: column; }
          .sni-actions { width: 100%; position: static; }
        }

        /* Card */
        .sni-card { margin-bottom: 0; }
        .sni-card .card-body { padding: var(--space-5); }
        .sni-images-count {
          font-size: var(--font-size-sm);
          color: var(--color-gray-600);
        }

        /* Alerts */
        .sni-alert {
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-4);
        }
        .sni-alert--error {
          background: var(--color-error-100);
          border: 1px solid var(--color-error-600);
          color: var(--color-error-600);
        }
        .sni-alert--success {
          background: var(--color-success-100);
          border: 1px solid var(--color-success-600);
          color: var(--color-success-600);
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
        }
        .sni-alert__text { margin: 0; font-size: var(--font-size-sm); }
        .sni-alert__text + .sni-alert__text { margin-top: var(--space-1); }

        /* Capture options */
        .sni-capture-options {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-4);
          margin-bottom: var(--space-5);
        }
        .sni-capture-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-5) var(--space-4);
          background: var(--color-navy-50);
          border: 2px solid var(--color-navy-100);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: center;
          font-family: inherit;
        }
        .sni-capture-option:hover:not(:disabled) {
          border-color: var(--color-navy-500);
          background: var(--color-white);
          box-shadow: var(--shadow-md);
          transform: translateY(-1px);
        }
        .sni-capture-option:disabled { opacity: 0.5; cursor: not-allowed; }
        .sni-capture-option--optional {
          background: var(--color-gray-50);
          border-color: var(--color-gray-200);
        }
        .sni-capture-option--optional:hover:not(:disabled) {
          border-color: var(--color-gray-400);
        }
        .sni-capture-option__icon { font-size: 2rem; }
        .sni-capture-option__label {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
          color: var(--color-navy-900);
        }
        .sni-capture-option__hint {
          font-size: var(--font-size-xs);
          color: var(--color-gray-600);
        }
        .sni-capture-option__hint--optional {
          color: var(--color-gray-500);
          font-style: italic;
        }

        @media (max-width: 640px) {
          .sni-capture-options { grid-template-columns: 1fr 1fr; }
        }

        /* Empty state */
        .sni-empty {
          text-align: center;
          padding: var(--space-8) var(--space-4);
          background: var(--color-gray-100);
          border: 2px dashed var(--color-gray-300);
          border-radius: var(--radius-lg);
          margin-bottom: var(--space-4);
        }
        .sni-empty p { margin: 0; color: var(--color-gray-600); font-size: var(--font-size-base); }
        .sni-empty__sub { font-size: var(--font-size-sm); color: var(--color-gray-500); margin-top: var(--space-2); }

        /* Gallery */
        .sni-gallery {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: var(--space-4);
          margin-bottom: var(--space-4);
        }
        .sni-image-card {
          background: var(--color-white);
          border: 1px solid var(--color-gray-200);
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        .sni-image-card__thumb {
          position: relative;
          aspect-ratio: 4/3;
          overflow: hidden;
          cursor: pointer;
          background: var(--color-gray-100);
        }
        .sni-image-card__thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .sni-image-card__thumb-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity var(--transition-fast);
          font-size: 1.5rem;
        }
        .sni-image-card__thumb:hover .sni-image-card__thumb-overlay { opacity: 1; }
        .sni-image-card__body { padding: var(--space-3); }
        .sni-image-card__type {
          width: 100%;
          padding: var(--space-2) var(--space-3);
          border: 1px solid var(--color-gray-300);
          border-radius: var(--radius-sm);
          font-size: var(--font-size-sm);
          color: var(--color-navy-900);
          background: var(--color-white);
          margin-bottom: var(--space-2);
        }
        .sni-image-card__meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-2);
        }
        .sni-image-card__time { font-size: var(--font-size-xs); color: var(--color-gray-500); }
        .sni-image-card__quality {
          display: flex;
          gap: var(--space-2);
          flex-wrap: wrap;
          font-size: 10px;
          color: var(--color-gray-600);
          margin-bottom: var(--space-2);
        }
        .sni-image-card__quality span { display: flex; align-items: center; gap: 2px; }
        .sni-quality-good { color: var(--color-success-600); }
        .sni-quality-warning { color: var(--color-warning-600); }
        .sni-quality-review_required { color: var(--color-error-600); }
        .sni-image-card__actions { display: flex; gap: var(--space-2); }

        .sni-gallery__add {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--space-1);
          border: 2px dashed var(--color-gray-300);
          border-radius: var(--radius-md);
          padding: var(--space-5);
          background: var(--color-gray-50);
          cursor: pointer;
          color: var(--color-navy-600);
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
          transition: all var(--transition-fast);
          min-height: 180px;
          font-family: inherit;
        }
        .sni-gallery__add:hover { border-color: var(--color-navy-500); background: var(--color-navy-50); }
        .sni-gallery__add-hint { font-size: var(--font-size-xs); color: var(--color-gray-500); font-weight: normal; }

        /* Capture hint */
        .sni-capture-hint {
          font-size: var(--font-size-sm);
          color: var(--color-gray-600);
          background: var(--color-navy-50);
          border-left: 3px solid var(--color-navy-500);
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-md);
          margin: 0;
        }

        /* Form grid */
        .sni-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-4);
        }
        .sni-form-field { display: flex; flex-direction: column; }
        .sni-form-field--full { grid-column: span 2; }
        .sni-form-label {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
          color: var(--color-navy-900);
          margin-bottom: var(--space-2);
        }
        .sni-form-select {
          width: 100%;
          padding: var(--space-3) var(--space-4);
          border: 2px solid var(--color-gray-300);
          border-radius: var(--radius-md);
          font-size: var(--font-size-base);
          color: var(--color-navy-900);
          background: var(--color-white);
          transition: border-color var(--transition-fast);
          min-height: 44px;
        }
        .sni-form-select:focus {
          outline: none;
          border-color: var(--color-navy-500);
          box-shadow: 0 0 0 3px rgba(63, 81, 181, 0.15);
        }

        @media (max-width: 640px) {
          .sni-form-grid { grid-template-columns: 1fr; }
          .sni-form-field--full { grid-column: span 1; }
        }

        /* Camera modal */
        .sni-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          z-index: var(--z-modal);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-4);
        }
        .sni-modal {
          background: var(--color-white);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xl);
          max-width: 520px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }
        .sni-modal__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-4) var(--space-5);
          border-bottom: 1px solid var(--color-gray-200);
        }
        .sni-modal__title {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-bold);
          color: var(--color-navy-900);
          margin: 0;
        }
        .sni-modal__close {
          background: none;
          border: none;
          font-size: var(--font-size-lg);
          color: var(--color-gray-600);
          cursor: pointer;
          padding: var(--space-2);
          border-radius: var(--radius-md);
        }
        .sni-modal__close:hover { background: var(--color-gray-100); }
        .sni-modal__body { padding: var(--space-5); }
        .sni-camera-footer {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-3);
          margin-top: var(--space-4);
          padding-top: var(--space-4);
          border-top: 1px solid var(--color-gray-200);
        }
        .sni-camera-hint {
          font-size: var(--font-size-sm);
          color: var(--color-gray-600);
          text-align: center;
          margin: 0;
        }

        /* Upload modal */
        .sni-upload-modal { min-height: 200px; }
        .sni-upload-zone {
          border: 2px dashed var(--color-gray-300);
          border-radius: var(--radius-lg);
          padding: var(--space-10) var(--space-6);
          text-align: center;
          cursor: pointer;
          transition: all var(--transition-fast);
          background: var(--color-gray-50);
        }
        .sni-upload-zone:hover { border-color: var(--color-navy-500); background: var(--color-navy-50); }
        .sni-upload-zone__icon { font-size: 2.5rem; display: block; margin-bottom: var(--space-3); }
        .sni-upload-zone__text { font-size: var(--font-size-base); color: var(--color-navy-900); margin: 0 0 var(--space-2); font-weight: var(--font-weight-medium); }
        .sni-upload-zone__sub { font-size: var(--font-size-sm); color: var(--color-gray-500); margin: 0; }
        .sni-upload-preview {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-3);
        }
        .sni-upload-preview img {
          max-width: 100%;
          max-height: 300px;
          border-radius: var(--radius-md);
          border: 1px solid var(--color-gray-200);
        }

        /* Preview modal */
        .sni-preview-modal { display: flex; justify-content: center; }
        .sni-preview-modal__img {
          max-width: 100%;
          max-height: 60vh;
          object-fit: contain;
          border-radius: var(--radius-md);
        }

        /* Camera unsupported fallback */
        .sni-camera-unsupported {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: var(--space-4);
          padding: var(--space-8) var(--space-4);
          background: var(--color-gray-50);
          border-radius: var(--radius-lg);
          border: 2px dashed var(--color-gray-300);
        }
        .sni-camera-unsupported__icon { color: var(--color-gray-400); }
        .sni-camera-unsupported h3 {
          margin: 0;
          font-size: var(--font-size-lg);
          color: var(--color-navy-900);
        }
        .sni-camera-unsupported p {
          margin: 0;
          font-size: var(--font-size-sm);
          color: var(--color-gray-600);
          max-width: 280px;
        }

        /* Image card quality strip */
        .sni-image-card__quality-strip {
          position: absolute;
          top: var(--space-2);
          right: var(--space-2);
          padding: 2px var(--space-2);
          border-radius: 10px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .sni-quality-strip-good {
          background: rgba(76, 175, 80, 0.9);
          color: white;
        }
        .sni-quality-strip-warning {
          background: rgba(255, 152, 0, 0.9);
          color: white;
        }
        .sni-quality-strip-review_required {
          background: rgba(244, 67, 54, 0.9);
          color: white;
        }

        /* Image card quality hint */
        .sni-image-card__hint {
          font-size: 11px;
          color: var(--color-gray-600);
          margin: var(--space-1) 0;
          padding: var(--space-1) var(--space-2);
          background: var(--color-gray-50);
          border-radius: var(--radius-sm);
          border-left: 2px solid var(--color-gray-300);
        }
      `}</style>
    </div>
  );
};

export default StartNewInspection;
