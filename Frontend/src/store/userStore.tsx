import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { AuthUser } from '../types/user';
import { api } from '../services/api';

type UserRole = 'employee' | 'citizen' | 'admin';

interface UserStoreContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  personType: UserRole | null;
  token: string | null;
  login: (identifier: string, password: string, personType: UserRole) => Promise<void>;
  googleLogin: (personType: UserRole, googleEmail?: string) => Promise<void>;
  logout: () => void;
}

const UserStoreContext = createContext<UserStoreContextType | null>(null);

interface UserStoreProviderProps {
  children: React.ReactNode;
}

export const UserStoreProvider = (props: UserStoreProviderProps) => {
  const { children } = props;
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [personType, setPersonType] = useState<UserRole | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = useCallback(async (identifier: string, password: string, personType: UserRole) => {
    const authState = await api.auth.login({ identifier, password }, personType);
    setUser(authState.user);
    setIsAuthenticated(true);
    setPersonType(authState.personType);
    setToken(authState.token);
  }, []);

  const googleLogin = useCallback(async (personType: UserRole, googleEmail?: string) => {
    const authState = await api.auth.googleLogin(personType, googleEmail);
    setUser(authState.user);
    setIsAuthenticated(true);
    setPersonType(authState.personType);
    setToken(authState.token);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    setPersonType(null);
    setToken(null);
    api.auth.logout();
  }, []);

  const value = useMemo<UserStoreContextType>(() => ({
    user,
    isAuthenticated,
    personType,
    token,
    login,
    googleLogin,
    logout
  }), [user, isAuthenticated, personType, token, login, googleLogin, logout]);

  return React.createElement(
    UserStoreContext.Provider,
    { value },
    children
  );
};

export const useUserStore = (): UserStoreContextType => {
  const context = useContext(UserStoreContext);
  if (!context) {
    throw new Error('useUserStore must be used within a UserStoreProvider');
  }
  return context;
};

export default UserStoreContext;