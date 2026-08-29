export type UserRole = 'citizen' | 'officer' | 'organisation' | 'admin';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  department?: string;
  organisationName?: string;
  isActive: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterPayload {
  email: string;
  fullName: string;
  password?: string;
  role: UserRole;
  department?: string;
  organisationName?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}
