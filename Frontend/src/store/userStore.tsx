import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { AuthUser } from '../types/user';
import { api } from '../services/api';
import { authStorage, UserRole } from '../features/auth/authStorage';

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

// Load persisted auth state from localStorage on startup
const persisted = authStorage.load();
const initialUser = persisted?.user ?? null;
const initialToken = persisted?.token ?? null;
const initialPersonType = persisted?.personType ?? null;
const initialIsAuthenticated = !!(initialUser && initialToken && initialPersonType);

export const UserStoreProvider = (props: UserStoreProviderProps) => {
  const { children } = props;
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [isAuthenticated, setIsAuthenticated] = useState(initialIsAuthenticated);
  const [personType, setPersonType] = useState<UserRole | null>(initialPersonType);
  const [token, setToken] = useState<string | null>(initialToken);

  const login = useCallback(async (identifier: string, password: string, personType: UserRole) => {
    const authState = await api.auth.login({ identifier, password }, personType);
    setUser(authState.user);
    setIsAuthenticated(true);
    setPersonType(authState.personType as UserRole);
    setToken(authState.token);
    // Persist auth state to localStorage
    authStorage.save({
      token: authState.token,
      personType: authState.personType as UserRole,
      user: authState.user
    });
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
    // Clear persisted auth state from localStorage
    authStorage.clear();
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