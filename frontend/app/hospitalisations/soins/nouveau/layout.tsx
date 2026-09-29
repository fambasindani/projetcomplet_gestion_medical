'use client';

import RequirePermission from '@/app/components/common/RequirePermission';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RequirePermission permission="SOINS_GERER">{children}</RequirePermission>;
}