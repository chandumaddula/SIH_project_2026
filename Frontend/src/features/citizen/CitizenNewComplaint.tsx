import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUserStore } from '../../store';
import { citizenComplaintService } from '../../services/citizenComplaint.service';
import { citizenScanService } from '../../services/citizenScan.service';
import { CitizenScan, CitizenComplaint } from '../../types/citizen';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';

interface FormState {
  product: string;
  issue: string;
  placeOfPurchase: string;
  date: string;
  description: string;
  packageImages: string[];
  supportingDocuments: string[];
  billEvidence: string | null;
}

interface FormErrors {
  product?: string;
  issue?: string;
  placeOfPurchase?: string;
  date?: string;
  description?: string;
}

const todayStr = () => new Date().toISOString().split('T')[0];

export const CitizenNewComplaint: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useUserStore();
  const scanId = searchParams.get('scanId');

  const packageImageInputRef = useRef<HTMLInputElement>(null);
  const supportingInputRef = useRef<HTMLInputElement>(null);
  const billInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>({
    product: '',
    issue: '',
    placeOfPurchase: '',
    date: todayStr(),
    description: '',
    packageImages: [],
    supportingDocuments: [],
    billEvidence: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedComplaint, setSubmittedComplaint] = useState<CitizenComplaint | null>(null);

  // Pre-fill from scan if available
  const [prefillScan, setPrefillScan] = useState<CitizenScan | null>(null);

  useEffect(() => {
    if (!scanId || !user) return;
    let cancelled = false;
    (async () => {
      const scan = await citizenScanService.getScan(scanId);
      if (cancelled) return;
      if (scan && scan.citizenId === user.id) {
        setPrefillScan(scan);
        setForm(prev => ({
          ...prev,
          product: scan.detected.productName || prev.product,
          description: `Preliminary screening result: ${scan.screening.result || 'N/A'}. ${scan.screening.explanation || ''}`,
        }));
      }
    })();
    return () => { cancelled = true; };
  }, [scanId, user]);

  const validate = useCallback((state: FormState): FormErrors => {
    const errs: FormErrors = {};
    if (!state.product.trim()) errs.product = 'Product is required.';
    if (!state.issue.trim()) errs.issue = 'Issue is required.';
    if (!state.placeOfPurchase.trim()) errs.placeOfPurchase = 'Place of purchase is required.';
    if (!state.date) errs.date = 'Date is required.';
    if (!state.description.trim()) errs.description = 'Description is required.';
    else if (state.description.trim().length < 10) errs.description = 'Please provide at least 10 characters of description.';
    return errs;
  }, []);

  const updateField = useCallback((field: keyof FormState, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setErrors({});

    try {
      const created = await citizenComplaintService.createComplaint(user.id, {
        product: form.product.trim(),
        issue: form.issue.trim(),
        placeOfPurchase: form.placeOfPurchase.trim(),
        date: form.date,
        description: form.description.trim(),
        packageImages: form.packageImages,
        supportingDocuments: form.supportingDocuments,
        billEvidence: form.billEvidence || undefined,
      });
      setSubmittedComplaint(created);
    } catch (err) {
      setSubmitError('Unable to submit complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [form, user, validate]);

  const handleFileImages = useCallback((files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setForm(prev => ({ ...prev, packageImages: [...prev.packageImages, dataUrl] }));
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFileDocuments = useCallback((files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setForm(prev => ({ ...prev, supportingDocuments: [...prev.supportingDocuments, dataUrl] }));
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFileBill = useCallback((file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setForm(prev => ({ ...prev, billEvidence: dataUrl }));
    };
    reader.readAsDataURL(file);
  }, []);

  const removePackageImage = (idx: number) => {
    setForm(prev => ({ ...prev, packageImages: prev.packageImages.filter((_, i) => i !== idx) }));
  };

  const removeSupportingDoc = (idx: number) => {
    setForm(prev => ({ ...prev, supportingDocuments: prev.supportingDocuments.filter((_, i) => i !== idx) }));
  };

  const handleCancel = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleTrackComplaint = useCallback(() => {
    if (submittedComplaint) {
      navigate(`/citizen/complaints/${submittedComplaint.id}`);
    }
  }, [submittedComplaint, navigate]);

  const handleGoHome = useCallback(() => {
    navigate('/citizen/home');
  }, [navigate]);

  // Success view
  if (submittedComplaint) {
    return (
      <div className="cit-new-complaint">
        <div className="cit-new-complaint__container">
          <div className="cit-new-complaint__success">
            <div className="cit-new-complaint__success-icon">✅</div>
            <h1 className="cit-new-complaint__success-title">Your complaint has been submitted.</h1>
            <p className="cit-new-complaint__success-text">
              You will be able to track its status from <strong>My Complaints</strong>.
            </p>

            <div className="cit-new-complaint__success-info">
              <div className="cit-new-complaint__info-row">
                <span className="cit-new-complaint__info-label">Complaint ID</span>
                <code className="cit-new-complaint__info-value">{submittedComplaint.id}</code>
              </div>
              <div className="cit-new-complaint__info-row">
                <span className="cit-new-complaint__info-label">Product</span>
                <span className="cit-new-complaint__info-value">{submittedComplaint.product}</span>
              </div>
              <div className="cit-new-complaint__info-row">
                <span className="cit-new-complaint__info-label">Issue</span>
                <span className="cit-new-complaint__info-value">{submittedComplaint.issue}</span>
              </div>
              <div className="cit-new-complaint__info-row">
                <span className="cit-new-complaint__info-label">Status</span>
                <span className="cit-new-complaint__info-value">{submittedComplaint.status}</span>
              </div>
            </div>

            <div className="cit-new-complaint__success-actions">
              <Button variant="primary" onClick={handleTrackComplaint}>
                Track Complaint
              </Button>
              <Button variant="outline" onClick={handleGoHome}>
                Back to Home
              </Button>
            </div>
          </div>
        </div>
        <CitizenNewComplaintStyles />
      </div>
    );
  }

  return (
    <div className="cit-new-complaint">
      <div className="cit-new-complaint__container">
        <button className="cit-new-complaint__back-btn" onClick={handleCancel}>
          ← Cancel
        </button>

        <header className="cit-new-complaint__header">
          <h1 className="cit-new-complaint__title">Submit a Complaint</h1>
          <p className="cit-new-complaint__subtitle">
            Submitting a complaint does not itself establish a legal violation.
            The complaint will be reviewed through the authorized process.
          </p>
        </header>

        {prefillScan && (
          <div className="cit-new-complaint__prefill-banner">
            <span aria-hidden="true">📋</span>
            <div>
              <strong>From a recent scan:</strong> Product information has been pre-filled.
              You may edit any field below.
            </div>
          </div>
        )}

        {submitError && (
          <div className="cit-new-complaint__error" role="alert">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="cit-new-complaint__form" noValidate>
          <Input
            id="product"
            label="Product *"
            placeholder="e.g., Vegetable Oil 1L"
            value={form.product}
            onChange={e => updateField('product', e.target.value)}
            error={errors.product}
            fullWidth
            required
          />

          <Input
            id="issue"
            label="Issue *"
            placeholder="Brief description of the issue"
            value={form.issue}
            onChange={e => updateField('issue', e.target.value)}
            error={errors.issue}
            fullWidth
            required
          />

          <div className="cit-new-complaint__row">
            <Input
              id="placeOfPurchase"
              label="Place of Purchase *"
              placeholder="e.g., City Supermarket"
              value={form.placeOfPurchase}
              onChange={e => updateField('placeOfPurchase', e.target.value)}
              error={errors.placeOfPurchase}
              fullWidth
              required
            />
            <Input
              id="date"
              label="Purchase Date *"
              type="date"
              value={form.date}
              max={todayStr()}
              onChange={e => updateField('date', e.target.value)}
              error={errors.date}
              fullWidth
              required
            />
          </div>

          <div className="cit-new-complaint__field">
            <label htmlFor="description" className="cit-new-complaint__label">
              Description *
            </label>
            <textarea
              id="description"
              className={`cit-new-complaint__textarea ${errors.description ? 'cit-new-complaint__textarea--error' : ''}`}
              placeholder="Provide details about the issue you observed"
              value={form.description}
              onChange={e => updateField('description', e.target.value)}
              rows={5}
              required
            />
            {errors.description && (
              <span className="cit-new-complaint__error-text">{errors.description}</span>
            )}
          </div>

          {/* Package images */}
          <div className="cit-new-complaint__field">
            <label className="cit-new-complaint__label">Package Images</label>
            <p className="cit-new-complaint__hint">Upload one or more photos of the product package.</p>
            <input
              ref={packageImageInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={e => handleFileImages(e.target.files)}
              className="cit-new-complaint__file-input"
            />
            <button
              type="button"
              className="cit-new-complaint__upload-btn"
              onClick={() => packageImageInputRef.current?.click()}
            >
              + Add Package Images
            </button>
            {form.packageImages.length > 0 && (
              <div className="cit-new-complaint__thumb-grid">
                {form.packageImages.map((src, idx) => (
                  <div key={idx} className="cit-new-complaint__thumb">
                    <img src={src} alt={`Package ${idx + 1}`} />
                    <button
                      type="button"
                      className="cit-new-complaint__thumb-remove"
                      onClick={() => removePackageImage(idx)}
                      aria-label="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Supporting documents */}
          <div className="cit-new-complaint__field">
            <label className="cit-new-complaint__label">Supporting Documents</label>
            <p className="cit-new-complaint__hint">Any other documents relevant to your complaint (e.g., warranty card).</p>
            <input
              ref={supportingInputRef}
              type="file"
              multiple
              onChange={e => handleFileDocuments(e.target.files)}
              className="cit-new-complaint__file-input"
            />
            <button
              type="button"
              className="cit-new-complaint__upload-btn"
              onClick={() => supportingInputRef.current?.click()}
            >
              + Add Documents
            </button>
            {form.supportingDocuments.length > 0 && (
              <ul className="cit-new-complaint__doc-list">
                {form.supportingDocuments.map((_src, idx) => (
                  <li key={idx}>
                    <span>Document {idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeSupportingDoc(idx)}
                      className="cit-new-complaint__doc-remove"
                      aria-label="Remove document"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Bill evidence */}
          <div className="cit-new-complaint__field">
            <label className="cit-new-complaint__label">Bill / Purchase Evidence (Optional)</label>
            <p className="cit-new-complaint__hint">Upload receipt or bill if available.</p>
            <input
              ref={billInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={e => handleFileBill(e.target.files?.[0] || null)}
              className="cit-new-complaint__file-input"
            />
            <button
              type="button"
              className="cit-new-complaint__upload-btn"
              onClick={() => billInputRef.current?.click()}
            >
              {form.billEvidence ? 'Replace Bill' : '+ Add Bill / Receipt'}
            </button>
            {form.billEvidence && (
              <p className="cit-new-complaint__file-status">✓ Bill/receipt attached</p>
            )}
          </div>

          {/* Submit */}
          <div className="cit-new-complaint__actions">
            <Button type="button" variant="ghost" onClick={handleCancel} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting} disabled={submitting}>
              Submit Complaint
            </Button>
          </div>
        </form>
      </div>

      <CitizenNewComplaintStyles />
    </div>
  );
};

const CitizenNewComplaintStyles: React.FC = () => (
  <style>{`
    .cit-new-complaint {
      min-height: calc(100vh - var(--header-height));
      background-color: var(--color-gray-50);
      padding: var(--space-6);
    }

    .cit-new-complaint__container {
      max-width: 720px;
      margin: 0 auto;
    }

    .cit-new-complaint__back-btn {
      background: none;
      border: none;
      color: var(--color-navy-700);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      cursor: pointer;
      padding: var(--space-2) 0;
      margin-bottom: var(--space-4);
      font-family: inherit;
    }

    .cit-new-complaint__back-btn:hover {
      color: var(--color-navy-900);
      text-decoration: underline;
    }

    .cit-new-complaint__header {
      margin-bottom: var(--space-5);
    }

    .cit-new-complaint__title {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-navy-900);
      margin: 0 0 var(--space-2) 0;
    }

    .cit-new-complaint__subtitle {
      font-size: var(--font-size-sm);
      color: var(--color-gray-700);
      margin: 0;
      padding: var(--space-3);
      background: var(--color-navy-50);
      border-left: 3px solid var(--color-navy-500);
      border-radius: var(--radius-sm);
      line-height: 1.6;
    }

    .cit-new-complaint__prefill-banner {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      background: #e3f2fd;
      border: 1px solid #90caf9;
      border-radius: var(--radius-md);
      margin-bottom: var(--space-4);
      font-size: var(--font-size-sm);
      color: #1565c0;
    }

    .cit-new-complaint__error {
      background: var(--color-error-100);
      border: 1px solid var(--color-error-600);
      color: var(--color-error-600);
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      margin-bottom: var(--space-4);
    }

    .cit-new-complaint__form {
      background: var(--color-white);
      border: 1px solid var(--color-gray-200);
      border-radius: var(--radius-lg);
      padding: var(--space-6);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      box-shadow: var(--shadow-sm);
    }

    .cit-new-complaint__row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
    }

    .cit-new-complaint__field {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .cit-new-complaint__label {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--color-gray-800);
    }

    .cit-new-complaint__hint {
      font-size: var(--font-size-xs);
      color: var(--color-gray-500);
      margin: 0;
    }

    .cit-new-complaint__textarea {
      width: 100%;
      padding: var(--space-3);
      border: 1px solid var(--color-gray-300);
      border-radius: var(--radius-md);
      font-family: inherit;
      font-size: var(--font-size-sm);
      color: var(--color-gray-900);
      background: var(--color-white);
      resize: vertical;
      min-height: 100px;
    }

    .cit-new-complaint__textarea:focus {
      outline: 2px solid var(--color-navy-500);
      outline-offset: 1px;
      border-color: var(--color-navy-500);
    }

    .cit-new-complaint__textarea--error {
      border-color: var(--color-error-600);
    }

    .cit-new-complaint__error-text {
      color: var(--color-error-600);
      font-size: var(--font-size-xs);
    }

    .cit-new-complaint__file-input {
      display: none;
    }

    .cit-new-complaint__upload-btn {
      align-self: flex-start;
      padding: var(--space-2) var(--space-4);
      background: var(--color-gray-50);
      border: 1px dashed var(--color-gray-400);
      border-radius: var(--radius-md);
      color: var(--color-gray-700);
      font-size: var(--font-size-sm);
      font-family: inherit;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .cit-new-complaint__upload-btn:hover {
      background: var(--color-navy-50);
      border-color: var(--color-navy-500);
      color: var(--color-navy-700);
    }

    .cit-new-complaint__thumb-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: var(--space-2);
    }

    .cit-new-complaint__thumb {
      position: relative;
      aspect-ratio: 1;
      border-radius: var(--radius-md);
      overflow: hidden;
      border: 1px solid var(--color-gray-200);
    }

    .cit-new-complaint__thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .cit-new-complaint__thumb-remove {
      position: absolute;
      top: 2px;
      right: 2px;
      width: 22px;
      height: 22px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      border: none;
      border-radius: var(--radius-full);
      cursor: pointer;
      font-size: var(--font-size-base);
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }

    .cit-new-complaint__doc-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .cit-new-complaint__doc-list li {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-2) var(--space-3);
      background: var(--color-gray-50);
      border: 1px solid var(--color-gray-200);
      border-radius: var(--radius-sm);
      font-size: var(--font-size-sm);
    }

    .cit-new-complaint__doc-remove {
      background: none;
      border: none;
      color: var(--color-error-600);
      font-size: var(--font-size-xs);
      cursor: pointer;
      text-decoration: underline;
      font-family: inherit;
    }

    .cit-new-complaint__file-status {
      color: var(--color-success-600);
      font-size: var(--font-size-sm);
      margin: 0;
    }

    .cit-new-complaint__actions {
      display: flex;
      gap: var(--space-3);
      justify-content: flex-end;
      padding-top: var(--space-3);
      border-top: 1px solid var(--color-gray-100);
    }

    /* Success state */
    .cit-new-complaint__success {
      background: var(--color-white);
      border: 1px solid var(--color-gray-200);
      border-radius: var(--radius-lg);
      padding: var(--space-8);
      text-align: center;
      box-shadow: var(--shadow-md);
    }

    .cit-new-complaint__success-icon {
      font-size: 4rem;
      margin: 0 0 var(--space-3) 0;
    }

    .cit-new-complaint__success-title {
      font-size: var(--font-size-2xl);
      color: var(--color-navy-900);
      margin: 0 0 var(--space-2) 0;
    }

    .cit-new-complaint__success-text {
      font-size: var(--font-size-sm);
      color: var(--color-gray-600);
      margin: 0 0 var(--space-5) 0;
    }

    .cit-new-complaint__success-info {
      background: var(--color-gray-50);
      border: 1px solid var(--color-gray-200);
      border-radius: var(--radius-md);
      padding: var(--space-4);
      margin-bottom: var(--space-5);
      text-align: left;
      max-width: 480px;
      margin-left: auto;
      margin-right: auto;
    }

    .cit-new-complaint__info-row {
      display: flex;
      justify-content: space-between;
      padding: var(--space-2) 0;
      border-bottom: 1px solid var(--color-gray-100);
      font-size: var(--font-size-sm);
    }

    .cit-new-complaint__info-row:last-child {
      border-bottom: none;
    }

    .cit-new-complaint__info-label {
      color: var(--color-gray-600);
      font-weight: var(--font-weight-medium);
    }

    .cit-new-complaint__info-value {
      color: var(--color-navy-900);
      font-weight: var(--font-weight-semibold);
    }

    .cit-new-complaint__success-actions {
      display: flex;
      gap: var(--space-3);
      justify-content: center;
      flex-wrap: wrap;
    }

    @media (max-width: 768px) {
      .cit-new-complaint {
        padding: var(--space-4);
      }

      .cit-new-complaint__form {
        padding: var(--space-4);
      }

      .cit-new-complaint__row {
        grid-template-columns: 1fr;
      }

      .cit-new-complaint__actions {
        flex-direction: column;
      }

      .cit-new-complaint__actions button {
        width: 100%;
      }
    }
  `}</style>
);

export default CitizenNewComplaint;