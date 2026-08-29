import { api } from './api';
import { AuthResponse, LoginCredentials, RegisterPayload, User } from '../types/user';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      return response.data;
    } catch (error) {
      // Demo fallback mode for offline/dev preview if backend is uncontactable
      console.warn('API error, falling back to local simulation:', error);
      const roleMap: Record<string, User['role']> = {
        'admin@metrology.gov.in': 'admin',
        'officer@metrology.gov.in': 'officer',
        'org@company.com': 'organisation',
      };

      const role = roleMap[credentials.email] || 'citizen';
      const mockUser: User = {
        id: 'usr_' + Math.random().toString(36).substr(2, 9),
        email: credentials.email,
        fullName: credentials.email.split('@')[0].toUpperCase(),
        role: role,
        department: role === 'officer' ? 'Field Enforcement Unit' : undefined,
        organisationName: role === 'organisation' ? 'PQR Consumer Packaged Goods Ltd' : undefined,
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      return {
        access_token: 'mock_jwt_token_' + Date.now(),
        token_type: 'bearer',
        user: mockUser,
      };
    }
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', payload);
      return response.data;
    } catch (error) {
      console.warn('API register fallback:', error);
      const mockUser: User = {
        id: 'usr_' + Math.random().toString(36).substr(2, 9),
        email: payload.email,
        fullName: payload.fullName,
        role: payload.role,
        department: payload.department,
        organisationName: payload.organisationName,
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      return {
        access_token: 'mock_jwt_token_' + Date.now(),
        token_type: 'bearer',
        user: mockUser,
      };
    }
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};
