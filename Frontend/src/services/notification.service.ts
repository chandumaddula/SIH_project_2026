/* ==========================================================================
   Notification Service
   Task N — Notifications

   Manages in-memory notification store with mock seed data.
   ========================================================================== */

import { AppNotification, NotificationFilter, NotificationSummary, NotificationType, NotificationPriority } from '../types/notification';

/* ---- Status display ---- */

export const NOTIFICATION_TYPE_CONFIG: Record<NotificationType, {
  label: string;
  icon: string;
}> = {
  complaint: { label: 'Complaint', icon: 'complaint' },
  inspection: { label: 'Inspection', icon: 'inspection' },
  verification: { label: 'Verification', icon: 'verification' },
  report: { label: 'Report', icon: 'report' },
  department_update: { label: 'Department Update', icon: 'department' },
  follow_up: { label: 'Follow-up', icon: 'followup' },
  system: { label: 'System', icon: 'system' },
};

export const NOTIFICATION_PRIORITY_CONFIG: Record<NotificationPriority, {
  label: string;
  badge: 'error' | 'warning' | 'info';
  color: string;
}> = {
  high: { label: 'HIGH', badge: 'error', color: '#c62828' },
  medium: { label: 'MEDIUM', badge: 'warning', color: '#f57f17' },
  normal: { label: 'NORMAL', badge: 'info', color: '#1565c0' },
};

/* ---- In-memory store ---- */

const notificationStore = new Map<string, AppNotification>();

/* ---- Seed data ---- */

const seedNotifications = (): void => {
  const seedData: AppNotification[] = [
    {
      id: 'notif-001',
      title: 'High Priority Complaint Received',
      description: 'A new citizen complaint requires officer review and action.',
      type: 'complaint',
      priority: 'high',
      status: 'unread',
      relatedId: 'comp-001',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif-002',
      title: 'Inspection Pending Verification',
      description: 'Inspection INS-001 requires officer verification before finalization.',
      type: 'verification',
      priority: 'high',
      status: 'unread',
      relatedId: 'insp-001',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif-003',
      title: 'Report Ready for Review',
      description: 'Inspection report RPT-2026-001 has been generated and is ready for review.',
      type: 'report',
      priority: 'medium',
      status: 'unread',
      relatedId: 'RPT-2026-001',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif-004',
      title: 'Department Update: New Guidelines',
      description: 'Updated inspection guidelines have been published by the department.',
      type: 'department_update',
      priority: 'medium',
      status: 'unread',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif-005',
      title: 'Follow-up Inspection Required',
      description: 'Product inspection INS-002 requires a follow-up visit within 14 days.',
      type: 'follow_up',
      priority: 'high',
      status: 'unread',
      relatedId: 'insp-002',
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif-006',
      title: 'Inspection Completed Successfully',
      description: 'Inspection INS-003 has been marked as completed.',
      type: 'inspection',
      priority: 'normal',
      status: 'read',
      relatedId: 'insp-003',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif-007',
      title: 'Report Approved',
      description: 'Inspection report RPT-2026-002 has been approved and finalized.',
      type: 'report',
      priority: 'normal',
      status: 'read',
      relatedId: 'RPT-2026-002',
      createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif-008',
      title: 'System Maintenance Scheduled',
      description: 'Scheduled system maintenance will occur on Saturday. Plan accordingly.',
      type: 'system',
      priority: 'normal',
      status: 'read',
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif-009',
      title: 'Complaint Resolved',
      description: 'Complaint COMP-002 has been marked as resolved by the officer.',
      type: 'complaint',
      priority: 'medium',
      status: 'read',
      relatedId: 'comp-002',
      createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'notif-010',
      title: 'New Inspection Assigned',
      description: 'A new inspection has been assigned to your region.',
      type: 'inspection',
      priority: 'normal',
      status: 'read',
      relatedId: 'insp-006',
      createdAt: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
    },
  ];

  for (const n of seedData) {
    notificationStore.set(n.id, n);
  }
};

seedNotifications();

/* ---- Helpers ---- */

// (Generate-id kept for future expansion; notifications are seeded with fixed IDs.)

/* ---- Public API ---- */

export const getNotifications = (filter?: NotificationFilter): AppNotification[] => {
  let results = Array.from(notificationStore.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (!filter) return results;

  if (filter.search) {
    const q = filter.search.toLowerCase();
    results = results.filter(n =>
      n.title.toLowerCase().includes(q) ||
      n.description.toLowerCase().includes(q)
    );
  }

  if (filter.type && filter.type !== 'all') {
    results = results.filter(n => n.type === filter.type);
  }

  if (filter.priority && filter.priority !== 'all') {
    results = results.filter(n => n.priority === filter.priority);
  }

  if (filter.status && filter.status !== 'all') {
    results = results.filter(n => n.status === filter.status);
  }

  if (filter.dateFrom) {
    results = results.filter(n => n.createdAt >= filter.dateFrom!);
  }

  if (filter.dateTo) {
    results = results.filter(n => n.createdAt <= filter.dateTo!);
  }

  return results;
};

export const getNotificationById = (id: string): AppNotification | null =>
  notificationStore.get(id) ?? null;

export const markNotificationAsRead = (id: string): AppNotification | null => {
  const n = notificationStore.get(id);
  if (!n) return null;
  const updated: AppNotification = { ...n, status: 'read', updatedAt: new Date().toISOString() };
  notificationStore.set(id, updated);
  return updated;
};

export const markAllNotificationsAsRead = (): void => {
  for (const [id, n] of notificationStore) {
    if (n.status === 'unread') {
      notificationStore.set(id, { ...n, status: 'read', updatedAt: new Date().toISOString() });
    }
  }
};

export const clearNotification = (id: string): boolean => {
  return notificationStore.delete(id);
};

export const getNotificationSummary = (): NotificationSummary => {
  const all = Array.from(notificationStore.values());
  return {
    total: all.length,
    unread: all.filter(n => n.status === 'unread').length,
    highPriority: all.filter(n => n.priority === 'high').length,
    actionRequired: all.filter(n => n.status === 'unread' && n.priority !== 'normal').length,
  };
};

export const getUnreadCount = (): number => {
  return Array.from(notificationStore.values()).filter(n => n.status === 'unread').length;
};

export const getNotificationNavigationTarget = (n: AppNotification): string | null => {
  if (!n.relatedId) return null;
  switch (n.type) {
    case 'complaint': return `/employee/complaints/${n.relatedId}`;
    case 'inspection': return `/employee/inspections/${n.relatedId}`;
    case 'verification': return `/employee/inspection/verification`;
    case 'report': return `/employee/reports/${n.relatedId}`;
    default: return null;
  }
};
