// app/providers.tsx
'use client';

import { ConfirmProvider } from 'react-use-confirming-dialog';
import { AuthProvider } from './contexts/AuthContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ConfirmProvider>
        {children}
      </ConfirmProvider>
    </AuthProvider>
  );
}