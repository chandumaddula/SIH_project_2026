import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';

export type StatusType = 'compliant' | 'non_compliant' | 'pending' | 'warning';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'compliant':
        return {
          bg: 'rgba(16, 185, 129, 0.15)',
          color: '#10b981',
          border: 'rgba(16, 185, 129, 0.3)',
          icon: <CheckCircle2 size={14} />,
          defaultLabel: 'Compliant',
        };
      case 'non_compliant':
        return {
          bg: 'rgba(239, 68, 68, 0.15)',
          color: '#ef4444',
          border: 'rgba(239, 68, 68, 0.3)',
          icon: <XCircle size={14} />,
          defaultLabel: 'Non-Compliant',
        };
      case 'warning':
        return {
          bg: 'rgba(245, 158, 11, 0.15)',
          color: '#f59e0b',
          border: 'rgba(245, 158, 11, 0.3)',
          icon: <AlertTriangle size={14} />,
          defaultLabel: 'Warning',
        };
      case 'pending':
      default:
        return {
          bg: 'rgba(59, 130, 246, 0.15)',
          color: '#3b82f6',
          border: 'rgba(59, 130, 246, 0.3)',
          icon: <Clock size={14} />,
          defaultLabel: 'Pending Review',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: '9999px',
        fontSize: '0.8rem',
        fontWeight: 600,
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
      }}
    >
      {config.icon}
      {label || config.defaultLabel}
    </span>
  );
};
