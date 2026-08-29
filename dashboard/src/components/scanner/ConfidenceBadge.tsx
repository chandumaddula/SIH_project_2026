import React from 'react';

interface ConfidenceBadgeProps {
  score: number; // 0.0 - 1.0 or 0 - 100
  size?: 'sm' | 'md';
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ score, size = 'md' }) => {
  const percent = score <= 1 ? Math.round(score * 100) : Math.round(score);
  const color = percent >= 90 ? '#10b981' : percent >= 75 ? '#f59e0b' : '#ef4444';
  const bgColor = percent >= 90 ? 'rgba(16, 185, 129, 0.15)' : percent >= 75 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)';

  return (
    <span
      style={{
        fontSize: size === 'sm' ? '0.75rem' : '0.85rem',
        fontWeight: 700,
        color,
        backgroundColor: bgColor,
        border: `1px solid ${color}44`,
        padding: size === 'sm' ? '2px 8px' : '4px 10px',
        borderRadius: '12px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      {percent}% Confidence
    </span>
  );
};
