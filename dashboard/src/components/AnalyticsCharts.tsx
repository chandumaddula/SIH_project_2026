import React from 'react';
import { BarChart3, TrendingUp, AlertOctagon, CheckCircle, MapPin, Building, ShieldCheck } from 'lucide-react';

export const AnalyticsCharts: React.FC = () => {
  const stats = [
    { title: 'Total Inspections (2026)', value: '142,890', change: '+12.4%', isPos: true, icon: BarChart3, color: '#3b82f6' },
    { title: 'PCR Compliance Pass Rate', value: '88.6%', change: '+3.1%', isPos: true, icon: CheckCircle, color: '#10b981' },
    { title: 'Non-Compliance Notices Issued', value: '16,240', change: '-4.2%', isPos: true, icon: AlertOctagon, color: '#f59e0b' },
    { title: 'Compounding Revenue Collected', value: '₹ 14.82 Cr', change: '+18.6%', isPos: true, icon: TrendingUp, color: '#8b5cf6' }
  ];

  const stateData = [
    { state: 'Maharashtra', inspections: 28400, passRate: 91.2, violations: 2500 },
    { state: 'Karnataka', inspections: 24100, passRate: 89.5, violations: 2530 },
    { state: 'Gujarat', inspections: 21900, passRate: 93.1, violations: 1510 },
    { state: 'Delhi NCR', inspections: 19800, passRate: 84.6, violations: 3040 },
    { state: 'Tamil Nadu', inspections: 18500, passRate: 88.0, violations: 2220 },
    { state: 'Uttar Pradesh', inspections: 16100, passRate: 81.4, violations: 2990 }
  ];

  const topViolations = [
    { rule: 'Rule 6(1)(e) - Non-compliant MRP Font & "incl. of all taxes"', count: 5420, percent: 33 },
    { rule: 'Rule 6(1)(b) - Incomplete Manufacturer / Importer Address', count: 3890, percent: 24 },
    { rule: 'Rule 11 - Short Net Weight / Permissible Error Exceeded', count: 3100, percent: 19 },
    { rule: 'Rule 6(2) - Missing Toll-Free Consumer Care Contact', count: 2410, percent: 15 },
    { rule: 'Rule 6(1)(f) - Missing Country of Origin on Imported Goods', count: 1420, percent: 9 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* 4 Stat Cards */}
      <div className="grid-4">
        {stats.map((s, idx) => (
          <div key={idx} className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>{s.title}</span>
              <div style={{ padding: '0.5rem', borderRadius: '8px', background: `${s.color}20`, color: s.color }}>
                <s.icon size={20} />
              </div>
            </div>

            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
              {s.value}
            </div>

            <span style={{ fontSize: '0.75rem', color: '#4ade80', fontWeight: 600 }}>
              {s.change} vs last quarter
            </span>
          </div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        
        {/* State Inspections Table / Visual */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={18} color="#38bdf8" /> State-wise Enforcement Leaderboard
            </h4>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Live Metrology Feed</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stateData.map((st, idx) => (
              <div key={idx} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 600, color: '#f8fafc' }}>{st.state}</span>
                  <span style={{ color: '#38bdf8' }}>{st.passRate}% Compliance Pass</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${st.passRate}%`, height: '100%', background: st.passRate > 90 ? '#10b981' : st.passRate > 85 ? '#f59e0b' : '#ef4444' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginTop: '0.35rem' }}>
                  <span>Inspections: {st.inspections.toLocaleString()}</span>
                  <span>Violations: {st.violations.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Legal Violations Breakdown */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertOctagon size={18} color="#f59e0b" /> Top PCR 2011 Legal Violations Breakdown
            </h4>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>2026 Audit</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {topViolations.map((v, idx) => (
              <div key={idx} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 600 }}>{v.rule}</span>
                  <span style={{ fontWeight: 700, color: '#f59e0b' }}>{v.percent}% ({v.count})</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${v.percent * 2.5}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b, #ef4444)' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
