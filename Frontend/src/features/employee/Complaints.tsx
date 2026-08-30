/* ==========================================================================
   Complaints List Page
   Task L — Citizen Complaint Management

   Officers can view, search, filter, and manage all citizen complaints.
   Uses complaint.service for data and state.
   ========================================================================== */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import {
  CitizenComplaint,
  ComplaintFilter,
  ComplaintStatus,
  ComplaintSummary,
} from '../../types/complaint';
import {
  getComplaints,
  getComplaintSummary,
  createInspectionLink,
  COMPLAINT_STATUS_CONFIG,
  COMPLAINT_PRIORITY_CONFIG,
} from '../../services/complaint.service';
import { generateInspectionId } from '../../services/inspection.service';
import { useInspectionStore } from '../../store/inspectionStore';

type TabFilter = ComplaintStatus | 'all';

const TABS: { value: TabFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'NEW', label: 'New' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'UNDER_INSPECTION', label: 'Under Inspection' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

export const Complaints: React.FC = () => {
  const navigate = useNavigate();
  const { setInspectionData } = useInspectionStore();

  /* ---- State ---- */

  const [phase, setPhase] = useState<'loading' | 'done' | 'error'>('loading');
  const [complaints, setComplaints] = useState<CitizenComplaint[]>([]);
  const [summary, setSummary] = useState<ComplaintSummary | null>(null);
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ComplaintFilter>({
    priority: 'all',
    status: 'all',
  });
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortField, setSortField] = useState<'date' | 'priority' | 'product'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  /* ---- Load ---- */

  useEffect(() => {
    setTimeout(() => {
      try {
        setComplaints(getComplaints());
        setSummary(getComplaintSummary());
        setPhase('done');
      } catch {
        setPhase('error');
      }
    }, 400);
  }, []);

  /* ---- Filter + sort ---- */

  const buildFilter = (): ComplaintFilter => ({
    ...filter,
    status: activeTab === 'all' ? 'all' : activeTab,
    search: search || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const filtered = getComplaints(buildFilter()).slice().sort((a, b) => {
    let aVal: any = '';
    let bVal: any = '';
    if (sortField === 'date') {
      aVal = new Date(a.submittedAt).getTime();
      bVal = new Date(b.submittedAt).getTime();
    } else if (sortField === 'priority') {
      const order = { HIGH: 0, MEDIUM: 1, NORMAL: 2 };
      aVal = order[a.priority] ?? 3;
      bVal = order[b.priority] ?? 3;
    } else {
      aVal = a.product.toLowerCase();
      bVal = b.product.toLowerCase();
    }
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  /* ---- Handlers ---- */

  const handleSort = (field: 'date' | 'priority' | 'product') => {
    if (sortField === field) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setFilter({ priority: 'all', status: 'all' });
    setDateFrom('');
    setDateTo('');
    setActiveTab('all');
  };

  const handleView = (id: string) => navigate(`/employee/complaints/${id}`);
  const handleCreateInspection = (complaint: CitizenComplaint) => {
    const inspectionId = generateInspectionId();
    createInspectionLink(complaint.id, inspectionId);
    setInspectionData({
      inspectionId,
      officerId: 'emp-001',
      officerName: 'John Martinez',
      office: 'Regional Metrology Office',
      images: [],
      form: {
        productName: complaint.product,
        productCategory: complaint.productCategory ?? '',
        manufacturer: complaint.manufacturer ?? '',
        retailer: '',
        location: complaint.location,
        packageType: '',
        barcode: '',
        complaintId: complaint.id,
        complaintIssue: complaint.issue,
      },
    });
    navigate('/employee/inspection/new');
  };

  /* ---- Render ---- */

  if (phase === 'loading') {
    return (
      <div className="page cmp-page">
        <h1 className="page-title">Citizen Complaints</h1>
        <p className="page-subtitle">Loading complaints...</p>
        <div className="cmp-loading">
          <div className="cmp-spinner" />
          <p>Loading complaints...</p>
        </div>
        <style>{cmpStyles}</style>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="page cmp-page">
        <h1 className="page-title">Citizen Complaints</h1>
        <p className="page-subtitle">Unable to load complaints.</p>
        <Card>
          <CardBody>
            <div className="cmp-error">
              <p>Unable to load complaint data.</p>
              <Button variant="primary" onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </CardBody>
        </Card>
        <style>{cmpStyles}</style>
      </div>
    );
  }

  const tabCount = (tab: TabFilter) => {
    if (!summary) return 0;
    if (tab === 'all') return summary.total;
    if (tab === 'NEW') return summary.newCount;
    if (tab === 'ASSIGNED') return summary.assignedCount;
    if (tab === 'UNDER_INSPECTION') return summary.underInspectionCount;
    if (tab === 'RESOLVED') return summary.resolvedCount;
    if (tab === 'CLOSED') return summary.closedCount;
    return 0;
  };

  return (
    <div className="page cmp-page">
      {/* Header */}
      <div className="cmp-header">
        <div>
          <h1 className="page-title">Citizen Complaints</h1>
          <p className="page-subtitle">Review and manage complaints submitted by citizens.</p>
        </div>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="cmp-summary">
          {[
            { label: 'Total', value: summary.total, variant: 'total' },
            { label: 'New', value: summary.newCount, variant: 'new' },
            { label: 'Assigned', value: summary.assignedCount, variant: 'assigned' },
            { label: 'Under Inspection', value: summary.underInspectionCount, variant: 'inspection' },
            { label: 'Resolved', value: summary.resolvedCount, variant: 'resolved' },
            { label: 'Closed', value: summary.closedCount, variant: 'closed' },
          ].map(s => (
            <div key={s.variant} className={`cmp-summary-card cmp-summary-card--${s.variant}`}>
              <span className="cmp-summary-num">{s.value}</span>
              <span className="cmp-summary-label">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="cmp-tabs" role="tablist">
        {TABS.map(tab => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={activeTab === tab.value}
            className={`cmp-tab ${activeTab === tab.value ? 'cmp-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
            <span className="cmp-tab-count">{tabCount(tab.value)}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="cmp-filters">
            <input
              type="search"
              className="cmp-search"
              placeholder="Search by ID, product, location, issue, or citizen..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className="cmp-filter-group">
              <label className="cmp-filter-label">Priority</label>
              <select
                className="cmp-filter-select"
                value={filter.priority ?? 'all'}
                onChange={e => setFilter(f => ({ ...f, priority: e.target.value as any }))}
              >
                <option value="all">All</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="NORMAL">NORMAL</option>
              </select>
            </div>
            <div className="cmp-filter-group">
              <label className="cmp-filter-label">From</label>
              <input
                type="date"
                className="cmp-filter-input"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
              />
            </div>
            <div className="cmp-filter-group">
              <label className="cmp-filter-label">To</label>
              <input
                type="date"
                className="cmp-filter-input"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
              />
            </div>
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              Clear
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Result count */}
      <div className="cmp-result-count">
        <span>{filtered.length} of {complaints.length} complaint(s)</span>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <Card>
          <CardBody>
            <div className="cmp-empty">
              <span className="cmp-empty-icon">📋</span>
              <p>No complaints found.</p>
              <p className="cmp-empty-sub">Try adjusting your filters or search.</p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <div className="cmp-table-wrapper">
            <table className="cmp-table">
              <thead>
                <tr>
                  <th>Complaint ID</th>
                  <th onClick={() => handleSort('product')} className="cmp-th--sortable">
                    Product {sortField === 'product' ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                  </th>
                  <th>Issue</th>
                  <th>Location</th>
                  <th onClick={() => handleSort('date')} className="cmp-th--sortable">
                    Submitted {sortField === 'date' ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                  </th>
                  <th onClick={() => handleSort('priority')} className="cmp-th--sortable">
                    Priority {sortField === 'priority' ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                  </th>
                  <th>Status</th>
                  <th>Evidence</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => {
                  const statusCfg = COMPLAINT_STATUS_CONFIG[c.status];
                  const priorityCfg = COMPLAINT_PRIORITY_CONFIG[c.priority];
                  return (
                    <tr key={c.id}>
                      <td><code className="cmp-id">{c.id}</code></td>
                      <td className="cmp-product">{c.product}</td>
                      <td className="cmp-issue">{c.issue}</td>
                      <td>{c.location}</td>
                      <td>
                        {new Date(c.submittedAt).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </td>
                      <td>
                        <Badge variant={priorityCfg.badge as any} size="sm">{priorityCfg.label}</Badge>
                      </td>
                      <td>
                        <Badge variant={statusCfg.badge as any} size="sm">{statusCfg.label}</Badge>
                      </td>
                      <td>
                        <Badge variant="neutral" size="sm">{c.evidence.length} item(s)</Badge>
                      </td>
                      <td>
                        <div className="cmp-actions">
                          <Button variant="ghost" size="sm" onClick={() => handleView(c.id)}>View</Button>
                          {c.status === 'NEW' && (
                            <Button variant="accent" size="sm" onClick={() => handleView(c.id)}>Assign</Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => handleCreateInspection(c)}>
                            Inspect
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="cmp-card-grid">
            {filtered.map(c => {
              const statusCfg = COMPLAINT_STATUS_CONFIG[c.status];
              const priorityCfg = COMPLAINT_PRIORITY_CONFIG[c.priority];
              return (
                <div key={c.id} className="cmp-card">
                  <div className="cmp-card__header">
                    <code className="cmp-id">{c.id}</code>
                    <Badge variant={priorityCfg.badge as any} size="sm">{priorityCfg.label}</Badge>
                  </div>
                  <div className="cmp-card__product">{c.product}</div>
                  <div className="cmp-card__issue">{c.issue}</div>
                  <div className="cmp-card__row">
                    <span className="cmp-card__label">Location</span>
                    <span>{c.location}</span>
                  </div>
                  <div className="cmp-card__row">
                    <span className="cmp-card__label">Submitted</span>
                    <span>
                      {new Date(c.submittedAt).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="cmp-card__row">
                    <span className="cmp-card__label">Status</span>
                    <Badge variant={statusCfg.badge as any} size="sm">{statusCfg.label}</Badge>
                  </div>
                  <div className="cmp-card__row">
                    <span className="cmp-card__label">Evidence</span>
                    <span>{c.evidence.length} item(s)</span>
                  </div>
                  <div className="cmp-card__actions">
                    <Button variant="ghost" size="sm" onClick={() => handleView(c.id)}>View</Button>
                    {c.status === 'NEW' && (
                      <Button variant="accent" size="sm" onClick={() => handleView(c.id)}>Assign</Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleCreateInspection(c)}>
                      Inspect
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <style>{cmpStyles}</style>
    </div>
  );
};

export default Complaints;

/* ==========================================================================
   Styles
   ========================================================================== */

const cmpStyles = `
  .cmp-page { max-width: 1280px; margin: 0 auto; }
  .cmp-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-4); }
  .cmp-page-title { font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); color: var(--color-navy-900); margin: 0 0 var(--space-1); }
  .cmp-page-sub { color: var(--color-gray-600); margin: 0; font-size: var(--font-size-sm); }

  /* Summary */
  .cmp-summary { display: grid; grid-template-columns: repeat(6, 1fr); gap: var(--space-3); margin-bottom: var(--space-4); }
  .cmp-summary-card {
    display: flex; flex-direction: column; align-items: center;
    padding: var(--space-3); border-radius: var(--radius-md);
    background: var(--color-white); border: 1px solid var(--color-gray-200);
    text-align: center;
  }
  .cmp-summary-num { font-size: 1.5rem; font-weight: var(--font-weight-bold); color: var(--color-navy-900); }
  .cmp-summary-label { font-size: 11px; color: var(--color-gray-600); text-transform: uppercase; margin-top: 2px; }
  .cmp-summary-card--total { background: var(--color-navy-50); border-color: var(--color-navy-200); }
  .cmp-summary-card--new .cmp-summary-num { color: var(--color-warning-600); }
  .cmp-summary-card--assigned .cmp-summary-num { color: #1976d2; }
  .cmp-summary-card--inspection .cmp-summary-num { color: #7b1fa2; }
  .cmp-summary-card--resolved .cmp-summary-num { color: var(--color-success-600); }
  .cmp-summary-card--closed .cmp-summary-num { color: var(--color-gray-600); }
  @media (max-width: 900px) { .cmp-summary { grid-template-columns: repeat(3, 1fr); } }
  @media (max-width: 600px) { .cmp-summary { grid-template-columns: repeat(2, 1fr); } }

  /* Tabs */
  .cmp-tabs { display: flex; gap: var(--space-1); margin-bottom: var(--space-4); border-bottom: 2px solid var(--color-gray-200); overflow-x: auto; }
  .cmp-tab {
    display: flex; align-items: center; gap: var(--space-2);
    padding: var(--space-2) var(--space-4); border: none; background: transparent;
    font-family: inherit; font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold);
    color: var(--color-gray-600); cursor: pointer; white-space: nowrap;
    border-bottom: 3px solid transparent; margin-bottom: -2px;
    transition: color var(--transition-fast), border-color var(--transition-fast);
  }
  .cmp-tab:hover { color: var(--color-navy-900); }
  .cmp-tab--active { color: var(--color-navy-700); border-bottom-color: var(--color-navy-600); }
  .cmp-tab-count { background: var(--color-gray-100); color: var(--color-gray-600); padding: 1px 6px; border-radius: 10px; font-size: 11px; }
  .cmp-tab--active .cmp-tab-count { background: var(--color-navy-100); color: var(--color-navy-700); }

  /* Filters */
  .cmp-filters { display: flex; flex-wrap: wrap; gap: var(--space-3); align-items: flex-end; }
  .cmp-search { flex: 1; min-width: 200px; padding: var(--space-2) var(--space-3); border: 1px solid var(--color-gray-300); border-radius: var(--radius-md); font-family: inherit; font-size: var(--font-size-sm); color: var(--color-navy-900); background: var(--color-white); }
  .cmp-search:focus { outline: none; border-color: var(--color-navy-500); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
  .cmp-filter-group { display: flex; flex-direction: column; gap: var(--space-1); }
  .cmp-filter-label { font-size: 11px; color: var(--color-gray-500); text-transform: uppercase; letter-spacing: 0.3px; font-weight: var(--font-weight-bold); }
  .cmp-filter-input, .cmp-filter-select { padding: var(--space-2) var(--space-3); border: 1px solid var(--color-gray-300); border-radius: var(--radius-md); font-family: inherit; font-size: var(--font-size-sm); color: var(--color-navy-900); background: var(--color-white); }
  .cmp-filter-input:focus, .cmp-filter-select:focus { outline: none; border-color: var(--color-navy-500); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }

  .cmp-result-count { padding: var(--space-2) 0; font-size: var(--font-size-sm); color: var(--color-gray-600); }

  /* Table */
  .cmp-table-wrapper { overflow-x: auto; border: 1px solid var(--color-gray-200); border-radius: var(--radius-md); background: var(--color-white); }
  .cmp-table { width: 100%; border-collapse: collapse; }
  .cmp-table th, .cmp-table td { padding: var(--space-3); text-align: left; border-bottom: 1px solid var(--color-gray-200); font-size: var(--font-size-sm); }
  .cmp-table th { background: var(--color-gray-50); font-weight: var(--font-weight-bold); color: var(--color-navy-900); text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; white-space: nowrap; }
  .cmp-th--sortable { cursor: pointer; user-select: none; }
  .cmp-th--sortable:hover { background: var(--color-gray-100); }
  .cmp-table tr:hover { background: var(--color-gray-50); }
  .cmp-id { font-family: var(--font-family-mono); font-size: var(--font-size-xs); color: var(--color-navy-700); background: var(--color-navy-50); padding: 2px 6px; border-radius: 3px; }
  .cmp-product { font-weight: var(--font-weight-semibold); color: var(--color-navy-900); max-width: 180px; }
  .cmp-issue { color: var(--color-gray-700); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .cmp-actions { display: flex; gap: var(--space-1); flex-wrap: wrap; }

  /* Mobile cards */
  .cmp-card-grid { display: none; flex-direction: column; gap: var(--space-3); }
  .cmp-card { padding: var(--space-3); background: var(--color-white); border: 1px solid var(--color-gray-200); border-radius: var(--radius-md); box-shadow: var(--shadow-sm); display: flex; flex-direction: column; gap: var(--space-2); }
  .cmp-card__header { display: flex; justify-content: space-between; align-items: center; }
  .cmp-card__product { font-size: var(--font-size-base); font-weight: var(--font-weight-semibold); color: var(--color-navy-900); }
  .cmp-card__issue { font-size: var(--font-size-sm); color: var(--color-gray-700); line-height: 1.4; }
  .cmp-card__row { display: flex; justify-content: space-between; align-items: center; font-size: var(--font-size-sm); }
  .cmp-card__label { color: var(--color-gray-500); font-size: 11px; text-transform: uppercase; }
  .cmp-card__actions { display: flex; gap: var(--space-1); flex-wrap: wrap; }

  @media (max-width: 768px) {
    .cmp-table-wrapper { display: none; }
    .cmp-card-grid { display: flex; }
  }

  /* Empty / loading / error */
  .cmp-empty { display: flex; flex-direction: column; align-items: center; gap: var(--space-2); text-align: center; padding: var(--space-8) 0; color: var(--color-gray-600); }
  .cmp-empty-icon { font-size: 3rem; }
  .cmp-empty p { margin: 0; font-size: var(--font-size-sm); }
  .cmp-empty-sub { font-size: 11px; color: var(--color-gray-500); }
  .cmp-loading { display: flex; flex-direction: column; align-items: center; gap: var(--space-3); padding: var(--space-12) 0; color: var(--color-gray-600); }
  .cmp-spinner { width: 40px; height: 40px; border: 3px solid var(--color-gray-200); border-top-color: var(--color-navy-500); border-radius: 50%; animation: cmp-spin 0.8s linear infinite; }
  @keyframes cmp-spin { to { transform: rotate(360deg); } }
  .cmp-error { display: flex; flex-direction: column; align-items: center; gap: var(--space-3); text-align: center; padding: var(--space-8) 0; }
  .cmp-error p { color: var(--color-gray-600); margin: 0; }
`;
