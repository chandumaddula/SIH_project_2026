import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';

interface AdminPlaceholderProps {
  title: string;
  description: string;
  icon: string;
}

export const AdminPlaceholder: React.FC<AdminPlaceholderProps> = ({ title, description, icon }) => {
  const navigate = useNavigate();
  const handleGoHome = useCallback(() => navigate('/admin/overview'), [navigate]);

  return (
    <div className="adm-placeholder">
      <div className="adm-placeholder__content">
        <span className="adm-placeholder__icon" aria-hidden="true">{icon}</span>
        <h1 className="adm-placeholder__title">{title}</h1>
        <p className="adm-placeholder__desc">{description}</p>
        <div className="adm-placeholder__badge">Coming Soon — Task B/C</div>
        <div className="adm-placeholder__actions">
          <Button variant="outline" onClick={handleGoHome}>
            ← Back to Overview
          </Button>
        </div>
      </div>
      <style>{`
        .adm-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - var(--admin-header-height, 64px));
          padding: var(--space-6);
        }
        .adm-placeholder__content {
          text-align: center;
          max-width: 480px;
        }
        .adm-placeholder__icon {
          font-size: 4rem;
          display: block;
          margin-bottom: var(--space-4);
        }
        .adm-placeholder__title {
          font-size: var(--font-size-2xl);
          font-weight: var(--font-weight-bold);
          color: #0f172a;
          margin: 0 0 var(--space-2) 0;
        }
        .adm-placeholder__desc {
          font-size: var(--font-size-sm);
          color: #475569;
          margin: 0 0 var(--space-4) 0;
          line-height: 1.6;
        }
        .adm-placeholder__badge {
          display: inline-block;
          background: #fef3c7;
          color: #713f12;
          border: 1px solid #fbbf24;
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-bold);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 4px var(--space-3);
          border-radius: var(--radius-full);
          margin-bottom: var(--space-6);
        }
      `}</style>
    </div>
  );
};

export default AdminPlaceholder;
