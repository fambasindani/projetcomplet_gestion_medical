'use client';

import { useAuth } from '@/app/contexts/AuthContext';

/**
 * Hook RBAC : indique si l'utilisateur possède une permission (ou l'une de plusieurs).
 * `ready` = les permissions sont chargées (évite de déclencher un fetch avant).
 */
export function usePermission(permission?: string, anyOf?: string[]) {
  const { permissions, isLoading } = useAuth();

  const ready = !isLoading && permissions.length > 0;

  const allowed =
    permissions.length === 0
      ? true // jeton ancien : on laisse le backend décider
      : anyOf && anyOf.length > 0
        ? anyOf.some((p) => permissions.includes(p))
        : permission
          ? permissions.includes(permission)
          : true;

  return { allowed, ready, permissions };
}

export default usePermission;
