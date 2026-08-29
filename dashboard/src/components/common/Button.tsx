import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
          color: '#ffffff',
          border: 'none',
          boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)',
        };
      case 'secondary':
        return {
          background: '#334155',
          color: '#f8fafc',
          border: '1px solid #475569',
        };
      case 'outline':
        return {
          background: 'transparent',
          color: '#6366f1',
          border: '1px solid #6366f1',
        };
      case 'danger':
        return {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: '#ffffff',
          border: 'none',
          boxShadow: '0 4px 14px 0 rgba(239, 68, 68, 0.39)',
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: '#94a3b8',
          border: 'none',
        };
      default:
        return {};
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { padding: '6px 12px', fontSize: '0.85rem' };
      case 'lg':
        return { padding: '14px 28px', fontSize: '1.05rem' };
      default:
        return { padding: '10px 20px', fontSize: '0.95rem' };
    }
  };

  return (
    <button
      disabled={disabled || isLoading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontWeight: 600,
        borderRadius: '8px',
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        opacity: disabled || isLoading ? 0.6 : 1,
        transition: 'all 0.2s ease-in-out',
        ...getVariantStyles(),
        ...getSizeStyles(),
      }}
      className={className}
      {...props}
    >
      {isLoading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};
