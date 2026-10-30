import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';

export default function AppLayout() {
  const location = useLocation();
  const { user, isLoading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = () => setSidebarCollapsed((v) => !v);
  const toggleMobile = () => setMobileOpen((v) => !v);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center text-slate-500">Chargement...</div>;
  }

  if (!user) {
    return null;
  }

  void location;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1220]">
      <Header onMenuClick={toggleMobile} />
      <Sidebar
        isCollapsed={sidebarCollapsed}
        toggleSidebar={toggleSidebar}
        isMobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <main className={`pt-16 transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}