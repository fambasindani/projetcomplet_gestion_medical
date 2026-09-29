'use client';

import RequirePermission from '@/app/components/common/RequirePermission';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RequirePermission permission="PRESCRIPTIONS_VOIR">{children}</RequirePermission>;
}