'use client';

import RequirePermission from '@/app/components/common/RequirePermission';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RequirePermission anyOf={['MEDECINS_VOIR', 'PLANNING_GROUPE_VOIR']}>
      {children}
    </RequirePermission>
  );
}