'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { userService } from '@/app/services/userService';
import UserForm from '@/app/components/settings/UserForm';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import type { User } from '@/app/types/user';

export default function EditUserPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService.getById(Number(id))
      .then(setData)
      .catch(() => router.push('/settings/utilisateurs'))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <SkeletonDetails />;
  if (!data) return null;
  return <UserForm initialData={data} isEdit />;
}
