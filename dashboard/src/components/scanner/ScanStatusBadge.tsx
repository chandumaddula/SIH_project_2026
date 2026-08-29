import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Clock, Loader2 } from 'lucide-react';
import { ComplianceStatus, ScanStatus } from '../../types/scan';

interface ScanStatusBadgeProps {
  status: ComplianceStatus | ScanStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

export const ScanStatusBadge: React.FC<ScanStatusBadgeProps> = ({ status, size = 'md' }) => {
  const iconSize = size === 'lg' ? 20 : size === 'sm' ? 14 : 16;

  const getConfig = () => {
    switch (status) {
      case 'COMPLETED':
      case 'COMPLIANT':
        return {
          bg: 'rgba(16, 185, 129, 0.15)',
          color: '#10b981',
          border: 'rgba(16, 185, 129, 0.35)',
          icon: <CheckCircle2 size={iconSize} />,
          text: status === 'COMPLETED' ? 'COMPLETED' : 'PASS: COMPLIANT',
        };
      case 'FAILED':
      case 'NON_COMPLIANT':
        return {
          bg: 'rgba(239, 68, 68, 0.15)',
          color: '#ef4444',
          border: 'rgba(239, 68, 68, 0.35)',
          icon: <XCircle size={iconSize} />,
          text: status === 'FAILED' ? 'FAILED' : 'FAIL: NON-COMPLIANT',
        };
      case 'PROCESSING':
        return {
          bg: 'rgba(99, 102, 241, 0.15)',
          color: '#6366f1',
          border: 'rgba(99, 102, 241, 0.35)',
          icon: <Loader2 size={iconSize} style={{ animation: 'spin 1s linear infinite' }} />,
          text: 'PROCESSING',
        };
      case 'WARNING':
        return {
          bg: 'rgba(245, 158, 11, 0.15)',
          color: '#f59e0b',
          border: 'rgba(245, 158, 11, 0.35)',
          icon: <AlertTriangle size={iconSize} />,
          text: 'WARNING: AUDIT REQD',
        };
      case 'PENDING':
      default:
        return {
          bg: 'rgba(59, 130, 246, 0.15)',
          color: '#3b82f6',
          border: 'rgba(59, 130, 246, 0.35)',
          icon: <Clock size={iconSize} />,
          text: 'PENDING',
        };
    }
  };

  const config = getConfig();

  const getPadding = () => {
    if (size === 'sm') return '3px 8px';
    if (size === 'lg') return '8px 16px';
    return '5px 12px';
  };

  const getFontSize = () => {
    if (size === 'sm') return '0.75rem';
    if (size === 'lg') return '0.95rem';
    return '0.85rem';
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: getPadding(),
        fontSize: getFontSize(),
        fontWeight: 700,
        borderRadius: '9999px',
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        letterSpacing: '0.02em',
      }}
    >
      {config.icon}
      {config.text}
    </span>
  );
};
