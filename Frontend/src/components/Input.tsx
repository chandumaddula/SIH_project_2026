import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  icon,
  fullWidth = true,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = Boolean(error);

  return (
    <div className={`input-wrapper ${fullWidth ? 'input-wrapper--full' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {props.required && <span className="input-required" aria-hidden="true"> *</span>}
        </label>
      )}
      <div className={`input-container ${hasError ? 'input-container--error' : ''}`}>
        {icon && <span className="input-icon" aria-hidden="true">{icon}</span>}
        <input
          ref={ref}
          id={inputId}
          className={`input-field ${icon ? 'input-field--with-icon' : ''} ${hasError ? 'input-field--error' : ''}`}
          aria-invalid={hasError}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
      </div>
      {error && (
        <p id={`${inputId}-error`} className="input-error" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="input-helper">
          {helperText}
        </p>
      )}
      <style>{`
        .input-wrapper {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .input-wrapper--full { width: 100%; }

        .input-label {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
          color: var(--color-navy-900);
        }
        .input-required { color: var(--color-error-600); }

        .input-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: var(--space-4);
          color: var(--color-gray-500);
          display: flex;
          align-items: center;
          pointer-events: none;
        }

        .input-field {
          width: 100%;
          padding: var(--space-3) var(--space-4);
          font-size: var(--font-size-base);
          border: 2px solid var(--color-gray-300);
          border-radius: var(--radius-md);
          transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
          min-height: 44px;
        }
        .input-field--with-icon { padding-left: calc(var(--space-4) + 24px + var(--space-2)); }

        .input-field:focus {
          outline: none;
          border-color: var(--color-navy-500);
          box-shadow: 0 0 0 3px rgba(63, 81, 181, 0.15);
        }

        .input-field--error {
          border-color: var(--color-error-600);
        }
        .input-field--error:focus {
          box-shadow: 0 0 0 3px rgba(229, 57, 53, 0.15);
        }

        .input-field:disabled {
          background-color: var(--color-gray-100);
          cursor: not-allowed;
          opacity: 0.6;
        }

        .input-error {
          font-size: var(--font-size-sm);
          color: var(--color-error-600);
          margin: 0;
        }

        .input-helper {
          font-size: var(--font-size-sm);
          color: var(--color-gray-600);
          margin: 0;
        }
      `}</style>
    </div>
  );
});

Input.displayName = 'Input';

export default Input;