import React, { useState, useEffect, useCallback } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from 'recharts';
import { adminService } from '../../services/admin.service';
import { AdminTrendPoint, AdminCategoryPoint, AdminActivityPoint, DateRangePreset } from '../../types/admin';
import { Loading } from '../../components/Loading';
import { Button } from '../../components/Button';

const COMPLIANCE_COLORS = ['#22c55e', '#f59e0b', '#ef4444'];

const DATE_PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: '7days', label: '7 Days' },
  { value: '30days', label: '30 Days' },
  { value: 'custom', label: 'Custom Range' },
];

const CustomTooltip: React.FC<{ active?: boolean; payload?: Array<{ value: number; name: string; color: string }> }> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', fontSize: 13 }}>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </div>
      ))}
    </div>
  );
};

export const AdminAnalytics: React.FC = () => {
  const [preset, setPreset] = useState<DateRangePreset>('30days');
  const [compliance, setCompliance] = useState<AdminTrendPoint[]>([]);
  const [monthly, setMonthly] = useState<AdminTrendPoint[]>([]);
  const [complaints, setComplaints] = useState<AdminTrendPoint[]>([]);
  const [issues, setIssues] = useState<AdminTrendPoint[]>([]);
  const [categories, setCategories] = useState<AdminCategoryPoint[]>([]);
  const [activity, setActivity] = useState<AdminActivityPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, m, ct, iss, cat, act] = await Promise.all([
        adminService.getComplianceDistribution(),
        adminService.getMonthlyInspections(),
        adminService.getComplaintTrend(),
        adminService.getPotentialIssueTrend(),
        adminService.getProductCategories(),
        adminService.getInspectionActivity(),
      ]);
      setCompliance(c);
      setMonthly(m);
      setComplaints(ct);
      setIssues(iss);
      setCategories(cat);
      setActivity(act);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Loading text="Loading analytics..." fullPage />;

  const totalScans = activity.reduce((s, d) => s + d.scans, 0);

  return (
    <div className="adm-analytics">
      <header className="adm-analytics__header">
        <div>
          <h1 className="adm-analytics__title">Analytics</h1>
          <p className="adm-analytics__subtitle">
            Platform performance and compliance trends across all regions.
          </p>
        </div>
        <div className="adm-analytics__filters">
          {DATE_PRESETS.map(p => (
            <Button
              key={p.value}
              variant={preset === p.value ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setPreset(p.value)}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </header>

      {/* Summary row */}
      <div className="adm-analytics__summary">
        <div className="adm-analytics__summary-card">
          <span className="adm-analytics__summary-label">Total Scans (period)</span>
          <span className="adm-analytics__summary-value">{totalScans.toLocaleString()}</span>
        </div>
        <div className="adm-analytics__summary-card">
          <span className="adm-analytics__summary-label">Potential Issues</span>
          <span className="adm-analytics__summary-value" style={{ color: '#ef4444' }}>32</span>
        </div>
        <div className="adm-analytics__summary-card">
          <span className="adm-analytics__summary-label">Open Complaints</span>
          <span className="adm-analytics__summary-value" style={{ color: '#f59e0b' }}>28</span>
        </div>
        <div className="adm-analytics__summary-card">
          <span className="adm-analytics__summary-label">Pass Rate</span>
          <span className="adm-analytics__summary-value" style={{ color: '#22c55e' }}>75%</span>
        </div>
      </div>

      {/* Row 1: Compliance distribution + Monthly Inspections */}
      <div className="adm-analytics__row">
        <div className="adm-analytics__card">
          <h2 className="adm-analytics__card-title">Compliance Distribution</h2>
          <div className="adm-analytics__chart-wrap">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={compliance}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                >
                  {compliance.map((_, i) => (
                    <Cell key={i} fill={COMPLIANCE_COLORS[i % COMPLIANCE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => <span style={{ color: '#475569', fontSize: 13 }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="adm-analytics__legend-manual">
            {compliance.map((c, i) => (
              <div key={c.label} className="adm-analytics__legend-row">
                <span className="adm-analytics__legend-dot" style={{ background: COMPLIANCE_COLORS[i] }} />
                <span className="adm-analytics__legend-label">{c.label}</span>
                <span className="adm-analytics__legend-value">{c.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="adm-analytics__card">
          <h2 className="adm-analytics__card-title">Monthly Inspections</h2>
          <div className="adm-analytics__chart-wrap">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthly} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Inspections" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Complaints + Issues trends */}
      <div className="adm-analytics__row">
        <div className="adm-analytics__card">
          <h2 className="adm-analytics__card-title">Complaint Trend</h2>
          <div className="adm-analytics__chart-wrap">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={complaints} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="value" name="Complaints" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4, fill: '#8b5cf6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="adm-analytics__card">
          <h2 className="adm-analytics__card-title">Potential Issue Trend</h2>
          <div className="adm-analytics__chart-wrap">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={issues} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="value" name="Potential Issues" stroke="#ef4444" strokeWidth={2} dot={{ r: 4, fill: '#ef4444' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Categories + Daily activity */}
      <div className="adm-analytics__row">
        <div className="adm-analytics__card">
          <h2 className="adm-analytics__card-title">Product Categories</h2>
          <div className="adm-analytics__chart-wrap">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categories} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis type="category" dataKey="category" tick={{ fontSize: 12, fill: '#64748b' }} width={76} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Scans" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                <Bar dataKey="potentialIssues" name="Issues" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="adm-analytics__card">
          <h2 className="adm-analytics__card-title">Daily Activity</h2>
          <div className="adm-analytics__chart-wrap">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={activity} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="scans" name="Scans" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="inspections" name="Inspections" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="complaints" name="Complaints" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <AdminAnalyticsStyles />
    </div>
  );
};

const AdminAnalyticsStyles: React.FC = () => (
  <style>{`
    .adm-analytics {
      padding: var(--space-6);
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
    }

    .adm-analytics__header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      flex-wrap: wrap;
      gap: var(--space-4);
    }

    .adm-analytics__title {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-bold);
      color: #0f172a;
      margin: 0 0 var(--space-1) 0;
    }

    .adm-analytics__subtitle {
      font-size: var(--font-size-sm);
      color: #475569;
      margin: 0;
    }

    .adm-analytics__filters {
      display: flex;
      gap: var(--space-2);
      flex-wrap: wrap;
    }

    /* Summary */
    .adm-analytics__summary {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-3);
    }

    .adm-analytics__summary-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: var(--radius-lg);
      padding: var(--space-4);
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .adm-analytics__summary-label {
      font-size: var(--font-size-xs);
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: var(--font-weight-semibold);
    }

    .adm-analytics__summary-value {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      color: #0f172a;
    }

    /* Charts */
    .adm-analytics__row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
    }

    .adm-analytics__card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: var(--radius-lg);
      padding: var(--space-5);
    }

    .adm-analytics__card-title {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-semibold);
      color: #0f172a;
      margin: 0 0 var(--space-4) 0;
    }

    .adm-analytics__chart-wrap {
      width: 100%;
    }

    .adm-analytics__legend-manual {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      margin-top: var(--space-3);
    }

    .adm-analytics__legend-row {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: var(--font-size-sm);
    }

    .adm-analytics__legend-dot {
      width: 12px;
      height: 12px;
      border-radius: 3px;
      flex-shrink: 0;
    }

    .adm-analytics__legend-label {
      color: #475569;
      flex: 1;
    }

    .adm-analytics__legend-value {
      font-weight: var(--font-weight-bold);
      color: #0f172a;
    }

    @media (max-width: 1023px) {
      .adm-analytics__row {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .adm-analytics {
        padding: var(--space-4);
      }
      .adm-analytics__summary {
        grid-template-columns: repeat(2, 1fr);
      }
      .adm-analytics__header {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `}</style>
);

export default AdminAnalytics;
