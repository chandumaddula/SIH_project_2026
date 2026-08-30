import React from 'react';

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullPage?: boolean;
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  text,
  fullPage = false,
  className = '',
}) => {
  const sizeClass = `loading--${size}`;

  if (fullPage) {
    return (
      <div className={`loading-fullpage ${className}`}>
        <div className="loading-content">
          <div className={`loading-spinner ${sizeClass}`} aria-label="Loading" />
          {text && <p className="loading-text">{text}</p>}
        </div>
        <style>{`
          .loading-fullpage {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: rgba(255, 255, 255, 0.9);
            z-index: 9999;
          }

          .loading-content {
            text-align: center;
          }

          .loading-spinner {
            border: 3px solid var(--color-gray-200);
            border-top-color: var(--color-navy-500);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          .loading--sm {
            width: 20px;
            height: 20px;
            border-width: 2px;
          }

          .loading--md {
            width: 32px;
            height: 32px;
            border-width: 3px;
          }

          .loading--lg {
            width: 48px;
            height: 48px;
            border-width: 4px;
          }

          .loading-text {
            margin-top: var(--space-4);
            font-size: var(--font-size-base);
            color: var(--color-navy-700);
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`loading-inline ${className}`}>
      <div className={`loading-spinner ${sizeClass}`} aria-label="Loading" />
      {text && <span className="loading-text">{text}</span>}
      <style>{`
        .loading-inline {
          display: inline-flex;
          align-items: center;
          gap: var(--space-3);
        }

        .loading-spinner {
          border: 3px solid var(--color-gray-200);
          border-top-color: var(--color-navy-500);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .loading--sm {
          width: 16px;
          height: 16px;
          border-width: 2px;
        }

        .loading--md {
          width: 24px;
          height: 24px;
          border-width: 3px;
        }

        .loading--lg {
          width: 40px;
          height: 40px;
          border-width: 4px;
        }

        .loading-text {
          font-size: var(--font-size-sm);
          color: var(--color-gray-600);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Loading;