import { Employee } from '../../types/user';

export const mockEmployees: Employee[] = [
  {
    id: 'emp-001',
    name: 'John Martinez',
    employeeId: 'MET-2024-001',
    department: 'Weights and Measures',
    office: 'Regional Metrology Office',
    contact: {
      phone: '+1 (555) 123-4567',
      email: 'john.martinez@metrology.gov'
    },
    role: 'employee'
  },
  {
    id: 'emp-002',
    name: 'Sarah Johnson',
    employeeId: 'MET-2024-002',
    department: 'Consumer Protection',
    office: 'Regional Metrology Office',
    contact: {
      phone: '+1 (555) 234-5678',
      email: 'sarah.johnson@metrology.gov'
    },
    role: 'employee'
  },
  {
    id: 'emp-003',
    name: 'Michael Chen',
    employeeId: 'MET-2024-003',
    department: 'Quality Assurance',
    office: 'Central Metrology Office',
    contact: {
      phone: '+1 (555) 345-6789',
      email: 'michael.chen@metrology.gov'
    },
    role: 'employee'
  }
];

export const mockEmployeePasswords: Record<string, string> = {
  'MET-2024-001': 'securePassword123',
  'MET-2024-002': 'securePassword123',
  'MET-2024-003': 'securePassword123'
};
