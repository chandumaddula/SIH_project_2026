import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{ fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1' }}
        >
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {icon && (
          <span
            style={{
              position: 'absolute',
              left: '12px',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {icon}
          </span>
        )}
        <input
          id={inputId}
          style={{
            width: '100%',
            padding: icon ? '10px 12px 10px 40px' : '10px 14px',
            backgroundColor: '#1e293b',
            color: '#f8fafc',
            border: error ? '1px solid #ef4444' : '1px solid #334155',
            borderRadius: '8px',
            fontSize: '0.95rem',
            outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          className={className}
          {...props}
        />
      </div>
      {error && <span style={{ fontSize: '0.8rem', color: '#ef4444' }}>{error}</span>}
      {!error && helperText && (
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{helperText}</span>
      )}
    </div>
  );
};
