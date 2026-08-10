// contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { LoginDto, RegisterDto, User } from '../types/auth';


interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => void;
  checkEmail: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      const token = authService.getStoredToken();
      const storedUser = authService.getStoredUser();
      if (!token || !storedUser) {
        if (isMounted) setIsLoading(false);
        return;
      }
      try {
        const currentUser = await authService.getCurrentUser();
        if (isMounted) setUser(currentUser);
      } catch (error) {
        console.error('Token validation failed', error);
        if (isMounted) authService.logout();
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    initAuth();
    return () => { isMounted = false; };
  }, []);

  const login = async (data: LoginDto) => {
    const response = await authService.login(data);
    authService.setAuthData(response);
    setUser({
      id: response.id,
      nom: response.nom,
      prenom: response.prenom,
      email: response.email,
      role: response.role,
    });
  };

  const register = async (data: RegisterDto) => {
    const response = await authService.register(data);
    authService.setAuthData(response);
    setUser({
      id: response.id,
      nom: response.nom,
      prenom: response.prenom,
      email: response.email,
      role: response.role,
    });
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const checkEmail = async (email: string): Promise<boolean> => {
    const result = await authService.checkEmail(email);
    return result.exists;
  };

  const value = { user, isLoading, login, register, logout, checkEmail };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};