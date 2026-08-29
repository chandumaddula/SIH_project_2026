import React from 'react';
import { ProductVerificationResult } from '../../types/product';
import { CheckCircle2, AlertOctagon } from 'lucide-react';
import { ConfidenceBadge } from './ConfidenceBadge';

interface VerificationPanelProps {
  result: ProductVerificationResult;
}

export const VerificationPanel: React.FC<VerificationPanelProps> = ({ result }) => {
  return (
    <div
      style={{
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '16px' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase' }}>
            Rule Evaluation Engine (PCR 2011)
          </span>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
            {result.productName} Compliance Audit
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ConfidenceBadge score={result.complianceScore} />
          <span
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: result.isCompliant ? '#10b981' : '#ef4444',
              backgroundColor: result.isCompliant ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
              border: `1px solid ${result.isCompliant ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            }}
          >
            {result.isCompliant ? 'FULLY COMPLIANT' : 'VIOLATION DETECTED'}
          </span>
        </div>
      </div>

      {result.violations.length === 0 ? (
        <div
          style={{
            padding: '18px 20px',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <CheckCircle2 size={24} />
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>All Mandatory Declarations Verified</h4>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '2px' }}>
              MRP formatting, Net Quantity, Date of Mfg, Manufacturer Identity & Consumer Care strictly adhere to PCR 2011.
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {result.violations.map((v, idx) => (
            <div
              key={idx}
              style={{
                padding: '14px 18px',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <AlertOctagon size={20} color="#ef4444" />
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444' }}>
                  [{v.severity}] Rule {v.ruleId}
                </span>
                <p style={{ fontSize: '0.9rem', color: '#f8fafc', fontWeight: 500, marginTop: '2px' }}>
                  {v.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
