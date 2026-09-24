// contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { LoginDto, User } from '../types/auth';


interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: LoginDto) => Promise<void>;
  logout: () => void;
  permissions: string[];
  hasPermission: (permission: string) => boolean;
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
        // Le cookie auth_ok est partagé entre ports, le token localStorage ne l'est pas.
        // On le supprime pour éviter une boucle /dashboard <-> /login (page blanche).
        if (typeof document !== 'undefined') {
          document.cookie = 'auth_ok=; Max-Age=0; path=/';
        }
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
      medecinId: response.medecinId ?? null,
      permissions: response.permissions ?? [],
    });
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const permissions = user?.permissions ?? [];
  const hasPermission = (permission: string) => permissions.includes(permission);

  const value = { user, isLoading, login, logout, permissions, hasPermission };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};