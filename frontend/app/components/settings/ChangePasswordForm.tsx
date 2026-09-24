'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaKey, FaSave, FaArrowLeft } from 'react-icons/fa';
import { FormInput } from '@/app/components/common/FormInput';
import { authService } from '@/app/services/authService';
import { useAuth } from '@/app/contexts/AuthContext';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import PageHeader from '@/app/ui/PageHeader';
import Button from '@/app/ui/Button';

export default function ChangePasswordForm() {
  const router = useRouter();
  const { logout } = useAuth();
  const [ancienMotDePasse, setAncienMotDePasse] = useState('');
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('');
  const [confirmationMotDePasse, setConfirmationMotDePasse] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const err: Record<string, string> = {};
    if (!ancienMotDePasse) err.ancienMotDePasse = 'Le mot de passe actuel est requis';
    if (!nouveauMotDePasse) err.nouveauMotDePasse = 'Le nouveau mot de passe est requis';
    else if (nouveauMotDePasse.length < 6) err.nouveauMotDePasse = 'Au moins 6 caractères';
    if (nouveauMotDePasse !== confirmationMotDePasse) err.confirmationMotDePasse = 'Les mots de passe ne correspondent pas';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await authService.changePassword({ ancienMotDePasse, nouveauMotDePasse, confirmationMotDePasse });
      toast.success('Mot de passe modifié. Veuillez vous reconnecter.');
      setTimeout(() => {
        logout();
        router.push('/login');
      }, 1200);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Changer le mot de passe"
        actions={
          <Button variant="secondary" icon={<FaArrowLeft />} onClick={() => router.back()}>
            Retour
          </Button>
        }
      />

      <form onSubmit={handleSubmit} noValidate className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 space-y-5">
          <h5 className="flex items-center gap-2 text-lg font-semibold text-indigo-600">
            <FaKey /> Sécurité du compte
          </h5>
          <FormInput
            label="Mot de passe actuel"
            name="ancienMotDePasse"
            type="password"
            value={ancienMotDePasse}
            onChange={(e) => setAncienMotDePasse(e.target.value)}
            required
            error={errors.ancienMotDePasse}
          />
          <FormInput
            label="Nouveau mot de passe"
            name="nouveauMotDePasse"
            type="password"
            value={nouveauMotDePasse}
            onChange={(e) => setNouveauMotDePasse(e.target.value)}
            required
            error={errors.nouveauMotDePasse}
          />
          <FormInput
            label="Confirmer le nouveau mot de passe"
            name="confirmationMotDePasse"
            type="password"
            value={confirmationMotDePasse}
            onChange={(e) => setConfirmationMotDePasse(e.target.value)}
            required
            error={errors.confirmationMotDePasse}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()}>Annuler</Button>
          <Button type="submit" disabled={loading} icon={<FaSave />}>
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </div>
  );
}
