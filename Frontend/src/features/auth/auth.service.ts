import { Employee, AuthState } from '../../types/user';
import { mockEmployees, mockEmployeePasswords } from '../../services/mockData';

export interface LoginRequest {
  employeeId: string;
  password: string;
  personType: 'employee';
}

export interface LoginResponse {
  success: boolean;
  user?: Employee;
  token?: string;
  error?: string;
}

export const authService = {
  async login(request: LoginRequest): Promise<LoginResponse> {
    const { employeeId, password, personType } = request;

    // Validate person type
    if (personType !== 'employee') {
      return {
        success: false,
        error: 'Invalid person type for this login flow'
      };
    }

    // Check credentials against mock data
    const storedPassword = mockEmployeePasswords[employeeId];
    if (!storedPassword || storedPassword !== password) {
      return {
        success: false,
        error: 'Invalid employee ID or password'
      };
    }

    // Find employee
    const employee = mockEmployees.find(e => e.employeeId === employeeId);
    if (!employee) {
      return {
        success: false,
        error: 'Employee not found'
      };
    }

    // Generate mock token
    const token = `mock_jwt_${employeeId}_${Date.now()}`;

    return {
      success: true,
      user: employee,
      token
    };
  },

  async logout(): Promise<void> {
    // Phase 1: No-op, just clear state
    return Promise.resolve();
  },

  getAuthState(user: Employee | null, token: string | null): AuthState {
    return {
      user,
      isAuthenticated: !!user && !!token,
      personType: 'employee',
      token
    };
  }
};

export default authService;