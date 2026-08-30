import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store';
import { citizenScanService } from '../../services/citizenScan.service';
import { CitizenScan, PreliminaryResult } from '../../types/citizen';
import { Button } from '../../components/Button';

type FilterType = 'all' | PreliminaryResult;

const FILTER_CONFIG: Record<FilterType, { label: string; color: string }> = {
  all: { label: 'All', color: 'navy' },
  no_issue: { label: 'No Potential Issue', color: 'success' },
  review_recommended: { label: 'Review Recommended', color: 'warning' },
  potential_issue: { label: 'Potential Issue', color: 'danger' },
};

const RESULT_DISPLAY: Record<PreliminaryResult, { label: string; icon: string; badgeClass: string }> = {
  no_issue: { label: 'No Potential Issue', icon: '🟢', badgeClass: 'cit-scans__badge--success' },
  review_recommended: { label: 'Review Recommended', icon: '🟡', badgeClass: 'cit-scans__badge--warning' },
  potential_issue: { label: 'Potential Issue', icon: '🔴', badgeClass: 'cit-scans__badge--danger' },
};

export const CitizenScansList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [scans, setScans] = useState<CitizenScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');

  const loadScans = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await citizenScanService.getScans(user.id);
      setScans(data);
    } catch (err) {
      setError('Unable to load your scans. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadScans();
  }, [loadScans]);

  const filteredScans = filter === 'all'
    ? scans
    : scans.filter(s => s.screening.result === filter);

  const handleOpenScan = useCallback((scanId: string) => {
    navigate(`/citizen/scans/${scanId}`);
  }, [navigate]);

  const handleNewScan = useCallback(() => {
    navigate('/citizen/scan');
  }, [navigate]);

  const handleGoHome = useCallback(() => {
    navigate('/citizen/home');
  }, [navigate]);

  return (
    <div className="cit-scans">
      <div className="cit-scans__container">
        <header className="cit-scans__header">
          <div>
            <h1 className="cit-scans__title">My Scans</h1>
            <p className="cit-scans__subtitle">
              {scans.length === 0
                ? 'No scans yet'
                : `${scans.length} scan${scans.length !== 1 ? 's' : ''} found`}
            </p>
          </div>
          <Button variant="primary" onClick={handleNewScan}>
            New Scan
          </Button>
        </header>

        {/* Filters */}
        <div className="cit-scans__filters" role="tablist" aria-label="Filter scans by result">
          {(Object.keys(FILTER_CONFIG) as FilterType[]).map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              className={`cit-scans__filter ${filter === f ? `cit-scans__filter--${f}` : ''} ${filter === f ? 'cit-scans__filter--active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {FILTER_CONFIG[f].label}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="cit-scans__loading">
            <div className="cit-scans__spinner" />
            <p>Loading your scans...</p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="cit-scans__error-state" role="alert">
            <p>{error}</p>
            <Button variant="primary" onClick={loadScans}>Retry</Button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredScans.length === 0 && (
          <div className="cit-scans__empty-state">
            <p className="cit-scans__empty-icon">📦</p>
            <h2>No scans yet</h2>
            <p className="cit-scans__empty-text">
              {filter === 'all'
                ? 'You haven\'t scanned any products yet. Start by scanning your first product package.'
                : 'No scans match the selected filter.'}
            </p>
            {filter === 'all' && (
              <Button variant="primary" onClick={handleNewScan}>
                Scan Your First Product
              </Button>
            )}
          </div>
        )}

        {/* Scans list */}
        {!loading && !error && filteredScans.length > 0 && (
          <div className="cit-scans__list">
            {filteredScans.map(scan => {
              const display = RESULT_DISPLAY[scan.screening.result];
              return (
                <article
                  key={scan.id}
                  className="cit-scans__card"
                  onClick={() => handleOpenScan(scan.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleOpenScan(scan.id);
                    }
                  }}
                  aria-label={`Open scan for ${scan.detected.productName || 'product'}`}
                >
                  <div className="cit-scans__card-header">
                    <div className="cit-scans__card-info">
                      <h2 className="cit-scans__card-title">
                        {scan.detected.productName || 'Unknown Product'}
                      </h2>
                      <p className="cit-scans__card-date">
                        {new Date(scan.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className={`cit-scans__badge ${display.badgeClass}`}>
                      <span aria-hidden="true">{display.icon}</span>
                      {display.label}
                    </span>
                  </div>

                  <div className="cit-scans__card-meta">
                    <span className="cit-scans__meta-item">
                      <strong>Images:</strong> {scan.images.length}
                    </span>
                    <span className="cit-scans__meta-item">
                      <strong>Confidence:</strong> {Math.round(scan.screening.confidence * 100)}%
                    </span>
                    <span className="cit-scans__meta-item">
                      <strong>ID:</strong> {scan.id}
                    </span>
                  </div>

                  <div className="cit-scans__card-footer">
                    <span className="cit-scans__details-link">View Details →</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="cit-scans__back-row">
          <Button variant="ghost" onClick={handleGoHome}>
            ← Back to Home
          </Button>
        </div>
      </div>

      <CitizenScansStyles />
    </div>
  );
};

/* ==========================================================================
   Styles
   ========================================================================== */
const CitizenScansStyles: React.FC = () => (
  <style>{`
    .cit-scans {
      min-height: calc(100vh - var(--header-height));
      background-color: var(--color-gray-50);
      padding: var(--space-6);
    }

    .cit-scans__container {
      max-width: 960px;
      margin: 0 auto;
    }

    .cit-scans__header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: var(--space-6);
      flex-wrap: wrap;
      gap: var(--space-3);
    }

    .cit-scans__title {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-navy-900);
      margin: 0 0 var(--space-1) 0;
    }

    .cit-scans__subtitle {
      font-size: var(--font-size-sm);
      color: var(--color-gray-600);
      margin: 0;
    }

    .cit-scans__filters {
      display: flex;
      gap: var(--space-2);
      margin-bottom: var(--space-5);
      flex-wrap: wrap;
    }

    .cit-scans__filter {
      padding: var(--space-2) var(--space-4);
      background: var(--color-white);
      border: 1px solid var(--color-gray-300);
      border-radius: var(--radius-full);
      font-size: var(--font-size-sm);
      color: var(--color-gray-700);
      cursor: pointer;
      font-family: inherit;
      transition: all var(--transition-fast);
    }

    .cit-scans__filter:hover {
      border-color: var(--color-navy-500);
      color: var(--color-navy-700);
    }

    .cit-scans__filter--active {
      background: var(--color-navy-700);
      border-color: var(--color-navy-700);
      color: var(--color-white);
      font-weight: var(--font-weight-semibold);
    }

    .cit-scans__filter--no_issue.cit-scans__filter--active {
      background: var(--color-success-600);
      border-color: var(--color-success-600);
    }

    .cit-scans__filter--review_recommended.cit-scans__filter--active {
      background: var(--color-warning-600);
      border-color: var(--color-warning-600);
    }

    .cit-scans__filter--potential_issue.cit-scans__filter--active {
      background: var(--color-error-600);
      border-color: var(--color-error-600);
    }

    .cit-scans__loading {
      text-align: center;
      padding: var(--space-12);
      color: var(--color-gray-600);
    }

    .cit-scans__spinner {
      width: 32px;
      height: 32px;
      margin: 0 auto var(--space-3);
      border: 3px solid var(--color-gray-200);
      border-top-color: var(--color-navy-500);
      border-radius: 50%;
      animation: cit-scans-spin 0.8s linear infinite;
    }

    @keyframes cit-scans-spin {
      to { transform: rotate(360deg); }
    }

    .cit-scans__error-state {
      background: var(--color-error-100);
      border: 1px solid var(--color-error-600);
      border-radius: var(--radius-lg);
      padding: var(--space-6);
      text-align: center;
      color: var(--color-error-600);
    }

    .cit-scans__error-state p {
      margin: 0 0 var(--space-4) 0;
    }

    .cit-scans__empty-state {
      background: var(--color-white);
      border: 1px solid var(--color-gray-200);
      border-radius: var(--radius-lg);
      padding: var(--space-12);
      text-align: center;
      box-shadow: var(--shadow-sm);
    }

    .cit-scans__empty-icon {
      font-size: 3rem;
      margin: 0 0 var(--space-3) 0;
    }

    .cit-scans__empty-state h2 {
      font-size: var(--font-size-xl);
      color: var(--color-navy-900);
      margin: 0 0 var(--space-2) 0;
    }

    .cit-scans__empty-text {
      font-size: var(--font-size-sm);
      color: var(--color-gray-600);
      margin: 0 0 var(--space-4) 0;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    }

    .cit-scans__list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .cit-scans__card {
      background: var(--color-white);
      border: 1px solid var(--color-gray-200);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
      cursor: pointer;
      transition: all var(--transition-base);
      box-shadow: var(--shadow-sm);
    }

    .cit-scans__card:hover {
      border-color: var(--color-navy-500);
      box-shadow: var(--shadow-md);
      transform: translateY(-1px);
    }

    .cit-scans__card:focus-visible {
      outline: 2px solid var(--color-navy-500);
      outline-offset: 2px;
    }

    .cit-scans__card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-3);
      gap: var(--space-3);
    }

    .cit-scans__card-info {
      flex: 1;
      min-width: 0;
    }

    .cit-scans__card-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--color-navy-900);
      margin: 0 0 var(--space-1) 0;
    }

    .cit-scans__card-date {
      font-size: var(--font-size-xs);
      color: var(--color-gray-500);
      margin: 0;
    }

    .cit-scans__badge {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      white-space: nowrap;
    }

    .cit-scans__badge--success {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .cit-scans__badge--warning {
      background: #fff8e1;
      color: #f57c00;
    }

    .cit-scans__badge--danger {
      background: #ffebee;
      color: #c62828;
    }

    .cit-scans__card-meta {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
      padding: var(--space-2) 0;
      border-top: 1px solid var(--color-gray-100);
      border-bottom: 1px solid var(--color-gray-100);
      margin-bottom: var(--space-3);
      font-size: var(--font-size-xs);
      color: var(--color-gray-600);
    }

    .cit-scans__meta-item strong {
      color: var(--color-gray-800);
      margin-right: var(--space-1);
    }

    .cit-scans__card-footer {
      text-align: right;
    }

    .cit-scans__details-link {
      font-size: var(--font-size-sm);
      color: var(--color-navy-700);
      font-weight: var(--font-weight-medium);
    }

    .cit-scans__back-row {
      margin-top: var(--space-6);
      text-align: center;
    }

    @media (max-width: 768px) {
      .cit-scans {
        padding: var(--space-4);
      }

      .cit-scans__header {
        flex-direction: column;
        align-items: stretch;
      }

      .cit-scans__card-header {
        flex-direction: column;
      }

      .cit-scans__card-meta {
        flex-direction: column;
        gap: var(--space-1);
      }
    }
  `}</style>
);

export default CitizenScansList;