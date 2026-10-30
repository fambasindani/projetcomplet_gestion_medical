import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import type { AuthResponseDto, LoginDto, User } from '../types/auth';

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
    let cancelled = false;
    const initAuth = async () => {
      const token = authService.getStoredToken();
      const storedUser = authService.getStoredUser();
      if (!token || !storedUser) {
        if (!cancelled) setIsLoading(false);
        return;
      }
      try {
        const currentUser = await authService.getCurrentUser();
        if (cancelled) return;
        setUser(currentUser);
      } catch {
        if (cancelled) return;
        authService.logout();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    void initAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (data: LoginDto) => {
    const response: AuthResponseDto = await authService.login(data);
    setUser({
      id: response.id,
      nom: response.nom,
      prenom: response.prenom,
      email: response.email,
      role: response.role,
      medecinId: response.medecinId ?? null,
      patientId: response.patientId ?? null,
      permissions: response.permissions ?? [],
    });
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const permissions = user?.permissions ?? [];
  const hasPermission = (permission: string) => permissions.includes(permission);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, permissions, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};