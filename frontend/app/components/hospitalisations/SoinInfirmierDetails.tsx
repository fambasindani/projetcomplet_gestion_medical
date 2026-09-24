'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FaEdit, FaUserMd, FaCalendarAlt, FaHospital, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { soinInfirmierService } from '@/app/services/soinInfirmierService';
import type { SoinInfirmier } from '@/app/types/soin';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import PageShell from '@/app/ui/PageShell';
import DetailBanner from '@/app/ui/DetailBanner';
import { InfoGrid, InfoCard } from '@/app/ui/InfoCard';
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
    <PageShell
      title="Détails du soin infirmier"
      maxWidth="max-w-6xl"
      onBack={() => router.push('/hospitalisations/soins')}
      actions={
        <>
            <Button icon={<FaEdit />} onClick={() => router.push(`/hospitalisations/soins/${soin.idSoin}/modifier`)}>
              Modifier
            </Button>
        </>
      }
    >

      <DetailBanner
        meta="Soin infirmier"
        title={soin.typeSoin}
        subtitle={`Soin infirmier #${soin.idSoin}`}
      >
        <InfoGrid>
          <InfoCard icon={FaCalendarAlt} label="Date" value={format(new Date(soin.dateSoin), 'dd/MM/yyyy à HH:mm', { locale: fr })} />
          <InfoCard icon={FaUserMd} label="Infirmier" value={soin.infirmierNom || `ID ${soin.idInfirmier}`} />
          <InfoCard icon={FaHospital} label="Hospitalisation" value={`#${soin.idHospitalisation} — ${soin.patientNom || 'Patient inconnu'}`} />
          <InfoCard icon={FaCheckCircle} label="Signature infirmier" value={soin.signatureInfirmier ? 'Signé' : 'Non signé'} />
        </InfoGrid>

        <div className="space-y-4 px-6 pb-6">
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Description</p>
            <p className="mt-1 whitespace-pre-wrap text-gray-700">{soin.description || 'Aucune description'}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Observations</p>
            <p className="mt-1 whitespace-pre-wrap text-gray-700">{soin.observations || 'Aucune observation'}</p>
          </div>
        </div>
      </DetailBanner>
    </PageShell>
  );
}
