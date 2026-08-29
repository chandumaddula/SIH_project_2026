import React from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Camera, FileText, CheckCircle, AlertCircle, Search } from 'lucide-react';

export const CitizenDashboard: React.FC = () => {
  const recentScans = [
    { id: 'SCN-1029', name: 'Organic Almond Milk 1L', date: '2026-08-28', status: 'compliant' as const, issue: 'None' },
    { id: 'SCN-1028', name: 'Premium Basmati Rice 5kg', date: '2026-08-26', status: 'non_compliant' as const, issue: 'Missing Manufacturer Address & Helpline' },
    { id: 'SCN-1025', name: 'Dark Chocolate Bar 100g', date: '2026-08-21', status: 'compliant' as const, issue: 'None' },
    { id: 'SCN-1021', name: 'Refined Sunflower Oil 1L', date: '2026-08-15', status: 'warning' as const, issue: 'MRP Font Height Below 1.5mm Threshold' },
  ];

  return (
    <PageContainer
      title="Citizen Consumer Portal"
      subtitle="Verify packaged commodity legal declarations, upload product label photos, and report non-compliant items."
      action={
        <Button leftIcon={<Camera size={18} />}>
          Scan Packaged Item
        </Button>
      }
    >
      {/* Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ padding: '24px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Total Scans</span>
            <FileText size={20} color="#6366f1" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f8fafc', marginTop: '12px' }}>14</div>
          <span style={{ fontSize: '0.8rem', color: '#10b981' }}>+3 scans this week</span>
        </div>

        <div style={{ padding: '24px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Compliant Verified</span>
            <CheckCircle size={20} color="#10b981" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f8fafc', marginTop: '12px' }}>11</div>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>78.5% compliance rate</span>
        </div>

        <div style={{ padding: '24px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Violations Reported</span>
            <AlertCircle size={20} color="#ef4444" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f8fafc', marginTop: '12px' }}>3</div>
          <span style={{ fontSize: '0.8rem', color: '#f59e0b' }}>1 case assigned to Officer</span>
        </div>
      </div>

      {/* Quick OCR Scanner Banner */}
      <div
        style={{
          padding: '28px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(30, 41, 59, 0.9) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>Instant Label Compliance Checker</h3>
          <p style={{ fontSize: '0.9rem', color: '#cbd5e1', marginTop: '6px', maxWidth: '600px' }}>
            Take a clear picture of MRP, Net Weight, Manufacturer Address, or Date of Mfg on any package to instantly check compliance with PCR 2011 regulations.
          </p>
        </div>
        <Button leftIcon={<Search size={18} />} variant="primary" size="lg">
          Upload & Verify Label
        </Button>
      </div>

      {/* Recent Scans Table */}
      <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc' }}>My Recent Commodity Scans</h3>
          <Button variant="ghost" size="sm">View All History</Button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#0f172a', color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                <th style={{ padding: '14px 24px' }}>Scan ID</th>
                <th style={{ padding: '14px 24px' }}>Commodity Name</th>
                <th style={{ padding: '14px 24px' }}>Scan Date</th>
                <th style={{ padding: '14px 24px' }}>Compliance Status</th>
                <th style={{ padding: '14px 24px' }}>Detected Issue</th>
              </tr>
            </thead>
            <tbody>
              {recentScans.map((scan) => (
                <tr key={scan.id} style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 600, color: '#6366f1' }}>{scan.id}</td>
                  <td style={{ padding: '16px 24px', color: '#f8fafc' }}>{scan.name}</td>
                  <td style={{ padding: '16px 24px', color: '#94a3b8' }}>{scan.date}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <StatusBadge status={scan.status} />
                  </td>
                  <td style={{ padding: '16px 24px', color: scan.issue === 'None' ? '#64748b' : '#ef4444' }}>
                    {scan.issue}
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
