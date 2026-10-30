
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';

export default function SettingsPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/settings/utilisateurs');
  }, [navigate]);

  return (
    <div className="flex items-center justify-center py-24 text-indigo-600">
      <FaSpinner className="animate-spin text-2xl" />
    </div>
  );
}