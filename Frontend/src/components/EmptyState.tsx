import React from 'react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`empty-state ${className}`}>
      {icon && <div className="empty-state-icon" aria-hidden="true">{icon}</div>}
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-description">{description}</p>}
      {action && <div className="empty-state-action">{action}</div>}
      <style>{`
        .empty-state {
          text-align: center;
          padding: var(--space-16) var(--space-8);
          max-width: 400px;
          margin: 0 auto;
        }

        .empty-state-icon {
          font-size: 4rem;
          margin-bottom: var(--space-6);
          color: var(--color-gray-300);
        }

        .empty-state-title {
          font-size: var(--font-size-xl);
          font-weight: var(--font-weight-semibold);
          color: var(--color-navy-900);
          margin: 0 0 var(--space-4);
        }

        .empty-state-description {
          font-size: var(--font-size-base);
          margin: 0 0 var(--space-8);
          color: var(--color-gray-600);
          line-height: var(--line-height-relaxed);
        }

        .empty-state-action {
          margin-top: var(--space-4);
        }
      `}</style>
    </div>
  );
};

export default EmptyState;