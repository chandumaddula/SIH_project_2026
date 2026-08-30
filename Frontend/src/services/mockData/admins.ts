import { Admin } from '../../types/user';

export const mockAdmins: Admin[] = [
  {
    id: 'adm-001',
    name: 'System Administrator',
    email: 'admin@metrology.gov',
    adminId: 'ADM-2024-001',
    department: 'IT Administration',
    contact: {
      phone: '+1 (555) 100-0001',
      email: 'admin@metrology.gov'
    },
    role: 'admin'
  }
];

export const mockAdminPasswords: Record<string, string> = {
  'ADM-2024-001': 'adminPass123'
};
