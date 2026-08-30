import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store';
import { citizenNotificationService } from '../../services/citizenNotification.service';
import { CitizenNotification } from '../../types/citizen';
import { Button } from '../../components/Button';

const TYPE_CONFIG: Record<CitizenNotification['type'], { label: string; icon: string }> = {
  complaint_received: { label: 'Complaint Received', icon: '📨' },
  complaint_assigned: { label: 'Complaint Assigned', icon: '👤' },
  inspection_initiated: { label: 'Inspection Initiated', icon: '🔍' },
  evidence_requested: { label: 'Evidence Requested', icon: '📎' },
  status_updated: { label: 'Status Updated', icon: '🔄' },
  complaint_resolved: { label: 'Complaint Resolved', icon: '✅' },
};

const PRIORITY_COLORS: Record<CitizenNotification['priority'], string> = {
  high: '#e53935',
  medium: '#fb8c00',
  low: '#1e88e5',
};

export const CitizenNotifications: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [notifications, setNotifications] = useState<CitizenNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await citizenNotificationService.getNotifications(user.id);
      setNotifications(data);
    } catch {
      setError('Unable to load your notifications.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleOpen = useCallback((n: CitizenNotification) => {
    if (n.complaintId) {
      navigate(`/citizen/complaints/${n.complaintId}`);
    }
  }, [navigate]);

  const handleMarkRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const handleMarkAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const handleGoHome = useCallback(() => {
    navigate('/citizen/home');
  }, [navigate]);

  return (
    <div className="cit-notifications">
      <div className="cit-notifications__container">
        <header className="cit-notifications__header">
          <div>
            <h1 className="cit-notifications__title">Notifications</h1>
            <p className="cit-notifications__subtitle">
              {loading
                ? 'Loading...'
                : unreadCount > 0
                  ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                  : 'All caught up'}
            </p>
          </div>
          {unreadCount > 0 && !loading && (
            <Button variant="outline" onClick={handleMarkAllRead}>
              Mark all as read
            </Button>
          )}
        </header>

        {/* Loading */}
        {loading && (
          <div className="cit-notifications__loading">
            <div className="cit-notifications__spinner" />
            <p>Loading notifications...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="cit-notifications__error" role="alert">
            <p>{error}</p>
            <Button variant="primary" onClick={loadNotifications}>Retry</Button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && notifications.length === 0 && (
          <div className="cit-notifications__empty">
            <p className="cit-notifications__empty-icon">🔔</p>
            <h2>No notifications</h2>
            <p className="cit-notifications__empty-text">
              You have no notifications at this time. We'll let you know when
              there are updates to your complaints.
            </p>
          </div>
        )}

        {/* List */}
        {!loading && !error && notifications.length > 0 && (
          <ul className="cit-notifications__list">
            {notifications.map(n => {
              const typeConfig = TYPE_CONFIG[n.type];
              return (
                <li
                  key={n.id}
                  className={`cit-notifications__item ${!n.read ? 'cit-notifications__item--unread' : ''}`}
                >
                  <div
                    className="cit-notifications__item-bar"
                    style={{ backgroundColor: PRIORITY_COLORS[n.priority] }}
                    aria-hidden="true"
                  />

                  <div className="cit-notifications__item-icon" aria-hidden="true">
                    {typeConfig.icon}
                  </div>

                  <div className="cit-notifications__item-content">
                    <div className="cit-notifications__item-title-row">
                      <h3 className="cit-notifications__item-title">
                        {typeConfig.label}
                        {!n.read && (
                          <span className="cit-notifications__unread-dot" aria-label="Unread" />
                        )}
                      </h3>
                      <time className="cit-notifications__item-time">
                        {new Date(n.createdAt).toLocaleString()}
                      </time>
                    </div>
                    <p className="cit-notifications__item-message">{n.message}</p>
                  </div>

                  <div className="cit-notifications__item-actions">
                    {n.complaintId && (
                      <Button variant="secondary" onClick={() => handleOpen(n)}>
                        Open
                      </Button>
                    )}
                    {!n.read && (
                      <Button variant="ghost" onClick={() => handleMarkRead(n.id)}>
                        Mark read
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="cit-notifications__back-row">
          <Button variant="ghost" onClick={handleGoHome}>
            ← Back to Home
          </Button>
        </div>
      </div>

      <CitizenNotificationsStyles />
    </div>
  );
};

const CitizenNotificationsStyles: React.FC = () => (
  <style>{`
    .cit-notifications {
      min-height: calc(100vh - var(--header-height));
      background-color: var(--color-gray-50);
      padding: var(--space-6);
    }

    .cit-notifications__container {
      max-width: 800px;
      margin: 0 auto;
    }

    .cit-notifications__header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: var(--space-5);
      flex-wrap: wrap;
      gap: var(--space-3);
    }

    .cit-notifications__title {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-navy-900);
      margin: 0 0 var(--space-1) 0;
    }

    .cit-notifications__subtitle {
      font-size: var(--font-size-sm);
      color: var(--color-gray-600);
      margin: 0;
    }

    .cit-notifications__loading,
    .cit-notifications__error,
    .cit-notifications__empty {
      background: var(--color-white);
      border: 1px solid var(--color-gray-200);
      border-radius: var(--radius-lg);
      padding: var(--space-12);
      text-align: center;
      box-shadow: var(--shadow-sm);
    }

    .cit-notifications__error {
      background: var(--color-error-100);
      border-color: var(--color-error-600);
      color: var(--color-error-600);
    }

    .cit-notifications__error p {
      margin: 0 0 var(--space-4) 0;
    }

    .cit-notifications__spinner {
      width: 32px;
      height: 32px;
      margin: 0 auto var(--space-3);
      border: 3px solid var(--color-gray-200);
      border-top-color: var(--color-navy-500);
      border-radius: 50%;
      animation: cit-n-spin 0.8s linear infinite;
    }

    @keyframes cit-n-spin {
      to { transform: rotate(360deg); }
    }

    .cit-notifications__empty-icon {
      font-size: 3rem;
      margin: 0 0 var(--space-3) 0;
    }

    .cit-notifications__empty h2 {
      font-size: var(--font-size-xl);
      color: var(--color-navy-900);
      margin: 0 0 var(--space-2) 0;
    }

    .cit-notifications__empty-text {
      font-size: var(--font-size-sm);
      color: var(--color-gray-600);
      max-width: 400px;
      margin: 0 auto;
    }

    .cit-notifications__list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .cit-notifications__item {
      display: grid;
      grid-template-columns: 4px 40px 1fr auto;
      gap: var(--space-3);
      background: var(--color-white);
      border: 1px solid var(--color-gray-200);
      border-radius: var(--radius-lg);
      padding: var(--space-4);
      align-items: center;
      transition: all var(--transition-fast);
    }

    .cit-notifications__item--unread {
      background: linear-gradient(90deg, rgba(63, 81, 181, 0.04) 0%, var(--color-white) 100%);
      border-left: 4px solid var(--color-navy-500);
    }

    .cit-notifications__item-bar {
      width: 4px;
      height: 100%;
      border-radius: var(--radius-sm);
    }

    .cit-notifications__item--unread .cit-notifications__item-bar {
      background-color: var(--color-navy-500) !important;
    }

    .cit-notifications__item-icon {
      font-size: 1.5rem;
      text-align: center;
    }

    .cit-notifications__item-content {
      min-width: 0;
    }

    .cit-notifications__item-title-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--space-3);
      margin-bottom: var(--space-1);
    }

    .cit-notifications__item-title {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--color-navy-900);
      margin: 0;
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .cit-notifications__unread-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      background: var(--color-navy-500);
      border-radius: 50%;
    }

    .cit-notifications__item-time {
      font-size: var(--font-size-xs);
      color: var(--color-gray-500);
      white-space: nowrap;
    }

    .cit-notifications__item-message {
      font-size: var(--font-size-sm);
      color: var(--color-gray-700);
      margin: 0;
      line-height: 1.5;
    }

    .cit-notifications__item-actions {
      display: flex;
      gap: var(--space-2);
      flex-wrap: wrap;
    }

    .cit-notifications__back-row {
      margin-top: var(--space-6);
      text-align: center;
    }

    @media (max-width: 768px) {
      .cit-notifications {
        padding: var(--space-4);
      }

      .cit-notifications__header {
        flex-direction: column;
        align-items: stretch;
      }

      .cit-notifications__item {
        grid-template-columns: 36px 1fr;
        gap: var(--space-2);
      }

      .cit-notifications__item-bar {
        display: none;
      }

      .cit-notifications__item-actions {
        grid-column: 1 / -1;
        justify-content: flex-end;
        padding-top: var(--space-2);
        border-top: 1px solid var(--color-gray-100);
      }
    }
  `}</style>
);

export default CitizenNotifications;