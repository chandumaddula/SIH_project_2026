/* ==========================================================================
   Reports List Page
   Task M — Inspection Reports

   Officers can view, search, and filter generated inspection reports.
   ========================================================================== */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { InspectionReport, ReportFilter, ReportSummary } from '../../types/report';
import {
  getReports,
  getReportSummary,
  generateReport,
  REPORT_STATUS_CONFIG,
  getUniqueReportOfficers,
  getUniqueReportCategories,
} from '../../services/report.service';
import { getInspectionById } from '../../services/inspection.service';

type SortField = 'id' | 'date' | 'product';

export const Reports: React.FC = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'loading' | 'done' | 'error'>('loading');
  const [reports, setReports] = useState<InspectionReport[]>([]);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ReportFilter>({ status: 'all' });
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => {
      try {
        setReports(getReports());
        setSummary(getReportSummary());
        setPhase('done');
      } catch {
        setPhase('error');
      }
    }, 300);
  }, []);

  const filtered = getReports({
    ...filter,
    search: search || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  }).slice().sort((a, b) => {
    let aVal: any = '';
    let bVal: any = '';
    if (sortField === 'id') {
      aVal = a.id;
      bVal = b.id;
    } else if (sortField === 'date') {
      aVal = a.inspectionDate;
      bVal = b.inspectionDate;
    } else {
      aVal = a.productName.toLowerCase();
      bVal = b.productName.toLowerCase();
    }
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setFilter({ status: 'all' });
    setDateFrom('');
    setDateTo('');
  };

  const handleView = (id: string) => navigate(`/employee/reports/${id}`);
  const handlePreview = (id: string) => navigate(`/employee/reports/${id}?preview=1`);

  const handleGenerate = (inspectionId: string) => {
    const insp = getInspectionById(inspectionId);
    if (!insp) {
      setActionError('Unable to generate report. Inspection not found.');
      setTimeout(() => setActionError(null), 4000);
      return;
    }
    const result = generateReport(inspectionId, insp.inspectorId);
    if (result) {
      setReports(getReports());
      setSummary(getReportSummary());
      setActionMessage('Inspection report generated successfully.');
      setTimeout(() => setActionMessage(null), 3000);
    } else {
      setActionError('Unable to generate report.');
      setTimeout(() => setActionError(null), 4000);
    }
  };

  const officers = getUniqueReportOfficers();
  const categories = getUniqueReportCategories();

  if (phase === 'loading') {
    return (
      <div className="page rep-page">
        <h1 className="page-title">Inspection Reports</h1>
        <p className="page-subtitle">Loading reports...</p>
        <div className="rep-loading"><div className="rep-spinner" /><p>Loading reports...</p></div>
        <style>{repStyles}</style>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="page rep-page">
        <h1 className="page-title">Inspection Reports</h1>
        <Card><CardBody>
          <div className="rep-error">
            <p>Unable to load reports.</p>
            <Button variant="primary" onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </CardBody></Card>
        <style>{repStyles}</style>
      </div>
    );
  }

  return (
    <div className="page rep-page">
      <div className="rep-header">
        <div>
          <h1 className="page-title">Inspection Reports</h1>
          <p className="page-subtitle">Generate and review inspection reports.</p>
        </div>
      </div>

      {actionMessage && <div className="rep-banner rep-banner--success">{actionMessage}</div>}
      {actionError && <div className="rep-banner rep-banner--error">{actionError}</div>}

      {/* Summary */}
      {summary && (
        <div className="rep-summary">
          {[
            { label: 'Total Reports', value: summary.total, variant: 'total' },
            { label: 'Draft', value: summary.draft, variant: 'draft' },
            { label: 'Generated', value: summary.generated, variant: 'generated' },
            { label: 'Review Required', value: summary.reviewRequired, variant: 'review' },
            { label: 'Completed', value: summary.completed, variant: 'completed' },
          ].map(s => (
            <div key={s.variant} className={`rep-summary-card rep-summary-card--${s.variant}`}>
              <span className="rep-summary-num">{s.value}</span>
              <span className="rep-summary-label">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="rep-filters">
            <input
              type="search"
              className="rep-search"
              placeholder="Search by report ID, inspection ID, product, or location..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className="rep-filter-group">
              <label className="rep-filter-label">Status</label>
              <select
                className="rep-filter-select"
                value={filter.status ?? 'all'}
                onChange={e => setFilter(f => ({ ...f, status: e.target.value as any }))}
              >
                <option value="all">All</option>
                <option value="DRAFT">DRAFT</option>
                <option value="GENERATED">GENERATED</option>
                <option value="REVIEW_REQUIRED">REVIEW REQUIRED</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>
            <div className="rep-filter-group">
              <label className="rep-filter-label">Officer</label>
              <select
                className="rep-filter-select"
                value={filter.officer ?? 'all'}
                onChange={e => setFilter(f => ({ ...f, officer: e.target.value as any }))}
              >
                <option value="all">All</option>
                {officers.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="rep-filter-group">
              <label className="rep-filter-label">Category</label>
              <select
                className="rep-filter-select"
                value={filter.category ?? 'all'}
                onChange={e => setFilter(f => ({ ...f, category: e.target.value as any }))}
              >
                <option value="all">All</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="rep-filter-group">
              <label className="rep-filter-label">From</label>
              <input type="date" className="rep-filter-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            </div>
            <div className="rep-filter-group">
              <label className="rep-filter-label">To</label>
              <input type="date" className="rep-filter-input" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>Clear</Button>
          </div>
        </CardBody>
      </Card>

      <div className="rep-result-count">{filtered.length} of {reports.length} report(s)</div>

      {/* Table */}
      {filtered.length === 0 ? (
        <Card><CardBody>
          <div className="rep-empty">
            <span className="rep-empty-icon">📄</span>
            <p>No inspection reports found.</p>
            <p className="rep-empty-sub">Try adjusting your filters or generate a report from an inspection.</p>
          </div>
        </CardBody></Card>
      ) : (
        <>
          <div className="rep-table-wrapper">
            <table className="rep-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('id')} className="rep-th--sortable">Report ID {sortField === 'id' ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}</th>
                  <th>Inspection ID</th>
                  <th onClick={() => handleSort('product')} className="rep-th--sortable">Product {sortField === 'product' ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}</th>
                  <th>Location</th>
                  <th onClick={() => handleSort('date')} className="rep-th--sortable">Date {sortField === 'date' ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}</th>
                  <th>Status</th>
                  <th>Officer</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const cfg = REPORT_STATUS_CONFIG[r.status];
                  return (
                    <tr key={r.id}>
                      <td><code className="rep-id">{r.id}</code></td>
                      <td><code className="rep-id-inline">{r.inspectionId}</code></td>
                      <td className="rep-product">{r.productName}</td>
                      <td>{r.inspectionLocation}</td>
                      <td>{new Date(r.inspectionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td><Badge variant={cfg.badge as any} size="sm">{cfg.label}</Badge></td>
                      <td>{r.officerName}</td>
                      <td>
                        <div className="rep-actions">
                          <Button variant="ghost" size="sm" onClick={() => handleView(r.id)}>View</Button>
                          {r.status !== 'DRAFT' && (
                            <Button variant="outline" size="sm" onClick={() => handlePreview(r.id)}>Preview</Button>
                          )}
                          {r.status === 'DRAFT' && (
                            <Button variant="primary" size="sm" onClick={() => handleGenerate(r.inspectionId)}>Generate</Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="rep-card-grid">
            {filtered.map(r => {
              const cfg = REPORT_STATUS_CONFIG[r.status];
              return (
                <div key={r.id} className="rep-card">
                  <div className="rep-card__header">
                    <code className="rep-id">{r.id}</code>
                    <Badge variant={cfg.badge as any} size="sm">{cfg.label}</Badge>
                  </div>
                  <div className="rep-card__product">{r.productName}</div>
                  <div className="rep-card__row"><span className="rep-card__label">Inspection</span><code className="rep-id-inline">{r.inspectionId}</code></div>
                  <div className="rep-card__row"><span className="rep-card__label">Location</span><span>{r.inspectionLocation}</span></div>
                  <div className="rep-card__row"><span className="rep-card__label">Date</span><span>{new Date(r.inspectionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></div>
                  <div className="rep-card__row"><span className="rep-card__label">Officer</span><span>{r.officerName}</span></div>
                  <div className="rep-card__actions">
                    <Button variant="ghost" size="sm" onClick={() => handleView(r.id)}>View</Button>
                    {r.status !== 'DRAFT' && <Button variant="outline" size="sm" onClick={() => handlePreview(r.id)}>Preview</Button>}
                    {r.status === 'DRAFT' && <Button variant="primary" size="sm" onClick={() => handleGenerate(r.inspectionId)}>Generate</Button>}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <style>{repStyles}</style>
    </div>
  );
};

export default Reports;

const repStyles = `
  .rep-page { max-width: 1280px; margin: 0 auto; }
  .rep-header { margin-bottom: var(--space-4); }
  .rep-banner { padding: var(--space-2) var(--space-3); border-radius: var(--radius-md); margin-bottom: var(--space-3); font-size: var(--font-size-sm); }
  .rep-banner--success { background: var(--color-success-100); color: var(--color-success-600); border: 1px solid var(--color-success-600); }
  .rep-banner--error { background: var(--color-error-100); color: var(--color-error-600); border: 1px solid var(--color-error-600); }

  .rep-summary { display: grid; grid-template-columns: repeat(5, 1fr); gap: var(--space-3); margin-bottom: var(--space-4); }
  .rep-summary-card { display: flex; flex-direction: column; align-items: center; padding: var(--space-3); border-radius: var(--radius-md); background: var(--color-white); border: 1px solid var(--color-gray-200); text-align: center; }
  .rep-summary-num { font-size: 1.5rem; font-weight: var(--font-weight-bold); color: var(--color-navy-900); }
  .rep-summary-label { font-size: 11px; color: var(--color-gray-600); text-transform: uppercase; margin-top: 2px; }
  .rep-summary-card--total .rep-summary-num { color: var(--color-navy-700); }
  .rep-summary-card--draft .rep-summary-num { color: var(--color-gray-600); }
  .rep-summary-card--generated .rep-summary-num { color: #1976d2; }
  .rep-summary-card--review .rep-summary-num { color: #7b1fa2; }
  .rep-summary-card--completed .rep-summary-num { color: var(--color-success-600); }
  @media (max-width: 900px) { .rep-summary { grid-template-columns: repeat(3, 1fr); } }
  @media (max-width: 600px) { .rep-summary { grid-template-columns: repeat(2, 1fr); } }

  .rep-filters { display: flex; flex-wrap: wrap; gap: var(--space-3); align-items: flex-end; }
  .rep-search { flex: 1; min-width: 200px; padding: var(--space-2) var(--space-3); border: 1px solid var(--color-gray-300); border-radius: var(--radius-md); font-family: inherit; font-size: var(--font-size-sm); color: var(--color-navy-900); background: var(--color-white); }
  .rep-search:focus { outline: none; border-color: var(--color-navy-500); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
  .rep-filter-group { display: flex; flex-direction: column; gap: var(--space-1); }
  .rep-filter-label { font-size: 11px; color: var(--color-gray-500); text-transform: uppercase; letter-spacing: 0.3px; font-weight: var(--font-weight-bold); }
  .rep-filter-input, .rep-filter-select { padding: var(--space-2) var(--space-3); border: 1px solid var(--color-gray-300); border-radius: var(--radius-md); font-family: inherit; font-size: var(--font-size-sm); color: var(--color-navy-900); background: var(--color-white); }
  .rep-filter-input:focus, .rep-filter-select:focus { outline: none; border-color: var(--color-navy-500); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }

  .rep-result-count { padding: var(--space-2) 0; font-size: var(--font-size-sm); color: var(--color-gray-600); }

  .rep-table-wrapper { overflow-x: auto; border: 1px solid var(--color-gray-200); border-radius: var(--radius-md); background: var(--color-white); }
  .rep-table { width: 100%; border-collapse: collapse; }
  .rep-table th, .rep-table td { padding: var(--space-3); text-align: left; border-bottom: 1px solid var(--color-gray-200); font-size: var(--font-size-sm); }
  .rep-table th { background: var(--color-gray-50); font-weight: var(--font-weight-bold); color: var(--color-navy-900); text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
  .rep-th--sortable { cursor: pointer; user-select: none; }
  .rep-th--sortable:hover { background: var(--color-gray-100); }
  .rep-table tr:hover { background: var(--color-gray-50); }
  .rep-id, .rep-id-inline { font-family: var(--font-family-mono); font-size: var(--font-size-xs); color: var(--color-navy-700); background: var(--color-navy-50); padding: 2px 6px; border-radius: 3px; }
  .rep-product { font-weight: var(--font-weight-semibold); color: var(--color-navy-900); }
  .rep-actions { display: flex; gap: var(--space-1); flex-wrap: wrap; }

  .rep-card-grid { display: none; flex-direction: column; gap: var(--space-3); }
  .rep-card { padding: var(--space-3); background: var(--color-white); border: 1px solid var(--color-gray-200); border-radius: var(--radius-md); box-shadow: var(--shadow-sm); display: flex; flex-direction: column; gap: var(--space-2); }
  .rep-card__header { display: flex; justify-content: space-between; align-items: center; }
  .rep-card__product { font-size: var(--font-size-base); font-weight: var(--font-weight-semibold); color: var(--color-navy-900); }
  .rep-card__row { display: flex; justify-content: space-between; align-items: center; font-size: var(--font-size-sm); }
  .rep-card__label { color: var(--color-gray-500); font-size: 11px; text-transform: uppercase; }
  .rep-card__actions { display: flex; gap: var(--space-1); flex-wrap: wrap; }

  @media (max-width: 768px) { .rep-table-wrapper { display: none; } .rep-card-grid { display: flex; } }

  .rep-empty { display: flex; flex-direction: column; align-items: center; gap: var(--space-2); text-align: center; padding: var(--space-8) 0; color: var(--color-gray-600); }
  .rep-empty-icon { font-size: 3rem; }
  .rep-empty p { margin: 0; font-size: var(--font-size-sm); }
  .rep-empty-sub { font-size: 11px; color: var(--color-gray-500); }
  .rep-loading { display: flex; flex-direction: column; align-items: center; gap: var(--space-3); padding: var(--space-12) 0; color: var(--color-gray-600); }
  .rep-spinner { width: 40px; height: 40px; border: 3px solid var(--color-gray-200); border-top-color: var(--color-navy-500); border-radius: 50%; animation: rep-spin 0.8s linear infinite; }
  @keyframes rep-spin { to { transform: rotate(360deg); } }
  .rep-error { display: flex; flex-direction: column; align-items: center; gap: var(--space-3); text-align: center; padding: var(--space-8) 0; }
  .rep-error p { color: var(--color-gray-600); margin: 0; }
`;
