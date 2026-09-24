// app/utils/permissions.ts
import type { UserRole } from '@/app/types/user';

/**
 * Détermine si l'utilisateur connecté peut modifier/supprimer une ressource.
 * - ADMIN / SECRETAIRE / ... : autorisés (pas de restriction de propriété) ;
 * - MEDECIN : uniquement si la ressource lui appartient (parmi les ids fournis) ;
 * - MEDECIN non rattaché : refusé.
 */
export function peutModifier(
  role: UserRole | string | undefined,
  medecinId: number | null | undefined,
  ...proprietaires: (number | null | undefined)[]
): boolean {
  if (role !== 'MEDECIN') return true;
  if (medecinId == null) return false;
  return proprietaires.some((id) => id != null && id === medecinId);
}
