import { useState, useEffect } from 'react';

export interface UserSession {
  role: 'employee' | 'user' | 'organisation';
  name: string;
  email: string;
  token: string;
}

export const useAuth = () => {
  const [session, setSession] = useState<UserSession | null>(null);

  const login = (role: 'employee' | 'user' | 'organisation', email: string) => {
    const mockSession: UserSession = {
      role,
      name: role === 'employee' ? 'Officer Rajesh Kumar' : role === 'user' ? 'Citizen Consumer' : 'HUL Packaging Ltd',
      email,
      token: `JWT-${Date.now()}`
    };
    setSession(mockSession);
    localStorage.setItem('lm_session', JSON.stringify(mockSession));
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem('lm_session');
  };

  return { session, login, logout };
};
