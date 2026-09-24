// services/api.ts
import axios from 'axios';
import { toast } from 'react-hot-toast';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  // Vérifie que localStorage est disponible (côté client uniquement)
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

let redirectingToLogin = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error?.response?.status === 401) {
      const requestUrl = error.config?.url ?? '';
      // Ne pas intercepter les appels d'authentification eux-mêmes
      if (!requestUrl.includes('/auth/login') && !requestUrl.includes('/auth/refresh')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        document.cookie = 'auth_ok=; Max-Age=0; path=/';
        if (!redirectingToLogin) {
          redirectingToLogin = true;
          const current = window.location.pathname;
          if (!current.startsWith('/login')) {
            window.location.href = '/login?redirect=' + encodeURIComponent(current);
          }
          setTimeout(() => { redirectingToLogin = false; }, 1000);
        }
      }
    }
    if (typeof window !== 'undefined' && error?.response?.status === 403) {
      // On n'affiche l'alerte que pour une action volontaire (pas les chargements GET
      // de widgets que le rôle courant n'a pas le droit de consulter).
      const method = String(error.config?.method ?? 'get').toLowerCase();
      if (method !== 'get') {
        toast.error('Accès refusé : permission insuffisante', { id: 'access-denied' });
      }
    }
    return Promise.reject(error);
  }
);

export default api;
