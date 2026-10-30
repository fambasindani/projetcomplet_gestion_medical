import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService } from '@/services/userService';
import UserForm from '@/components/settings/UserForm';
import SkeletonDetails from '@/ui/SkeletonDetails';
import type { User } from '@/types/user';

export default function EditUserPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService.getById(Number(id))
      .then(setData)
      .catch(() => navigate('/settings/utilisateurs'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <SkeletonDetails />;
  if (!data) return null;
  return <UserForm initialData={data} isEdit />;
}
