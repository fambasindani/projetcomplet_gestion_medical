/**
 * URL publique d'un fichier servi par le backend sous /uploads/**.
 *
 *   VITE_API_URL = '/api'                   -> '/uploads/medecins/x.jpg'
 *                                              (meme origine : port du backend)
 *   VITE_API_URL = 'http://hote:7035/api'   -> 'http://hote:7035/uploads/medecins/x.jpg'
 *
 * Ne jamais utiliser le fallback "|| 'http://localhost:7034'" : en production
 * VITE_API_URL vaut '/api', donc l'origine est vide et le chemin relatif est
 * le bon. Un fallback sur localhost casse les images chez tous les clients.
 */
const API_URL = import.meta.env.VITE_API_URL || '/api';
const UPLOADS_ORIGIN = API_URL.replace(/\/api\/?$/, '');

export function uploadsUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('blob:') || path.startsWith('http')) return path;
  if (!path.startsWith('/uploads')) return path;
  return `${UPLOADS_ORIGIN}${path}`;
}
