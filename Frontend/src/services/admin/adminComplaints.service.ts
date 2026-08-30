import { CitizenComplaint, ComplaintSummary } from '../../types/complaint';
import { mockComplaints } from '../mockData/complaints';

export type TabStatus = 'NEW' | 'ASSIGNED' | 'UNDER_INSPECTION' | 'RESOLVED' | 'CLOSED';

export interface ComplaintWithSummary extends CitizenComplaint {
  tabStatus: TabStatus;
}

function delay<T>(v: T): Promise<T> {
  return new Promise(r => setTimeout(() => r(v), 200));
}

function classifyStatus(c: CitizenComplaint): TabStatus {
  if (c.status === 'NEW') return 'NEW';
  if (c.status === 'ASSIGNED') return 'ASSIGNED';
  if (c.status === 'UNDER_INSPECTION') return 'UNDER_INSPECTION';
  if (c.status === 'RESOLVED') return 'RESOLVED';
  return 'CLOSED';
}

export const adminComplaintsService = {
  async getComplaints(tab?: TabStatus | 'all'): Promise<ComplaintWithSummary[]> {
    let list = mockComplaints.map(c => ({ ...c, tabStatus: classifyStatus(c) }));
    if (tab && tab !== 'all') {
      list = list.filter(c => c.tabStatus === tab);
    }
    return delay(list.sort((a, b) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    ));
  },

  async getComplaint(id: string): Promise<ComplaintWithSummary | null> {
    const c = mockComplaints.find(x => x.id === id);
    if (!c) return delay(null);
    return delay({ ...c, tabStatus: classifyStatus(c) });
  },

  async getSummary(): Promise<ComplaintSummary> {
    const list = mockComplaints;
    return delay({
      total: list.length,
      newCount: list.filter(c => c.status === 'NEW').length,
      assignedCount: list.filter(c => c.status === 'ASSIGNED').length,
      underInspectionCount: list.filter(c => c.status === 'UNDER_INSPECTION').length,
      resolvedCount: list.filter(c => c.status === 'RESOLVED').length,
      closedCount: list.filter(c => c.status === 'CLOSED').length,
      highPriorityCount: list.filter(c => c.priority === 'HIGH').length,
    });
  },
};
