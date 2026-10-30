import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/utils/toast';
import { useAuth } from '@/contexts/AuthContext';

interface RequirePermissionProps {
  permission?: string;
  /** Une seule de ces permissions suffit. */
  anyOf?: string[];
  children: React.ReactNode;
}

/**
 * Garde de page : si l'utilisateur n'a pas la permission requise, affiche une
 * ALERTE (toast) et le renvoie au tableau de bord — sans afficher de page
 * plein écran « Accès non autorisé » (plus discret et professionnel).
 */
export default function RequirePermission({ permission, anyOf, children }: RequirePermissionProps) {
  const { permissions, isLoading } = useAuth();
  const navigate = useNavigate();

  const ok =
    permissions.length === 0
      ? true // jetons anciens : le backend reste la source de vérité
      : anyOf && anyOf.length > 0
        ? anyOf.some((p) => permissions.includes(p))
        : permission
          ? permissions.includes(permission)
          : true;

  useEffect(() => {
    if (!isLoading && !ok) {
      toast.error("Vous n'avez pas les droits pour accéder à cette section");
      navigate('/dashboard');
    }
  }, [isLoading, ok, navigate]);

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center text-slate-400">Chargement...</div>;
  }

  // Permission manquante : on n'affiche rien (redirection en cours).
  if (!ok) return null;

  return <>{children}</>;
}
