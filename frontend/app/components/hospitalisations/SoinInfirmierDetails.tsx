'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FaArrowLeft, FaEdit, FaUserMd, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { soinInfirmierService } from '@/app/services/soinInfirmierService';
import type { SoinInfirmier } from '@/app/types/soin';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import PageHeader from '@/app/ui/PageHeader';
import Button from '@/app/ui/Button';

export default function SoinInfirmierDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [soin, setSoin] = useState<SoinInfirmier | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      router.push('/hospitalisations/soins');
      return;
    }
    soinInfirmierService.getById(Number(id))
      .then(setSoin)
      .catch(() => {
        toast.error('Erreur de chargement');
        router.push('/hospitalisations/soins');
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <SkeletonDetails />;
  if (!soin) return <div className="p-6 text-center">Soin non trouvé</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Détails du soin infirmier"
        actions={
          <>
            <Button variant="secondary" icon={<FaArrowLeft />} onClick={() => router.push('/hospitalisations/soins')}>
              Retour
            </Button>
            <Button icon={<FaEdit />} onClick={() => router.push(`/hospitalisations/soins/${soin.idSoin}/modifier`)}>
              Modifier
            </Button>
          </>
        }
      />

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
          <h1 className="text-white text-2xl font-bold">{soin.typeSoin}</h1>
          <p className="text-indigo-100">
            Soin infirmier #{soin.idSoin}
          </p>
        </div>

        {/* Corps */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong><FaCalendarAlt className="inline mr-1" /> Date :</strong>
              <span className="ml-1">{format(new Date(soin.dateSoin), 'dd/MM/yyyy à HH:mm', { locale: fr })}</span>
            </div>
            <div>
              <strong><FaUserMd className="inline mr-1" /> Infirmier :</strong>
              <span className="ml-1">{soin.infirmierNom || `ID ${soin.idInfirmier}`}</span>
            </div>
            <div className="md:col-span-2">
              <strong>Hospitalisation :</strong>
              <span className="ml-1">#{soin.idHospitalisation}</span>
              <span className="ml-2 text-gray-500">— {soin.patientNom || 'Patient inconnu'}</span>
            </div>
            <div className="md:col-span-2">
              <strong>Description :</strong>
              <p className="mt-1 text-gray-700 whitespace-pre-wrap">{soin.description || 'Aucune description'}</p>
            </div>
            <div className="md:col-span-2">
              <strong>Observations :</strong>
              <p className="mt-1 text-gray-700 whitespace-pre-wrap">{soin.observations || 'Aucune observation'}</p>
            </div>
            <div>
              <strong>Signature infirmier :</strong>
              <span className="ml-1">{soin.signatureInfirmier ? '✓ Signé' : '✗ Non signé'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
