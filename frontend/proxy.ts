import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const BASE_PATH = '/medical';
const PUBLIC_PATHS = ['/login'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirige la racine vers le module médical.
  if (pathname === '/') {
    return NextResponse.redirect(new URL(`${BASE_PATH}/login`, request.url));
  }

  // Retire le basePath pour raisonner sur les routes internes.
  const route = pathname.startsWith(BASE_PATH) ? pathname.slice(BASE_PATH.length) || '/' : pathname;

  // Toujours laisser passer les ressources statiques et API
  if (
    route.startsWith('/_next') ||
    route.startsWith('/api') ||
    route.startsWith('/images') ||
    route.includes('.')
  ) {
    return NextResponse.next();
  }

  const hasSession = request.cookies.get('auth_ok')?.value === '1';

  if (PUBLIC_PATHS.includes(route)) {
    // Déjà connecté ? Rediriger vers le dashboard
    if (hasSession && route === '/login') {
      return NextResponse.redirect(new URL(`${BASE_PATH}/dashboard`, request.url));
    }
    return NextResponse.next();
  }

  // Routes protégées
  if (!hasSession) {
    const loginUrl = new URL(`${BASE_PATH}/login`, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Exclut les fichiers statiques et assets
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
