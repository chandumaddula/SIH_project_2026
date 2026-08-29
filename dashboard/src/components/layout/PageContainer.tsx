import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface PageContainerProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  title,
  subtitle,
  action,
  children,
}) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0f172a' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, padding: '32px', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '28px',
            }}
          >
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                {title}
              </h1>
              {subtitle && (
                <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '4px' }}>
                  {subtitle}
                </p>
              )}
            </div>
            {action && <div>{action}</div>}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
};
