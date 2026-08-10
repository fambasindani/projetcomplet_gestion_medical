'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useState } from 'react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const isPublicRoute = pathname === '/login';

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);
  const toggleMobile = () => setMobileOpen(!mobileOpen);

  // Rediriger si non authentifié et route non publique
  useEffect(() => {
    if (!isLoading && !user && !isPublicRoute) {
      router.push('/login');
    }
  }, [user, isLoading, isPublicRoute, router]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Chargement...</div>;
  }

  if (!user && !isPublicRoute) {
    return null; // ou un spinner, mais la redirection va avoir lieu
  }

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={toggleMobile} />
      <Sidebar
        isCollapsed={sidebarCollapsed}
        toggleSidebar={toggleSidebar}
        isMobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <main className={`transition-all duration-300 pt-16 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}