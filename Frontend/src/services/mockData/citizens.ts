import { Citizen } from '../../types/user';

export const mockCitizens: Citizen[] = [
  {
    id: 'cit-001',
    citizenId: 'CIT-2024-001',
    name: 'Jane Smith',
    email: 'jane.smith@email.com',
    phone: '+1 (555) 987-6543',
    createdAt: '2024-01-15T10:00:00Z',
    role: 'citizen'
  },
  {
    id: 'cit-002',
    citizenId: 'CIT-2024-002',
    name: 'Robert Wilson',
    email: 'robert.wilson@email.com',
    phone: '+1 (555) 876-5432',
    createdAt: '2024-02-20T14:30:00Z',
    role: 'citizen'
  },
  {
    id: 'cit-003',
    citizenId: 'CIT-2024-003',
    name: 'Emily Davis',
    email: 'emily.davis@email.com',
    phone: '+1 (555) 765-4321',
    createdAt: '2024-03-05T09:15:00Z',
    role: 'citizen'
  }
];

export const mockCitizenPasswords: Record<string, string> = {
  'CIT-2024-001': 'citizenPass123',
  'CIT-2024-002': 'citizenPass123',
  'CIT-2024-003': 'citizenPass123'
};
