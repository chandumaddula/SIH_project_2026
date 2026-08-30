import { ReportStatus } from '../../types/report';

export type ReportType =
  | 'state_wise'
  | 'district_wise'
  | 'product_wise'
  | 'complaint_wise'
  | 'inspection_wise'
  | 'officer_activity'
  | 'potential_issue_trends';

export interface AdminReport {
  id: string;
  title: string;
  description: string;
  type: ReportType;
  status: ReportStatus;
  generatedAt: string;
  generatedBy: string;
  period: string;
  recordCount: number;
}

const MOCK_REPORTS: AdminReport[] = [
  { id: 'rep-001', title: 'State-wise Inspection Summary — August 2024', description: 'Inspection counts, pass rates, and compliance by state.', type: 'state_wise', status: 'COMPLETED', generatedAt: '2024-08-25T10:00:00Z', generatedBy: 'System Administrator', period: 'Aug 2024', recordCount: 548 },
  { id: 'rep-002', title: 'District-wise Complaint Analysis — Q2 2024', description: 'Complaint distribution across districts with priority breakdown.', type: 'district_wise', status: 'COMPLETED', generatedAt: '2024-07-01T09:00:00Z', generatedBy: 'System Administrator', period: 'Q2 2024', recordCount: 92 },
  { id: 'rep-003', title: 'Product Compliance Summary — H1 2024', description: 'Pass, review, and issue rates by product category.', type: 'product_wise', status: 'COMPLETED', generatedAt: '2024-07-05T14:00:00Z', generatedBy: 'System Administrator', period: 'H1 2024', recordCount: 312 },
  { id: 'rep-004', title: 'Complaint Resolution Report — Q2 2024', description: 'Average resolution time, outcomes, and citizen satisfaction.', type: 'complaint_wise', status: 'COMPLETED', generatedAt: '2024-07-02T11:00:00Z', generatedBy: 'System Administrator', period: 'Q2 2024', recordCount: 47 },
  { id: 'rep-005', title: 'Potential Issue Trends — 2024', description: 'Monthly breakdown of flagged inspections and repeat locations.', type: 'potential_issue_trends', status: 'COMPLETED', generatedAt: '2024-08-01T10:00:00Z', generatedBy: 'System Administrator', period: 'Jan–Aug 2024', recordCount: 86 },
  { id: 'rep-006', title: 'Officer Activity Report — August 2024', description: 'Inspections per officer, pending cases, and performance metrics.', type: 'officer_activity', status: 'GENERATED', generatedAt: '2024-08-26T08:00:00Z', generatedBy: 'System Administrator', period: 'Aug 2024', recordCount: 24 },
  { id: 'rep-007', title: 'Inspection Summary — July 2024', description: 'Full inspection record summary for July 2024.', type: 'inspection_wise', status: 'DRAFT', generatedAt: '2024-08-01T09:00:00Z', generatedBy: 'System Administrator', period: 'Jul 2024', recordCount: 0 },
  { id: 'rep-008', title: 'Potential Issue Trends — H1 2024', description: 'Flagged inspections by product category and region.', type: 'potential_issue_trends', status: 'REVIEW_REQUIRED', generatedAt: '2024-07-08T13:00:00Z', generatedBy: 'System Administrator', period: 'H1 2024', recordCount: 42 },
];

function delay<T>(v: T): Promise<T> {
  return new Promise(r => setTimeout(() => r(v), 200));
}

export const adminReportsService = {
  async getReports(type?: ReportType | 'all'): Promise<AdminReport[]> {
    let list = [...MOCK_REPORTS];
    if (type && type !== 'all') {
      list = list.filter(r => r.type === type);
    }
    return delay(list.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()));
  },

  async getReport(id: string): Promise<AdminReport | null> {
    return delay(MOCK_REPORTS.find(r => r.id === id) || null);
  },

  async generateReport(type: ReportType, period: string): Promise<AdminReport> {
    await delay(undefined);
    const newReport: AdminReport = {
      id: `rep-${Date.now()}`,
      title: `${type.replace(/_/g, ' ')} Report — ${period}`,
      description: `Auto-generated report of type ${type} for period ${period}.`,
      type,
      status: 'GENERATED',
      generatedAt: new Date().toISOString(),
      generatedBy: 'System Administrator',
      period,
      recordCount: Math.floor(Math.random() * 300) + 50,
    };
    MOCK_REPORTS.unshift(newReport);
    return delay(newReport);
  },
};
