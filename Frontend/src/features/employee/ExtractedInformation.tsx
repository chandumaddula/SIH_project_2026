import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { useInspectionStore } from '../../store';
import {
  ExtractedField,
  ConfidenceLevel,
  buildExtractedInformation,
  applyFieldEdit,
  applyOfficerNotes,
} from '../../services/extractedInfo.service';
import { MockOCRResult } from '../../services/analysis.service';

/* ==========================================================================
   Helpers
   ========================================================================== */

const CONFIDENCE_LABEL: Record<ConfidenceLevel, string> = {
  high: 'High Confidence',
  medium: 'Medium Confidence',
  low: 'Review Recommended',
};

const STATUS_BADGE: Record<string, 'info' | 'success' | 'warning' | 'error' | 'neutral'> = {
  extracted: 'success',
  edited: 'info',
  not_detected: 'neutral',
  review_required: 'warning',
};

const getCurrentDate = () =>
  new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

/* ==========================================================================
   Field Card
   ========================================================================== */

interface FieldCardProps {
  field: ExtractedField;
  onSave: (id: string, value: string) => void;
}

const FieldCard: React.FC<FieldCardProps> = ({ field, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(field.currentValue);
  const [showSuccess, setShowSuccess] = useState(false);

  const openEdit = () => {
    setEditValue(field.currentValue);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setEditValue(field.currentValue);
    setIsEditing(false);
  };

  const saveEdit = () => {
    onSave(field.id, editValue);
    setIsEditing(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const isNotDetected = !field.currentValue || field.currentValue.trim() === '';

  return (
    <div className={`eif-field-card eif-field-card--${field.status}`}>
      <div className="eif-field-card__header">
        <div className="eif-field-card__title-row">
          <h4 className="eif-field-card__title">{field.label}</h4>
          <Badge variant={STATUS_BADGE[field.status] ?? 'neutral'} size="sm">
            {field.status === 'edited' ? 'Manually Edited' : field.status === 'not_detected' ? 'Not Detected' : field.status === 'review_required' ? 'Review Required' : 'Extracted'}
          </Badge>
        </div>
        <div className="eif-field-card__confidence">
          <span className={`eif-confidence-bar eif-confidence-bar--${field.confidenceLevel}`}>
            <span
              className="eif-confidence-bar__fill"
              style={{ width: `${field.confidence}%` }}
            />
          </span>
          <span className={`eif-confidence-label eif-confidence-label--${field.confidenceLevel}`}>
            {isNotDetected ? '—' : `${field.confidence}%`} · {CONFIDENCE_LABEL[field.confidenceLevel]}
          </span>
        </div>
      </div>

      <div className="eif-field-card__body">
        {isEditing ? (
          <div className="eif-field-card__edit">
            {field.isEdited && field.originalValue && (
              <div className="eif-field-card__original">
                <span className="eif-field-card__original-label">Original:</span>
                <span className="eif-field-card__original-value">{field.originalValue}</span>
              </div>
            )}
            <input
              className="eif-field-card__input"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveEdit();
                if (e.key === 'Escape') cancelEdit();
              }}
              autoFocus
              aria-label={`Edit ${field.label}`}
            />
            <div className="eif-field-card__edit-actions">
              <Button variant="primary" size="sm" onClick={saveEdit}>Save</Button>
              <Button variant="ghost" size="sm" onClick={cancelEdit}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="eif-field-card__value-row">
            <span className={`eif-field-card__value ${isNotDetected ? 'eif-field-card__value--empty' : ''}`}>
              {isNotDetected ? 'Not detected' : field.currentValue}
            </span>
            {field.isEdited && field.originalValue && (
              <div className="eif-field-card__original">
                <span className="eif-field-card__original-label">Original:</span>
                <span className="eif-field-card__original-value">{field.originalValue}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="eif-field-card__footer">
        <span className="eif-field-card__source">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          Source: {field.sourceImageType}
        </span>
        {showSuccess && (
          <span className="eif-field-card__saved">
            ✓ Updated
          </span>
        )}
        {!isEditing && (
          <Button variant="outline" size="sm" onClick={openEdit}>
            Edit
          </Button>
        )}
      </div>
    </div>
  );
};

/* ==========================================================================
   Main component
   ========================================================================== */

export const ExtractedInformation: React.FC = () => {
  const navigate = useNavigate();
  const { inspectionId, officerName, images, form, extractedInfo, setExtractedInfo } = useInspectionStore();

  // Build mock extracted info if not already set (e.g., navigated directly or via Continue Manually)
  const [localInfo, setLocalInfo] = useState(extractedInfo);

  // Build from store or generate a default if coming via Continue Manually
  useEffect(() => {
    if (!localInfo && images.length > 0) {
      // Create a synthetic mock OCR result for Continue Manually path
      const mockOCR: MockOCRResult = {
        success: true,
        detectedTexts: [],
        declarations: [
          { type: 'mrp', label: 'MRP', value: form.productName ? '₹50.00' : '₹50.00', confidence: 94, rawText: 'MRP ₹50.00' },
          { type: 'net_quantity', label: 'Net Quantity', value: '500 g', confidence: 92, rawText: 'Net Qty 500 g' },
          { type: 'manufacturer', label: 'Manufacturer', value: form.manufacturer || 'ABC Foods Pvt. Ltd.', confidence: 88, rawText: 'Manufactured by ABC Foods Pvt. Ltd.' },
          { type: 'batch_number', label: 'Batch Number', value: 'BN-2026-08-A', confidence: 85, rawText: 'Batch No. BN-2026-08-A' },
          { type: 'best_before', label: 'Best Before', value: '31 Mar 2027', confidence: 90, rawText: 'Best Before 31 Mar 2027' },
          { type: 'marketed_by', label: 'Marketed By', value: 'ABC Foods Pvt. Ltd., Mumbai', confidence: 82, rawText: 'Marketed By: ABC Foods Pvt. Ltd., Mumbai' },
          { type: 'country', label: 'Country of Origin', value: 'India', confidence: 97, rawText: 'Country of Origin: India' },
          { type: 'ingredients', label: 'Ingredients', value: 'Wheat Flour, Sugar, Palm Oil, Salt, Baking Soda', confidence: 78, rawText: 'Ingredients: Wheat Flour, Sugar, Palm Oil...' },
        ],
        productName: form.productName || 'ABC Biscuits Premium Pack',
        category: form.productCategory || 'Packaged Food',
        overallConfidence: 89,
        textDetectionConfidence: 95,
        ocrConfidence: 93,
        declarationDetectionConfidence: 90,
        qualityWarning: null,
        regionHighlights: [],
      };
      const built = buildExtractedInformation(
        mockOCR,
        inspectionId,
        { packageType: form.packageType, retailer: form.retailer }
      );
      setLocalInfo(built);
    }
  }, [localInfo, images, form, inspectionId]);

  // Unsaved changes tracking
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  /* ---- Field save ---- */

  const handleFieldSave = (fieldId: string, newValue: string) => {
    setLocalInfo(prev => {
      if (!prev) return prev;
      return applyFieldEdit(prev, fieldId, newValue);
    });
    setHasUnsavedChanges(true);
  };

  /* ---- Officer notes ---- */

  const handleNotesChange = (notes: string) => {
    setLocalInfo(prev => {
      if (!prev) return prev;
      return applyOfficerNotes(prev, notes);
    });
    setHasUnsavedChanges(true);
  };

  /* ---- Save draft ---- */

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveDraft = () => {
    if (!localInfo) return;
    setIsSaving(true);
    setExtractedInfo(localInfo);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setHasUnsavedChanges(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 600);
  };

  /* ---- Navigation ---- */

  const handleBack = () => {
    if (hasUnsavedChanges) {
      setShowDiscardModal(true);
    } else {
      navigate('/employee/inspection/analysis');
    }
  };

  const handleContinue = () => {
    if (localInfo) {
      setExtractedInfo(localInfo);
    }
    navigate('/employee/inspection/readability');
  };

  const handleDiscardAndBack = () => {
    setShowDiscardModal(false);
    navigate('/employee/inspection/analysis');
  };

  /* ---- Raw text collapse ---- */

  const [rawTextOpen, setRawTextOpen] = useState(false);

  /* ---- Render ---- */

  const currentInfo = localInfo ?? extractedInfo;

  if (!currentInfo) {
    return (
      <div className="page">
        <Card>
          <CardBody>
            <div style={{ textAlign: 'center', padding: 'var(--space-12) 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>📋</div>
              <h2 style={{ marginBottom: 'var(--space-4)' }}>Extracted Product Information</h2>
              <p style={{ color: 'var(--color-gray-600)' }}>
                No analysis data available. Please complete the image analysis first.
              </p>
              <div style={{ marginTop: 'var(--space-6)' }}>
                <Button variant="primary" onClick={() => navigate('/employee/inspection/new')}>
                  Start New Inspection
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  const { productSummary, fields, rawText, qualitySummary } = currentInfo;
  const reviewFields = fields.filter(f => f.confidence < 70 || f.status === 'review_required' || f.status === 'not_detected');
  const primaryFields = fields.filter(f => f.status !== 'not_detected');
  const currentDate = getCurrentDate();

  return (
    <div className="page eif-page">
      {/* Header */}
      <div className="eif-header">
        <div className="eif-header__left">
          <h1 className="page-title">Extracted Product Information</h1>
          <p className="page-subtitle">
            Review the information detected from the package images before continuing to compliance screening.
          </p>
        </div>
        <div className="eif-header__meta">
          <div className="eif-meta-item">
            <span className="eif-meta-label">Inspection ID</span>
            <span className="eif-meta-value eif-meta-value--id">{inspectionId || 'N/A'}</span>
          </div>
          <div className="eif-meta-item">
            <span className="eif-meta-label">Officer</span>
            <span className="eif-meta-value">{officerName || 'Officer'}</span>
          </div>
          <div className="eif-meta-item">
            <span className="eif-meta-label">Date</span>
            <span className="eif-meta-value">{currentDate}</span>
          </div>
        </div>
      </div>

      {/* Demo banner */}
      <div className="eif-demo-banner" role="status">
        <span className="eif-demo-banner__icon">ℹ️</span>
        <span>
          <strong>Demo / Mock OCR Data</strong> — Values shown are simulated and do not originate from a real OCR engine.
          All fields require officer verification before compliance determination.
        </span>
      </div>

      <div className="eif-body">
        {/* Left column */}
        <div className="eif-main">

          {/* Product image + summary */}
          <Card className="eif-card">
            <CardHeader>
              <CardTitle>Product Summary</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="eif-product-row">
                {images.length > 0 && (
                  <div className="eif-product-thumb">
                    <img src={images[0].imageData} alt="Package" />
                  </div>
                )}
                <div className="eif-product-details">
                  <div className="eif-detail-row">
                    <span className="eif-detail-label">Product Name</span>
                    <span className="eif-detail-value">{productSummary.productName}</span>
                  </div>
                  <div className="eif-detail-row">
                    <span className="eif-detail-label">Category</span>
                    <span className="eif-detail-value">{productSummary.productCategory}</span>
                  </div>
                  <div className="eif-detail-row">
                    <span className="eif-detail-label">Package Type</span>
                    <span className="eif-detail-value">{productSummary.packageType}</span>
                  </div>
                  <div className="eif-detail-row">
                    <span className="eif-detail-label">Manufacturer</span>
                    <span className="eif-detail-value">{productSummary.manufacturer}</span>
                  </div>
                  <div className="eif-detail-row">
                    <span className="eif-detail-label">Retailer</span>
                    <span className="eif-detail-value">{productSummary.retailer}</span>
                  </div>
                  <div className="eif-detail-row">
                    <span className="eif-detail-label">Country of Origin</span>
                    <span className="eif-detail-value">{productSummary.countryOfOrigin}</span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Extraction quality summary */}
          <Card className="eif-card">
            <CardHeader>
              <CardTitle>Extraction Quality Summary</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="eif-quality-grid">
                <div className="eif-quality-item">
                  <span className="eif-quality-number">{qualitySummary.fieldsDetected}</span>
                  <span className="eif-quality-label">Fields Detected</span>
                </div>
                <div className="eif-quality-item eif-quality-item--good">
                  <span className="eif-quality-number">{qualitySummary.highConfidence}</span>
                  <span className="eif-quality-label">High Confidence</span>
                </div>
                <div className="eif-quality-item eif-quality-item--warn">
                  <span className="eif-quality-number">{qualitySummary.reviewRecommended}</span>
                  <span className="eif-quality-label">Review Recommended</span>
                </div>
                <div className="eif-quality-item eif-quality-item--empty">
                  <span className="eif-quality-number">{qualitySummary.notDetected}</span>
                  <span className="eif-quality-label">Not Detected</span>
                </div>
              </div>
              <p className="eif-quality-note">
                These are demo confidence values. They do not represent scientifically validated OCR accuracy.
              </p>
            </CardBody>
          </Card>

          {/* Detected Declarations */}
          <Card className="eif-card">
            <CardHeader>
              <CardTitle>Detected Declarations</CardTitle>
              <span className="eif-card-count">{primaryFields.length} fields</span>
            </CardHeader>
            <CardBody>
              <div className="eif-fields-grid">
                {primaryFields.map((field) => (
                  <FieldCard
                    key={field.id}
                    field={field}
                    onSave={handleFieldSave}
                  />
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Fields requiring review */}
          {reviewFields.length > 0 && (
            <Card className="eif-card eif-card--review">
              <CardHeader>
                <CardTitle>Fields Requiring Review</CardTitle>
                <Badge variant="warning" size="sm">{reviewFields.length}</Badge>
              </CardHeader>
              <CardBody>
                <div className="eif-review-list">
                  {reviewFields.map((field) => (
                    <div key={field.id} className="eif-review-item">
                      <div className="eif-review-item__header">
                        <span className="eif-review-item__title">{field.label}</span>
                        <Badge variant="warning" size="sm">Review Required</Badge>
                      </div>
                      <p className="eif-review-item__value">
                        {field.currentValue || 'Not clearly detected'}
                        {field.currentValue && <span className="eif-review-item__confidence"> — {field.confidence}% confidence</span>}
                      </p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Raw detected text */}
          <Card className="eif-card">
            <CardHeader>
              <CardTitle>Detected Text (Mock OCR Output)</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRawTextOpen(o => !o)}
              >
                {rawTextOpen ? '▲ Hide' : '▼ Show'}
              </Button>
            </CardHeader>
            {rawTextOpen && (
              <CardBody>
                <pre className="eif-raw-text">{rawText}</pre>
                <p className="eif-raw-note">This is mock OCR output. Do not represent as real text extraction.</p>
              </CardBody>
            )}
          </Card>

          {/* Officer notes */}
          <Card className="eif-card">
            <CardHeader>
              <CardTitle>Officer Notes</CardTitle>
            </CardHeader>
            <CardBody>
              <textarea
                className="eif-notes"
                placeholder="Add observations about the extracted information — discrepancies, unclear text, additional context..."
                value={currentInfo.officerNotes}
                onChange={(e) => handleNotesChange(e.target.value)}
                rows={4}
                aria-label="Officer notes"
              />
            </CardBody>
          </Card>
        </div>

        {/* Sticky action sidebar */}
        <div className="eif-actions">
          {saveSuccess && (
            <div className="eif-alert eif-alert--success">
              ✓ Draft saved successfully
            </div>
          )}

          <div className="eif-actions__card">
            <h3 className="eif-actions__title">Actions</h3>
            <Button variant="secondary" size="lg" fullWidth onClick={handleSaveDraft} loading={isSaving}>
              Save Draft
            </Button>
            <Button variant="primary" size="lg" fullWidth onClick={handleContinue}>
              Continue to Readability Analysis →
            </Button>
            <Button variant="ghost" size="sm" fullWidth onClick={handleBack}>
              ← Back to Analysis
            </Button>
          </div>

          <div className="eif-actions__info">
            <p>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4M12 16h.01"/>
              </svg>
              Officer verification is required before any compliance determination.
            </p>
          </div>
        </div>
      </div>

      {/* Unsaved changes modal */}
      <Modal
        isOpen={showDiscardModal}
        onClose={() => setShowDiscardModal(false)}
        title="Unsaved Changes"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowDiscardModal(false)}>
              Stay on Page
            </Button>
            <Button variant="primary" onClick={handleDiscardAndBack}>
              Discard & Go Back
            </Button>
          </>
        }
      >
        <p style={{ margin: 0 }}>
          You have unsaved changes to the extracted information. Going back will discard these changes.
        </p>
      </Modal>

      <style>{`
        .eif-page {
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Header */
        .eif-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: var(--space-6);
          flex-wrap: wrap;
          margin-bottom: var(--space-4);
        }
        .eif-header__left { flex: 1; }
        .eif-header__meta { display: flex; gap: var(--space-4); flex-wrap: wrap; }
        .eif-meta-item {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
        }
        .eif-meta-label {
          font-size: var(--font-size-xs);
          color: var(--color-gray-500);
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
        .eif-meta-value {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
          color: var(--color-navy-900);
        }
        .eif-meta-value--id {
          font-family: var(--font-family-mono);
          color: var(--color-navy-700);
          font-size: var(--font-size-xs);
        }

        /* Demo banner */
        .eif-demo-banner {
          display: flex;
          align-items: flex-start;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-4);
          background: var(--color-navy-50);
          border-left: 4px solid var(--color-navy-500);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-4);
          font-size: var(--font-size-sm);
          color: var(--color-navy-900);
        }
        .eif-demo-banner__icon { font-size: 1.2rem; flex-shrink: 0; }

        /* Body */
        .eif-body {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: var(--space-5);
          align-items: flex-start;
        }
        .eif-main { display: flex; flex-direction: column; gap: var(--space-4); }

        @media (max-width: 900px) {
          .eif-body { grid-template-columns: 1fr; }
          .eif-actions { position: static; order: -1; }
        }
        @media (max-width: 768px) {
          .eif-header { flex-direction: column; }
          .eif-header__meta { justify-content: flex-start; }
          .eif-meta-item { align-items: flex-start; }
        }

        /* Card */
        .eif-card { margin-bottom: 0; }
        .eif-card--review { border: 2px solid var(--color-warning-300, #fcd9a8); }
        .eif-card .card-body { padding: var(--space-4) var(--space-5); }
        .eif-card-count {
          font-size: var(--font-size-sm);
          color: var(--color-gray-600);
        }

        /* Product summary */
        .eif-product-row {
          display: flex;
          gap: var(--space-4);
          align-items: flex-start;
        }
        .eif-product-thumb {
          width: 100px;
          height: 80px;
          border-radius: var(--radius-md);
          overflow: hidden;
          flex-shrink: 0;
          background: var(--color-gray-100);
        }
        .eif-product-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .eif-product-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .eif-detail-row {
          display: grid;
          grid-template-columns: 130px 1fr;
          gap: var(--space-2);
          align-items: baseline;
        }
        .eif-detail-label {
          font-size: var(--font-size-xs);
          color: var(--color-gray-500);
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .eif-detail-value {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
          color: var(--color-navy-900);
        }

        /* Quality summary */
        .eif-quality-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-3);
          margin-bottom: var(--space-3);
        }
        .eif-quality-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: var(--space-3);
          background: var(--color-navy-50);
          border-radius: var(--radius-md);
          text-align: center;
        }
        .eif-quality-item--good { background: var(--color-success-50, #e8f5e9); }
        .eif-quality-item--warn { background: var(--color-warning-50, #fff3e0); }
        .eif-quality-item--empty { background: var(--color-gray-100); }
        .eif-quality-number {
          font-size: 1.8rem;
          font-weight: var(--font-weight-bold);
          color: var(--color-navy-900);
          line-height: 1;
        }
        .eif-quality-item--warn .eif-quality-number { color: var(--color-warning-600, #f57c00); }
        .eif-quality-label {
          font-size: 10px;
          color: var(--color-gray-700);
          margin-top: var(--space-1);
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .eif-quality-note {
          font-size: 11px;
          color: var(--color-gray-500);
          margin: 0;
          font-style: italic;
        }

        /* Fields grid */
        .eif-fields-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-3);
        }
        @media (max-width: 640px) {
          .eif-fields-grid { grid-template-columns: 1fr; }
        }

        /* Field card */
        .eif-field-card {
          border: 1px solid var(--color-gray-200);
          border-radius: var(--radius-md);
          background: var(--color-white);
          overflow: hidden;
        }
        .eif-field-card--review_required { border-color: var(--color-warning-400, #ffa726); }
        .eif-field-card--not_detected { border-color: var(--color-gray-300, #ccc); opacity: 0.8; }

        .eif-field-card__header {
          padding: var(--space-3) var(--space-3) var(--space-2);
          border-bottom: 1px solid var(--color-gray-100);
          background: var(--color-gray-50);
        }
        .eif-field-card__title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: var(--space-2);
          margin-bottom: var(--space-1);
        }
        .eif-field-card__title {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-bold);
          color: var(--color-navy-900);
          margin: 0;
        }
        .eif-field-card__confidence {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        .eif-confidence-bar {
          flex: 1;
          height: 4px;
          background: var(--color-gray-200);
          border-radius: 2px;
          overflow: hidden;
          max-width: 80px;
        }
        .eif-confidence-bar__fill {
          height: 100%;
          border-radius: 2px;
          display: block;
        }
        .eif-confidence-bar--high .eif-confidence-bar__fill { background: var(--color-success-600, #2e7d32); }
        .eif-confidence-bar--medium .eif-confidence-bar__fill { background: var(--color-warning-600, #f57c00); }
        .eif-confidence-bar--low .eif-confidence-bar__fill { background: var(--color-error-600, #d32f2f); }
        .eif-confidence-label { font-size: 10px; }
        .eif-confidence-label--high { color: var(--color-success-600, #2e7d32); }
        .eif-confidence-label--medium { color: var(--color-warning-600, #f57c00); }
        .eif-confidence-label--low { color: var(--color-error-600, #d32f2f); }

        .eif-field-card__body { padding: var(--space-3); }
        .eif-field-card__value-row { display: flex; flex-direction: column; gap: var(--space-1); }
        .eif-field-card__value {
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          color: var(--color-navy-900);
          font-family: var(--font-family-mono);
        }
        .eif-field-card__value--empty { color: var(--color-gray-500); font-style: italic; font-family: inherit; }
        .eif-field-card__original {
          display: flex;
          gap: var(--space-1);
          font-size: 11px;
          color: var(--color-gray-500);
          align-items: baseline;
        }
        .eif-field-card__original-label { font-style: italic; }
        .eif-field-card__original-value { font-family: var(--font-family-mono); text-decoration: line-through; }

        .eif-field-card__edit { display: flex; flex-direction: column; gap: var(--space-2); }
        .eif-field-card__input {
          width: 100%;
          padding: var(--space-2) var(--space-3);
          border: 2px solid var(--color-navy-500);
          border-radius: var(--radius-sm);
          font-size: var(--font-size-sm);
          color: var(--color-navy-900);
          background: var(--color-white);
          outline: none;
        }
        .eif-field-card__edit-actions { display: flex; gap: var(--space-2); }

        .eif-field-card__footer {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          border-top: 1px solid var(--color-gray-100);
          background: var(--color-gray-50);
          font-size: 11px;
        }
        .eif-field-card__source {
          flex: 1;
          color: var(--color-gray-500);
          display: flex;
          align-items: center;
          gap: var(--space-1);
        }
        .eif-field-card__saved {
          color: var(--color-success-600, #2e7d32);
          font-weight: var(--font-weight-semibold);
          font-size: 11px;
        }

        /* Review list */
        .eif-review-list { display: flex; flex-direction: column; gap: var(--space-2); }
        .eif-review-item {
          padding: var(--space-2) var(--space-3);
          background: var(--color-warning-50, #fff3e0);
          border-radius: var(--radius-sm);
          border-left: 3px solid var(--color-warning-600, #f57c00);
        }
        .eif-review-item__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-1);
        }
        .eif-review-item__title { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-navy-900); }
        .eif-review-item__value { font-size: var(--font-size-sm); color: var(--color-gray-700); margin: 0; }
        .eif-review-item__confidence { font-size: 11px; color: var(--color-gray-500); }

        /* Raw text */
        .eif-raw-text {
          font-family: var(--font-family-mono);
          font-size: var(--font-size-sm);
          background: var(--color-gray-100);
          padding: var(--space-3);
          border-radius: var(--radius-md);
          white-space: pre-wrap;
          margin: 0 0 var(--space-2);
          color: var(--color-navy-900);
        }
        .eif-raw-note { font-size: 11px; color: var(--color-gray-500); margin: 0; font-style: italic; }

        /* Officer notes */
        .eif-notes {
          width: 100%;
          padding: var(--space-3);
          border: 2px solid var(--color-gray-300);
          border-radius: var(--radius-md);
          font-size: var(--font-size-sm);
          color: var(--color-navy-900);
          background: var(--color-white);
          resize: vertical;
          min-height: 80px;
          font-family: inherit;
          transition: border-color var(--transition-fast);
        }
        .eif-notes:focus { outline: none; border-color: var(--color-navy-500); }
        .eif-notes::placeholder { color: var(--color-gray-400); }

        /* Actions sidebar */
        .eif-actions {
          position: sticky;
          top: calc(var(--header-height) + var(--space-6));
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        .eif-actions__card {
          background: var(--color-white);
          border: 2px solid var(--color-navy-100);
          border-radius: var(--radius-lg);
          padding: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        .eif-actions__title {
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-bold);
          color: var(--color-navy-900);
          margin: 0 0 var(--space-2);
        }
        .eif-actions__info {
          font-size: 11px;
          color: var(--color-gray-600);
          display: flex;
          align-items: flex-start;
          gap: var(--space-2);
          padding: 0 var(--space-1);
        }
        .eif-actions__info p { margin: 0; display: flex; align-items: flex-start; gap: var(--space-1); }

        .eif-alert {
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-md);
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        .eif-alert--success {
          background: var(--color-success-100);
          border: 1px solid var(--color-success-600);
          color: var(--color-success-600);
        }
      `}</style>
    </div>
  );
};

export default ExtractedInformation;
