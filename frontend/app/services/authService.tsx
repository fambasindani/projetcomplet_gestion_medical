// services/authService.ts
import { AuthResponseDto, LoginDto, User } from '../types/auth';
import api from './api';

export const authService = {
  async login(data: LoginDto): Promise<AuthResponseDto> {
    const response = await api.post<{ message: string; data: AuthResponseDto }>('/auth/login', data);
    const authData = response.data.data;
    this.setAuthData(authData);
    return authData;
  },
  async refresh(refreshToken: string): Promise<AuthResponseDto> {
    const response = await api.post<{ message: string; data: AuthResponseDto }>('/auth/refresh', { refreshToken });
    const authData = response.data.data;
    this.setAuthData(authData);
    return authData;
  },
  async getCurrentUser(): Promise<User> {
    const response = await api.get<{ message: string; data: User }>('/auth/me');
    return response.data.data;
  },
  async changePassword(data: {
    ancienMotDePasse: string;
    nouveauMotDePasse: string;
    confirmationMotDePasse: string;
  }): Promise<void> {
    await api.post('/auth/change-password', data);
  },
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    document.cookie = 'auth_ok=; Max-Age=0; path=/';
  },
  setAuthData(data: AuthResponseDto): void {
    localStorage.setItem('token', data.token);
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    localStorage.setItem('user', JSON.stringify({
      id: data.id,
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      role: data.role,
      medecinId: data.medecinId ?? null,
      patientId: data.patientId ?? null,
      permissions: data.permissions ?? [],
    }));
    document.cookie = 'auth_ok=1; path=/';
  },
  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },
  getStoredToken(): string | null {
    return localStorage.getItem('token');
  },
};