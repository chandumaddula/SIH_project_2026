import { Employee } from '../../types/user';

export type EmployeeStatus = 'active' | 'inactive';

export interface AdminEmployee extends Employee {
  status: EmployeeStatus;
  region: string;
  inspectionCount: number;
  pendingCases: number;
  lastInspection?: string;
  joinedAt: string;
}

const ADMIN_EMPLOYEES: AdminEmployee[] = [
  {
    id: 'emp-001', name: 'John Martinez', employeeId: 'MET-2024-001',
    department: 'Weights and Measures', office: 'Regional Metrology Office',
    contact: { phone: '+1 (555) 123-4567', email: 'john.martinez@metrology.gov' },
    role: 'employee', status: 'active', region: 'Maharashtra',
    inspectionCount: 148, pendingCases: 3, lastInspection: '2024-08-20',
    joinedAt: '2022-03-15',
  },
  {
    id: 'emp-002', name: 'Sarah Johnson', employeeId: 'MET-2024-002',
    department: 'Consumer Protection', office: 'Regional Metrology Office',
    contact: { phone: '+1 (555) 234-5678', email: 'sarah.johnson@metrology.gov' },
    role: 'employee', status: 'active', region: 'Karnataka',
    inspectionCount: 112, pendingCases: 5, lastInspection: '2024-08-22',
    joinedAt: '2022-07-01',
  },
  {
    id: 'emp-003', name: 'Michael Chen', employeeId: 'MET-2024-003',
    department: 'Quality Assurance', office: 'Central Metrology Office',
    contact: { phone: '+1 (555) 345-6789', email: 'michael.chen@metrology.gov' },
    role: 'employee', status: 'active', region: 'Delhi',
    inspectionCount: 89, pendingCases: 2, lastInspection: '2024-08-18',
    joinedAt: '2023-01-10',
  },
  {
    id: 'emp-004', name: 'Priya Sharma', employeeId: 'MET-2024-004',
    department: 'Weights and Measures', office: 'Regional Metrology Office',
    contact: { phone: '+1 (555) 456-7890', email: 'priya.sharma@metrology.gov' },
    role: 'employee', status: 'active', region: 'Tamil Nadu',
    inspectionCount: 76, pendingCases: 1, lastInspection: '2024-08-15',
    joinedAt: '2023-04-20',
  },
  {
    id: 'emp-005', name: 'Rajesh Kumar', employeeId: 'MET-2024-005',
    department: 'Consumer Protection', office: 'Regional Metrology Office',
    contact: { phone: '+1 (555) 567-8901', email: 'rajesh.kumar@metrology.gov' },
    role: 'employee', status: 'active', region: 'Maharashtra',
    inspectionCount: 134, pendingCases: 4, lastInspection: '2024-08-21',
    joinedAt: '2022-11-05',
  },
  {
    id: 'emp-006', name: 'Anita Desai', employeeId: 'MET-2024-006',
    department: 'Legal Metrology', office: 'Central Metrology Office',
    contact: { phone: '+1 (555) 678-9012', email: 'anita.desai@metrology.gov' },
    role: 'employee', status: 'inactive', region: 'Karnataka',
    inspectionCount: 58, pendingCases: 0, lastInspection: '2024-06-10',
    joinedAt: '2021-09-01',
  },
  {
    id: 'emp-007', name: 'Vikram Singh', employeeId: 'MET-2024-007',
    department: 'Weights and Measures', office: 'Regional Metrology Office',
    contact: { phone: '+1 (555) 789-0123', email: 'vikram.singh@metrology.gov' },
    role: 'employee', status: 'active', region: 'Delhi',
    inspectionCount: 95, pendingCases: 2, lastInspection: '2024-08-19',
    joinedAt: '2023-02-14',
  },
  {
    id: 'emp-008', name: 'Lakshmi Nair', employeeId: 'MET-2024-008',
    department: 'Consumer Protection', office: 'Regional Metrology Office',
    contact: { phone: '+1 (555) 890-1234', email: 'lakshmi.nair@metrology.gov' },
    role: 'employee', status: 'active', region: 'Tamil Nadu',
    inspectionCount: 63, pendingCases: 1, lastInspection: '2024-08-23',
    joinedAt: '2023-08-30',
  },
];

export interface EmployeeFilter {
  search?: string;
  department?: string;
  region?: string;
  status?: EmployeeStatus | 'all';
}

function delay<T>(v: T): Promise<T> {
  return new Promise(r => setTimeout(() => r(v), 200));
}

export const adminEmployeesService = {
  async getEmployees(filter?: EmployeeFilter): Promise<AdminEmployee[]> {
    let list = [...ADMIN_EMPLOYEES];
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.employeeId.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q)
      );
    }
    if (filter?.department && filter.department !== 'all') {
      list = list.filter(e => e.department === filter.department);
    }
    if (filter?.region && filter.region !== 'all') {
      list = list.filter(e => e.region === filter.region);
    }
    if (filter?.status && filter.status !== 'all') {
      list = list.filter(e => e.status === filter.status);
    }
    return delay(list);
  },

  async getEmployee(id: string): Promise<AdminEmployee | null> {
    return delay(ADMIN_EMPLOYEES.find(e => e.id === id) || null);
  },

  async getDepartments(): Promise<string[]> {
    return delay([...new Set(ADMIN_EMPLOYEES.map(e => e.department))].sort());
  },

  async getRegions(): Promise<string[]> {
    return delay([...new Set(ADMIN_EMPLOYEES.map(e => e.region))].sort());
  },

  async deactivateEmployee(id: string): Promise<AdminEmployee | null> {
    const emp = ADMIN_EMPLOYEES.find(e => e.id === id);
    if (!emp) return delay(null);
    emp.status = 'inactive';
    return delay({ ...emp });
  },

  async activateEmployee(id: string): Promise<AdminEmployee | null> {
    const emp = ADMIN_EMPLOYEES.find(e => e.id === id);
    if (!emp) return delay(null);
    emp.status = 'active';
    return delay({ ...emp });
  },
};
