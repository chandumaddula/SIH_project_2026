import { AuthUser } from '../../types/user';

export type UserRole = 'employee' | 'citizen' | 'admin';

const STORAGE_KEY = 'metrology.auth';

interface PersistedAuth {
  token: string | null;
  personType: UserRole | null;
  user: AuthUser | null;
}

export const authStorage = {
  save(state: PersistedAuth): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage failures (e.g., private mode, quota)
    }
  },

  load(): PersistedAuth | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as PersistedAuth;
      if (!parsed || typeof parsed !== 'object') return null;
      return {
        token: parsed.token ?? null,
        personType: parsed.personType ?? null,
        user: parsed.user ?? null
      };
    } catch {
      return null;
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
};

export default authStorage;