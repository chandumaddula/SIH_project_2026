import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { ConfidenceBadge } from './ConfidenceBadge';

interface ProductFieldProps {
  label: string;
  value: string;
  confidence?: number;
  isCompliant?: boolean;
}

export const ProductField: React.FC<ProductFieldProps> = ({
  label,
  value,
  confidence,
  isCompliant = true,
}) => {
  return (
    <div
      style={{
        padding: '14px 18px',
        backgroundColor: '#1e293b',
        border: `1px solid ${isCompliant ? '#334155' : 'rgba(239, 68, 68, 0.4)'}`,
        borderRadius: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <div>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
          {label}
        </span>
        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc', marginTop: '2px' }}>
          {value || 'Not Disclosed'}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {confidence !== undefined && <ConfidenceBadge score={confidence} size="sm" />}
        {isCompliant ? (
          <CheckCircle2 size={20} color="#10b981" />
        ) : (
          <AlertCircle size={20} color="#ef4444" />
        )}
      </div>
    </div>
  );
};
