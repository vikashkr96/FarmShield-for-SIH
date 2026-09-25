'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRoleMode } from '../components/ui/Navbar';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRoleMode;
  state: string;
  district: string;
  farmId?: string;
  licenseNo?: string;
  farmType?: string;
  authProvider?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (userData: UserProfile) => void;
  logout: () => void;
  openAuthModal: (initialMode?: 'login' | 'register', defaultRole?: UserRoleMode) => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  authModalDefaultRole: UserRoleMode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'vasudha_farmshield_user_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [authModalDefaultRole, setAuthModalDefaultRole] = useState<UserRoleMode>('farmer');

  useEffect(() => {
    try {
      const savedSession = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedSession) {
        setUser(JSON.parse(savedSession));
      }
      // Note: Initially user is null when first visiting, allowing clean overview landing
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const login = (userData: UserProfile) => {
    setUser(userData);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
    } catch {
      // Ignore
    }
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  const openAuthModal = (mode: 'login' | 'register' = 'login', defaultRole: UserRoleMode = 'farmer') => {
    setAuthModalMode(mode);
    setAuthModalDefaultRole(defaultRole);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        openAuthModal,
        closeAuthModal,
        isAuthModalOpen,
        authModalMode,
        authModalDefaultRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
