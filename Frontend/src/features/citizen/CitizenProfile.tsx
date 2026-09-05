import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store';
import { citizenScanService } from '../../services/citizenScan.service';
import { citizenComplaintService } from '../../services/citizenComplaint.service';
import { Button } from '../../components/Button';
import { CitizenScan } from '../../types/citizen';
import { CitizenComplaint } from '../../types/citizen';

export const CitizenProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [scans, setScans] = useState<CitizenScan[]>([]);
  const [complaints, setComplaints] = useState<CitizenComplaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      citizenScanService.getScans(user.id),
      citizenComplaintService.listComplaints(user.id),
    ]).then(([scanData, complaintData]) => {
      setScans(scanData);
      setComplaints(complaintData);
    }).catch(() => {
      // silently fail - profile still shows user info
    }).finally(() => {
      setLoading(false);
    });
  }, [user]);

  const handleGoHome = useCallback(() => {
    navigate('/citizen/home');
  }, [navigate]);

  const handleScan = useCallback(() => {
    navigate('/citizen/scan');
  }, [navigate]);

  const handleNewComplaint = useCallback(() => {
    navigate('/citizen/complaints/new');
  }, [navigate]);

  const handleOpenScan = useCallback((id: string) => {
    navigate(`/citizen/scans/${id}`);
  }, [navigate]);

  const handleOpenComplaint = useCallback((id: string) => {
    navigate(`/citizen/complaints/${id}`);
  }, [navigate]);

  const citizen = user && user.role === 'citizen' ? user : null;
  const joinedDate = citizen?.createdAt
    ? new Date(citizen.createdAt).toLocaleDateString()
    : 'N/A';

  return (
    <div className="cit-profile">
      <div className="cit-profile__container">
        <header className="cit-profile__header">
          <h1 className="cit-profile__title">My Profile</h1>
          <p className="cit-profile__subtitle">
            Your account information and activity summary.
          </p>
        </header>

        {/* Profile card */}
        <section className="cit-profile__section">
          <div className="cit-profile__identity">
            <div className="cit-profile__avatar">
              {(citizen?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="cit-profile__info">
              <h2 className="cit-profile__name">{citizen?.name || 'Citizen'}</h2>
              <p className="cit-profile__role-badge">Citizen Portal</p>
              <p className="cit-profile__member-since">
                Member since {joinedDate}
              </p>
            </div>
          </div>

          <div className="cit-profile__details">
            <DetailRow label="Full Name" value={citizen?.name || 'N/A'} />
            <DetailRow label="Citizen ID" value={citizen?.citizenId || citizen?.id || 'N/A'} />
            <DetailRow label="Email" value={citizen?.email || 'N/A'} />
            <DetailRow label="Phone" value={citizen?.phone || 'Not provided'} />
          </div>
        </section>

        {/* Activity summary */}
        <section className="cit-profile__section">
          <h2 className="cit-profile__section-title">Activity Summary</h2>

          {loading ? (
            <div className="cit-profile__activity-loading">
              <div className="cit-profile__spinner" />
              <p>Loading activity...</p>
            </div>
          ) : (
            <div className="cit-profile__stats">
              <div className="cit-profile__stat">
                <span className="cit-profile__stat-number">{scans.length}</span>
                <span className="cit-profile__stat-label">Total Scans</span>
              </div>
              <div className="cit-profile__stat">
                <span className="cit-profile__stat-number">{complaints.length}</span>
                <span className="cit-profile__stat-label">Complaints Filed</span>
              </div>
              <div className="cit-profile__stat">
                <span className="cit-profile__stat-number">
                  {complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length}
                </span>
                <span className="cit-profile__stat-label">Resolved</span>
              </div>
            </div>
          )}
        </section>

        {/* Recent scans */}
        <section className="cit-profile__section">
          <div className="cit-profile__section-header">
            <h2 className="cit-profile__section-title">Recent Scans</h2>
            <Button variant="outline" size="sm" onClick={handleScan}>
              Scan Product
            </Button>
          </div>

          {loading ? null : scans.length === 0 ? (
            <p className="cit-profile__empty">No scans yet. Scan a product to get started.</p>
          ) : (
            <ul className="cit-profile__scan-list">
              {scans.slice(0, 5).map(scan => (
                <li
                  key={scan.id}
                  className="cit-profile__scan-item"
                  onClick={() => handleOpenScan(scan.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleOpenScan(scan.id);
                    }
                  }}
                >
                  <div className="cit-profile__scan-info">
                    <span className="cit-profile__scan-product">
                      {scan.detected.productName || 'Unknown Product'}
                    </span>
                    <span className="cit-profile__scan-date">
                      {new Date(scan.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className={`cit-profile__scan-result cit-profile__scan-result--${scan.screening.result.replace('_', '-')}`}>
                    {scan.screening.result === 'no_issue' ? 'No Issue' :
                     scan.screening.result === 'review_recommended' ? 'Review' : 'Flagged'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent complaints */}
        <section className="cit-profile__section">
          <div className="cit-profile__section-header">
            <h2 className="cit-profile__section-title">Recent Complaints</h2>
            <Button variant="outline" size="sm" onClick={handleNewComplaint}>
              New Complaint
            </Button>
          </div>

          {loading ? null : complaints.length === 0 ? (
            <p className="cit-profile__empty">No complaints submitted yet.</p>
          ) : (
            <ul className="cit-profile__complaint-list">
              {complaints.slice(0, 5).map(c => (
                <li
                  key={c.id}
                  className="cit-profile__complaint-item"
                  onClick={() => handleOpenComplaint(c.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleOpenComplaint(c.id);
                    }
                  }}
                >
                  <div className="cit-profile__complaint-info">
                    <span className="cit-profile__complaint-product">{c.product}</span>
                    <span className="cit-profile__complaint-id">ID: {c.id}</span>
                  </div>
                  <span className={`cit-profile__complaint-status cit-profile__complaint-status--${c.status.toLowerCase()}`}>
                    {c.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="cit-profile__back-row">
          <Button variant="ghost" onClick={handleGoHome}>
            ← Back to Home
          </Button>
        </div>
      </div>

      <CitizenProfileStyles />
    </div>
  );
};

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="cit-profile__detail-row">
    <span className="cit-profile__detail-label">{label}</span>
    <span className="cit-profile__detail-value">{value}</span>
  </div>
);

const CitizenProfileStyles: React.FC = () => (
  <style>{`
    .cit-profile {
      min-height: calc(100vh - var(--header-height));
      background-color: var(--color-gray-50);
      padding: var(--space-6);
    }

    .cit-profile__container {
      max-width: 720px;
      margin: 0 auto;
    }

    .cit-profile__header {
      margin-bottom: var(--space-5);
    }

    .cit-profile__title {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-navy-900);
      margin: 0 0 var(--space-1) 0;
    }

    .cit-profile__subtitle {
      font-size: var(--font-size-sm);
      color: var(--color-gray-600);
      margin: 0;
    }

    .cit-profile__section {
      background: var(--color-white);
      border: 1px solid var(--color-gray-200);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
      margin-bottom: var(--space-4);
      box-shadow: var(--shadow-sm);
    }

    .cit-profile__section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-4);
    }

    .cit-profile__section-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--color-navy-900);
      margin: 0 0 var(--space-4) 0;
    }

    .cit-profile__section-header .cit-profile__section-title {
      margin-bottom: 0;
    }

    /* Identity */
    .cit-profile__identity {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      padding-bottom: var(--space-4);
      border-bottom: 1px solid var(--color-gray-100);
      margin-bottom: var(--space-4);
    }

    .cit-profile__avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--color-navy-500), var(--color-navy-700));
      color: var(--color-white);
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .cit-profile__info {
      flex: 1;
    }

    .cit-profile__name {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-navy-900);
      margin: 0 0 var(--space-1) 0;
    }

    .cit-profile__role-badge {
      display: inline-block;
      padding: 2px var(--space-3);
      background: rgba(34, 197, 94, 0.1);
      color: var(--color-success-600);
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      margin: 0 0 var(--space-1) 0;
    }

    .cit-profile__member-since {
      font-size: var(--font-size-xs);
      color: var(--color-gray-500);
      margin: 0;
    }

    /* Details */
    .cit-profile__details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-3);
    }

    .cit-profile__detail-row {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .cit-profile__detail-label {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      color: var(--color-gray-500);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .cit-profile__detail-value {
      font-size: var(--font-size-sm);
      color: var(--color-navy-900);
      font-weight: var(--font-weight-medium);
    }

    /* Activity */
    .cit-profile__activity-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-6);
      color: var(--color-gray-600);
    }

    .cit-profile__spinner {
      width: 24px;
      height: 24px;
      border: 2px solid var(--color-gray-200);
      border-top-color: var(--color-navy-500);
      border-radius: 50%;
      animation: cit-p-spin 0.8s linear infinite;
    }

    @keyframes cit-p-spin {
      to { transform: rotate(360deg); }
    }

    .cit-profile__stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-4);
      text-align: center;
    }

    .cit-profile__stat {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
      padding: var(--space-3);
      background: var(--color-gray-50);
      border-radius: var(--radius-md);
    }

    .cit-profile__stat-number {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-navy-700);
    }

    .cit-profile__stat-label {
      font-size: var(--font-size-xs);
      color: var(--color-gray-600);
      font-weight: var(--font-weight-medium);
    }

    /* Scans */
    .cit-profile__empty {
      font-size: var(--font-size-sm);
      color: var(--color-gray-500);
      font-style: italic;
      margin: 0;
      text-align: center;
      padding: var(--space-4);
    }

    .cit-profile__scan-list,
    .cit-profile__complaint-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .cit-profile__scan-item,
    .cit-profile__complaint-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-3);
      background: var(--color-gray-50);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: background var(--transition-fast);
    }

    .cit-profile__scan-item:hover,
    .cit-profile__complaint-item:hover {
      background: var(--color-gray-100);
    }

    .cit-profile__scan-info,
    .cit-profile__complaint-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .cit-profile__scan-product,
    .cit-profile__complaint-product {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--color-navy-900);
    }

    .cit-profile__scan-date,
    .cit-profile__complaint-id {
      font-size: var(--font-size-xs);
      color: var(--color-gray-500);
      font-family: var(--font-family-mono);
    }

    .cit-profile__scan-result {
      display: inline-block;
      padding: 2px var(--space-3);
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
    }

    .cit-profile__scan-result--no-issue {
      background: var(--color-success-100, #e8f5e9);
      color: var(--color-success-600, #2e7d32);
    }

    .cit-profile__scan-result--review-recommended {
      background: #fff8e1;
      color: #f57c00;
    }

    .cit-profile__scan-result--potential-issue {
      background: #ffebee;
      color: #c62828;
    }

    .cit-profile__complaint-status {
      display: inline-block;
      padding: 2px var(--space-3);
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      white-space: nowrap;
    }

    .cit-profile__complaint-status--submitted { background: #e3f2fd; color: #1565c0; }
    .cit-profile__complaint-status--received { background: #e0f7fa; color: #00838f; }
    .cit-profile__complaint-status--assigned { background: #ede7f6; color: #4527a0; }
    .cit-profile__complaint-status--inspection { background: #fff8e1; color: #f57c00; }
    .cit-profile__complaint-status--verification { background: #e1f5fe; color: #0277bd; }
    .cit-profile__complaint-status--resolved { background: #e8f5e9; color: #2e7d32; }
    .cit-profile__complaint-status--closed { background: var(--color-gray-200); color: #616161; }

    .cit-profile__back-row {
      text-align: center;
      margin-top: var(--space-4);
    }

    @media (max-width: 768px) {
      .cit-profile {
        padding: var(--space-4);
      }

      .cit-profile__details {
        grid-template-columns: 1fr;
      }

      .cit-profile__stats {
        grid-template-columns: repeat(3, 1fr);
        gap: var(--space-2);
      }

      .cit-profile__identity {
        flex-direction: column;
        text-align: center;
      }
    }
  `}</style>
);

export default CitizenProfile;
