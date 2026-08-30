import { Citizen } from '../../types/user';

export type AccountStatus = 'active' | 'inactive' | 'suspended';

export interface AdminCitizen extends Citizen {
  accountStatus: AccountStatus;
  complaintCount: number;
  activeComplaints: number;
  lastActivity?: string;
}

const ADMIN_CITIZENS: AdminCitizen[] = [
  { id: 'cit-001', citizenId: 'CIT-2024-001', name: 'Jane Smith', email: 'jane.smith@email.com', phone: '+1 (555) 987-6543', createdAt: '2024-01-15T10:00:00Z', role: 'citizen', accountStatus: 'active', complaintCount: 3, activeComplaints: 1, lastActivity: '2024-08-22' },
  { id: 'cit-002', citizenId: 'CIT-2024-002', name: 'Robert Wilson', email: 'robert.wilson@email.com', phone: '+1 (555) 876-5432', createdAt: '2024-02-20T14:30:00Z', role: 'citizen', accountStatus: 'active', complaintCount: 2, activeComplaints: 0, lastActivity: '2024-08-10' },
  { id: 'cit-003', citizenId: 'CIT-2024-003', name: 'Emily Davis', email: 'emily.davis@email.com', phone: '+1 (555) 765-4321', createdAt: '2024-03-05T09:15:00Z', role: 'citizen', accountStatus: 'active', complaintCount: 2, activeComplaints: 1, lastActivity: '2024-08-18' },
  { id: 'cit-004', citizenId: 'CIT-2024-004', name: 'Amit Patel', email: 'amit.patel@email.com', phone: '+1 (555) 654-3210', createdAt: '2024-04-12T11:00:00Z', role: 'citizen', accountStatus: 'active', complaintCount: 1, activeComplaints: 0, lastActivity: '2024-07-30' },
  { id: 'cit-005', citizenId: 'CIT-2024-005', name: 'Sunita Reddy', email: 'sunita.reddy@email.com', phone: '+1 (555) 543-2109', createdAt: '2024-04-18T08:45:00Z', role: 'citizen', accountStatus: 'inactive', complaintCount: 0, activeComplaints: 0, lastActivity: '2024-06-01' },
  { id: 'cit-006', citizenId: 'CIT-2024-006', name: 'Ravi Krishna', email: 'ravi.krishna@email.com', phone: '+1 (555) 432-1098', createdAt: '2024-05-02T16:20:00Z', role: 'citizen', accountStatus: 'active', complaintCount: 4, activeComplaints: 2, lastActivity: '2024-08-25' },
  { id: 'cit-007', citizenId: 'CIT-2024-007', name: 'Neha Gupta', email: 'neha.gupta@email.com', phone: '+1 (555) 321-0987', createdAt: '2024-05-15T13:30:00Z', role: 'citizen', accountStatus: 'active', complaintCount: 1, activeComplaints: 0, lastActivity: '2024-08-05' },
  { id: 'cit-008', citizenId: 'CIT-2024-008', name: 'Arjun Mehta', email: 'arjun.mehta@email.com', phone: '+1 (555) 210-9876', createdAt: '2024-06-01T10:00:00Z', role: 'citizen', accountStatus: 'active', complaintCount: 2, activeComplaints: 1, lastActivity: '2024-08-20' },
  { id: 'cit-009', citizenId: 'CIT-2024-009', name: 'Priya Iyer', email: 'priya.iyer@email.com', phone: '+1 (555) 109-8765', createdAt: '2024-06-20T09:00:00Z', role: 'citizen', accountStatus: 'suspended', complaintCount: 0, activeComplaints: 0, lastActivity: '2024-07-15' },
];

export interface CitizenFilter {
  search?: string;
  accountStatus?: AccountStatus | 'all';
}

function delay<T>(v: T): Promise<T> {
  return new Promise(r => setTimeout(() => r(v), 200));
}

export const adminCitizensService = {
  async getCitizens(filter?: CitizenFilter): Promise<AdminCitizen[]> {
    let list = [...ADMIN_CITIZENS];
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.citizenId.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      );
    }
    if (filter?.accountStatus && filter.accountStatus !== 'all') {
      list = list.filter(c => c.accountStatus === filter.accountStatus);
    }
    return delay(list);
  },

  async getCitizen(id: string): Promise<AdminCitizen | null> {
    return delay(ADMIN_CITIZENS.find(c => c.id === id) || null);
  },
};
