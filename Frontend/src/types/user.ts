/* ==========================================================================
   User Types - Multi-role support
   ========================================================================== */

export type UserRole = 'employee' | 'citizen' | 'admin';

/* ---- Employee ---- */
export interface Employee {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  office: string;
  contact: {
    phone: string;
    email: string;
  };
  role: 'employee';
}

/* ---- Citizen ---- */
export interface Citizen {
  id: string;
  citizenId: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  role: 'citizen';
}

/* ---- Admin ---- */
export interface Admin {
  id: string;
  name: string;
  email: string;
  adminId: string;
  department: string;
  contact: {
    phone: string;
    email: string;
  };
  role: 'admin';
}

/* ---- Unified Auth User ---- */
export type AuthUser = Employee | Citizen | Admin;

/* ---- Auth State ---- */
export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  token: string | null;
  personType: 'employee' | 'citizen' | 'admin' | null;
}

/* ---- Login Credentials ---- */
export interface LoginCredentials {
  identifier: string;
  password: string;
  role: UserRole;
}
