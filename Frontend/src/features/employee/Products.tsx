/* ==========================================================================
   Products List Page
   Task M — Product Repository

   Officers can view, search, and filter products associated with inspections.
   Derived from existing inspection data.
   ========================================================================== */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Product, ProductFilter, ProductSummary } from '../../types/product';
import {
  getProducts,
  getProductSummary,
  PRODUCT_CATEGORIES,
  PRODUCT_MANUFACTURERS,
} from '../../services/product.service';
import { COMPLIANCE_STATUS_CONFIG } from '../../services/inspection.service';

type SortField = 'name' | 'lastInspection' | 'inspectionCount';

export const Products: React.FC = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'loading' | 'done' | 'error'>('loading');
  const [products, setProducts] = useState<Product[]>([]);
  const [summary, setSummary] = useState<ProductSummary | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ProductFilter>({ complianceStatus: 'all' });
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  /* ---- Load ---- */

  useEffect(() => {
    setTimeout(() => {
      try {
        setProducts(getProducts());
        setSummary(getProductSummary());
        setPhase('done');
      } catch {
        setPhase('error');
      }
    }, 300);
  }, []);

  /* ---- Filter + sort ---- */

  const filtered = getProducts({
    ...filter,
    search: search || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  }).slice().sort((a, b) => {
    let aVal: any = '';
    let bVal: any = '';
    if (sortField === 'name') {
      aVal = a.name.toLowerCase();
      bVal = b.name.toLowerCase();
    } else if (sortField === 'lastInspection') {
      aVal = a.lastInspectionDate ?? '';
      bVal = b.lastInspectionDate ?? '';
    } else {
      aVal = a.inspectionCount;
      bVal = b.inspectionCount;
    }
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  /* ---- Handlers ---- */

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
    setFilter({ complianceStatus: 'all' });
    setDateFrom('');
    setDateTo('');
  };

  const handleView = (product: Product) => navigate(`/employee/products/${product.id}`);

  /* ---- Render ---- */

  if (phase === 'loading') {
    return (
      <div className="page prod-page">
        <h1 className="page-title">Product Repository</h1>
        <p className="page-subtitle">Loading products...</p>
        <div className="prod-loading"><div className="prod-spinner" /><p>Loading products...</p></div>
        <style>{prodStyles}</style>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="page prod-page">
        <h1 className="page-title">Product Repository</h1>
        <Card>
          <CardBody>
            <div className="prod-error">
              <p>Unable to load products.</p>
              <Button variant="primary" onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </CardBody>
        </Card>
        <style>{prodStyles}</style>
      </div>
    );
  }

  return (
    <div className="page prod-page">
      <div className="prod-header">
        <h1 className="page-title">Product Repository</h1>
        <p className="page-subtitle">Search and review products associated with inspections.</p>
      </div>

      {/* Summary */}
      {summary && (
        <div className="prod-summary">
          {[
            { label: 'Total Products', value: summary.total, variant: 'total' },
            { label: 'Inspected', value: summary.inspected, variant: 'inspected' },
            { label: 'Review Required', value: summary.requiresReview, variant: 'review' },
            { label: 'Potential Issues', value: summary.potentialIssues, variant: 'issues' },
          ].map(s => (
            <div key={s.variant} className={`prod-summary-card prod-summary-card--${s.variant}`}>
              <span className="prod-summary-num">{s.value}</span>
              <span className="prod-summary-label">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="prod-filters">
            <input
              type="search"
              className="prod-search"
              placeholder="Search by product name, manufacturer, barcode, or inspection ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className="prod-filter-group">
              <label className="prod-filter-label">Category</label>
              <select
                className="prod-filter-select"
                value={filter.category ?? 'all'}
                onChange={e => setFilter(f => ({ ...f, category: e.target.value as any }))}
              >
                <option value="all">All</option>
                {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="prod-filter-group">
              <label className="prod-filter-label">Compliance</label>
              <select
                className="prod-filter-select"
                value={filter.complianceStatus ?? 'all'}
                onChange={e => setFilter(f => ({ ...f, complianceStatus: e.target.value as any }))}
              >
                <option value="all">All</option>
                <option value="pass">PASS</option>
                <option value="review_required">REVIEW REQUIRED</option>
                <option value="potential_issue">POTENTIAL ISSUE</option>
              </select>
            </div>
            <div className="prod-filter-group">
              <label className="prod-filter-label">Manufacturer</label>
              <select
                className="prod-filter-select"
                value={filter.manufacturer ?? 'all'}
                onChange={e => setFilter(f => ({ ...f, manufacturer: e.target.value as any }))}
              >
                <option value="all">All</option>
                {PRODUCT_MANUFACTURERS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="prod-filter-group">
              <label className="prod-filter-label">From</label>
              <input type="date" className="prod-filter-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            </div>
            <div className="prod-filter-group">
              <label className="prod-filter-label">To</label>
              <input type="date" className="prod-filter-input" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>Clear</Button>
          </div>
        </CardBody>
      </Card>

      <div className="prod-result-count">{filtered.length} of {products.length} product(s)</div>

      {/* Table */}
      {filtered.length === 0 ? (
        <Card><CardBody>
          <div className="prod-empty"><span className="prod-empty-icon">📦</span><p>No products found.</p><p className="prod-empty-sub">Try adjusting your filters or search.</p></div>
        </CardBody></Card>
      ) : (
        <>
          <div className="prod-table-wrapper">
            <table className="prod-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')} className="prod-th--sortable">
                    Product {sortField === 'name' ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                  </th>
                  <th>Manufacturer</th>
                  <th>Category</th>
                  <th onClick={() => handleSort('lastInspection')} className="prod-th--sortable">
                    Last Inspection {sortField === 'lastInspection' ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                  </th>
                  <th>Status</th>
                  <th onClick={() => handleSort('inspectionCount')} className="prod-th--sortable">
                    Inspections {sortField === 'inspectionCount' ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const cfg = COMPLIANCE_STATUS_CONFIG[p.complianceStatus];
                  return (
                    <tr key={p.id}>
                      <td className="prod-name">{p.name}</td>
                      <td>{p.manufacturer}</td>
                      <td>{p.category}</td>
                      <td>{p.lastInspectionDate ? new Date(p.lastInspectionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                      <td><Badge variant={cfg.badge as any} size="sm">{cfg.label}</Badge></td>
                      <td>{p.inspectionCount > 0 ? <Badge variant="neutral" size="sm">{p.inspectionCount}</Badge> : <span className="prod-none">—</span>}</td>
                      <td>
                        <div className="prod-actions">
                          <Button variant="ghost" size="sm" onClick={() => handleView(p)}>View</Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="prod-card-grid">
            {filtered.map(p => {
              const cfg = COMPLIANCE_STATUS_CONFIG[p.complianceStatus];
              return (
                <div key={p.id} className="prod-card">
                  <div className="prod-card__header">
                    <span className="prod-card__name">{p.name}</span>
                    <Badge variant={cfg.badge as any} size="sm">{cfg.label}</Badge>
                  </div>
                  <div className="prod-card__row"><span className="prod-card__label">Manufacturer</span><span>{p.manufacturer}</span></div>
                  <div className="prod-card__row"><span className="prod-card__label">Category</span><span>{p.category}</span></div>
                  <div className="prod-card__row"><span className="prod-card__label">Last Inspection</span><span>{p.lastInspectionDate ? new Date(p.lastInspectionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span></div>
                  <div className="prod-card__row"><span className="prod-card__label">Inspections</span><span>{p.inspectionCount}</span></div>
                  <div className="prod-card__actions"><Button variant="ghost" size="sm" onClick={() => handleView(p)}>View Product</Button></div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <style>{prodStyles}</style>
    </div>
  );
};

export default Products;

/* ==========================================================================
   Styles
   ========================================================================== */

const prodStyles = `
  .prod-page { max-width: 1280px; margin: 0 auto; }
  .prod-header { margin-bottom: var(--space-4); }

  /* Summary */
  .prod-summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-3); margin-bottom: var(--space-4); }
  .prod-summary-card { display: flex; flex-direction: column; align-items: center; padding: var(--space-4); border-radius: var(--radius-md); background: var(--color-white); border: 1px solid var(--color-gray-200); text-align: center; }
  .prod-summary-num { font-size: 1.8rem; font-weight: var(--font-weight-bold); color: var(--color-navy-900); }
  .prod-summary-label { font-size: 11px; color: var(--color-gray-600); text-transform: uppercase; margin-top: 2px; }
  .prod-summary-card--total .prod-summary-num { color: var(--color-navy-700); }
  .prod-summary-card--inspected .prod-summary-num { color: var(--color-success-600); }
  .prod-summary-card--review .prod-summary-num { color: var(--color-warning-600); }
  .prod-summary-card--issues .prod-summary-num { color: var(--color-error-600); }
  @media (max-width: 700px) { .prod-summary { grid-template-columns: repeat(2, 1fr); } }

  /* Filters */
  .prod-filters { display: flex; flex-wrap: wrap; gap: var(--space-3); align-items: flex-end; }
  .prod-search { flex: 1; min-width: 200px; padding: var(--space-2) var(--space-3); border: 1px solid var(--color-gray-300); border-radius: var(--radius-md); font-family: inherit; font-size: var(--font-size-sm); color: var(--color-navy-900); background: var(--color-white); }
  .prod-search:focus { outline: none; border-color: var(--color-navy-500); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
  .prod-filter-group { display: flex; flex-direction: column; gap: var(--space-1); }
  .prod-filter-label { font-size: 11px; color: var(--color-gray-500); text-transform: uppercase; letter-spacing: 0.3px; font-weight: var(--font-weight-bold); }
  .prod-filter-input, .prod-filter-select { padding: var(--space-2) var(--space-3); border: 1px solid var(--color-gray-300); border-radius: var(--radius-md); font-family: inherit; font-size: var(--font-size-sm); color: var(--color-navy-900); background: var(--color-white); }
  .prod-filter-input:focus, .prod-filter-select:focus { outline: none; border-color: var(--color-navy-500); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }

  .prod-result-count { padding: var(--space-2) 0; font-size: var(--font-size-sm); color: var(--color-gray-600); }

  /* Table */
  .prod-table-wrapper { overflow-x: auto; border: 1px solid var(--color-gray-200); border-radius: var(--radius-md); background: var(--color-white); }
  .prod-table { width: 100%; border-collapse: collapse; }
  .prod-table th, .prod-table td { padding: var(--space-3); text-align: left; border-bottom: 1px solid var(--color-gray-200); font-size: var(--font-size-sm); }
  .prod-table th { background: var(--color-gray-50); font-weight: var(--font-weight-bold); color: var(--color-navy-900); text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
  .prod-th--sortable { cursor: pointer; user-select: none; }
  .prod-th--sortable:hover { background: var(--color-gray-100); }
  .prod-table tr:hover { background: var(--color-gray-50); }
  .prod-name { font-weight: var(--font-weight-semibold); color: var(--color-navy-900); }
  .prod-actions { display: flex; gap: var(--space-1); }
  .prod-none { color: var(--color-gray-400); }

  /* Mobile cards */
  .prod-card-grid { display: none; flex-direction: column; gap: var(--space-3); }
  .prod-card { padding: var(--space-3); background: var(--color-white); border: 1px solid var(--color-gray-200); border-radius: var(--radius-md); box-shadow: var(--shadow-sm); display: flex; flex-direction: column; gap: var(--space-2); }
  .prod-card__header { display: flex; justify-content: space-between; align-items: flex-start; }
  .prod-card__name { font-size: var(--font-size-base); font-weight: var(--font-weight-semibold); color: var(--color-navy-900); }
  .prod-card__row { display: flex; justify-content: space-between; align-items: center; font-size: var(--font-size-sm); }
  .prod-card__label { color: var(--color-gray-500); font-size: 11px; text-transform: uppercase; }
  .prod-card__actions { margin-top: var(--space-1); }

  @media (max-width: 768px) { .prod-table-wrapper { display: none; } .prod-card-grid { display: flex; } }

  /* Empty / loading / error */
  .prod-empty { display: flex; flex-direction: column; align-items: center; gap: var(--space-2); text-align: center; padding: var(--space-8) 0; color: var(--color-gray-600); }
  .prod-empty-icon { font-size: 3rem; }
  .prod-empty p { margin: 0; font-size: var(--font-size-sm); }
  .prod-empty-sub { font-size: 11px; color: var(--color-gray-500); }
  .prod-loading { display: flex; flex-direction: column; align-items: center; gap: var(--space-3); padding: var(--space-12) 0; color: var(--color-gray-600); }
  .prod-spinner { width: 40px; height: 40px; border: 3px solid var(--color-gray-200); border-top-color: var(--color-navy-500); border-radius: 50%; animation: prod-spin 0.8s linear infinite; }
  @keyframes prod-spin { to { transform: rotate(360deg); } }
  .prod-error { display: flex; flex-direction: column; align-items: center; gap: var(--space-3); text-align: center; padding: var(--space-8) 0; }
  .prod-error p { color: var(--color-gray-600); margin: 0; }
`;
