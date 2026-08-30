import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store';
import { adminService } from '../../services/admin.service';
import { AdminKpis, AdminAuditEntry } from '../../types/admin';
import { Button } from '../../components/Button';
import { Loading } from '../../components/Loading';

interface KpiTile {
  key: keyof AdminKpis;
  label: string;
  value: number;
  hint: string;
  tone: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
  trend: number;
  link: string;
}

const TONE_COLORS: Record<KpiTile['tone'], { bg: string; fg: string; accent: string }> = {
  neutral: { bg: '#f1f5f9', fg: '#0f172a', accent: '#475569' },
  success: { bg: '#dcfce7', fg: '#14532d', accent: '#16a34a' },
  warning: { bg: '#fef3c7', fg: '#713f12', accent: '#d97706' },
  danger: { bg: '#fee2e2', fg: '#7f1d1d', accent: '#dc2626' },
  info: { bg: '#dbeafe', fg: '#1e3a8a', accent: '#2563eb' },
};

export const AdminOverview: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [kpis, setKpis] = useState<AdminKpis | null>(null);
  const [audit, setAudit] = useState<AdminAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [k, a] = await Promise.all([adminService.getKpis(), adminService.getRecentAudit(5)]);
      setKpis(k);
      setAudit(a);
    } catch {
      setError('Unable to load overview. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const tiles: KpiTile[] = useMemo(() => kpis ? [
    { key: 'totalInspections', label: 'Total Inspections', value: kpis.totalInspections, hint: 'across all officers', tone: 'info', trend: 12, link: '/admin/inspections' },
    { key: 'productsScanned', label: 'Products Scanned', value: kpis.productsScanned, hint: 'citizen scans', tone: 'neutral', trend: 8, link: '/admin/products' },
    { key: 'openComplaints', label: 'Open Complaints', value: kpis.openComplaints, hint: 'pending resolution', tone: 'warning', trend: -3, link: '/admin/complaints' },
    { key: 'potentialIssues', label: 'Potential Issues', value: kpis.potentialIssues, hint: 'flagged in last 30d', tone: 'danger', trend: 4, link: '/admin/analytics' },
    { key: 'employees', label: 'Employees', value: kpis.employees, hint: 'active officers', tone: 'success', trend: 0, link: '/admin/employees' },
    { key: 'reportsGenerated', label: 'Reports Generated', value: kpis.reportsGenerated, hint: 'this quarter', tone: 'neutral', trend: 6, link: '/admin/reports' },
    { key: 'pendingVerification', label: 'Pending Verification', value: kpis.pendingVerification, hint: 'awaiting officer sign-off', tone: 'warning', trend: 1, link: '/admin/inspections' },
  ] : [], [kpis]);

  const QUICK_LINKS = [
    { to: '/admin/inspections', icon: '🔍', label: 'Inspections', desc: 'Review and oversee all inspections' },
    { to: '/admin/complaints', icon: '📋', label: 'Complaints', desc: 'Track and manage citizen complaints' },
    { to: '/admin/employees', icon: '👥', label: 'Employees', desc: 'Manage officer accounts and roles' },
    { to: '/admin/analytics', icon: '📊', label: 'Analytics', desc: 'Detailed trends and compliance charts' },
    { to: '/admin/geography', icon: '🗺️', label: 'Geography', desc: 'Geographic distribution of activity' },
    { to: '/admin/reports', icon: '📄', label: 'Reports', desc: 'Generate system reports' },
  ];

  if (loading) return <Loading text="Loading overview..." fullPage />;

  if (error || !kpis) {
    return (
      <div className="adm-overview__error" role="alert">
        <p>{error || 'Failed to load overview.'}</p>
        <Button variant="primary" onClick={load}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="adm-overview">
      {/* Header */}
      <header className="adm-overview__header">
        <div>
          <h1 className="adm-overview__title">System Overview</h1>
          <p className="adm-overview__subtitle">
            Welcome back, {user?.name || 'Administrator'}. Here is what is happening across the platform.
          </p>
        </div>
        <div className="adm-overview__header-meta">
          <span className="adm-overview__env-badge">DEMO</span>
          <span className="adm-overview__ts">Last updated: {new Date().toLocaleString()}</span>
        </div>
      </header>

      {/* KPI grid */}
      <section className="adm-overview__kpis" aria-label="Key performance indicators">
        {tiles.map(tile => {
          const color = TONE_COLORS[tile.tone];
          return (
            <button
              key={tile.key}
              className="adm-overview__kpi"
              onClick={() => navigate(tile.link)}
              aria-label={`${tile.label}: ${tile.value.toLocaleString()}`}
            >
              <div className="adm-overview__kpi-top">
                <span className="adm-overview__kpi-label">{tile.label}</span>
                <span
                  className="adm-overview__kpi-trend"
                  style={{ color: color.accent }}
                >
                  {tile.trend > 0 ? '▲' : tile.trend < 0 ? '▼' : '–'} {Math.abs(tile.trend)}%
                </span>
              </div>
              <div className="adm-overview__kpi-value" style={{ color: color.fg }}>
                {tile.value.toLocaleString()}
              </div>
              <div className="adm-overview__kpi-hint">{tile.hint}</div>
            </button>
          );
        })}
      </section>

      {/* Quick links + recent activity */}
      <div className="adm-overview__row">
        <section className="adm-overview__panel">
          <h2 className="adm-overview__panel-title">Quick Links</h2>
          <div className="adm-overview__quick-grid">
            {QUICK_LINKS.map(link => (
              <button
                key={link.to}
                className="adm-overview__quick"
                onClick={() => navigate(link.to)}
              >
                <span className="adm-overview__quick-icon">{link.icon}</span>
                <span className="adm-overview__quick-text">
                  <span className="adm-overview__quick-label">{link.label}</span>
                  <span className="adm-overview__quick-desc">{link.desc}</span>
                </span>
                <span className="adm-overview__quick-arrow" aria-hidden="true">→</span>
              </button>
            ))}
          </div>
        </section>

        <section className="adm-overview__panel">
          <h2 className="adm-overview__panel-title">Recent Admin Activity</h2>
          {audit.length === 0 ? (
            <p className="adm-overview__empty">No recent activity.</p>
          ) : (
            <ul className="adm-overview__activity">
              {audit.map(a => (
                <li key={a.id} className="adm-overview__activity-item">
                  <span className={`adm-overview__activity-cat adm-overview__activity-cat--${a.category}`}>
                    {a.category}
                  </span>
                  <div className="adm-overview__activity-content">
                    <span className="adm-overview__activity-action">
                      <strong>{a.actor}</strong> — {a.action} <em>{a.target}</em>
                    </span>
                    <span className="adm-overview__activity-meta">
                      {new Date(a.timestamp).toLocaleString()} • IP {a.ip}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/audit')}
          >
            View All Activity →
          </Button>
        </section>
      </div>

      {/* Compliance status summary */}
      <section className="adm-overview__panel">
        <h2 className="adm-overview__panel-title">Compliance Status Summary</h2>
        <div className="adm-overview__status-grid">
          <StatusCard label="Pass" icon="🟢" count={412} tone="success" />
          <StatusCard label="Review" icon="🟡" count={94} tone="warning" />
          <StatusCard label="Potential Issue" icon="🔴" count={42} tone="danger" />
        </div>
        <p className="adm-overview__panel-note">
          Status counts are derived from mock data for demonstration. See Analytics for full detail.
        </p>
      </section>

      <AdminOverviewStyles />
    </div>
  );
};

const StatusCard: React.FC<{ label: string; icon: string; count: number; tone: 'success' | 'warning' | 'danger' }> = ({ label, icon, count, tone }) => {
  const color = TONE_COLORS[tone];
  return (
    <div className="adm-overview__status" style={{ background: color.bg, color: color.fg }}>
      <span className="adm-overview__status-icon" aria-hidden="true">{icon}</span>
      <div>
        <div className="adm-overview__status-label">{label}</div>
        <div className="adm-overview__status-count">{count.toLocaleString()}</div>
      </div>
    </div>
  );
};

const AdminOverviewStyles: React.FC = () => (
  <style>{`
    .adm-overview {
      padding: var(--space-6);
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
    }

    .adm-overview__error {
      margin: var(--space-6);
      padding: var(--space-6);
      background: #fee2e2;
      border: 1px solid #dc2626;
      color: #7f1d1d;
      border-radius: var(--radius-lg);
      text-align: center;
    }

    .adm-overview__error p { margin-bottom: var(--space-3); }

    .adm-overview__header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      flex-wrap: wrap;
      gap: var(--space-3);
    }

    .adm-overview__title {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-bold);
      color: #0f172a;
      margin: 0 0 var(--space-1) 0;
    }

    .adm-overview__subtitle {
      font-size: var(--font-size-sm);
      color: #475569;
      margin: 0;
      max-width: 720px;
    }

    .adm-overview__header-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: var(--space-1);
    }

    .adm-overview__env-badge {
      font-size: 10px;
      font-weight: var(--font-weight-bold);
      letter-spacing: 1px;
      color: #92400e;
      background: #fef3c7;
      border: 1px solid #fbbf24;
      padding: 2px var(--space-2);
      border-radius: var(--radius-sm);
    }

    .adm-overview__ts {
      font-size: 11px;
      color: #64748b;
    }

    /* KPI grid */
    .adm-overview__kpis {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: var(--space-3);
    }

    .adm-overview__kpi {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: var(--radius-lg);
      padding: var(--space-4);
      text-align: left;
      cursor: pointer;
      transition: all var(--transition-fast);
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
      font-family: inherit;
    }

    .adm-overview__kpi:hover {
      border-color: #3b82f6;
      box-shadow: 0 4px 12px rgba(59,130,246,0.1);
      transform: translateY(-1px);
    }

    .adm-overview__kpi:focus-visible {
      outline: 2px solid #3b82f6;
      outline-offset: 2px;
    }

    .adm-overview__kpi-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .adm-overview__kpi-label {
      font-size: var(--font-size-xs);
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: var(--font-weight-semibold);
    }

    .adm-overview__kpi-trend {
      font-size: 11px;
      font-weight: var(--font-weight-semibold);
    }

    .adm-overview__kpi-value {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-bold);
      line-height: 1.1;
      margin: var(--space-1) 0;
    }

    .adm-overview__kpi-hint {
      font-size: 11px;
      color: #94a3b8;
    }

    /* Row of two panels */
    .adm-overview__row {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: var(--space-4);
    }

    .adm-overview__panel {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: var(--radius-lg);
      padding: var(--space-5);
    }

    .adm-overview__panel-title {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-semibold);
      color: #0f172a;
      margin: 0 0 var(--space-3) 0;
    }

    /* Quick links */
    .adm-overview__quick-grid {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .adm-overview__quick {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3);
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);
      font-family: inherit;
      text-align: left;
    }

    .adm-overview__quick:hover {
      background: #eff6ff;
      border-color: #3b82f6;
    }

    .adm-overview__quick-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .adm-overview__quick-text {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .adm-overview__quick-label {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: #0f172a;
    }

    .adm-overview__quick-desc {
      font-size: 11px;
      color: #64748b;
    }

    .adm-overview__quick-arrow {
      color: #94a3b8;
      font-size: var(--font-size-lg);
    }

    /* Activity */
    .adm-overview__activity {
      list-style: none;
      padding: 0;
      margin: 0 0 var(--space-3) 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .adm-overview__activity-item {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      padding: var(--space-2);
      border-bottom: 1px solid #f1f5f9;
    }

    .adm-overview__activity-item:last-child { border-bottom: none; }

    .adm-overview__activity-cat {
      font-size: 10px;
      font-weight: var(--font-weight-bold);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 2px var(--space-2);
      border-radius: var(--radius-sm);
      flex-shrink: 0;
    }

    .adm-overview__activity-cat--auth { background: #dbeafe; color: #1e3a8a; }
    .adm-overview__activity-cat--data { background: #dcfce7; color: #14532d; }
    .adm-overview__activity-cat--config { background: #fef3c7; color: #713f12; }
    .adm-overview__activity-cat--access { background: #f3e8ff; color: #581c87; }

    .adm-overview__activity-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .adm-overview__activity-action {
      font-size: var(--font-size-sm);
      color: #1e293b;
    }

    .adm-overview__activity-action em { font-style: normal; color: #3b82f6; }

    .adm-overview__activity-meta {
      font-size: 11px;
      color: #94a3b8;
    }

    .adm-overview__empty {
      font-size: var(--font-size-sm);
      color: #94a3b8;
      text-align: center;
      padding: var(--space-4);
      margin: 0 0 var(--space-3) 0;
    }

    /* Status grid */
    .adm-overview__status-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-3);
      margin-bottom: var(--space-3);
    }

    .adm-overview__status {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-4);
      border-radius: var(--radius-md);
    }

    .adm-overview__status-icon {
      font-size: 1.5rem;
    }

    .adm-overview__status-label {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      opacity: 0.7;
    }

    .adm-overview__status-count {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      line-height: 1.1;
    }

    .adm-overview__panel-note {
      font-size: 11px;
      color: #94a3b8;
      font-style: italic;
      margin: var(--space-2) 0 0 0;
    }

    @media (max-width: 1023px) {
      .adm-overview__row {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .adm-overview {
        padding: var(--space-4);
      }
      .adm-overview__kpis {
        grid-template-columns: repeat(2, 1fr);
      }
      .adm-overview__status-grid {
        grid-template-columns: 1fr;
      }
    }
  `}</style>
);

export default AdminOverview;
