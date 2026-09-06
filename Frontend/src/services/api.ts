import { AuthState, AuthUser } from '../types/user';
import { CitizenComplaint } from '../types/complaint';
import { AIScanResponse } from '../types/scan';
import {
  mockEmployees,
  mockEmployeePasswords,
  mockCitizens,
  mockCitizenPasswords,
  mockAdmins,
  mockAdminPasswords,
  mockComplaints
} from './mockData';

// Backend base URL — relative paths work with Vite proxy in dev; absolute URL for prod
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '';

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
      const norm = identifier.trim().toLowerCase();
      // Try to find admin by adminId OR email
      const admin = mockAdmins.find(a =>
        a.adminId.toLowerCase() === norm || a.email.toLowerCase() === norm
      );
      if (!admin) {
        throw new Error('Admin not found');
      }
      const storedPassword = mockAdminPasswords[admin.adminId];
      if (!storedPassword || storedPassword !== password) {
        throw new Error('Invalid admin ID or password');
      }
      const token = `mock_token_adm_${admin.adminId}_${Date.now()}`;
      return {
        user: admin,
        isAuthenticated: true,
        personType: 'admin',
        token
      };
    }

    throw new Error('Invalid person type');
  },

  async googleLogin(
    personType: PersonType,
    googleEmail?: string
  ): Promise<AuthState> {
    try {
      const response = await fetch('/api/v1/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: googleEmail, personType })
      });
      if (response.ok) {
        const data = await response.json();
        return {
          user: data.user,
          isAuthenticated: true,
          personType: data.personType || personType,
          token: data.access_token
        };
      }
    } catch (e) {
      // Fallback if server is offline
    }

    const email = googleEmail || `google.${personType}@metrology.gov.in`;
    let mockUser: AuthUser;

    if (personType === 'employee') {
      mockUser = {
        id: `emp-google-${Date.now().toString().slice(-4)}`,
        name: 'Google Employee User',
        employeeId: `MET-GOOGLE-${Date.now().toString().slice(-4)}`,
        department: 'Regional Metrology Inspection',
        office: 'Regional Office #4',
        contact: { phone: '+91 9876543210', email },
        role: 'employee'
      };
    } else if (personType === 'admin') {
      mockUser = {
        id: `adm-google-${Date.now().toString().slice(-4)}`,
        name: 'Google Admin User',
        adminId: `ADM-GOOGLE-${Date.now().toString().slice(-4)}`,
        email,
        department: 'System Administration',
        contact: { phone: '+91 9876543210', email },
        role: 'admin'
      };
    } else {
      mockUser = {
        id: `cit-google-${Date.now().toString().slice(-4)}`,
        citizenId: `CIT-GOOGLE-${Date.now().toString().slice(-4)}`,
        name: 'Google Citizen User',
        email,
        createdAt: new Date().toISOString(),
        role: 'citizen'
      };
    }

    return {
      user: mockUser,
      isAuthenticated: true,
      personType,
      token: `google_oauth_token_${personType}_${Date.now()}`
    };
  },

  async logout(): Promise<void> {
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
   Scan Service — calls the real /api/v1/ai/scan endpoint
   ========================================================================== */
export const scanService = {
  /**
   * Upload a package image to the backend AI pipeline.
   * Returns real OCR data, extracted fields, and compliance screening results.
   */
  async scanPackage(file: File): Promise<AIScanResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('image', file); // backend also accepts "image" field

    const response = await fetch(`${API_BASE_URL}/api/v1/ai/scan`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let detail = `Scan failed (HTTP ${response.status})`;
      try {
        const err = await response.json();
        detail = err.detail || detail;
      } catch {
        // ignore JSON parse errors
      }
      throw new Error(detail);
    }

    return response.json();
  },

  /**
   * Health check for the AI pipeline — useful to show backend status in the UI.
   */
  async checkHealth(): Promise<{ status: string; ai_flow_pipeline: boolean; ocr_engine: string }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/ai/health`);
    if (!response.ok) {
      throw new Error(`AI health check failed (HTTP ${response.status})`);
    }
    return response.json();
  },
};

/* ==========================================================================
   Services Index
   ========================================================================== */
export const api = {
  auth: authService,
  complaint: complaintService,
  scan: scanService,
};