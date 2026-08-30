export type AnnouncementPriority = 'low' | 'medium' | 'high';

export interface GovtAnnouncement {
  id: string;
  title: string;
  body: string;
  office: string;
  publishedAt: string;
  priority: AnnouncementPriority;
}