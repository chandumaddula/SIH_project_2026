/* ==========================================================================
   Inspections List Page
   Task K — Inspections management

   Officers can view, search, filter, and manage all inspection records.

   Statuses:
   - PASS / REVIEW REQUIRED / POTENTIAL ISSUE (automated screening)
   - PENDING / PARTIALLY VERIFIED / VERIFIED / REVIEW REQUESTED (officer)

   Demo: Uses mock data.
   ========================================================================== */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import {
  InspectionRecord,
  InspectionFilter,
  InspectionSummary,
  getInspections,
  getInspectionSummary,
  COMPLIANCE_STATUS_CONFIG,
  VERIFICATION_STATUS_CONFIG,
} from '../../services/inspection.service';

type SortField = 'id' | 'date' | 'product' | 'status';
type SortDirection = 'asc' | 'desc';

export const InspectionsList: React.FC = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'loading' | 'done' | 'error'>('loading');
  const [inspections, setInspections] = useState<InspectionRecord[]>([]);
  const [summary, setSummary] = useState<InspectionSummary | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<InspectionFilter>({
    status: 'all',
    complianceStatus: 'all',
    verificationStatus: 'all',
  });
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  /* ---- Load data on mount ---- */

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setInspections(getInspections());
        setSummary(getInspectionSummary());
        setPhase('done');
      } catch {
        setPhase('error');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  /* ---- Filter and sort ---- */

  const filteredAndSorted = inspections
    .filter(insp => {
      if (search) {
        const q = search.toLowerCase();
        const matchId = insp.id.toLowerCase().includes(q);
        const matchProduct = insp.product?.toLowerCase().includes(q);
        const matchLocation = insp.location.toLowerCase().includes(q);
        const matchOfficer = insp.inspectorId.toLowerCase().includes(q);
        if (!matchId && !matchProduct && !matchLocation && !matchOfficer) return false;
      }
      if (filter.status && filter.status !== 'all' && insp.status !== filter.status) return false;
      if (filter.complianceStatus && filter.complianceStatus !== 'all' && insp.complianceStatus !== filter.complianceStatus) return false;
      if (filter.verificationStatus && filter.verificationStatus !== 'all' && insp.verificationStatus !== filter.verificationStatus) return false;
      return true;
    })
    .sort((a, b) => {
      let aVal: any = a[sortField] ?? '';
      let bVal: any = b[sortField] ?? '';
      if (sortField === 'date') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else {
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
      }
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  /* ---- Handlers ---- */

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const handleClearFilters = () => {
    setSearch('');
    setFilter({ status: 'all', complianceStatus: 'all', verificationStatus: 'all' });
  };

  const handleView = (id: string) => navigate(`/employee/inspections/${id}`);
  const handleContinue = (id: string) => navigate(`/employee/inspections/${id}`);
  const handleReport = (id: string) => navigate(`/employee/reports?id=${id}`);

  /* ---- Render ---- */

  if (phase === 'loading') {
    return (
      <div className="page il-page">
        <h1 className="page-title">Inspections</h1>
        <p className="page-subtitle">Loading inspections...</p>
        <div className="il-loading">
          <div className="il-loading__spinner" />
          <p>Loading inspections...</p>
        </div>
        <style>{ilStyles}</style>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="page il-page">
        <h1 className="page-title">Inspections</h1>
        <p className="page-subtitle">Unable to load inspections.</p>
        <Card>
          <CardBody>
            <div className="il-error">
              <p>Unable to load inspection data. Please try again.</p>
              <Button variant="primary" onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </CardBody>
        </Card>
        <style>{ilStyles}</style>
      </div>
    );
  }

  return (
    <div className="page il-page">
      {/* Header */}
      <div className="il-header">
        <h1 className="page-title">Inspections</h1>
        <p className="page-subtitle">
          View and manage all inspection records. AI-assisted screening is advisory only — final
          verification requires officer decision.
        </p>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="il-summary">
          <div className="il-summary__card il-summary__card--total">
            <span className="il-summary__num">{summary.total}</span>
            <span className="il-summary__label">Total</span>
          </div>
          <div className="il-summary__card il-summary__card--pass">
            <span className="il-summary__num">{summary.passCount}</span>
            <span className="il-summary__label">PASS</span>
          </div>
          <div className="il-summary__card il-summary__card--review">
            <span className="il-summary__num">{summary.reviewRequiredCount}</span>
            <span className="il-summary__label">Review Required</span>
          </div>
          <div className="il-summary__card il-summary__card--issue">
            <span className="il-summary__num">{summary.potentialIssueCount}</span>
            <span className="il-summary__label">Potential Issue</span>
          </div>
          <div className="il-summary__card il-summary__card--verified">
            <span className="il-summary__num">{summary.verified}</span>
            <span className="il-summary__label">Officer Verified</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="il-filters">
            <input
              type="search"
              className="il-search"
              placeholder="Search by ID, product, location, or officer..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className="il-filter-group">
              <label className="il-filter-label">Date</label>
              <input
                type="date"
                className="il-filter-input"
                value={filter.dateFrom ?? ''}
                onChange={e => setFilter(f => ({ ...f, dateFrom: e.target.value }))}
              />
            </div>
            <div className="il-filter-group">
              <label className="il-filter-label">Status</label>
              <select
                className="il-filter-select"
                value={filter.status ?? 'all'}
                onChange={e => setFilter(f => ({ ...f, status: e.target.value as any }))}
              >
                <option value="all">All</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="flagged">Flagged</option>
              </select>
            </div>
            <div className="il-filter-group">
              <label className="il-filter-label">Compliance</label>
              <select
                className="il-filter-select"
                value={filter.complianceStatus ?? 'all'}
                onChange={e => setFilter(f => ({ ...f, complianceStatus: e.target.value as any }))}
              >
                <option value="all">All</option>
                <option value="pass">PASS</option>
                <option value="review_required">REVIEW REQUIRED</option>
                <option value="potential_issue">POTENTIAL ISSUE</option>
              </select>
            </div>
            <div className="il-filter-group">
              <label className="il-filter-label">Verification</label>
              <select
                className="il-filter-select"
                value={filter.verificationStatus ?? 'all'}
                onChange={e => setFilter(f => ({ ...f, verificationStatus: e.target.value as any }))}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="partially_verified">Partially Verified</option>
                <option value="verified">Verified</option>
                <option value="review_requested">Review Requested</option>
              </select>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Result count */}
      <div className="il-result-count">
        <span>{filteredAndSorted.length} of {inspections.length} inspection(s)</span>
      </div>

      {/* Table / Cards */}
      {filteredAndSorted.length === 0 ? (
        <Card>
          <CardBody>
            <div className="il-empty">
              <span className="il-empty__icon">📋</span>
              <p>No inspections found.</p>
              <p className="il-empty__sub">Try adjusting your search or filters.</p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <div className="il-table-wrapper">
            <table className="il-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('id')} className="il-th--sortable">
                    Inspection ID {getSortIcon('id')}
                  </th>
                  <th onClick={() => handleSort('product')} className="il-th--sortable">
                    Product {getSortIcon('product')}
                  </th>
                  <th>Location</th>
                  <th onClick={() => handleSort('date')} className="il-th--sortable">
                    Date {getSortIcon('date')}
                  </th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Verification</th>
                  <th>Officer</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSorted.map(insp => {
                  const compCfg = COMPLIANCE_STATUS_CONFIG[insp.complianceStatus];
                  const verCfg = VERIFICATION_STATUS_CONFIG[insp.verificationStatus];
                  return (
                    <tr key={insp.id}>
                      <td><code className="il-id">{insp.id}</code></td>
                      <td className="il-product">{insp.product || '—'}</td>
                      <td>{insp.location}</td>
                      <td>{new Date(insp.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td>{insp.time}</td>
                      <td>
                        <Badge variant={compCfg.badge} size="sm">{compCfg.label}</Badge>
                      </td>
                      <td>
                        <Badge variant={verCfg.badge} size="sm">{verCfg.label}</Badge>
                      </td>
                      <td>{insp.inspectorId}</td>
                      <td>
                        <div className="il-actions">
                          <Button variant="ghost" size="sm" onClick={() => handleView(insp.id)}>View</Button>
                          <Button variant="ghost" size="sm" onClick={() => handleContinue(insp.id)}>Continue</Button>
                          <Button variant="ghost" size="sm" onClick={() => handleReport(insp.id)}>Report</Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="il-card-grid">
            {filteredAndSorted.map(insp => {
              const compCfg = COMPLIANCE_STATUS_CONFIG[insp.complianceStatus];
              const verCfg = VERIFICATION_STATUS_CONFIG[insp.verificationStatus];
              return (
                <div key={insp.id} className="il-card">
                  <div className="il-card__header">
                    <code className="il-id">{insp.id}</code>
                    <Badge variant={compCfg.badge} size="sm">{compCfg.label}</Badge>
                  </div>
                  <div className="il-card__product">{insp.product || '—'}</div>
                  <div className="il-card__row">
                    <span className="il-card__label">Location</span>
                    <span>{insp.location}</span>
                  </div>
                  <div className="il-card__row">
                    <span className="il-card__label">Date</span>
                    <span>{new Date(insp.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="il-card__row">
                    <span className="il-card__label">Verification</span>
                    <Badge variant={verCfg.badge} size="sm">{verCfg.label}</Badge>
                  </div>
                  <div className="il-card__actions">
                    <Button variant="ghost" size="sm" onClick={() => handleView(insp.id)}>View</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleContinue(insp.id)}>Continue</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleReport(insp.id)}>Report</Button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <style>{ilStyles}</style>
    </div>
  );
};

export default InspectionsList;

/* ==========================================================================
   Styles
   ========================================================================== */

const ilStyles = `
  .il-page { max-width: 1280px; margin: 0 auto; }
  .il-header { margin-bottom: var(--space-4); }

  /* Summary */
  .il-summary {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: var(--space-3);
    margin-bottom: var(--space-4);
  }
  .il-summary__card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--space-4);
    background: var(--color-white);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-gray-200);
    text-align: center;
  }
  .il-summary__card--total { background: var(--color-navy-50); border-color: var(--color-navy-200); }
  .il-summary__card--pass { background: var(--color-success-100); border-color: var(--color-success-600, #2e7d32); }
  .il-summary__card--review { background: var(--color-warning-100); border-color: var(--color-warning-600, #f57c00); }
  .il-summary__card--issue { background: var(--color-error-100); border-color: var(--color-error-600, #d32f2f); }
  .il-summary__card--verified { background: #e3f2fd; border-color: #1976d2; }
  .il-summary__num { font-size: 1.8rem; font-weight: var(--font-weight-bold); color: var(--color-navy-900); }
  .il-summary__card--pass .il-summary__num { color: var(--color-success-600, #2e7d32); }
  .il-summary__card--review .il-summary__num { color: var(--color-warning-600, #f57c00); }
  .il-summary__card--issue .il-summary__num { color: var(--color-error-600, #d32f2f); }
  .il-summary__card--verified .il-summary__num { color: #1565c0; }
  .il-summary__label { font-size: 11px; color: var(--color-gray-700); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
  @media (max-width: 900px) { .il-summary { grid-template-columns: repeat(3, 1fr); } }
  @media (max-width: 600px) { .il-summary { grid-template-columns: repeat(2, 1fr); } }

  /* Filters */
  .il-filters { display: flex; flex-wrap: wrap; gap: var(--space-3); align-items: flex-end; }
  .il-search {
    flex: 1;
    min-width: 200px;
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-gray-300);
    border-radius: var(--radius-md);
    font-family: inherit;
    font-size: var(--font-size-sm);
    color: var(--color-navy-900);
    background: var(--color-white);
  }
  .il-search:focus { outline: none; border-color: var(--color-navy-500); box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
  .il-filter-group { display: flex; flex-direction: column; gap: var(--space-1); }
  .il-filter-label { font-size: 11px; color: var(--color-gray-500); text-transform: uppercase; letter-spacing: 0.3px; font-weight: var(--font-weight-bold); }
  .il-filter-input, .il-filter-select {
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-gray-300);
    border-radius: var(--radius-md);
    font-family: inherit;
    font-size: var(--font-size-sm);
    color: var(--color-navy-900);
    background: var(--color-white);
  }
  .il-filter-input:focus, .il-filter-select:focus { outline: none; border-color: var(--color-navy-500); box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }

  /* Result count */
  .il-result-count { padding: var(--space-2) 0; font-size: var(--font-size-sm); color: var(--color-gray-600); }

  /* Table */
  .il-table-wrapper { overflow-x: auto; border: 1px solid var(--color-gray-200); border-radius: var(--radius-md); background: var(--color-white); }
  .il-table { width: 100%; border-collapse: collapse; }
  .il-table th, .il-table td { padding: var(--space-3); text-align: left; border-bottom: 1px solid var(--color-gray-200); font-size: var(--font-size-sm); }
  .il-table th { background: var(--color-gray-50); font-weight: var(--font-weight-bold); color: var(--color-navy-900); text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
  .il-th--sortable { cursor: pointer; user-select: none; }
  .il-th--sortable:hover { background: var(--color-gray-100); }
  .il-table tr:hover { background: var(--color-gray-50); }
  .il-id { font-family: var(--font-family-mono); font-size: var(--font-size-xs); color: var(--color-navy-700); background: var(--color-navy-50); padding: 2px 6px; border-radius: 3px; }
  .il-product { color: var(--color-navy-900); font-weight: var(--font-weight-semibold); }
  .il-actions { display: flex; gap: var(--space-1); flex-wrap: wrap; }

  /* Mobile cards (hidden on desktop) */
  .il-card-grid { display: none; flex-direction: column; gap: var(--space-3); }
  .il-card {
    padding: var(--space-3);
    background: var(--color-white);
    border: 1px solid var(--color-gray-200);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
  .il-card__header { display: flex; justify-content: space-between; align-items: center; }
  .il-card__product { font-size: var(--font-size-base); font-weight: var(--font-weight-semibold); color: var(--color-navy-900); }
  .il-card__row { display: flex; justify-content: space-between; align-items: center; font-size: var(--font-size-sm); }
  .il-card__label { color: var(--color-gray-500); font-size: 11px; text-transform: uppercase; }
  .il-card__actions { display: flex; gap: var(--space-1); flex-wrap: wrap; }

  @media (max-width: 768px) {
    .il-table-wrapper { display: none; }
    .il-card-grid { display: flex; }
  }

  /* Empty / loading / error */
  .il-empty { display: flex; flex-direction: column; align-items: center; gap: var(--space-2); text-align: center; padding: var(--space-8) 0; color: var(--color-gray-600); }
  .il-empty__icon { font-size: 3rem; }
  .il-empty p { margin: 0; font-size: var(--font-size-sm); }
  .il-empty__sub { font-size: 11px; color: var(--color-gray-500); }
  .il-loading { display: flex; flex-direction: column; align-items: center; gap: var(--space-3); padding: var(--space-12) 0; color: var(--color-gray-600); }
  .il-loading__spinner { width: 40px; height: 40px; border: 3px solid var(--color-gray-200); border-top-color: var(--color-navy-500); border-radius: 50%; animation: il-spin 0.8s linear infinite; }
  @keyframes il-spin { to { transform: rotate(360deg); } }
  .il-error { display: flex; flex-direction: column; align-items: center; gap: var(--space-3); text-align: center; padding: var(--space-8) 0; }
  .il-error p { color: var(--color-gray-600); margin: 0; }
`;
