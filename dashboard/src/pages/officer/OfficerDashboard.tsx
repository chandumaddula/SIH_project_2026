import React from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { ShieldCheck, FileText, AlertTriangle, CheckSquare, MapPin, Eye } from 'lucide-react';

export const OfficerDashboard: React.FC = () => {
  const activeInspections = [
    {
      id: 'INS-2026-881',
      storeName: 'Metro Supermarket - Branch 12',
      location: 'Central Market District',
      sampleCount: 18,
      status: 'warning' as const,
      flaggedViolations: '2 Non-compliant MRP fonts, 1 missing packer detail',
      assignedDate: '2026-08-29',
    },
    {
      id: 'INS-2026-879',
      storeName: 'Reliance Fresh Superstore',
      location: 'Sector 4 Commercial Hub',
      sampleCount: 25,
      status: 'compliant' as const,
      flaggedViolations: 'All mandatory declarations verified',
      assignedDate: '2026-08-28',
    },
    {
      id: 'INS-2026-875',
      storeName: 'Apex Wholesalers & Retail',
      location: 'Industrial Estate Zone B',
      sampleCount: 12,
      status: 'non_compliant' as const,
      flaggedViolations: 'Overcharging above declared MRP detected',
      assignedDate: '2026-08-27',
    },
  ];

  return (
    <PageContainer
      title="Field Enforcement Officer Portal"
      subtitle="Manage Legal Metrology on-site inspections, review AI OCR evidence extraction, and issue digital violation notices."
      action={
        <Button leftIcon={<ShieldCheck size={18} />}>
          Start New Inspection Audit
        </Button>
      }
    >
      {/* Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ padding: '24px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Active Inspections</span>
            <CheckSquare size={20} color="#6366f1" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f8fafc', marginTop: '12px' }}>8</div>
          <span style={{ fontSize: '0.8rem', color: '#3b82f6' }}>3 scheduled today</span>
        </div>

        <div style={{ padding: '24px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Violations Issued</span>
            <AlertTriangle size={20} color="#ef4444" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f8fafc', marginTop: '12px' }}>19</div>
          <span style={{ fontSize: '0.8rem', color: '#ef4444' }}>PCR 2011 Rule 6 breaches</span>
        </div>

        <div style={{ padding: '24px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>PDF Inspection Reports</span>
            <FileText size={20} color="#10b981" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f8fafc', marginTop: '12px' }}>42</div>
          <span style={{ fontSize: '0.8rem', color: '#10b981' }}>Digitally signed</span>
        </div>
      </div>

      {/* Active Field Inspection Queue */}
      <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc' }}>Active Inspection Queue</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Pending verification and digital sign-off</p>
          </div>
          <Button variant="outline" size="sm">Filter by Region</Button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#0f172a', color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                <th style={{ padding: '14px 24px' }}>Inspection ID</th>
                <th style={{ padding: '14px 24px' }}>Establishment Name</th>
                <th style={{ padding: '14px 24px' }}>Location</th>
                <th style={{ padding: '14px 24px' }}>Samples</th>
                <th style={{ padding: '14px 24px' }}>Status</th>
                <th style={{ padding: '14px 24px' }}>Violations / Notes</th>
                <th style={{ padding: '14px 24px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {activeInspections.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 600, color: '#6366f1' }}>{item.id}</td>
                  <td style={{ padding: '16px 24px', color: '#f8fafc', fontWeight: 500 }}>{item.storeName}</td>
                  <td style={{ padding: '16px 24px', color: '#94a3b8' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} /> {item.location}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', color: '#cbd5e1' }}>{item.sampleCount} items</td>
                  <td style={{ padding: '16px 24px' }}>
                    <StatusBadge status={item.status} />
                  </td>
                  <td style={{ padding: '16px 24px', color: '#cbd5e1' }}>{item.flaggedViolations}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <Button variant="secondary" size="sm" leftIcon={<Eye size={14} />}>
                      Audit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
};
