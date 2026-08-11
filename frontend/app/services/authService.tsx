// services/authService.ts
import { AuthResponseDto, LoginDto, RegisterDto, User } from '../types/auth';
import api from './api';
//import type { RegisterDto, LoginDto, AuthResponseDto, User } from '../types/auth';

export const authService = {
  async register(data: RegisterDto): Promise<AuthResponseDto> {
    const response = await api.post<{ message: string; data: AuthResponseDto }>('/auth/register', data);
    return response.data.data;
  },
  async login(data: LoginDto): Promise<AuthResponseDto> {
    const response = await api.post<{ message: string; data: AuthResponseDto }>('/auth/login', data);
    const authData = response.data.data;
    this.setAuthData(authData);
    return authData;
  },
  async checkEmail(email: string): Promise<{ exists: boolean; available: boolean }> {
    const response = await api.post<{ exists: boolean; available: boolean }>('/auth/check-email', email);
    return response.data;
  },
  async getCurrentUser(): Promise<User> {
    const response = await api.get<{ message: string; data: User }>('/auth/me');
    return response.data.data;
  },
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'auth_ok=; Max-Age=0; path=/';
  },
  setAuthData(data: AuthResponseDto): void {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({
      id: data.id,
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      role: data.role,
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