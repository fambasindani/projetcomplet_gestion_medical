// app/providers.tsx
'use client';

import { ConfirmProvider } from 'react-use-confirming-dialog';
import { AuthProvider } from './contexts/AuthContext';
import { AppSettingsProvider } from './contexts/AppSettingsContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppSettingsProvider>
      <AuthProvider>
        <ConfirmProvider>
          {children}
        </ConfirmProvider>
      </AuthProvider>
    </AppSettingsProvider>
  );
}