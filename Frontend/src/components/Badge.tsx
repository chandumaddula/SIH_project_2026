import React from 'react';

export type BadgeVariant = 'primary' | 'secondary' | 'accent' | 'success' | 'error' | 'warning' | 'info' | 'neutral';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  dot = false,
  icon,
  className = '',
}) => {
  const classes = [
    'badge',
    `badge--${variant}`,
    size === 'sm' ? 'badge--sm' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={classes}>
      {dot && <span className="badge-dot" aria-hidden="true" />}
      {icon && <span className="badge-icon" aria-hidden="true">{icon}</span>}
      <span>{children}</span>
      <style>{`
        .badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-1);
          padding: var(--space-1) var(--space-3);
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
          border-radius: var(--radius-full);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
          line-height: 1;
        }

        .badge--sm {
          font-size: var(--font-size-xs);
          padding: var(--space-1) var(--space-2);
        }

        /* Primary */
        .badge--primary {
          background-color: var(--color-navy-100);
          color: var(--color-navy-900);
        }

        /* Secondary */
        .badge--secondary {
          background-color: var(--color-gray-200);
          color: var(--color-gray-800);
        }

        /* Accent */
        .badge--accent {
          background-color: var(--color-gold-100);
          color: var(--color-gold-600);
          border: 1px solid var(--color-gold-400);
        }

        /* Success */
        .badge--success {
          background-color: var(--color-success-100);
          color: var(--color-success-600);
        }

        /* Error */
        .badge--error {
          background-color: var(--color-error-100);
          color: var(--color-error-600);
        }

        /* Warning */
        .badge--warning {
          background-color: var(--color-warning-100);
          color: var(--color-warning-600);
        }

        /* Info */
        .badge--info {
          background-color: var(--color-info-100);
          color: var(--color-info-600);
        }

        /* Neutral */
        .badge--neutral {
          background-color: var(--color-gray-200);
          color: var(--color-gray-700);
        }

        .badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: currentColor;
        }

        .badge-icon {
          display: flex;
          align-items: center;
        }
      `}</style>
    </span>
  );
};

export default Badge;