import React from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Upload, Building2, ShieldCheck, CheckCircle2, Clock, FileCheck } from 'lucide-react';

export const OrganisationDashboard: React.FC = () => {
  const registeredProducts = [
    { sku: 'SKU-8821', brand: 'Apex Premium Tea 500g', category: 'Food & Beverage', date: '2026-08-20', status: 'compliant' as const },
    { sku: 'SKU-8822', brand: 'SunGlow Cooking Oil 5L', category: 'Edible Oils', date: '2026-08-22', status: 'compliant' as const },
    { sku: 'SKU-8829', brand: 'Crispy Snack Bites 150g', category: 'Packaged Snacks', date: '2026-08-27', status: 'pending' as const },
    { sku: 'SKU-8830', brand: 'UltraClean Detergent 2kg', category: 'Household Care', date: '2026-08-28', status: 'warning' as const },
  ];

  return (
    <PageContainer
      title="Manufacturer & Organisation Portal"
      subtitle="Submit pre-market commodity package artwork for automated PCR 2011 compliance verification."
      action={
        <Button leftIcon={<Upload size={18} />}>
          Upload Label Artwork
        </Button>
      }
    >
      {/* Metrics Header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ padding: '24px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Registered SKUs</span>
            <Building2 size={20} color="#6366f1" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f8fafc', marginTop: '12px' }}>128</div>
          <span style={{ fontSize: '0.8rem', color: '#10b981' }}>+12 new labels this month</span>
        </div>

        <div style={{ padding: '24px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Pre-Market Verified</span>
            <CheckCircle2 size={20} color="#10b981" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f8fafc', marginTop: '12px' }}>119</div>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>93% compliance clearance</span>
        </div>

        <div style={{ padding: '24px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Pending Review</span>
            <Clock size={20} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f8fafc', marginTop: '12px' }}>9</div>
          <span style={{ fontSize: '0.8rem', color: '#f59e0b' }}>Awaiting officer verification</span>
        </div>
      </div>

      {/* Compliance Rule Assistant Box */}
      <div
        style={{
          padding: '24px',
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '12px',
          marginBottom: '32px',
          display: 'flex',
          gap: '20px',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6366f1',
            flexShrink: 0,
          }}
        >
          <ShieldCheck size={28} />
        </div>
        <div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc' }}>
            Legal Metrology (Packaged Commodities) Amendment Compliance Checklist
          </h4>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '4px' }}>
            Ensure your package packaging artwork includes Mandatory Name & Address of Manufacturer/Importer, Net Quantity in standard units, Month & Year of Mfg/Pack, MRP inclusive of all taxes, and Customer Care details.
          </p>
        </div>
      </div>

      {/* Product Submission Table */}
      <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc' }}>Submitted Commodity Labels</h3>
          <Button variant="ghost" size="sm">Export Report</Button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#0f172a', color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                <th style={{ padding: '14px 24px' }}>SKU Code</th>
                <th style={{ padding: '14px 24px' }}>Product Title</th>
                <th style={{ padding: '14px 24px' }}>Category</th>
                <th style={{ padding: '14px 24px' }}>Submission Date</th>
                <th style={{ padding: '14px 24px' }}>Clearance Status</th>
                <th style={{ padding: '14px 24px' }}>Certificate</th>
              </tr>
            </thead>
            <tbody>
              {registeredProducts.map((p) => (
                <tr key={p.sku} style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 600, color: '#6366f1' }}>{p.sku}</td>
                  <td style={{ padding: '16px 24px', color: '#f8fafc', fontWeight: 500 }}>{p.brand}</td>
                  <td style={{ padding: '16px 24px', color: '#94a3b8' }}>{p.category}</td>
                  <td style={{ padding: '16px 24px', color: '#cbd5e1' }}>{p.date}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <StatusBadge status={p.status} />
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <Button variant="ghost" size="sm" leftIcon={<FileCheck size={14} />}>
                      PDF Certificate
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
