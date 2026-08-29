import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  text?: string;
  fullPage?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  text = 'Loading compliance platform...',
  fullPage = false,
}) => {
  const content = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        color: '#6366f1',
      }}
    >
      <Loader2 size={36} style={{ animation: 'spin 1s linear infinite' }} />
      <span style={{ fontSize: '0.95rem', color: '#94a3b8', fontWeight: 500 }}>{text}</span>
    </div>
  );

  if (fullPage) {
    return (
      <div
        style={{
          minHeight: '100vh',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
        }}
      >
        {content}
      </div>
    );
  }

  return <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>{content}</div>;
};
