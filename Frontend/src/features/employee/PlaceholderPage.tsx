import React from 'react';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/Card';
import { Badge } from '../../components/Badge';

interface PlaceholderPageProps {
  title: string;
  subtitle: string;
  description: string;
  status: 'planned' | 'in_progress';
  taskTag?: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  subtitle,
  description,
  status,
  taskTag,
}) => {
  return (
    <div className="page">
      <div className="page-header">
        <div className="placeholder-header">
          <div>
            <h1 className="page-title">{title}</h1>
            <p className="page-subtitle">{subtitle}</p>
          </div>
          <Badge variant={status === 'in_progress' ? 'warning' : 'info'}>
            {status === 'in_progress' ? 'In Progress' : 'Planned'}
          </Badge>
        </div>
      </div>

      <Card className="placeholder-card">
        <CardHeader>
          <CardTitle>Section</CardTitle>
        </CardHeader>
        <CardBody>
          <p className="placeholder-description">{description}</p>
          {taskTag && (
            <p className="placeholder-task-tag">
              <strong>Planned for:</strong> {taskTag}
            </p>
          )}
          <div className="placeholder-note">
            This page is part of the Employee dashboard layout. The full
            functionality for this section will be added in a subsequent task.
          </div>
        </CardBody>
      </Card>

      <style>{`
        .placeholder-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: var(--space-4);
          flex-wrap: wrap;
        }

        .placeholder-card {
          margin-bottom: var(--space-6);
        }

        .placeholder-description {
          font-size: var(--font-size-base);
          color: var(--color-gray-700);
          line-height: var(--line-height-relaxed);
          margin: 0 0 var(--space-4);
        }

        .placeholder-task-tag {
          font-size: var(--font-size-sm);
          color: var(--color-navy-700);
          background-color: var(--color-navy-50);
          border-left: 3px solid var(--color-gold-600);
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-md);
          margin: 0 0 var(--space-4);
        }

        .placeholder-task-tag strong {
          color: var(--color-navy-900);
        }

        .placeholder-note {
          font-size: var(--font-size-sm);
          color: var(--color-gray-600);
          background-color: var(--color-gray-100);
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-md);
          border: 1px dashed var(--color-gray-300);
        }
      `}</style>
    </div>
  );
};

export default PlaceholderPage;
