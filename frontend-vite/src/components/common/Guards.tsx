import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAppSettings } from '../../contexts/AppSettingsContext';
import { toast } from '../../utils/toast';

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

// Garde de permission : si l'utilisateur ne possède pas la permission
// demandée (ou aucune des anyPermission), on le renvoie vers le tableau
// de bord avec une alerte (comme côté Next.js).
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

  const denied = !!user && !allowed();

  useEffect(() => {
    if (denied) toast.error("Vous n'avez pas les droits pour accéder à cette section");
  }, [denied]);

  if (!user) return null;
  if (denied) {
    if (fallback !== undefined) return <>{fallback}</>;
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};