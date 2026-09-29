'use client';

import React from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

interface CanProps {
  /** Optionnel si anyOf est fourni. */
  permission?: string;
  /** Optionnel : plusieurs permissions, une seule suffit. */
  anyOf?: string[];
  children: React.ReactNode;
  /** Contenu affiché si la permission manque (par défaut : rien). */
  fallback?: React.ReactNode;
}

/**
 * N'affiche ses enfants que si l'utilisateur possède la permission demandée.
 * Sert à masquer les boutons/actions AVANT que l'utilisateur ne clique.
 *
 * Exemple : <Can permission="EXAMENS_GERER"><Button>Nouveau</Button></Can>
 */
export default function Can({ permission, anyOf, children, fallback = null }: CanProps) {
  const { permissions } = useAuth();
  if (permissions.length === 0) return <>{fallback}</>;
  const ok = anyOf && anyOf.length > 0
    ? anyOf.some((p) => permissions.includes(p))
    : permission
      ? permissions.includes(permission)
      : true;
  return <>{ok ? children : fallback}</>;
}
