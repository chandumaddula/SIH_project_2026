import { CitizenComplaint, CitizenTimelineEvent } from '../types/citizen';
import { mockCitizenComplaints } from './mockData/citizenComplaints';

/**
 * Mock service for citizen complaint operations.
 * Simulates POST /api/complaints, GET /api/complaints, GET /api/complaints/{id}.
 * Data is stored in-memory only (no persistence).
 */

export const citizenComplaintService = {
  /**
   * Retrieve all complaints submitted by the authenticated citizen.
   */
  async listComplaints(citizenId: string): Promise<CitizenComplaint[]> {
    await new Promise(resolve => setTimeout(resolve, 250));
    return mockCitizenComplaints
      .filter(c => c.citizenId === citizenId)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  },

  /**
   * Retrieve a single complaint by ID.
   */
  async getComplaint(complaintId: string): Promise<CitizenComplaint | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockCitizenComplaints.find(c => c.id === complaintId) || null;
  },

  /**
   * Create a new complaint and add the "Submitted" timeline event.
   */
  async createComplaint(
    citizenId: string,
    data: {
      product: string;
      issue: string;
      placeOfPurchase: string;
      date: string;
      description: string;
      packageImages: string[];
      supportingDocuments: string[];
      billEvidence?: string;
    }
  ): Promise<CitizenComplaint> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const complaintId = `comp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`;
    const submittedAt = new Date().toISOString();

    const timeline: CitizenTimelineEvent[] = [
      {
        id: `tl-${Date.now().toString(36)}`,
        status: 'Submitted',
        timestamp: submittedAt,
        note: 'Complaint submitted by citizen',
      },
    ];

    const summary = `${data.product} - ${data.issue} (${data.placeOfPurchase}, ${data.date})`;

    const complaint: CitizenComplaint = {
      id: complaintId,
      citizenId,
      product: data.product,
      issue: data.issue,
      placeOfPurchase: data.placeOfPurchase,
      date: data.date,
      description: data.description,
      packageImages: data.packageImages,
      supportingDocuments: data.supportingDocuments,
      billEvidence: data.billEvidence,
      status: 'Submitted',
      submittedAt,
      timeline,
      summary,
    };

    mockCitizenComplaints.unshift(complaint);
    return complaint;
  },
};

export default citizenComplaintService;