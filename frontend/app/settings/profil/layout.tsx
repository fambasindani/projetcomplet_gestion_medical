'use client';

export default function Layout({ children }: { children: React.ReactNode }) {
  // Mon profil : accessible a tout utilisateur authentifie (pas de permission).
  return <>{children}</>;
}