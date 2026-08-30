import { CitizenNotification } from '../types/citizen';
import { mockCitizenNotifications } from './mockData/citizenNotifications';

/**
 * Mock service for citizen notification operations.
 * Simulates GET /api/notifications.
 * Data is stored in-memory only (no persistence).
 */

export const citizenNotificationService = {
  /**
   * Retrieve all notifications for the authenticated citizen.
   */
  async getNotifications(citizenId: string): Promise<CitizenNotification[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockCitizenNotifications
      .filter(n => n.citizenId === citizenId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
};

export default citizenNotificationService;