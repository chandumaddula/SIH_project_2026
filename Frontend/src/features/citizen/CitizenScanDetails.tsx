import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUserStore } from '../../store';
import { citizenScanService } from '../../services/citizenScan.service';
import { citizenComplaintService } from '../../services/citizenComplaint.service';
import { CitizenScan, PreliminaryResult, CitizenComplaint } from '../../types/citizen';
import { Button } from '../../components/Button';

const RESULT_DISPLAY: Record<PreliminaryResult, { label: string; icon: string; color: string }> = {
  no_issue: { label: 'No Potential Issue Detected', icon: '🟢', color: 'success' },
  review_recommended: { label: 'Review Recommended', icon: '🟡', color: 'warning' },
  potential_issue: { label: 'Potential Issue Detected', icon: '🔴', color: 'danger' },
};

export const CitizenScanDetails: React.FC = () => {
  const navigate = useNavigate();
  const { scanId } = useParams<{ scanId: string }>();
  const { user } = useUserStore();
  const [scan, setScan] = useState<CitizenScan | null>(null);
  const [relatedComplaint, setRelatedComplaint] = useState<CitizenComplaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadScan = useCallback(async () => {
    if (!scanId || !user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await citizenScanService.getScan(scanId);
      if (!data) {
        setError('Scan not found.');
        setScan(null);
        return;
      }
      // Verify ownership
      if (data.citizenId !== user.id) {
        setError('You do not have permission to view this scan.');
        setScan(null);
        return;
      }
      setScan(data);

      // Check if a complaint exists for this scan
      const allComplaints = await citizenComplaintService.listComplaints(user.id);
      const match = allComplaints.find(c => c.summary.includes(data.detected.productName || ''));
      setRelatedComplaint(match || null);
    } catch (err) {
      setError('Unable to load this scan. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [scanId, user]);

  useEffect(() => {
    loadScan();
  }, [loadScan]);

  const handleBack = useCallback(() => {
    navigate('/citizen/scans');
  }, [navigate]);

  const handleViewComplaint = useCallback(() => {
    if (relatedComplaint) {
      navigate(`/citizen/complaints/${relatedComplaint.id}`);
    }
  }, [relatedComplaint, navigate]);

  const handleSubmitComplaint = useCallback(() => {
    if (!scan) return;
    // Pass the scan ID so the new complaint can pre-fill the form
    navigate(`/citizen/complaints/new?scanId=${scan.id}`);
  }, [scan, navigate]);

  const handleScanAnother = useCallback(() => {
    navigate('/citizen/scan');
  }, [navigate]);

  if (loading) {
    return (
      <div className="cit-scan-details">
        <div className="cit-scan-details__container">
          <div className="cit-scan-details__loading">
            <div className="cit-scan-details__spinner" />
            <p>Loading scan...</p>
          </div>
        </div>
        <CitizenScanDetailsStyles />
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="cit-scan-details">
        <div className="cit-scan-details__container">
          <div className="cit-scan-details__error">
            <p>{error || 'Scan not found.'}</p>
            <Button variant="primary" onClick={handleBack}>
              Back to My Scans
            </Button>
          </div>
        </div>
        <CitizenScanDetailsStyles />
      </div>
    );
  }

  const { result, explanation, confidence, flags, suggestedNextStep, detectedAt } = scan.screening;
  const display = RESULT_DISPLAY[result];
  const detected = scan.detected;

  return (
    <div className="cit-scan-details">
      <div className="cit-scan-details__container">
        <button className="cit-scan-details__back-btn" onClick={handleBack} aria-label="Back to my scans">
          ← Back to My Scans
        </button>

        {/* Disclaimer */}
        <div className="cit-scan-details__disclaimer">
          <span aria-hidden="true">ℹ️</span>
          <p>
            This is a preliminary automated screening result.
            Final verification is performed through the authorized inspection process.
          </p>
        </div>

        {/* Result banner */}
        <div className={`cit-scan-details__banner cit-scan-details__banner--${display.color}`}>
          <span className="cit-scan-details__banner-icon" aria-hidden="true">{display.icon}</span>
          <div>
            <h1 className="cit-scan-details__banner-title">{display.label}</h1>
            <p className="cit-scan-details__banner-meta">
              Scan ID: {scan.id} • Confidence: {Math.round(confidence * 100)}% • {new Date(detectedAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Explanation */}
        <section className="cit-scan-details__section">
          <h2 className="cit-scan-details__section-title">What this means</h2>
          <p className="cit-scan-details__text">{explanation}</p>
        </section>

        {/* Flags */}
        {flags.length > 0 && (
          <section className="cit-scan-details__section">
            <h2 className="cit-scan-details__section-title">Areas of concern</h2>
            <ul className="cit-scan-details__flags">
              {flags.map((flag, index) => (
                <li key={index}>{flag}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Package images */}
        <section className="cit-scan-details__section">
          <h2 className="cit-scan-details__section-title">
            Package Images ({scan.images.length})
          </h2>
          {scan.images.length === 0 ? (
            <p className="cit-scan-details__empty-text">
              No images are associated with this scan.
            </p>
          ) : (
            <div className="cit-scan-details__images-grid">
              {scan.images.map(img => (
                <div key={img.id} className="cit-scan-details__image-card">
                  <img src={img.dataUrl} alt={`Package ${img.type} view`} />
                  <span className="cit-scan-details__image-type">{img.type}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Detected information */}
        <section className="cit-scan-details__section">
          <h2 className="cit-scan-details__section-title">Detected Information</h2>
          <p className="cit-scan-details__note">
            This information was automatically detected from the package image and may not be complete or accurate.
          </p>
          <div className="cit-scan-details__info-grid">
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
                <InfoRow label="Manufacturing Date" value={detected.dateInformation.mfgDate} />
                <InfoRow label="Expiry Date" value={detected.dateInformation.expDate} />
                <InfoRow label="Batch Number" value={detected.dateInformation.batchNumber} />
              </>
            )}
            <InfoRow label="Consumer Care" value={detected.consumerCare} />
            <InfoRow label="Other Detected" value={detected.otherDetected} />
          </div>
        </section>

        {/* Suggested next step */}
        <section className="cit-scan-details__section">
          <h2 className="cit-scan-details__section-title">Suggested Next Step</h2>
          <p className="cit-scan-details__text">{suggestedNextStep}</p>
        </section>

        {/* Complaint section */}
        {result !== 'no_issue' && (
          <section className="cit-scan-details__section cit-scan-details__action-section">
            <h2 className="cit-scan-details__section-title">
              {relatedComplaint ? 'Complaint Submitted' : 'Submit a Complaint'}
            </h2>
            {relatedComplaint ? (
              <div>
                <p className="cit-scan-details__text">
                  You have already submitted a complaint related to this scan.
                </p>
                <p>
                  <strong>Complaint ID:</strong>{' '}
                  <code className="cit-scan-details__code">{relatedComplaint.id}</code>
                </p>
                <div className="cit-scan-details__actions">
                  <Button variant="primary" onClick={handleViewComplaint}>
                    Track Complaint
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="cit-scan-details__text">
                  You may submit a complaint to have this product reviewed through the
                  authorized inspection process.
                </p>
                <p className="cit-scan-details__note">
                  Submitting a complaint does not itself establish a legal violation.
                  The complaint will be reviewed through the authorized process.
                </p>
                <div className="cit-scan-details__actions">
                  <Button variant="primary" onClick={handleSubmitComplaint}>
                    Submit Complaint
                  </Button>
                  <Button variant="outline" onClick={handleScanAnother}>
                    Scan Another
                  </Button>
                </div>
              </>
            )}
          </section>
        )}

        {result === 'no_issue' && (
          <section className="cit-scan-details__section cit-scan-details__action-section">
            <div className="cit-scan-details__actions">
              <Button variant="outline" onClick={handleScanAnother}>
                Scan Another Product
              </Button>
            </div>
          </section>
        )}
      </div>

      <CitizenScanDetailsStyles />
    </div>
  );
};

const InfoRow: React.FC<{ label: string; value?: string }> = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="cit-scan-details__info-row">
      <span className="cit-scan-details__info-label">{label}</span>
      <span className="cit-scan-details__info-value">{value}</span>
    </div>
  );
};

const CitizenScanDetailsStyles: React.FC = () => (
  <style>{`
    .cit-scan-details {
      min-height: calc(100vh - var(--header-height));
      background-color: var(--color-gray-50);
      padding: var(--space-6);
    }

    .cit-scan-details__container {
      max-width: 800px;
      margin: 0 auto;
    }

    .cit-scan-details__back-btn {
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

    .cit-scan-details__back-btn:hover {
      color: var(--color-navy-900);
      text-decoration: underline;
    }

    .cit-scan-details__loading {
      text-align: center;
      padding: var(--space-12);
    }

    .cit-scan-details__spinner {
      width: 32px;
      height: 32px;
      margin: 0 auto var(--space-3);
      border: 3px solid var(--color-gray-200);
      border-top-color: var(--color-navy-500);
      border-radius: 50%;
      animation: cit-sd-spin 0.8s linear infinite;
    }

    @keyframes cit-sd-spin {
      to { transform: rotate(360deg); }
    }

    .cit-scan-details__error {
      background: var(--color-error-100);
      border: 1px solid var(--color-error-600);
      border-radius: var(--radius-lg);
      padding: var(--space-6);
      text-align: center;
      color: var(--color-error-600);
    }

    .cit-scan-details__error p {
      margin: 0 0 var(--space-4) 0;
    }

    .cit-scan-details__disclaimer {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      padding: var(--space-4);
      background: var(--color-navy-50);
      border: 1px solid var(--color-navy-100);
      border-radius: var(--radius-lg);
      margin-bottom: var(--space-5);
    }

    .cit-scan-details__disclaimer p {
      font-size: var(--font-size-sm);
      color: var(--color-navy-700);
      margin: 0;
      line-height: 1.6;
    }

    .cit-scan-details__banner {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-6);
      border-radius: var(--radius-xl);
      margin-bottom: var(--space-5);
    }

    .cit-scan-details__banner--success {
      background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
      border: 1px solid #a5d6a7;
    }

    .cit-scan-details__banner--warning {
      background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
      border: 1px solid #ffe082;
    }

    .cit-scan-details__banner--danger {
      background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
      border: 1px solid #ef9a9a;
    }

    .cit-scan-details__banner-icon {
      font-size: 3rem;
      line-height: 1;
    }

    .cit-scan-details__banner-title {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-navy-900);
      margin: 0 0 var(--space-1) 0;
    }

    .cit-scan-details__banner-meta {
      font-size: var(--font-size-xs);
      color: var(--color-gray-600);
      margin: 0;
    }

    .cit-scan-details__section {
      background: var(--color-white);
      border: 1px solid var(--color-gray-200);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
      margin-bottom: var(--space-4);
    }

    .cit-scan-details__action-section {
      background: var(--color-navy-50);
      border-color: var(--color-navy-100);
    }

    .cit-scan-details__section-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--color-navy-900);
      margin: 0 0 var(--space-3) 0;
    }

    .cit-scan-details__text {
      font-size: var(--font-size-sm);
      color: var(--color-gray-700);
      line-height: 1.7;
      margin: 0 0 var(--space-3) 0;
    }

    .cit-scan-details__note {
      font-size: var(--font-size-xs);
      color: var(--color-gray-500);
      font-style: italic;
      margin: var(--space-2) 0 var(--space-3) 0;
    }

    .cit-scan-details__empty-text {
      color: var(--color-gray-500);
      font-style: italic;
      margin: 0;
    }

    .cit-scan-details__flags {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .cit-scan-details__flags li {
      padding: var(--space-2) var(--space-3);
      margin-bottom: var(--space-2);
      background: var(--color-error-100);
      border-left: 3px solid var(--color-error-600);
      border-radius: var(--radius-sm);
      color: var(--color-error-600);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
    }

    .cit-scan-details__flags li::before {
      content: '⚠ ';
      margin-right: var(--space-1);
    }

    .cit-scan-details__images-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: var(--space-3);
    }

    .cit-scan-details__image-card {
      position: relative;
      border-radius: var(--radius-md);
      overflow: hidden;
      border: 1px solid var(--color-gray-200);
    }

    .cit-scan-details__image-card img {
      width: 100%;
      aspect-ratio: 4/3;
      object-fit: cover;
      display: block;
    }

    .cit-scan-details__image-type {
      position: absolute;
      bottom: var(--space-1);
      left: var(--space-1);
      background: rgba(0,0,0,0.6);
      color: white;
      padding: 2px var(--space-2);
      border-radius: var(--radius-sm);
      font-size: 10px;
      text-transform: uppercase;
    }

    .cit-scan-details__info-grid {
      display: grid;
      gap: var(--space-2);
    }

    .cit-scan-details__info-row {
      display: grid;
      grid-template-columns: 160px 1fr;
      gap: var(--space-3);
      padding: var(--space-2) 0;
      border-bottom: 1px solid var(--color-gray-100);
      font-size: var(--font-size-sm);
    }

    .cit-scan-details__info-row:last-child {
      border-bottom: none;
    }

    .cit-scan-details__info-label {
      font-weight: var(--font-weight-semibold);
      color: var(--color-gray-600);
    }

    .cit-scan-details__info-value {
      color: var(--color-gray-900);
    }

    .cit-scan-details__actions {
      display: flex;
      gap: var(--space-3);
      flex-wrap: wrap;
      margin-top: var(--space-3);
    }

    .cit-scan-details__code {
      display: inline-block;
      padding: 2px var(--space-2);
      background: var(--color-navy-100);
      color: var(--color-navy-900);
      border-radius: var(--radius-sm);
      font-family: var(--font-family-mono);
      font-size: var(--font-size-sm);
    }

    @media (max-width: 768px) {
      .cit-scan-details {
        padding: var(--space-4);
      }

      .cit-scan-details__info-row {
        grid-template-columns: 1fr;
        gap: var(--space-1);
      }
    }
  `}</style>
);

export default CitizenScanDetails;