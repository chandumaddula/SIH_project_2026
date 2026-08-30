import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUserStore } from '../../store';
import { citizenComplaintService } from '../../services/citizenComplaint.service';
import { CitizenComplaint, CitizenComplaintStatus } from '../../types/citizen';
import { Button } from '../../components/Button';

const ALL_STATUSES: CitizenComplaintStatus[] = [
  'Submitted',
  'Received',
  'Assigned',
  'Inspection',
  'Verification',
  'Resolved',
  'Closed',
];

const STATUS_INDEX: Record<CitizenComplaintStatus, number> = {
  Submitted: 0,
  Received: 1,
  Assigned: 2,
  Inspection: 3,
  Verification: 4,
  Resolved: 5,
  Closed: 6,
};

const STATUS_COLORS: Record<CitizenComplaintStatus, { bg: string; text: string; dot: string }> = {
  Submitted: { bg: '#e3f2fd', text: '#1565c0', dot: '#1565c0' },
  Received: { bg: '#e0f7fa', text: '#00838f', dot: '#00838f' },
  Assigned: { bg: '#ede7f6', text: '#4527a0', dot: '#4527a0' },
  Inspection: { bg: '#fff8e1', text: '#f57c00', dot: '#f57c00' },
  Verification: { bg: '#e1f5fe', text: '#0277bd', dot: '#0277bd' },
  Resolved: { bg: '#e8f5e9', text: '#2e7d32', dot: '#2e7d32' },
  Closed: { bg: '#f5f5f5', text: '#616161', dot: '#9e9e9e' },
};

export const CitizenComplaintDetails: React.FC = () => {
  const navigate = useNavigate();
  const { complaintId } = useParams<{ complaintId: string }>();
  const { user } = useUserStore();
  const [complaint, setComplaint] = useState<CitizenComplaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadComplaint = useCallback(async () => {
    if (!complaintId || !user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await citizenComplaintService.getComplaint(complaintId);
      if (!data) {
        setError('Complaint not found.');
        setComplaint(null);
        return;
      }
      if (data.citizenId !== user.id) {
        setError('You do not have permission to view this complaint.');
        setComplaint(null);
        return;
      }
      setComplaint(data);
    } catch {
      setError('Unable to load this complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [complaintId, user]);

  useEffect(() => {
    loadComplaint();
  }, [loadComplaint]);

  const handleBack = useCallback(() => {
    navigate('/citizen/complaints');
  }, [navigate]);

  const handleGoHome = useCallback(() => {
    navigate('/citizen/home');
  }, [navigate]);

  if (loading) {
    return (
      <div className="cit-complaint-details">
        <div className="cit-complaint-details__container">
          <div className="cit-complaint-details__loading">
            <div className="cit-complaint-details__spinner" />
            <p>Loading complaint...</p>
          </div>
        </div>
        <CitizenComplaintDetailsStyles />
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="cit-complaint-details">
        <div className="cit-complaint-details__container">
          <div className="cit-complaint-details__error">
            <p>{error || 'Complaint not found.'}</p>
            <Button variant="primary" onClick={handleBack}>
              Back to My Complaints
            </Button>
          </div>
        </div>
        <CitizenComplaintDetailsStyles />
      </div>
    );
  }

  const evidenceCount =
    complaint.packageImages.length +
    complaint.supportingDocuments.length +
    (complaint.billEvidence ? 1 : 0);

  const currentIndex = STATUS_INDEX[complaint.status];

  return (
    <div className="cit-complaint-details">
      <div className="cit-complaint-details__container">
        <button className="cit-complaint-details__back-btn" onClick={handleBack}>
          ← Back to My Complaints
        </button>

        {/* Header */}
        <div className="cit-complaint-details__header">
          <div>
            <h1 className="cit-complaint-details__title">{complaint.product}</h1>
            <code className="cit-complaint-details__id">Complaint ID: {complaint.id}</code>
          </div>
          <StatusBadge status={complaint.status} />
        </div>

        {/* Info grid */}
        <section className="cit-complaint-details__info-section">
          <div className="cit-complaint-details__info-grid">
            <InfoItem label="Issue" value={complaint.issue} />
            <InfoItem label="Place of Purchase" value={complaint.placeOfPurchase} />
            <InfoItem label="Purchase Date" value={complaint.date} />
            <InfoItem label="Submitted On" value={new Date(complaint.submittedAt).toLocaleString()} />
            <InfoItem label="Evidence" value={`${evidenceCount} item${evidenceCount !== 1 ? 's' : ''}`} />
          </div>
        </section>

        {/* Description */}
        {complaint.description && (
          <section className="cit-complaint-details__section">
            <h2 className="cit-complaint-details__section-title">Description</h2>
            <p className="cit-complaint-details__description">{complaint.description}</p>
          </section>
        )}

        {/* Evidence */}
        {evidenceCount > 0 && (
          <section className="cit-complaint-details__section">
            <h2 className="cit-complaint-details__section-title">Evidence ({evidenceCount})</h2>
            <div className="cit-complaint-details__evidence-grid">
              {complaint.packageImages.map((src, i) => (
                <div key={`pkg-${i}`} className="cit-complaint-details__evidence-item">
                  <img src={src} alt={`Package image ${i + 1}`} />
                  <span>Package Image {i + 1}</span>
                </div>
              ))}
              {complaint.supportingDocuments.map((src, i) => (
                <div key={`doc-${i}`} className="cit-complaint-details__evidence-item">
                  <img src={src} alt={`Document ${i + 1}`} />
                  <span>Supporting Document {i + 1}</span>
                </div>
              ))}
              {complaint.billEvidence && (
                <div className="cit-complaint-details__evidence-item">
                  <img src={complaint.billEvidence} alt="Bill / Receipt" />
                  <span>Bill / Receipt</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Timeline */}
        <section className="cit-complaint-details__section">
          <h2 className="cit-complaint-details__section-title">Complaint Timeline</h2>
          <div className="cit-complaint-details__timeline">
            {ALL_STATUSES.map((status, index) => {
              const isPast = index < currentIndex;
              const isCurrent = index === currentIndex;
              const isFuture = index > currentIndex;

              // Find timeline event for this status
              const event = complaint.timeline.find(e => e.status === status);

              const colors = STATUS_COLORS[status];

              return (
                <div
                  key={status}
                  className={`cit-complaint-details__timeline-item
                    ${isPast ? 'cit-complaint-details__timeline-item--past' : ''}
                    ${isCurrent ? 'cit-complaint-details__timeline-item--current' : ''}
                    ${isFuture ? 'cit-complaint-details__timeline-item--future' : ''}`}
                >
                  {/* Connector line */}
                  {index < ALL_STATUSES.length - 1 && (
                    <div className={`cit-complaint-details__timeline-connector
                      ${isPast ? 'cit-complaint-details__timeline-connector--past' : ''}`} />
                  )}

                  {/* Dot */}
                  <div
                    className={`cit-complaint-details__timeline-dot
                      ${isPast ? 'cit-complaint-details__timeline-dot--past' : ''}
                      ${isCurrent ? 'cit-complaint-details__timeline-dot--current' : ''}
                      ${isFuture ? 'cit-complaint-details__timeline-dot--future' : ''}`}
                    style={isCurrent ? { backgroundColor: colors.dot } : undefined}
                  >
                    {isPast && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>

                  {/* Content */}
                  <div className="cit-complaint-details__timeline-content">
                    <div
                      className="cit-complaint-details__timeline-status"
                      style={isCurrent ? { color: colors.text } : undefined}
                    >
                      {status}
                      {isCurrent && (
                        <span
                          className="cit-complaint-details__current-badge"
                          style={{ backgroundColor: colors.bg, color: colors.text }}
                        >
                          Current
                        </span>
                      )}
                    </div>
                    {event && (
                      <div className="cit-complaint-details__timeline-event">
                        <p className="cit-complaint-details__timeline-note">{event.note}</p>
                        <time className="cit-complaint-details__timeline-time">
                          {new Date(event.timestamp).toLocaleString()}
                        </time>
                      </div>
                    )}
                    {!event && isFuture && (
                      <p className="cit-complaint-details__timeline-pending">
                        Not yet reached
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="cit-complaint-details__footer-actions">
          <Button variant="outline" onClick={handleBack}>
            ← Back to Complaints
          </Button>
          <Button variant="secondary" onClick={handleGoHome}>
            Home
          </Button>
        </div>
      </div>

      <CitizenComplaintDetailsStyles />
    </div>
  );
};

const StatusBadge: React.FC<{ status: CitizenComplaintStatus }> = ({ status }) => {
  const colors = STATUS_COLORS[status];
  return (
    <span
      className="cit-complaint-details__status-badge"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {status}
    </span>
  );
};

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="cit-complaint-details__info-item">
    <span className="cit-complaint-details__info-label">{label}</span>
    <span className="cit-complaint-details__info-value">{value}</span>
  </div>
);

const CitizenComplaintDetailsStyles: React.FC = () => (
  <style>{`
    .cit-complaint-details {
      min-height: calc(100vh - var(--header-height));
      background-color: var(--color-gray-50);
      padding: var(--space-6);
    }

    .cit-complaint-details__container {
      max-width: 800px;
      margin: 0 auto;
    }

    .cit-complaint-details__loading {
      text-align: center;
      padding: var(--space-12);
      color: var(--color-gray-600);
    }

    .cit-complaint-details__spinner {
      width: 32px;
      height: 32px;
      margin: 0 auto var(--space-3);
      border: 3px solid var(--color-gray-200);
      border-top-color: var(--color-navy-500);
      border-radius: 50%;
      animation: cit-cd-spin 0.8s linear infinite;
    }

    @keyframes cit-cd-spin {
      to { transform: rotate(360deg); }
    }

    .cit-complaint-details__error {
      background: var(--color-error-100);
      border: 1px solid var(--color-error-600);
      border-radius: var(--radius-lg);
      padding: var(--space-6);
      text-align: center;
      color: var(--color-error-600);
    }

    .cit-complaint-details__error p {
      margin: 0 0 var(--space-4) 0;
    }

    .cit-complaint-details__back-btn {
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

    .cit-complaint-details__back-btn:hover {
      color: var(--color-navy-900);
      text-decoration: underline;
    }

    .cit-complaint-details__header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-5);
      gap: var(--space-3);
      flex-wrap: wrap;
    }

    .cit-complaint-details__title {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-navy-900);
      margin: 0 0 var(--space-1) 0;
    }

    .cit-complaint-details__id {
      display: inline-block;
      padding: 2px var(--space-2);
      background: var(--color-gray-100);
      color: var(--color-gray-700);
      border-radius: var(--radius-sm);
      font-family: var(--font-family-mono);
      font-size: 12px;
    }

    .cit-complaint-details__status-badge {
      display: inline-block;
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-full);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      white-space: nowrap;
    }

    .cit-complaint-details__section {
      background: var(--color-white);
      border: 1px solid var(--color-gray-200);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
      margin-bottom: var(--space-4);
    }

    .cit-complaint-details__section-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--color-navy-900);
      margin: 0 0 var(--space-3) 0;
    }

    .cit-complaint-details__description {
      font-size: var(--font-size-sm);
      color: var(--color-gray-700);
      line-height: 1.7;
      margin: 0;
      white-space: pre-wrap;
    }

    .cit-complaint-details__info-section {
      background: var(--color-white);
      border: 1px solid var(--color-gray-200);
      border-radius: var(--radius-lg);
      padding: var(--space-4);
      margin-bottom: var(--space-4);
    }

    .cit-complaint-details__info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-3);
    }

    .cit-complaint-details__info-item {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .cit-complaint-details__info-label {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      color: var(--color-gray-500);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .cit-complaint-details__info-value {
      font-size: var(--font-size-sm);
      color: var(--color-navy-900);
      font-weight: var(--font-weight-medium);
    }

    /* Evidence */
    .cit-complaint-details__evidence-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: var(--space-3);
    }

    .cit-complaint-details__evidence-item {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .cit-complaint-details__evidence-item img {
      width: 100%;
      aspect-ratio: 4/3;
      object-fit: cover;
      border-radius: var(--radius-md);
      border: 1px solid var(--color-gray-200);
    }

    .cit-complaint-details__evidence-item span {
      font-size: 11px;
      color: var(--color-gray-600);
      text-align: center;
    }

    /* Timeline */
    .cit-complaint-details__timeline {
      position: relative;
    }

    .cit-complaint-details__timeline-item {
      display: grid;
      grid-template-columns: 24px 1fr;
      gap: var(--space-4);
      position: relative;
      padding-bottom: var(--space-4);
    }

    .cit-complaint-details__timeline-item:last-child {
      padding-bottom: 0;
    }

    .cit-complaint-details__timeline-connector {
      position: absolute;
      left: 11px;
      top: 24px;
      bottom: 0;
      width: 2px;
      background: var(--color-gray-200);
    }

    .cit-complaint-details__timeline-connector--past {
      background: #a5d6a7;
    }

    .cit-complaint-details__timeline-dot {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid var(--color-gray-300);
      background: var(--color-gray-100);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      z-index: 1;
    }

    .cit-complaint-details__timeline-dot--past {
      background: #4caf50;
      border-color: #4caf50;
    }

    .cit-complaint-details__timeline-dot--current {
      background: var(--color-navy-500);
      border-color: var(--color-navy-500);
      box-shadow: 0 0 0 4px rgba(63, 81, 181, 0.2);
    }

    .cit-complaint-details__timeline-dot--future {
      background: var(--color-gray-100);
      border-color: var(--color-gray-300);
    }

    .cit-complaint-details__timeline-content {
      padding-top: 2px;
    }

    .cit-complaint-details__timeline-status {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--color-gray-400);
      display: flex;
      align-items: center;
      gap: var(--space-2);
      margin-bottom: var(--space-1);
    }

    .cit-complaint-details__timeline-item--past .cit-complaint-details__timeline-status {
      color: var(--color-gray-600);
    }

    .cit-complaint-details__timeline-item--current .cit-complaint-details__timeline-status {
      font-weight: var(--font-weight-bold);
    }

    .cit-complaint-details__current-badge {
      display: inline-block;
      padding: 1px var(--space-2);
      border-radius: var(--radius-full);
      font-size: 10px;
      font-weight: var(--font-weight-bold);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .cit-complaint-details__timeline-note {
      font-size: var(--font-size-sm);
      color: var(--color-gray-700);
      margin: 0 0 var(--space-1) 0;
      line-height: 1.5;
    }

    .cit-complaint-details__timeline-time {
      font-size: var(--font-size-xs);
      color: var(--color-gray-500);
    }

    .cit-complaint-details__timeline-pending {
      font-size: var(--font-size-xs);
      color: var(--color-gray-400);
      font-style: italic;
      margin: 0;
    }

    .cit-complaint-details__footer-actions {
      display: flex;
      gap: var(--space-3);
      justify-content: center;
      padding-top: var(--space-4);
    }

    @media (max-width: 768px) {
      .cit-complaint-details {
        padding: var(--space-4);
      }

      .cit-complaint-details__header {
        flex-direction: column;
      }

      .cit-complaint-details__info-grid {
        grid-template-columns: 1fr;
      }
    }
  `}</style>
);

export default CitizenComplaintDetails;