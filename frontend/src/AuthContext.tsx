import React, { createContext, useContext, useState, useEffect } from 'react';
import type { BackendUser } from './api';
import type { UserType } from './data/mockData';

/** Map backend numeric type to frontend UserType string */
export function backendTypeToUserType(type: number): UserType {
  switch (type) {
    case 0: return 'kids';
    case 1: return 'adults';
    case 2: return 'founder';
    default: return 'adults';
  }
}

/** Map frontend UserType string to backend numeric type */
export function userTypeToBackendType(ut: UserType): number {
  switch (ut) {
    case 'kids': return 0;
    case 'adults': return 1;
    case 'founder': return 2;
  }
}

interface AuthState {
  user: BackendUser | null;
  userType: UserType;
  isAuthenticated: boolean;
  setUser: (user: BackendUser | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({
  user: null,
  userType: 'adults',
  isAuthenticated: false,
  setUser: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

const STORAGE_KEY = 'soleada_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<BackendUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const userType: UserType = user ? backendTypeToUserType(user.type) : 'adults';
  const isAuthenticated = user !== null;

  const setUser = (u: BackendUser | null) => {
    setUserState(u);
    if (u) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      if (u.primaryLang !== undefined) {
        localStorage.setItem('preferredLanguage', u.primaryLang === 1 ? 'ES' : 'EN');
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const logout = () => {
    setUser(null);
  };

  // Sync across tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setUserState(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <AuthContext.Provider value={{ user, userType, isAuthenticated, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
