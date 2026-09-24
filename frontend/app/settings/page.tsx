'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaSpinner } from 'react-icons/fa';

export default function SettingsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/settings/utilisateurs');
  }, [router]);

  return (
    <div className="flex items-center justify-center py-24 text-indigo-600">
      <FaSpinner className="animate-spin text-2xl" />
    </div>
  );
}
