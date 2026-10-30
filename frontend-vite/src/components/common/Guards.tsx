import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAppSettings } from '../../contexts/AppSettingsContext';

// Route protégée : redirige vers /login si non authentifié.
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const { t } = useAppSettings();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center text-slate-500">{t('app.loading')}</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
};

// Garde de permission : affiche un état "accès refusé" si l'utilisateur
// ne possède pas la permission demandée (ou une des anyPermission).
export const RequirePermission: React.FC<{
  permission?: string;
  anyPermission?: string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}> = ({ permission, anyPermission, fallback, children }) => {
  const { hasPermission, user } = useAuth();

  const allowed = () => {
    if (!user) return false;
    if (anyPermission && anyPermission.length > 0) {
      return anyPermission.some((p) => hasPermission(p));
    }
    if (permission) {
      return hasPermission(permission);
    }
    return true;
  };

  if (!allowed()) {
    return fallback ?? (
      <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
        <p className="text-sm text-slate-500">Accès refusé : permission insuffisante.</p>
      </div>
    );
  }

  return <>{children}</>;
};