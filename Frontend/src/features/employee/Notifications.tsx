/* ==========================================================================
   Employee Notifications Page
   Task N — Notifications

   Full notification list with summary cards, search, filters,
   read/unread state, and action handlers.
   ========================================================================== */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { AppNotification, NotificationSummary, NotificationType, NotificationPriority } from '../../types/notification';
import {
  getNotifications,
  getNotificationSummary,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotification,
  getNotificationNavigationTarget,
  NOTIFICATION_TYPE_CONFIG,
  NOTIFICATION_PRIORITY_CONFIG,
} from '../../services/notification.service';

type StatusFilter = 'all' | 'unread' | 'read' | 'action_required' | 'high_priority';

export const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'loading' | 'done' | 'error'>('loading');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [summary, setSummary] = useState<NotificationSummary | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<NotificationPriority | 'all'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [actionErr, setActionErr] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => {
      try {
        setNotifications(getNotifications());
        setSummary(getNotificationSummary());
        setPhase('done');
      } catch {
        setPhase('error');
      }
    }, 300);
  }, []);

  const reload = () => {
    setNotifications(getNotifications({
      search: search || undefined,
      type: typeFilter,
      priority: priorityFilter,
      status: statusFilter === 'action_required' || statusFilter === 'high_priority' ? 'unread' : statusFilter,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    }));
    setSummary(getNotificationSummary());
  };

  useEffect(() => {
    if (phase !== 'done') return;
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, typeFilter, priorityFilter, dateFrom, dateTo]);

  const showMsg = (msg: string) => {
    setActionMsg(msg);
    setActionErr(null);
    setTimeout(() => setActionMsg(null), 3000);
  };

  const showErr = (msg: string) => {
    setActionErr(msg);
    setActionMsg(null);
    setTimeout(() => setActionErr(null), 4000);
  };

  const handleMarkRead = (id: string) => {
    const result = markNotificationAsRead(id);
    if (result) {
      setNotifications(getNotifications({
        search: search || undefined,
        type: typeFilter,
        priority: priorityFilter,
        status: statusFilter === 'action_required' || statusFilter === 'high_priority' ? 'unread' : statusFilter,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      }));
      setSummary(getNotificationSummary());
      showMsg('Notification marked as read.');
    } else {
      showErr('Unable to update notification.');
    }
  };

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead();
    reload();
    showMsg('All notifications marked as read.');
  };

  const handleClear = (id: string) => {
    setConfirmClear(id);
  };

  const confirmClearAction = () => {
    if (!confirmClear) return;
    const ok = clearNotification(confirmClear);
    setConfirmClear(null);
    if (ok) {
      reload();
      showMsg('Notification cleared.');
    } else {
      showErr('Unable to clear notification.');
    }
  };

  const handleOpen = (n: AppNotification) => {
    if (n.status === 'unread') handleMarkRead(n.id);
    const target = getNotificationNavigationTarget(n);
    if (target) navigate(target);
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setTypeFilter('all');
    setPriorityFilter('all');
    setDateFrom('');
    setDateTo('');
  };

  const typeCfg = NOTIFICATION_TYPE_CONFIG;
  const priorityCfg = NOTIFICATION_PRIORITY_CONFIG;

  if (phase === 'loading') {
    return (
      <div className="page notif-page">
        <h1 className="page-title">Notifications</h1>
        <p className="page-subtitle">Loading notifications...</p>
        <div className="notif-loading"><div className="notif-spinner" /><p>Loading notifications...</p></div>
        <style>{notifStyles}</style>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="page notif-page">
        <h1 className="page-title">Notifications</h1>
        <Card><CardBody>
          <div className="notif-error">
            <p>Unable to load notifications.</p>
            <Button variant="primary" onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </CardBody></Card>
        <style>{notifStyles}</style>
      </div>
    );
  }

  return (
    <div className="page notif-page">
      <div className="notif-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Alerts, inspection updates and actions requiring your attention.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
          Mark All as Read
        </Button>
      </div>

      {actionMsg && <div className="notif-banner notif-banner--success">{actionMsg}</div>}
      {actionErr && <div className="notif-banner notif-banner--error">{actionErr}</div>}

      {/* Summary cards */}
      {summary && (
        <div className="notif-summary">
          {[
            { label: 'All Notifications', value: summary.total, variant: 'total', filter: 'all' as StatusFilter },
            { label: 'Unread', value: summary.unread, variant: 'unread', filter: 'unread' as StatusFilter },
            { label: 'High Priority', value: summary.highPriority, variant: 'high', filter: 'high_priority' as StatusFilter },
            { label: 'Action Required', value: summary.actionRequired, variant: 'action', filter: 'action_required' as StatusFilter },
          ].map(s => (
            <button
              key={s.variant}
              className={`notif-summary-card notif-summary-card--${s.variant} ${statusFilter === s.filter ? 'notif-summary-card--active' : ''}`}
              onClick={() => setStatusFilter(s.filter)}
            >
              <span className="notif-summary-num">{s.value}</span>
              <span className="notif-summary-label">{s.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="notif-filters">
            <input
              type="search"
              className="notif-search"
              placeholder="Search notifications..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className="notif-filter-group">
              <label className="notif-filter-label">Type</label>
              <select
                className="notif-filter-select"
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value as NotificationType | 'all')}
              >
                <option value="all">All</option>
                {Object.entries(typeCfg).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div className="notif-filter-group">
              <label className="notif-filter-label">Priority</label>
              <select
                className="notif-filter-select"
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value as NotificationPriority | 'all')}
              >
                <option value="all">All</option>
                {Object.entries(priorityCfg).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div className="notif-filter-group">
              <label className="notif-filter-label">From</label>
              <input type="date" className="notif-filter-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            </div>
            <div className="notif-filter-group">
              <label className="notif-filter-label">To</label>
              <input type="date" className="notif-filter-input" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>Clear</Button>
          </div>
        </CardBody>
      </Card>

      <div className="notif-result-count">{notifications.length} notification(s)</div>

      {/* Notification list */}
      {notifications.length === 0 ? (
        <Card><CardBody>
          <div className="notif-empty">
            <span className="notif-empty-icon">🔔</span>
            <p>No notifications found.</p>
            <p className="notif-empty-sub">Try adjusting your filters.</p>
          </div>
        </CardBody></Card>
      ) : (
        <div className="notif-list">
          {notifications.map(n => {
            const type = typeCfg[n.type];
            const prio = priorityCfg[n.priority];
            const target = getNotificationNavigationTarget(n);
            return (
              <Card key={n.id} className={`notif-card ${n.status === 'unread' ? 'notif-card--unread' : ''}`}>
                <CardBody>
                  <div className="notif-card__main">
                    <div className="notif-card__icon">
                      <NotifIcon type={n.type} />
                    </div>
                    <div className="notif-card__body">
                      <div className="notif-card__head">
                        <span className="notif-card__id"><code>{n.id}</code></span>
                        <Badge variant={prio.badge as any} size="sm">{prio.label}</Badge>
                        <Badge variant="neutral" size="sm">{type.label}</Badge>
                        {n.status === 'unread' && <span className="notif-unread-dot" title="Unread" />}
                      </div>
                      <h3 className="notif-card__title">{n.title}</h3>
                      <p className="notif-card__desc">{n.description}</p>
                      <div className="notif-card__meta">
                        <span>{new Date(n.createdAt).toLocaleString('en-IN')}</span>
                        {n.relatedId && <span>Related: <code className="notif-id-inline">{n.relatedId}</code></span>}
                      </div>
                    </div>
                    <div className="notif-card__actions">
                      {target && (
                        <Button variant="primary" size="sm" onClick={() => handleOpen(n)}>Open</Button>
                      )}
                      {n.status === 'unread' && (
                        <Button variant="outline" size="sm" onClick={() => handleMarkRead(n.id)}>Mark as Read</Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleClear(n.id)}>Clear</Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {/* Clear confirmation modal */}
      <Modal
        isOpen={!!confirmClear}
        onClose={() => setConfirmClear(null)}
        title="Clear Notification"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmClear(null)}>Cancel</Button>
            <Button variant="error" onClick={confirmClearAction}>Clear Notification</Button>
          </>
        }
      >
        <p>Are you sure you want to clear this notification? This action cannot be undone.</p>
      </Modal>

      <style>{notifStyles}</style>
    </div>
  );
};

/* ---- Icon component per notification type ---- */

const NotifIcon: React.FC<{ type: NotificationType }> = ({ type }) => {
  const icons: Record<NotificationType, React.ReactNode> = {
    complaint: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="12" y1="18" x2="12" y2="12"/>
        <line x1="9" y1="15" x2="15" y2="15"/>
      </svg>
    ),
    inspection: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
    verification: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
    report: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
    department_update: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    follow_up: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    system: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.07 4.93l-1.41 1.41M5.34 18.66l-1.41 1.41M12 2v2M12 20v2M4.93 4.93l1.41 1.41M18.66 18.66l1.41 1.41M2 12h2M20 12h2"/>
      </svg>
    ),
  };
  return <>{icons[type]}</>;
};

export default Notifications;

const notifStyles = `
  .notif-page { max-width: 1100px; margin: 0 auto; }
  .notif-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-4); gap: var(--space-3); }
  .notif-banner { padding: var(--space-2) var(--space-3); border-radius: var(--radius-md); margin-bottom: var(--space-3); font-size: var(--font-size-sm); }
  .notif-banner--success { background: var(--color-success-100); color: var(--color-success-600); border: 1px solid var(--color-success-600); }
  .notif-banner--error { background: var(--color-error-100); color: var(--color-error-600); border: 1px solid var(--color-error-600); }

  .notif-summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-3); margin-bottom: var(--space-4); }
  .notif-summary-card { display: flex; flex-direction: column; align-items: center; padding: var(--space-3); border-radius: var(--radius-md); background: var(--color-white); border: 1px solid var(--color-gray-200); text-align: center; cursor: pointer; transition: all 0.15s; }
  .notif-summary-card:hover { border-color: var(--color-navy-400); }
  .notif-summary-card--active { border-color: var(--color-navy-600); background: var(--color-navy-50); }
  .notif-summary-num { font-size: 1.5rem; font-weight: var(--font-weight-bold); color: var(--color-navy-900); }
  .notif-summary-label { font-size: 11px; color: var(--color-gray-600); text-transform: uppercase; margin-top: 2px; }
  .notif-summary-card--unread .notif-summary-num { color: var(--color-navy-700); }
  .notif-summary-card--high .notif-summary-num { color: var(--color-error-600); }
  .notif-summary-card--action .notif-summary-num { color: var(--color-warning-600); }
  @media (max-width: 700px) { .notif-summary { grid-template-columns: repeat(2, 1fr); } }

  .notif-filters { display: flex; flex-wrap: wrap; gap: var(--space-3); align-items: flex-end; }
  .notif-search { flex: 1; min-width: 200px; padding: var(--space-2) var(--space-3); border: 1px solid var(--color-gray-300); border-radius: var(--radius-md); font-family: inherit; font-size: var(--font-size-sm); color: var(--color-navy-900); background: var(--color-white); }
  .notif-search:focus { outline: none; border-color: var(--color-navy-500); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
  .notif-filter-group { display: flex; flex-direction: column; gap: var(--space-1); }
  .notif-filter-label { font-size: 11px; color: var(--color-gray-500); text-transform: uppercase; letter-spacing: 0.3px; font-weight: var(--font-weight-bold); }
  .notif-filter-input, .notif-filter-select { padding: var(--space-2) var(--space-3); border: 1px solid var(--color-gray-300); border-radius: var(--radius-md); font-family: inherit; font-size: var(--font-size-sm); color: var(--color-navy-900); background: var(--color-white); }
  .notif-filter-input:focus, .notif-filter-select:focus { outline: none; border-color: var(--color-navy-500); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }

  .notif-result-count { padding: var(--space-2) 0; font-size: var(--font-size-sm); color: var(--color-gray-600); }

  .notif-list { display: flex; flex-direction: column; gap: var(--space-3); }
  .notif-card__main { display: flex; gap: var(--space-3); align-items: flex-start; }
  .notif-card__icon { width: 40px; height: 40px; background: var(--color-navy-50); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: var(--color-navy-600); flex-shrink: 0; }
  .notif-card__body { flex: 1; min-width: 0; }
  .notif-card__head { display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap; margin-bottom: var(--space-1); }
  .notif-card__id { font-size: 10px; color: var(--color-gray-400); }
  .notif-card__title { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-navy-900); margin: 0 0 4px; }
  .notif-card__desc { font-size: var(--font-size-sm); color: var(--color-gray-600); margin: 0 0 var(--space-2); }
  .notif-card__meta { display: flex; gap: var(--space-3); font-size: 11px; color: var(--color-gray-500); flex-wrap: wrap; }
  .notif-card__actions { display: flex; gap: var(--space-1); flex-shrink: 0; flex-wrap: wrap; }
  .notif-id-inline { font-family: var(--font-family-mono); font-size: 10px; color: var(--color-navy-700); background: var(--color-navy-50); padding: 1px 4px; border-radius: 2px; }
  .notif-unread-dot { width: 8px; height: 8px; background: var(--color-navy-600); border-radius: 50%; flex-shrink: 0; }
  .notif-card--unread { border-left: 3px solid var(--color-navy-600); }
  .notif-card--unread .notif-card__title { color: var(--color-navy-900); }
  .notif-card { transition: box-shadow 0.15s; }
  .notif-card:hover { box-shadow: var(--shadow-md); }

  @media (max-width: 600px) {
    .notif-card__main { flex-direction: column; }
    .notif-card__actions { width: 100%; justify-content: flex-start; }
  }

  .notif-empty { display: flex; flex-direction: column; align-items: center; gap: var(--space-2); text-align: center; padding: var(--space-8) 0; color: var(--color-gray-600); }
  .notif-empty-icon { font-size: 3rem; }
  .notif-empty p { margin: 0; font-size: var(--font-size-sm); }
  .notif-empty-sub { font-size: 11px; color: var(--color-gray-500); }
  .notif-loading { display: flex; flex-direction: column; align-items: center; gap: var(--space-3); padding: var(--space-12) 0; color: var(--color-gray-600); }
  .notif-spinner { width: 40px; height: 40px; border: 3px solid var(--color-gray-200); border-top-color: var(--color-navy-500); border-radius: 50%; animation: notif-spin 0.8s linear infinite; }
  @keyframes notif-spin { to { transform: rotate(360deg); } }
  .notif-error { display: flex; flex-direction: column; align-items: center; gap: var(--space-3); text-align: center; padding: var(--space-8) 0; }
  .notif-error p { color: var(--color-gray-600); margin: 0; }
`;
