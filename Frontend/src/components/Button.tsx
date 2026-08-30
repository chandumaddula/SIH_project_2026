import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'accent' | 'success' | 'error';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const variantClass = `button--${variant}`;
  const sizeClass = size !== 'md' ? `button--${size}` : '';
  const loadingClass = loading ? 'button--loading' : '';
  const widthClass = fullWidth ? 'button--full-width' : '';

  const classes = [
    'button',
    variantClass,
    sizeClass,
    loadingClass,
    widthClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="button-spinner" aria-hidden="true" />
      )}
      {!loading && icon && iconPosition === 'left' && (
        <span className="button-icon" aria-hidden="true">{icon}</span>
      )}
      <span>{children}</span>
      {!loading && icon && iconPosition === 'right' && (
        <span className="button-icon" aria-hidden="true">{icon}</span>
      )}
      <style>{`
        .button {
          font-family: var(--font-family-base);
          font-weight: var(--font-weight-semibold);
          font-size: var(--font-size-base);
          border-radius: var(--radius-md);
          padding: var(--space-3) var(--space-6);
          border: 2px solid transparent;
          cursor: pointer;
          transition: all var(--transition-fast);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          text-decoration: none;
          text-align: center;
          min-height: 44px;
        }
        .button:hover:not(:disabled) { transform: translateY(-1px); box-shadow: var(--shadow-md); }
        .button:active:not(:disabled) { transform: translateY(0); box-shadow: var(--shadow-sm); }
        .button:disabled { opacity: 0.6; cursor: not-allowed; }
        .button--full-width { width: 100%; }

        /* Primary */
        .button--primary { background-color: var(--color-navy-500); color: var(--color-white); border-color: var(--color-navy-500); }
        .button--primary:hover:not(:disabled) { background-color: var(--color-navy-600); border-color: var(--color-navy-600); }

        /* Secondary */
        .button--secondary { background-color: var(--color-navy-700); color: var(--color-white); border-color: var(--color-navy-700); }
        .button--secondary:hover:not(:disabled) { background-color: var(--color-navy-600); border-color: var(--color-navy-600); }

        /* Ghost */
        .button--ghost { background-color: transparent; color: var(--color-navy-500); border-color: var(--color-navy-500); }
        .button--ghost:hover:not(:disabled) { background-color: var(--color-navy-50); }

        /* Outline */
        .button--outline { background-color: var(--color-white); color: var(--color-navy-500); border: 2px solid var(--color-navy-500); }
        .button--outline:hover:not(:disabled) { background-color: var(--color-navy-50); }

        /* Accent */
        .button--accent { background-color: var(--color-gold-600); color: var(--color-white); border-color: var(--color-gold-600); }
        .button--accent:hover:not(:disabled) { background-color: var(--color-gold-500); border-color: var(--color-gold-500); }

        /* Success */
        .button--success { background-color: var(--color-success-600); color: var(--color-white); border-color: var(--color-success-600); }
        .button--success:hover:not(:disabled) { background-color: #388e3c; border-color: #388e3c; }

        /* Error */
        .button--error { background-color: var(--color-error-600); color: var(--color-white); border-color: var(--color-error-600); }
        .button--error:hover:not(:disabled) { background-color: #c62828; border-color: #c62828; }

        /* Sizes */
        .button--sm { font-size: var(--font-size-sm); padding: var(--space-2) var(--space-4); min-height: 36px; }
        .button--lg { font-size: var(--font-size-lg); padding: var(--space-4) var(--space-8); min-height: 52px; }

        /* Loading */
        .button--loading { position: relative; pointer-events: none; opacity: 0.8; }
        .button-spinner {
          width: 16px; height: 16px;
          border: 2px solid currentColor;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-right: var(--space-2);
        }

        /* Icon */
        .button-icon { display: flex; align-items: center; }

        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </button>
  );
};

export default Button;