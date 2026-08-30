import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store';
import { citizenComplaintService } from '../../services/citizenComplaint.service';
import { CitizenComplaint, CitizenComplaintStatus } from '../../types/citizen';
import { Button } from '../../components/Button';

const STATUS_CONFIG: Record<CitizenComplaintStatus, { label: string; className: string }> = {
  Submitted: { label: 'Submitted', className: 'cit-complaints__status--submitted' },
  Received: { label: 'Received', className: 'cit-complaints__status--received' },
  Assigned: { label: 'Assigned', className: 'cit-complaints__status--assigned' },
  Inspection: { label: 'Inspection', className: 'cit-complaints__status--inspection' },
  Verification: { label: 'Verification', className: 'cit-complaints__status--verification' },
  Resolved: { label: 'Resolved', className: 'cit-complaints__status--resolved' },
  Closed: { label: 'Closed', className: 'cit-complaints__status--closed' },
};

export const CitizenComplaintsList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [complaints, setComplaints] = useState<CitizenComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadComplaints = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await citizenComplaintService.listComplaints(user.id);
      setComplaints(data);
    } catch (err) {
      setError('Unable to load your complaints.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  const handleOpenComplaint = useCallback((id: string) => {
    navigate(`/citizen/complaints/${id}`);
  }, [navigate]);

  const handleNewComplaint = useCallback(() => {
    navigate('/citizen/complaints/new');
  }, [navigate]);

  const handleGoHome = useCallback(() => {
    navigate('/citizen/home');
  }, [navigate]);

  return (
    <div className="cit-complaints">
      <div className="cit-complaints__container">
        <header className="cit-complaints__header">
          <div>
            <h1 className="cit-complaints__title">My Complaints</h1>
            <p className="cit-complaints__subtitle">
              {complaints.length === 0
                ? 'No complaints submitted yet'
                : `${complaints.length} complaint${complaints.length !== 1 ? 's' : ''} submitted`}
            </p>
          </div>
          <Button variant="primary" onClick={handleNewComplaint}>
            New Complaint
          </Button>
        </header>

        {/* Loading */}
        {loading && (
          <div className="cit-complaints__loading">
            <div className="cit-complaints__spinner" />
            <p>Loading your complaints...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="cit-complaints__error-state" role="alert">
            <p>{error}</p>
            <Button variant="primary" onClick={loadComplaints}>Retry</Button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && complaints.length === 0 && (
          <div className="cit-complaints__empty-state">
            <p className="cit-complaints__empty-icon">📋</p>
            <h2>No complaints submitted yet</h2>
            <p className="cit-complaints__empty-text">
              You haven't submitted any complaints. If you encountered an issue with
              a product, you can file a complaint to have it reviewed.
            </p>
            <Button variant="primary" onClick={handleNewComplaint}>
              Submit Your First Complaint
            </Button>
          </div>
        )}

        {/* List */}
        {!loading && !error && complaints.length > 0 && (
          <div className="cit-complaints__list">
            {complaints.map(c => {
              const statusConfig = STATUS_CONFIG[c.status];
              const evidenceCount = c.packageImages.length + c.supportingDocuments.length + (c.billEvidence ? 1 : 0);
              return (
                <article
                  key={c.id}
                  className="cit-complaints__card"
                  onClick={() => handleOpenComplaint(c.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleOpenComplaint(c.id);
                    }
                  }}
                  aria-label={`Open complaint ${c.id}`}
                >
                  <div className="cit-complaints__card-header">
                    <div>
                      <h2 className="cit-complaints__card-title">{c.product}</h2>
                      <code className="cit-complaints__card-id">ID: {c.id}</code>
                    </div>
                    <span className={`cit-complaints__status ${statusConfig.className}`}>
                      {statusConfig.label}
                    </span>
                  </div>

                  <div className="cit-complaints__card-issue">
                    <strong>Issue:</strong> {c.issue}
                  </div>

                  <div className="cit-complaints__card-meta">
                    <span>
                      <strong>Location:</strong> {c.placeOfPurchase}
                    </span>
                    <span>
                      <strong>Submitted:</strong> {new Date(c.submittedAt).toLocaleDateString()}
                    </span>
                    <span>
                      <strong>Evidence:</strong> {evidenceCount} item{evidenceCount !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="cit-complaints__card-footer">
                    <span className="cit-complaints__details-link">Track Complaint →</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="cit-complaints__back-row">
          <Button variant="ghost" onClick={handleGoHome}>
            ← Back to Home
          </Button>
        </div>
      </div>

      <CitizenComplaintsListStyles />
    </div>
  );
};

const CitizenComplaintsListStyles: React.FC = () => (
  <style>{`
    .cit-complaints {
      min-height: calc(100vh - var(--header-height));
      background-color: var(--color-gray-50);
      padding: var(--space-6);
    }

    .cit-complaints__container {
      max-width: 960px;
      margin: 0 auto;
    }

    .cit-complaints__header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: var(--space-6);
      flex-wrap: wrap;
      gap: var(--space-3);
    }

    .cit-complaints__title {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-navy-900);
      margin: 0 0 var(--space-1) 0;
    }

    .cit-complaints__subtitle {
      font-size: var(--font-size-sm);
      color: var(--color-gray-600);
      margin: 0;
    }

    .cit-complaints__loading {
      text-align: center;
      padding: var(--space-12);
    }

    .cit-complaints__spinner {
      width: 32px;
      height: 32px;
      margin: 0 auto var(--space-3);
      border: 3px solid var(--color-gray-200);
      border-top-color: var(--color-navy-500);
      border-radius: 50%;
      animation: cit-c-spin 0.8s linear infinite;
    }

    @keyframes cit-c-spin {
      to { transform: rotate(360deg); }
    }

    .cit-complaints__error-state {
      background: var(--color-error-100);
      border: 1px solid var(--color-error-600);
      border-radius: var(--radius-lg);
      padding: var(--space-6);
      text-align: center;
      color: var(--color-error-600);
    }

    .cit-complaints__error-state p {
      margin: 0 0 var(--space-4) 0;
    }

    .cit-complaints__empty-state {
      background: var(--color-white);
      border: 1px solid var(--color-gray-200);
      border-radius: var(--radius-lg);
      padding: var(--space-12);
      text-align: center;
      box-shadow: var(--shadow-sm);
    }

    .cit-complaints__empty-icon {
      font-size: 3rem;
      margin: 0 0 var(--space-3) 0;
    }

    .cit-complaints__empty-state h2 {
      font-size: var(--font-size-xl);
      color: var(--color-navy-900);
      margin: 0 0 var(--space-2) 0;
    }

    .cit-complaints__empty-text {
      font-size: var(--font-size-sm);
      color: var(--color-gray-600);
      max-width: 480px;
      margin: 0 auto var(--space-4) auto;
    }

    .cit-complaints__list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .cit-complaints__card {
      background: var(--color-white);
      border: 1px solid var(--color-gray-200);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
      cursor: pointer;
      transition: all var(--transition-base);
      box-shadow: var(--shadow-sm);
    }

    .cit-complaints__card:hover {
      border-color: var(--color-navy-500);
      box-shadow: var(--shadow-md);
      transform: translateY(-1px);
    }

    .cit-complaints__card:focus-visible {
      outline: 2px solid var(--color-navy-500);
      outline-offset: 2px;
    }

    .cit-complaints__card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-3);
      gap: var(--space-3);
    }

    .cit-complaints__card-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--color-navy-900);
      margin: 0 0 var(--space-1) 0;
    }

    .cit-complaints__card-id {
      display: inline-block;
      padding: 2px var(--space-2);
      background: var(--color-gray-100);
      color: var(--color-gray-700);
      border-radius: var(--radius-sm);
      font-family: var(--font-family-mono);
      font-size: 11px;
    }

    .cit-complaints__status {
      display: inline-block;
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      white-space: nowrap;
    }

    .cit-complaints__status--submitted {
      background: #e3f2fd;
      color: #1565c0;
    }

    .cit-complaints__status--received {
      background: #e0f7fa;
      color: #00838f;
    }

    .cit-complaints__status--assigned {
      background: #ede7f6;
      color: #4527a0;
    }

    .cit-complaints__status--inspection {
      background: #fff8e1;
      color: #f57c00;
    }

    .cit-complaints__status--verification {
      background: #e1f5fe;
      color: #0277bd;
    }

    .cit-complaints__status--resolved {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .cit-complaints__status--closed {
      background: var(--color-gray-200);
      color: var(--color-gray-700);
    }

    .cit-complaints__card-issue {
      font-size: var(--font-size-sm);
      color: var(--color-gray-700);
      margin-bottom: var(--space-3);
      padding-bottom: var(--space-3);
      border-bottom: 1px solid var(--color-gray-100);
    }

    .cit-complaints__card-meta {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
      font-size: var(--font-size-xs);
      color: var(--color-gray-600);
      margin-bottom: var(--space-3);
    }

    .cit-complaints__card-meta strong {
      color: var(--color-gray-800);
      margin-right: var(--space-1);
    }

    .cit-complaints__card-footer {
      text-align: right;
    }

    .cit-complaints__details-link {
      font-size: var(--font-size-sm);
      color: var(--color-navy-700);
      font-weight: var(--font-weight-medium);
    }

    .cit-complaints__back-row {
      margin-top: var(--space-6);
      text-align: center;
    }

    @media (max-width: 768px) {
      .cit-complaints {
        padding: var(--space-4);
      }

      .cit-complaints__header {
        flex-direction: column;
        align-items: stretch;
      }

      .cit-complaints__card-header {
        flex-direction: column;
      }

      .cit-complaints__card-meta {
        flex-direction: column;
        gap: var(--space-1);
      }
    }
  `}</style>
);

export default CitizenComplaintsList;