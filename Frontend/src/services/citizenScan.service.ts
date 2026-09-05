import { CitizenScan, PreliminaryResult } from '../types/citizen';
import { apiClient } from './apiClient';

/**
 * Real API service for citizen scan operations.
 * Replaces mock service with actual backend API calls.
 */

export const citizenScanService = {
  /**
   * Retrieve all scans for the authenticated citizen.
   */
  async getScans(citizenId: string): Promise<CitizenScan[]> {
    try {
      const response = await apiClient.get<CitizenScan[]>(`/api/v1/scans?citizenId=${citizenId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch scans:', error);
      // Fallback to empty array if API unavailable
      return [];
    }
  },

  /**
   * Retrieve a single scan by ID.
   */
  async getScan(scanId: string): Promise<CitizenScan | null> {
    try {
      const response = await apiClient.get<CitizenScan>(`/api/v1/scans/${scanId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch scan:', error);
      return null;
    }
  },

  /**
   * Create a new scan by uploading images to the backend.
   * Uses the real AI pipeline on the backend.
   */
  async createScan(citizenId: string, images: File[]): Promise<CitizenScan> {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('citizenId', citizenId);

      for (const image of images) {
        formData.append('images', image);
      }

      const response = await apiClient.post<CitizenScan>('/api/v1/scans/analyze', formData);

      return response.data;
    } catch (error) {
      console.error('Failed to create scan:', error);
      throw error;
    }
  },
};

/**
 * Upload image for quality check only
 */
export async function checkImageQuality(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await apiClient.post('/api/v1/scans/quality-check', formData);
    return response.data;
  } catch (error) {
    console.error('Quality check failed:', error);
    throw error;
  }
}

export default citizenScanService;