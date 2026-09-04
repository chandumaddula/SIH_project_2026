import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  hoverable?: boolean;
  accentColor?: 'primary' | 'success' | 'error' | 'warning' | 'accent' | 'none';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  style,
  onClick,
  hoverable = false,
  accentColor = 'none',
  padding = 'md',
}) => {
  const paddingClass = padding === 'none' ? '' : padding === 'sm' ? 'card--padding-sm' : padding === 'lg' ? 'card--padding-lg' : '';
  const accentClass = accentColor !== 'none' ? `card--accent-${accentColor}` : '';
  const hoverClass = hoverable ? 'card--hoverable' : '';
  const clickableClass = onClick ? 'card--clickable' : '';

  const classes = [
    'card',
    paddingClass,
    accentClass,
    hoverClass,
    clickableClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      style={style}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {children}
      <style>{`
        .card {
          background-color: var(--color-white);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-base);
          overflow: hidden;
          transition: box-shadow var(--transition-base), transform var(--transition-base);
          position: relative;
        }
        .card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background-color: transparent;
          transition: background-color var(--transition-fast);
        }
        .card--accent-primary::before { background-color: var(--color-navy-500); }
        .card--accent-success::before { background-color: var(--color-success-600); }
        .card--accent-error::before { background-color: var(--color-error-600); }
        .card--accent-warning::before { background-color: var(--color-warning-600); }
        .card--accent-accent::before { background-color: var(--color-gold-600); }

        .card--padding-sm .card-body { padding: var(--space-3); }
        .card--padding-lg .card-body { padding: var(--space-8); }

        .card--hoverable:hover { box-shadow: var(--shadow-lg); transform: translateY(-2px); }
        .card--clickable { cursor: pointer; }
        .card--clickable:focus-visible { outline: 2px solid var(--color-gold-600); outline-offset: 2px; }
      `}</style>
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({ children, className = '', style }) => (
  <div className={`card-header ${className}`} style={style}>
    {children}
    <style>{`
      .card-header {
        padding: var(--space-4) var(--space-5);
        border-bottom: 1px solid var(--color-gray-200);
        background-color: var(--color-navy-50);
      }
    `}</style>
  </div>
);

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({ children, className = '', style }) => (
  <h3 className={`card-title ${className}`} style={style}>
    {children}
    <style>{`
      .card-title {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-semibold);
        color: var(--color-navy-900);
        margin: 0;
      }
    `}</style>
  </h3>
);

export const CardBody: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({ children, className = '', style }) => (
  <div className={`card-body ${className}`} style={style}>
    {children}
    <style>{`
      .card-body {
        padding: var(--space-5);
      }
    `}</style>
  </div>
);

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({ children, className = '', style }) => (
  <div className={`card-footer ${className}`} style={style}>
    {children}
    <style>{`
      .card-footer {
        padding: var(--space-4) var(--space-5);
        border-top: 1px solid var(--color-gray-200);
        background-color: var(--color-gray-50);
        display: flex;
        justify-content: flex-end;
        gap: var(--space-3);
      }
    `}</style>
  </div>
);

export default Card;