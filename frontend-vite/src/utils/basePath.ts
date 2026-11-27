/**
 * Chemin de base de l'application (defini par `base` dans vite.config.ts).
 *
 *   dev / production :  import.meta.env.BASE_URL = '/med/'
 *   BASE_PATH                             = '/med'
 *
 * Permet de construire des URL absolues qui respectent le prefixe :
 *   assetUrl('Logo.png')          -> '/med/Logo.png'
 *   appUrl('/consultations/12')   -> '/med/consultations/12'
 */
export const BASE_PATH = import.meta.env.BASE_URL.replace(/\/+$/, '');

export function assetUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
}

export function appUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_PATH}${p}`;
}
