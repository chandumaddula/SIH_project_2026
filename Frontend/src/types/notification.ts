/* ==========================================================================
   Notification Types
   Task N — Notifications
   ========================================================================== */

export type NotificationType =
  | 'complaint'
  | 'inspection'
  | 'verification'
  | 'report'
  | 'department_update'
  | 'follow_up'
  | 'system';

export type NotificationPriority = 'high' | 'medium' | 'normal';

export type NotificationStatus = 'read' | 'unread';

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  relatedId?: string; // links to complaint/inspection/report id
  createdAt: string;
  updatedAt: string;
}

export interface NotificationFilter {
  type?: NotificationType | 'all';
  priority?: NotificationPriority | 'all';
  status?: 'all' | 'read' | 'unread';
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface NotificationSummary {
  total: number;
  unread: number;
  highPriority: number;
  actionRequired: number;
}
