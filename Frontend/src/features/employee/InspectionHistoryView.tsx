/* ==========================================================================
   Inspection History Page
   Task K — Inspection History

   Historical view of all inspections with search, filters, sorting.
   Reuses inspection.service for data + filters.
   ========================================================================== */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import {
  InspectionRecord,
  InspectionFilter,
  getInspections,
  COMPLIANCE_STATUS_CONFIG,
} from '../../services/inspection.service';

type SortField = 'id' | 'date' | 'product' | 'status';
type SortDirection = 'asc' | 'desc';
type DateRangePreset = 'all' | 'today' | '7days' | '30days' | 'custom';

export const InspectionHistoryView: React.FC = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'loading' | 'done' | 'error'>('loading');
  const [inspections, setInspections] = useState<InspectionRecord[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<InspectionFilter>({
    status: 'all',
    complianceStatus: 'all',
    verificationStatus: 'all',
  });
  const [datePreset, setDatePreset] = useState<DateRangePreset>('all');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  /* ---- Load data on mount ---- */

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setInspections(getInspections());
        setPhase('done');
      } catch {
        setPhase('error');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  /* ---- Date range computation ---- */

  const computeDateRange = (): { from?: string; to?: string } => {
    const today = new Date();
    if (datePreset === 'today') {
      const todayStr = today.toISOString().split('T')[0];
      return { from: todayStr, to: todayStr };
    }
    if (datePreset === '7days') {
      const d = new Date(today);
      d.setDate(d.getDate() - 7);
      return { from: d.toISOString().split('T')[0], to: today.toISOString().split('T')[0] };
    }
    if (datePreset === '30days') {
      const d = new Date(today);
      d.setDate(d.getDate() - 30);
      return { from: d.toISOString().split('T')[0], to: today.toISOString().split('T')[0] };
    }
    if (datePreset === 'custom') {
      return { from: customDateFrom, to: customDateTo };
    }
    return {};
  };

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

      // Date range
      if (datePreset !== 'all') {
        const { from, to } = computeDateRange();
        if (from && insp.date < from) return false;
        if (to && insp.date > to) return false;
      }

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
    setDatePreset('all');
    setCustomDateFrom('');
    setCustomDateTo('');
  };

  const handleView = (id: string) => navigate(`/employee/inspections/${id}`);
  const handleReport = (id: string) => navigate(`/employee/reports?id=${id}`);
  const handleEvidence = (_id: string) => {
    navigate('/employee/inspection/evidence');
  };

  /* ---- Render ---- */

  if (phase === 'loading') {
    return (
      <div className="page ih-page">
        <h1 className="page-title">Inspection History</h1>
        <p className="page-subtitle">Loading inspection history...</p>
        <div className="ih-loading">
          <div className="ih-loading__spinner" />
          <p>Loading inspection history...</p>
        </div>
        <style>{ihStyles}</style>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="page ih-page">
        <h1 className="page-title">Inspection History</h1>
        <p className="page-subtitle">Unable to load inspection history.</p>
        <Card>
          <CardBody>
            <div className="ih-error">
              <p>Unable to load inspection data. Please try again.</p>
              <Button variant="primary" onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </CardBody>
        </Card>
        <style>{ihStyles}</style>
      </div>
    );
  }

  return (
    <div className="page ih-page">
      {/* Header */}
      <div className="ih-header">
        <h1 className="page-title">Inspection History</h1>
        <p className="page-subtitle">
          Complete historical view of all inspection records. AI-assisted screening is advisory only —
          officer verification is required for final findings.
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="ih-filters">
            <input
              type="search"
              className="ih-search"
              placeholder="Search by ID, product, location, or officer..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className="ih-filter-group">
              <label className="ih-filter-label">Date Range</label>
              <select
                className="ih-filter-select"
                value={datePreset}
                onChange={e => setDatePreset(e.target.value as DateRangePreset)}
              >
                <option value="all">All</option>
                <option value="today">Today</option>
                <option value="7days">Past 7 Days</option>
                <option value="30days">Past 30 Days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            {datePreset === 'custom' && (
              <>
                <div className="ih-filter-group">
                  <label className="ih-filter-label">From</label>
                  <input
                    type="date"
                    className="ih-filter-input"
                    value={customDateFrom}
                    onChange={e => setCustomDateFrom(e.target.value)}
                  />
                </div>
                <div className="ih-filter-group">
                  <label className="ih-filter-label">To</label>
                  <input
                    type="date"
                    className="ih-filter-input"
                    value={customDateTo}
                    onChange={e => setCustomDateTo(e.target.value)}
                  />
                </div>
              </>
            )}
            <div className="ih-filter-group">
              <label className="ih-filter-label">Status</label>
              <select
                className="ih-filter-select"
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
            <div className="ih-filter-group">
              <label className="ih-filter-label">Compliance</label>
              <select
                className="ih-filter-select"
                value={filter.complianceStatus ?? 'all'}
                onChange={e => setFilter(f => ({ ...f, complianceStatus: e.target.value as any }))}
              >
                <option value="all">All</option>
                <option value="pass">PASS</option>
                <option value="review_required">REVIEW REQUIRED</option>
                <option value="potential_issue">POTENTIAL ISSUE</option>
              </select>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Result count */}
      <div className="ih-result-count">
        <span>{filteredAndSorted.length} of {inspections.length} inspection(s)</span>
      </div>

      {/* Table / Cards */}
      {filteredAndSorted.length === 0 ? (
        <Card>
          <CardBody>
            <div className="ih-empty">
              <span className="ih-empty__icon">📋</span>
              <p>No inspections found.</p>
              <p className="ih-empty__sub">Try adjusting your search or filters.</p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <>
          <div className="ih-table-wrapper">
            <table className="ih-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('id')} className="ih-th--sortable">
                    Inspection ID {getSortIcon('id')}
                  </th>
                  <th onClick={() => handleSort('product')} className="ih-th--sortable">
                    Product {getSortIcon('product')}
                  </th>
                  <th>Location</th>
                  <th onClick={() => handleSort('date')} className="ih-th--sortable">
                    Date {getSortIcon('date')}
                  </th>
                  <th>Status</th>
                  <th>Officer</th>
                  <th>Report</th>
                  <th>Evidence</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSorted.map(insp => {
                  const compCfg = COMPLIANCE_STATUS_CONFIG[insp.complianceStatus];
                  return (
                    <tr key={insp.id}>
                      <td><code className="ih-id">{insp.id}</code></td>
                      <td className="ih-product">{insp.product || '—'}</td>
                      <td>{insp.location}</td>
                      <td>{new Date(insp.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td>
                        <Badge variant={compCfg.badge} size="sm">{compCfg.label}</Badge>
                      </td>
                      <td>{insp.inspectorId}</td>
                      <td>
                        <Badge variant="neutral" size="sm">—</Badge>
                      </td>
                      <td>
                        <Badge variant="info" size="sm">{insp.evidenceCount}</Badge>
                      </td>
                      <td>
                        <div className="ih-actions">
                          <Button variant="ghost" size="sm" onClick={() => handleView(insp.id)}>View</Button>
                          <Button variant="ghost" size="sm" onClick={() => handleReport(insp.id)}>Report</Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEvidence(insp.id)}>Evidence</Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="ih-card-grid">
            {filteredAndSorted.map(insp => {
              const compCfg = COMPLIANCE_STATUS_CONFIG[insp.complianceStatus];
              return (
                <div key={insp.id} className="ih-card">
                  <div className="ih-card__header">
                    <code className="ih-id">{insp.id}</code>
                    <Badge variant={compCfg.badge} size="sm">{compCfg.label}</Badge>
                  </div>
                  <div className="ih-card__product">{insp.product || '—'}</div>
                  <div className="ih-card__row">
                    <span className="ih-card__label">Location</span>
                    <span>{insp.location}</span>
                  </div>
                  <div className="ih-card__row">
                    <span className="ih-card__label">Date</span>
                    <span>{new Date(insp.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="ih-card__row">
                    <span className="ih-card__label">Officer</span>
                    <span>{insp.inspectorId}</span>
                  </div>
                  <div className="ih-card__row">
                    <span className="ih-card__label">Evidence</span>
                    <span>{insp.evidenceCount} item(s)</span>
                  </div>
                  <div className="ih-card__actions">
                    <Button variant="ghost" size="sm" onClick={() => handleView(insp.id)}>View</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleReport(insp.id)}>Report</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEvidence(insp.id)}>Evidence</Button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <style>{ihStyles}</style>
    </div>
  );
};

export default InspectionHistoryView;

/* ==========================================================================
   Styles
   ========================================================================== */

const ihStyles = `
  .ih-page { max-width: 1280px; margin: 0 auto; }
  .ih-header { margin-bottom: var(--space-4); }

  /* Filters */
  .ih-filters { display: flex; flex-wrap: wrap; gap: var(--space-3); align-items: flex-end; }
  .ih-search {
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
  .ih-search:focus { outline: none; border-color: var(--color-navy-500); box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
  .ih-filter-group { display: flex; flex-direction: column; gap: var(--space-1); }
  .ih-filter-label { font-size: 11px; color: var(--color-gray-500); text-transform: uppercase; letter-spacing: 0.3px; font-weight: var(--font-weight-bold); }
  .ih-filter-input, .ih-filter-select {
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-gray-300);
    border-radius: var(--radius-md);
    font-family: inherit;
    font-size: var(--font-size-sm);
    color: var(--color-navy-900);
    background: var(--color-white);
  }
  .ih-filter-input:focus, .ih-filter-select:focus { outline: none; border-color: var(--color-navy-500); box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }

  .ih-result-count { padding: var(--space-2) 0; font-size: var(--font-size-sm); color: var(--color-gray-600); }

  /* Table */
  .ih-table-wrapper { overflow-x: auto; border: 1px solid var(--color-gray-200); border-radius: var(--radius-md); background: var(--color-white); }
  .ih-table { width: 100%; border-collapse: collapse; }
  .ih-table th, .ih-table td { padding: var(--space-3); text-align: left; border-bottom: 1px solid var(--color-gray-200); font-size: var(--font-size-sm); }
  .ih-table th { background: var(--color-gray-50); font-weight: var(--font-weight-bold); color: var(--color-navy-900); text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
  .ih-th--sortable { cursor: pointer; user-select: none; }
  .ih-th--sortable:hover { background: var(--color-gray-100); }
  .ih-table tr:hover { background: var(--color-gray-50); }
  .ih-id { font-family: var(--font-family-mono); font-size: var(--font-size-xs); color: var(--color-navy-700); background: var(--color-navy-50); padding: 2px 6px; border-radius: 3px; }
  .ih-product { color: var(--color-navy-900); font-weight: var(--font-weight-semibold); }
  .ih-actions { display: flex; gap: var(--space-1); flex-wrap: wrap; }

  /* Mobile cards */
  .ih-card-grid { display: none; flex-direction: column; gap: var(--space-3); }
  .ih-card {
    padding: var(--space-3);
    background: var(--color-white);
    border: 1px solid var(--color-gray-200);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
  .ih-card__header { display: flex; justify-content: space-between; align-items: center; }
  .ih-card__product { font-size: var(--font-size-base); font-weight: var(--font-weight-semibold); color: var(--color-navy-900); }
  .ih-card__row { display: flex; justify-content: space-between; align-items: center; font-size: var(--font-size-sm); }
  .ih-card__label { color: var(--color-gray-500); font-size: 11px; text-transform: uppercase; }
  .ih-card__actions { display: flex; gap: var(--space-1); flex-wrap: wrap; }

  @media (max-width: 768px) {
    .ih-table-wrapper { display: none; }
    .ih-card-grid { display: flex; }
  }

  /* Empty / loading / error */
  .ih-empty { display: flex; flex-direction: column; align-items: center; gap: var(--space-2); text-align: center; padding: var(--space-8) 0; color: var(--color-gray-600); }
  .ih-empty__icon { font-size: 3rem; }
  .ih-empty p { margin: 0; font-size: var(--font-size-sm); }
  .ih-empty__sub { font-size: 11px; color: var(--color-gray-500); }
  .ih-loading { display: flex; flex-direction: column; align-items: center; gap: var(--space-3); padding: var(--space-12) 0; color: var(--color-gray-600); }
  .ih-loading__spinner { width: 40px; height: 40px; border: 3px solid var(--color-gray-200); border-top-color: var(--color-navy-500); border-radius: 50%; animation: ih-spin 0.8s linear infinite; }
  @keyframes ih-spin { to { transform: rotate(360deg); } }
  .ih-error { display: flex; flex-direction: column; align-items: center; gap: var(--space-3); text-align: center; padding: var(--space-8) 0; }
  .ih-error p { color: var(--color-gray-600); margin: 0; }
`;
