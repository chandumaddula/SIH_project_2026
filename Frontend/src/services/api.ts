import { AuthState, AuthUser } from '../types/user';
import { CitizenComplaint } from '../types/complaint';
import {
  mockEmployees,
  mockEmployeePasswords,
  mockCitizens,
  mockCitizenPasswords,
  mockAdmins,
  mockAdminPasswords,
  mockComplaints
} from './mockData';

type PersonType = 'employee' | 'citizen' | 'admin';

/* ==========================================================================
   Auth Service
   ========================================================================== */
export const authService = {
  async login(
    credentials: { identifier: string; password: string },
    personType: PersonType
  ): Promise<AuthState> {
    const { identifier, password } = credentials;

    if (personType === 'employee') {
      const storedPassword = mockEmployeePasswords[identifier];
      if (!storedPassword || storedPassword !== password) {
        throw new Error('Invalid employee ID or password');
      }
      const employee = mockEmployees.find(e => e.employeeId === identifier);
      if (!employee) {
        throw new Error('Employee not found');
      }
      const token = `mock_token_emp_${identifier}_${Date.now()}`;
      return {
        user: employee,
        isAuthenticated: true,
        personType: 'employee',
        token
      };
    }

    if (personType === 'citizen') {
      const storedPassword = mockCitizenPasswords[identifier];
      if (!storedPassword || storedPassword !== password) {
        throw new Error('Invalid citizen ID or password');
      }
      const citizen = mockCitizens.find(c => c.citizenId === identifier || c.id === identifier || c.email === identifier);
      if (!citizen) {
        throw new Error('Citizen not found');
      }
      const token = `mock_token_cit_${identifier}_${Date.now()}`;
      return {
        user: citizen,
        isAuthenticated: true,
        personType: 'citizen',
        token
      };
    }

    if (personType === 'admin') {
      const storedPassword = mockAdminPasswords[identifier];
      if (!storedPassword || storedPassword !== password) {
        throw new Error('Invalid admin ID or password');
      }
      const admin = mockAdmins.find(a => a.adminId === identifier);
      if (!admin) {
        throw new Error('Admin not found');
      }
      const token = `mock_token_adm_${identifier}_${Date.now()}`;
      return {
        user: admin,
        isAuthenticated: true,
        personType: 'admin',
        token
      };
    }

    throw new Error('Invalid person type');
  },

  async logout(): Promise<void> {
    // Phase 2: No-op (just clear localStorage if used)
    return Promise.resolve();
  },

  getCurrentUser(): AuthUser | null {
    return mockEmployees[0] || null;
  }
};

/* ==========================================================================
   Complaint Service
   ========================================================================== */
export const complaintService = {
  async listComplaints(): Promise<CitizenComplaint[]> {
    return [...mockComplaints];
  },

  async createComplaint(data: Omit<CitizenComplaint, 'id' | 'status' | 'submittedAt'>): Promise<CitizenComplaint> {
    const newComplaint: CitizenComplaint = {
      id: `comp-${Date.now()}`,
      ...data,
      status: 'NEW',
      priority: 'NORMAL',
      evidence: data.evidence ?? [],
      notes: data.notes ?? [],
      submittedAt: new Date().toISOString()
    };
    mockComplaints.push(newComplaint);
    return newComplaint;
  },

  async getComplaint(id: string): Promise<CitizenComplaint | null> {
    return mockComplaints.find(c => c.id === id) || null;
  },

  async updateComplaintStatus(id: string, status: CitizenComplaint['status']): Promise<CitizenComplaint | null> {
    const complaint = mockComplaints.find(c => c.id === id);
    if (complaint) {
      complaint.status = status;
      return complaint;
    }
    return null;
  }
};

/* ==========================================================================
   Services Index
   ========================================================================== */
export const api = {
  auth: authService,
  complaint: complaintService,
};